from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# ===== Models =====

class Business(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    owner_name: str
    mobile: str
    whatsapp: Optional[str] = None
    address: str
    district: str  # "Tirunelveli" | "Thoothukudi"
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = ""
    rating: Optional[float] = 4.5
    image_url: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class BusinessCreate(BaseModel):
    name: str
    owner_name: str
    mobile: str
    whatsapp: Optional[str] = None
    address: str
    district: str
    category: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    description: Optional[str] = ""
    image_url: Optional[str] = None


class Category(BaseModel):
    key: str
    label: str
    icon: str
    image_url: str


CATEGORIES: List[Category] = [
    Category(key="hotels", label="Hotels", icon="bed-outline",
             image_url="https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"),
    Category(key="hospitals", label="Hospitals", icon="medkit-outline",
             image_url="https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg"),
    Category(key="battery", label="Battery Shops", icon="battery-charging-outline",
             image_url="https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"),
    Category(key="electricians", label="Electricians", icon="flash-outline",
             image_url="https://images.pexels.com/photos/9679179/pexels-photo-9679179.jpeg"),
    Category(key="plumbers", label="Plumbers", icon="water-outline",
             image_url="https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg"),
    Category(key="auto", label="Auto Services", icon="car-outline",
             image_url="https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"),
    Category(key="restaurants", label="Restaurants", icon="restaurant-outline",
             image_url="https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"),
    Category(key="salons", label="Salons", icon="cut-outline",
             image_url="https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"),
    Category(key="grocery", label="Grocery", icon="basket-outline",
             image_url="https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"),
]


SEED_BUSINESSES = [
    # Tirunelveli
    {"name": "Iruttu Kadai Halwa Shop", "owner_name": "Selvaraj", "mobile": "9442123456",
     "address": "West Car Street, Tirunelveli Town", "district": "Tirunelveli", "category": "restaurants",
     "latitude": 8.7139, "longitude": 77.7567, "description": "Famous halwa shop since 1900s.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "Hotel Aryaas", "owner_name": "Murugan", "mobile": "9842234567",
     "address": "67 Madurai Road, Tirunelveli Junction", "district": "Tirunelveli", "category": "hotels",
     "latitude": 8.7256, "longitude": 77.6900, "description": "AC rooms with restaurant.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "Galaxy Hospital", "owner_name": "Dr. Karthik", "mobile": "9842345678",
     "address": "Palayamkottai Main Road, Tirunelveli", "district": "Tirunelveli", "category": "hospitals",
     "latitude": 8.7283, "longitude": 77.7341, "description": "Multi-speciality hospital, 24x7 emergency.",
     "image_url": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg"},
    {"name": "Power Battery World", "owner_name": "Ramesh", "mobile": "9943456789",
     "address": "Bypass Road, Vannarpettai, Tirunelveli", "district": "Tirunelveli", "category": "battery",
     "latitude": 8.7194, "longitude": 77.7350, "description": "All brands - Exide, Amaron, Luminous.",
     "image_url": "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"},
    {"name": "Sakthi Electricals", "owner_name": "Vinoth Kumar", "mobile": "9789567890",
     "address": "Tower Junction, Tirunelveli Town", "district": "Tirunelveli", "category": "electricians",
     "latitude": 8.7150, "longitude": 77.7480, "description": "Wiring, repairs, installations.",
     "image_url": "https://images.pexels.com/photos/9679179/pexels-photo-9679179.jpeg"},
    {"name": "Senthil Plumbing Works", "owner_name": "Senthil Kumar", "mobile": "9787678901",
     "address": "VOC Nagar, Palayamkottai", "district": "Tirunelveli", "category": "plumbers",
     "latitude": 8.7300, "longitude": 77.7350, "description": "24/7 emergency plumbing.",
     "image_url": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg"},
    {"name": "Sri Lakshmi Auto Service", "owner_name": "Babu", "mobile": "9043789012",
     "address": "NH-7 Bypass, Tirunelveli", "district": "Tirunelveli", "category": "auto",
     "latitude": 8.7100, "longitude": 77.7100, "description": "Cars, bikes, all repairs.",
     "image_url": "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"},
    {"name": "Aalayam Restaurant", "owner_name": "Mohan", "mobile": "9842890123",
     "address": "Trivandrum Road, Tirunelveli", "district": "Tirunelveli", "category": "restaurants",
     "latitude": 8.7220, "longitude": 77.7000, "description": "South Indian veg meals.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "Green Leaf Hospital", "owner_name": "Dr. Priya", "mobile": "9786901234",
     "address": "Vannarpettai, Tirunelveli", "district": "Tirunelveli", "category": "hospitals",
     "latitude": 8.7180, "longitude": 77.7380, "description": "Children & maternity care.",
     "image_url": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg"},
    {"name": "Rolex Salon", "owner_name": "Anand", "mobile": "9043012345",
     "address": "Trivandrum Road, Tirunelveli Junction", "district": "Tirunelveli", "category": "salons",
     "latitude": 8.7250, "longitude": 77.6920, "description": "Unisex salon, AC.",
     "image_url": "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"},
    {"name": "Saravana Stores", "owner_name": "Saravanan", "mobile": "9842123450",
     "address": "Melapalayam, Tirunelveli", "district": "Tirunelveli", "category": "grocery",
     "latitude": 8.7000, "longitude": 77.7300, "description": "Daily groceries, home delivery.",
     "image_url": "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"},
    {"name": "Amaron Battery Point", "owner_name": "Karthik", "mobile": "9994234561",
     "address": "Junction Main Road, Tirunelveli", "district": "Tirunelveli", "category": "battery",
     "latitude": 8.7230, "longitude": 77.6950, "description": "Inverter & car batteries.",
     "image_url": "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"},

    # Thoothukudi
    {"name": "Hotel Sea View", "owner_name": "Antony", "mobile": "9842345671",
     "address": "Beach Road, Thoothukudi", "district": "Thoothukudi", "category": "hotels",
     "latitude": 8.7642, "longitude": 78.1348, "description": "Sea-facing rooms, AC.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "Pearl City Hospital", "owner_name": "Dr. Stephen", "mobile": "9943567812",
     "address": "Palayamkottai Road, Thoothukudi", "district": "Thoothukudi", "category": "hospitals",
     "latitude": 8.7700, "longitude": 78.1300, "description": "Multi-speciality, ICU.",
     "image_url": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg"},
    {"name": "Coastal Battery Shop", "owner_name": "Mariappan", "mobile": "9789678923",
     "address": "Harbour Road, Thoothukudi", "district": "Thoothukudi", "category": "battery",
     "latitude": 8.7650, "longitude": 78.1400, "description": "Marine & auto batteries.",
     "image_url": "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"},
    {"name": "Selva Electricals", "owner_name": "Selvam", "mobile": "9787789034",
     "address": "Thoothukudi Old Bus Stand", "district": "Thoothukudi", "category": "electricians",
     "latitude": 8.7625, "longitude": 78.1310, "description": "Home & commercial wiring.",
     "image_url": "https://images.pexels.com/photos/9679179/pexels-photo-9679179.jpeg"},
    {"name": "Royal Plumbing", "owner_name": "John Peter", "mobile": "9043890145",
     "address": "Millerpuram, Thoothukudi", "district": "Thoothukudi", "category": "plumbers",
     "latitude": 8.7710, "longitude": 78.1260, "description": "RO, motors, fittings.",
     "image_url": "https://images.pexels.com/photos/6419128/pexels-photo-6419128.jpeg"},
    {"name": "Marina Auto Garage", "owner_name": "Stephen Raj", "mobile": "9842901256",
     "address": "Port Road, Thoothukudi", "district": "Thoothukudi", "category": "auto",
     "latitude": 8.7660, "longitude": 78.1380, "description": "Cars & trucks, all brands.",
     "image_url": "https://images.pexels.com/photos/4374843/pexels-photo-4374843.jpeg"},
    {"name": "Macrons Restaurant", "owner_name": "Velu", "mobile": "9786012367",
     "address": "Beach Road, Thoothukudi", "district": "Thoothukudi", "category": "restaurants",
     "latitude": 8.7635, "longitude": 78.1370, "description": "Seafood specialities.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "Style Studio Salon", "owner_name": "Manoj", "mobile": "9442123478",
     "address": "George Road, Thoothukudi", "district": "Thoothukudi", "category": "salons",
     "latitude": 8.7680, "longitude": 78.1290, "description": "Hair, beard, facial.",
     "image_url": "https://images.pexels.com/photos/3992874/pexels-photo-3992874.jpeg"},
    {"name": "Annai Grocery Mart", "owner_name": "Devi", "mobile": "9994234589",
     "address": "Anna Nagar, Thoothukudi", "district": "Thoothukudi", "category": "grocery",
     "latitude": 8.7720, "longitude": 78.1340, "description": "Wholesale & retail.",
     "image_url": "https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg"},
    {"name": "Sun Hotels", "owner_name": "Bharath", "mobile": "9842345690",
     "address": "Trichy Road, Thoothukudi", "district": "Thoothukudi", "category": "hotels",
     "latitude": 8.7600, "longitude": 78.1250, "description": "Budget AC stay.",
     "image_url": "https://images.pexels.com/photos/34487094/pexels-photo-34487094.jpeg"},
    {"name": "City Care Hospital", "owner_name": "Dr. Vinodh", "mobile": "9043456712",
     "address": "Bryant Nagar, Thoothukudi", "district": "Thoothukudi", "category": "hospitals",
     "latitude": 8.7690, "longitude": 78.1320, "description": "General medicine, surgery.",
     "image_url": "https://images.pexels.com/photos/668300/pexels-photo-668300.jpeg"},
]


# ===== Routes =====

@api_router.get("/")
async def root():
    return {"message": "We Connect API"}


@api_router.get("/categories", response_model=List[Category])
async def get_categories():
    return CATEGORIES


@api_router.get("/businesses", response_model=List[Business])
async def list_businesses(
    district: Optional[str] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    query: dict = {}
    if district:
        query["district"] = district
    if category:
        query["category"] = category
    if search:
        query["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"owner_name": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
        ]
    items = await db.businesses.find(query, {"_id": 0}).to_list(1000)
    return [Business(**item) for item in items]


@api_router.get("/businesses/{business_id}", response_model=Business)
async def get_business(business_id: str):
    item = await db.businesses.find_one({"id": business_id}, {"_id": 0})
    if not item:
        raise HTTPException(status_code=404, detail="Business not found")
    return Business(**item)


@api_router.post("/businesses", response_model=Business)
async def create_business(payload: BusinessCreate):
    biz = Business(**payload.dict())
    doc = biz.dict()
    await db.businesses.insert_one(doc)
    return biz


@api_router.post("/seed")
async def seed_data():
    """Idempotent seed - only inserts if collection is empty."""
    count = await db.businesses.count_documents({})
    if count > 0:
        return {"seeded": False, "existing": count}
    docs = []
    for s in SEED_BUSINESSES:
        biz = Business(**s)
        docs.append(biz.dict())
    if docs:
        await db.businesses.insert_many(docs)
    return {"seeded": True, "count": len(docs)}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("startup")
async def startup_seed():
    try:
        count = await db.businesses.count_documents({})
        if count == 0:
            docs = [Business(**s).dict() for s in SEED_BUSINESSES]
            if docs:
                await db.businesses.insert_many(docs)
                logger.info(f"Seeded {len(docs)} businesses")
    except Exception as e:
        logger.error(f"Seed failed: {e}")


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
