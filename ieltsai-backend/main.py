from fastapi import FastAPI

from app.routers.health import router as health_route
from app.services.APIhealth import router as deepseek_health

app = FastAPI()

app.include_router(health_route)
app.include_router(deepseek_health)

@app.get("/")
def read_root():
    return {"message": "IELTS backend is running"}


    