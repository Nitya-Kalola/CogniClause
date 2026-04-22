from fastapi import APIRouter

router = APIRouter()

@router.post("/login")
async def login(username: str, password: str):
    # Very simple placeholder. Replace with real auth later.
    if username == "admin" and password == "password":
        return {"message": "Login success"}
    return {"message": "Invalid credentials"}
