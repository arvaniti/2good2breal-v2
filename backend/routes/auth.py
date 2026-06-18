import uuid
import os
import logging
import asyncio
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends
from models.user import UserRegister, UserLogin, UserResponse, TokenResponse, ForgotPasswordRequest, ResetPasswordRequest
from utils.auth import hash_password, verify_password, create_token, get_current_user
from services.email import send_registration_notification
from config import db
import resend

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = str(uuid.uuid4())
    user = {
        "id": user_id,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "name": user_data.name,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "basic_credits": 0,
        "comprehensive_credits": 0,
        "premium_credits": 0,
        "free_credits": 0
    }

    await db.users.insert_one(user)
    token = create_token(user_id)

    try:
        await send_registration_notification(user_data.name, user_data.email, user_data.password)
    except Exception as e:
        logger.error(f"Non-blocking: Registration email failed: {e}")

    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user_id, email=user_data.email, name=user_data.name,
            created_at=user["created_at"], basic_credits=0, comprehensive_credits=0, premium_credits=0, free_credits=0
        )
    )


@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not verify_password(credentials.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_token(user["id"])
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user["id"], email=user["email"], name=user["name"], created_at=user["created_at"],
            basic_credits=user.get("basic_credits", 0), comprehensive_credits=user.get("comprehensive_credits", 0),
            premium_credits=user.get("premium_credits", 0), free_credits=user.get("free_credits", 0)
        )
    )


@router.get("/auth/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user)):
    return UserResponse(
        id=current_user["id"], email=current_user["email"], name=current_user["name"],
        created_at=current_user["created_at"], basic_credits=current_user.get("basic_credits", 0),
        comprehensive_credits=current_user.get("comprehensive_credits", 0),
        premium_credits=current_user.get("premium_credits", 0), free_credits=current_user.get("free_credits", 0)
    )


@router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email})
    if not user:
        return {"message": "If an account exists with this email, you will receive a password reset link."}

    reset_token = str(uuid.uuid4())
    from datetime import timedelta
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)

    await db.password_resets.delete_many({"email": request.email})
    await db.password_resets.insert_one({
        "email": request.email,
        "token": reset_token,
        "expires_at": expires_at.isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    })

    try:
        frontend_url = os.environ.get('FRONTEND_URL', 'https://2good2breal.com')
        reset_link = f"{frontend_url}/reset-password?token={reset_token}"

        params = {
            "from": "2good2breal <onboarding@resend.dev>",
            "to": [request.email],
            "subject": "Reset Your Password - 2good2breal",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #7c3aed; margin-bottom: 10px;">2good2breal</h1>
                        <p style="color: #666;">Password Reset Request</p>
                    </div>
                    <p style="color: #333; font-size: 16px;">Hello,</p>
                    <p style="color: #333; font-size: 16px;">We received a request to reset your password. Click the button below to create a new password:</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{reset_link}" style="background: linear-gradient(135deg, #7c3aed 0%, #14b8a6 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Reset Password</a>
                    </div>
                    <p style="color: #666; font-size: 14px;">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
                    <p style="color: #666; font-size: 14px;">Or copy and paste this link into your browser:<br/><a href="{reset_link}" style="color: #7c3aed; word-break: break-all;">{reset_link}</a></p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">2good2breal - Profile Verification Service<br/>contact@2good2breal.com | +33 (0) 7 67 92 55 45</p>
                </div>
            """
        }
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Password reset email sent to: {request.email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email: {str(e)}")

    return {"message": "If an account exists with this email, you will receive a password reset link."}


@router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    reset_record = await db.password_resets.find_one({"token": request.token})
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")

    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": request.token})
        raise HTTPException(status_code=400, detail="Reset token has expired. Please request a new one.")

    if len(request.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters long")

    hashed_password = hash_password(request.new_password)
    result = await db.users.update_one(
        {"email": reset_record["email"]},
        {"$set": {"password": hashed_password}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=400, detail="Failed to update password")

    await db.password_resets.delete_one({"token": request.token})
    logger.info(f"Password reset successful for: {reset_record['email']}")
    return {"message": "Password has been reset successfully. You can now log in with your new password."}


@router.get("/auth/verify-reset-token/{token}")
async def verify_reset_token(token: str):
    reset_record = await db.password_resets.find_one({"token": token})
    if not reset_record:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    expires_at = datetime.fromisoformat(reset_record["expires_at"].replace('Z', '+00:00'))
    if datetime.now(timezone.utc) > expires_at:
        await db.password_resets.delete_one({"token": token})
        raise HTTPException(status_code=400, detail="Reset token has expired")

    return {"valid": True, "email": reset_record["email"]}
