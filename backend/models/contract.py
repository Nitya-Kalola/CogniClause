from fastapi import APIRouter
from pydantic import BaseModel
from services.clause_service import evaluate_contract

router = APIRouter(prefix="/contracts", tags=["Contracts"])

class EvaluateRequest(BaseModel):
    contract_text: str

@router.post("/evaluate")
def evaluate_contract_api(payload: EvaluateRequest):
    return evaluate_contract(payload.contract_text)