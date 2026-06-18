from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv
import os
import logging

logger = logging.getLogger(__name__)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env', override=True)

# MongoDB
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

client = None
db = None

def init_mongodb():
    global client, db
    try:
        client = AsyncIOMotorClient(
            mongo_url,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=30000,
            retryWrites=True,
            w='majority'
        )
        db = client[db_name]
        logger.info(f"MongoDB client initialized for database: {db_name}")
        return True
    except Exception as e:
        logger.error(f"Failed to initialize MongoDB client: {e}")
        client = None
        db = None
        return False

init_mongodb()

# JWT
JWT_SECRET = os.environ.get('JWT_SECRET', 'fallback-secret-key')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Admin
ADMIN_USERNAME = os.environ.get('ADMIN_USERNAME', 'admin')
ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'admin2026')

# API Keys
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
SERPAPI_KEY = os.environ.get('SERPAPI_KEY')
STRIPE_API_KEY = os.environ.get('STRIPE_API_KEY')
RESEND_API_KEY = os.environ.get('RESEND_API_KEY')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'fsixou@yahoo.fr')

# Resend setup
import resend
resend.api_key = RESEND_API_KEY

# Pricing packages
PRICING_PACKAGES = {
    "basic": {
        "name": "Basic Verification",
        "amount": 49.00,
        "currency": "eur",
        "description": "Standard profile analysis with trust score and basic red flag detection",
        "profiles_included": 1
    },
    "comprehensive": {
        "name": "Comprehensive Verification",
        "amount": 99.00,
        "currency": "eur",
        "description": "In-depth investigation with extended background check and detailed report",
        "profiles_included": 1
    },
    "premium": {
        "name": "Premium Package",
        "amount": 189.00,
        "currency": "eur",
        "description": "All comprehensive features plus continuous monitoring and expert consultation",
        "profiles_included": 1
    }
}
