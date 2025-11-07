from fastapi import APIRouter
from pydantic import BaseModel

from math import exp

router = APIRouter(prefix="/predict", tags=["Predict"])

class Symptoms(BaseModel):
    fever: bool
    cough: bool
    headache: bool

@router.post("/")
def predict(symptoms: Symptoms):
    coefficients = {
        "intercept": -1.2,
        "fever": 1.5,
        "cough": 0.9,
        "headache": 0.6,
    }

    linear_sum = coefficients["intercept"]
    if symptoms.fever:
        linear_sum += coefficients["fever"]
    if symptoms.cough:
        linear_sum += coefficients["cough"]
    if symptoms.headache:
        linear_sum += coefficients["headache"]

    probability = 1 / (1 + exp(-linear_sum))
    prediction = "Likely Sick" if probability >= 0.5 else "Low Risk"

    return {"prediction": prediction, "confidence": round(probability, 2)}