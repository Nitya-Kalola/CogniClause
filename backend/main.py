from dotenv import load_dotenv
import os
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routes_contracts, routes_health, routes_auth, routes_optimization
from pydantic import BaseModel
from services.clause_service import evaluate_contract



app = FastAPI(title="CogniClause API")

class EvaluateRequest(BaseModel):
    contract_text: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# include routers
app.include_router(routes_health.router, prefix="/health", tags=["Health"])
app.include_router(routes_contracts.router, prefix="/contracts", tags=["Contracts"])
app.include_router(routes_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(routes_optimization.router, prefix="/optimize", tags=["Optimization"])

@app.get("/")
def root():
    return {"message": "Welcome to CogniClause Backend"}

@app.post("/contracts/evaluate")
def evaluate_contract_api(payload: EvaluateRequest):
    return evaluate_contract(payload.contract_text)
