import os
from dotenv import load_dotenv

load_dotenv()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")


from fastapi import APIRouter
from openai import OpenAI

router = APIRouter(tags = ["health"])

@router.get("/AI/health")
def check_deepseek_connection():
    client = OpenAI(api_key= DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    messages = [{"role": "user", "content": "I am checking if I can interact with you through my API and API key. Can you confirm this is working?"}]
    response = client.chat.completions.create(
        model="deepseek-v4-pro",
        messages=messages
    )
    return{response.choices[0].message.content}


