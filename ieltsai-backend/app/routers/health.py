
import os
from dotenv import load_dotenv
from fastapi import APIRouter

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

from app.services.APIhealth import check_deepseek_connection

router = APIRouter(tags=["health"])

@router.get("/")
def read_root():
    return {"message":"Backend is running"}


@router.get("/AI")
def ai_health():
    print("Currently awaiting AI response")
    result = check_deepseek_connection(DEEPSEEK_API_KEY)
    return {"message": result}

