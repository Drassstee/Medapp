from fastapi import FastAPI
from app.routers import predict

app = FastAPI(title="MedApp ML Service")
app.include_router(predict.router)

@app.get("/")
def root():
    return {"message": "ML service is running"}