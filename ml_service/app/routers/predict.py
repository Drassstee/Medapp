from fastapi import APIRouter
from pydantic import BaseModel
import random

router = APIRouter(prefix="/predict", tags=["Predict"])

class Symptoms(BaseModel):
    fever: bool
    cough: bool
    headache: bool

@router.post("/")
def predict(symptoms: Symptoms):
    # I will replace here with model
    risk_score = random.uniform(0, 1)
    result = "Likely Sick" if risk_score > 0.5 else "Healthy"
    return {"prediction": result, "confidence": round(risk_score, 2)}