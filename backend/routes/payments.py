import uuid
import logging
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, Request
from emergentintegrations.payments.stripe.checkout import StripeCheckout, CheckoutStatusResponse
from models.payment import CreateCheckoutRequest, CheckoutResponse, PaymentStatusResponse, PackageInfo, UserCreditsResponse
from utils.auth import get_current_user
from services.email import send_payment_confirmation_to_client
from config import db, STRIPE_API_KEY, PRICING_PACKAGES

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/packages", response_model=List[PackageInfo])
async def get_packages():
    return [
        PackageInfo(
            id=pkg_id, name=pkg["name"], amount=pkg["amount"],
            currency=pkg["currency"], description=pkg["description"],
            profiles_included=pkg["profiles_included"]
        )
        for pkg_id, pkg in PRICING_PACKAGES.items()
    ]


@router.post("/checkout", response_model=CheckoutResponse)
async def create_checkout(request: Request, checkout_data: CreateCheckoutRequest, current_user: dict = Depends(get_current_user)):
    import stripe

    if not STRIPE_API_KEY:
        raise HTTPException(status_code=500, detail="Payment system not configured. Please contact support.")

    if checkout_data.package_id not in PRICING_PACKAGES:
        raise HTTPException(status_code=400, detail="Invalid package ID")

    package = PRICING_PACKAGES[checkout_data.package_id]
    success_url = f"{checkout_data.origin_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = f"{checkout_data.origin_url}/payment/cancel"

    VALID_PROMO_CODE = "2good2026"
    DISCOUNT_PERCENT = 10
    original_amount = package["amount"]
    final_amount = original_amount
    promo_applied = False

    if checkout_data.promo_code and checkout_data.promo_code.lower() == VALID_PROMO_CODE.lower():
        final_amount = original_amount * (100 - DISCOUNT_PERCENT) / 100
        promo_applied = True
        logger.info(f"Promo code applied: {DISCOUNT_PERCENT}% discount for user {current_user['email']}")

    stripe.api_key = STRIPE_API_KEY
    product_description = package["description"]
    if promo_applied:
        product_description = f"{package['description']} (Code promo -{DISCOUNT_PERCENT}% appliqu\u00e9)"

    try:
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": package["currency"],
                    "product_data": {"name": package["name"], "description": product_description},
                    "unit_amount": int(final_amount * 100)
                },
                "quantity": 1
            }],
            mode="payment",
            success_url=success_url,
            cancel_url=cancel_url,
            locale="en",
            customer_email=current_user["email"],
            metadata={
                "user_id": current_user["id"],
                "user_email": current_user["email"],
                "package_id": checkout_data.package_id,
                "package_name": package["name"],
                "profiles_included": str(package["profiles_included"]),
                "promo_code": checkout_data.promo_code if promo_applied else "",
                "original_amount": str(original_amount),
                "discount_percent": str(DISCOUNT_PERCENT) if promo_applied else "0"
            }
        )
    except Exception as e:
        logger.error(f"Stripe checkout creation failed: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create checkout session: {str(e)}")

    if not session:
        raise HTTPException(status_code=500, detail="Stripe session creation returned empty response")

    transaction = {
        "id": str(uuid.uuid4()),
        "session_id": session.id,
        "user_id": current_user["id"],
        "user_email": current_user["email"],
        "package_id": checkout_data.package_id,
        "package_name": package["name"],
        "amount": final_amount,
        "original_amount": original_amount,
        "currency": package["currency"],
        "profiles_included": package["profiles_included"],
        "promo_code": checkout_data.promo_code if promo_applied else None,
        "discount_percent": DISCOUNT_PERCENT if promo_applied else 0,
        "payment_status": "pending",
        "status": "initiated",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    await db.payment_transactions.insert_one(transaction)
    logger.info(f"Checkout session created: {session.id} for user {current_user['email']}")

    return CheckoutResponse(checkout_url=session.url, session_id=session.id)


@router.get("/checkout/status/{session_id}", response_model=PaymentStatusResponse)
async def get_checkout_status(request: Request, session_id: str, current_user: dict = Depends(get_current_user)):
    transaction = await db.payment_transactions.find_one(
        {"session_id": session_id, "user_id": current_user["id"]}, {"_id": 0}
    )
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")

    host_url = str(request.base_url).rstrip('/')
    webhook_url = f"{host_url}/api/webhook/stripe"
    stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
    checkout_status: CheckoutStatusResponse = await stripe_checkout.get_checkout_status(session_id)

    if transaction["payment_status"] != checkout_status.payment_status:
        update_data = {
            "payment_status": checkout_status.payment_status,
            "status": checkout_status.status,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }

        if checkout_status.payment_status == "paid" and transaction["payment_status"] != "paid":
            update_result = await db.payment_transactions.update_one(
                {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                {"$set": {"payment_status": "paid", "credits_added_by": "polling", "updated_at": datetime.now(timezone.utc).isoformat()}}
            )
            if update_result.modified_count > 0:
                profiles_to_add = transaction["profiles_included"]
                credit_field = f"{transaction['package_id']}_credits"
                await db.users.update_one(
                    {"id": current_user["id"]},
                    {"$inc": {credit_field: profiles_to_add}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                update_data["credits_added"] = profiles_to_add
                logger.info(f"Added {profiles_to_add} {transaction['package_id']} credits to user {current_user['email']} (via polling)")
            else:
                logger.info(f"Credits already added for session {session_id} (likely via webhook)")

        await db.payment_transactions.update_one(
            {"session_id": session_id},
            {"$set": {k: v for k, v in update_data.items() if k != "payment_status"}}
        )

    return PaymentStatusResponse(
        status=checkout_status.status, payment_status=checkout_status.payment_status,
        amount=transaction["amount"], currency=transaction["currency"],
        package_id=transaction["package_id"], package_name=transaction["package_name"]
    )


@router.get("/credits", response_model=UserCreditsResponse)
async def get_user_credits(current_user: dict = Depends(get_current_user)):
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0})
    basic = user.get("basic_credits", 0)
    comprehensive = user.get("comprehensive_credits", 0)
    premium = user.get("premium_credits", 0)
    return UserCreditsResponse(basic_credits=basic, comprehensive_credits=comprehensive, premium_credits=premium, total_analyses_available=basic + comprehensive + (premium * 2))


@router.get("/transactions")
async def get_user_transactions(current_user: dict = Depends(get_current_user)):
    transactions = await db.payment_transactions.find({"user_id": current_user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(50)
    return transactions


@router.post("/webhook/stripe")
async def stripe_webhook(request: Request):
    try:
        body = await request.body()
        signature = request.headers.get("Stripe-Signature")
        host_url = str(request.base_url).rstrip('/')
        webhook_url = f"{host_url}/api/webhook/stripe"
        stripe_checkout = StripeCheckout(api_key=STRIPE_API_KEY, webhook_url=webhook_url)
        webhook_response = await stripe_checkout.handle_webhook(body, signature)

        if webhook_response.payment_status == "paid":
            session_id = webhook_response.session_id
            transaction = await db.payment_transactions.find_one({"session_id": session_id}, {"_id": 0})

            if transaction and transaction["payment_status"] != "paid":
                update_result = await db.payment_transactions.update_one(
                    {"session_id": session_id, "payment_status": {"$ne": "paid"}},
                    {"$set": {"payment_status": "paid", "credits_added_by": "webhook", "updated_at": datetime.now(timezone.utc).isoformat()}}
                )
                if update_result.modified_count > 0:
                    user_id = transaction["user_id"]
                    profiles_to_add = transaction["profiles_included"]
                    credit_field = f"{transaction['package_id']}_credits"
                    await db.users.update_one(
                        {"id": user_id},
                        {"$inc": {credit_field: profiles_to_add}, "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}}
                    )
                    logger.info(f"Webhook: Added {profiles_to_add} credits to user {user_id}")
                else:
                    logger.info(f"Webhook: Credits already added for session {session_id}")

                user = await db.users.find_one({"id": user_id}, {"_id": 0})
                if user:
                    await send_payment_confirmation_to_client(
                        user_email=transaction["user_email"],
                        user_name=user.get("name", "Customer"),
                        package_name=transaction["package_name"],
                        amount=transaction["amount"],
                        currency=transaction["currency"],
                        credits_added=profiles_to_add
                    )

        return {"status": "received"}
    except Exception as e:
        logger.error(f"Webhook error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
