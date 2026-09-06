from fastapi import FastAPI

from app.routers.health import router as health_route

app = FastAPI()

app.include_router(health_route, prefix = "/health")

@app.get("/")
def read_root():
    return {"message": "IELTS backend is running"}


    