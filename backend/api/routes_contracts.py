
# backend/api/routes_contracts.py
from fastapi import APIRouter, UploadFile, File, HTTPException, Request, Form
from services.parser_service import extract_text
from services.clause_service import evaluate_contract
from database.supabase_client import supabase
from fastapi.responses import StreamingResponse
from services.clause_service import AI_RESULTS
import json
import jwt

router = APIRouter()

def extract_user_id_from_bearer(request: Request):
    """
    Try to decode Bearer token (JWT) from Authorization header and return 'sub' (user id).
    This is best-effort and does no signature verification (server uses service role for inserts).
    If you prefer not to decode tokens on the server, send user_id in the JSON payload (key: user_id).
    """
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if not auth:
        return None
    parts = auth.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    token = parts[1]
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        # supabase uses 'sub' as user id in JWT
        return payload.get("sub")
    except Exception:
        return None

@router.post("/evaluate")
async def evaluate(request: Request):
    """
    Accepts flexible payloads. Prefer keys: text, content, contract_text.
    Returns evaluation result from clause_service.evaluate_contract(...)
    Also attempts to insert a summary row into Supabase (non-blocking).
    """
    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    # Resolve text from several possible keys
    text = None
    if isinstance(payload, dict):
        for key in ("text", "content", "contract_text", "body"):
            if key in payload and payload[key]:
                if isinstance(payload[key], dict) and "text" in payload[key]:
                    text = payload[key]["text"]
                else:
                    text = payload[key]
                break
    elif isinstance(payload, str):
        text = payload

    if not text:
        raise HTTPException(status_code=422, detail="Request must include contract text under 'text'/'content'/'contract_text'")

    # evaluate
    try:
        result =  evaluate_contract(text)
    except Exception as e:
        import traceback
        print("🔥 FULL ERROR:")
        traceback.print_exc()
        return {"error": str(e)}

    # Normalize / enrich result values if missing
    clause_count = result.get("clause_count", len(result.get("details", [])))
    categories_summary = result.get("categories_summary", {})
    low_count = result.get("low_count", 0)
    medium_count = result.get("medium_count", 0)
    high_count = result.get("high_count", 0)
    level = result.get("risk_level") or None
    avg_score = result.get("average_risk_score")

    # Try to insert into Supabase if available (non-blocking)
    try:
        if supabase:
            # determine a name fallback: payload.name -> payload.filename -> 'manual evaluation'
            name_val = None
            if isinstance(payload, dict):
                name_val = payload.get("name") or payload.get("filename")
            if not name_val:
                name_val = "manual evaluation"

            # try to extract user id from bearer token or payload
            user_id = payload.get("user_id") if isinstance(payload, dict) else None
            if not user_id:
                user_id = extract_user_id_from_bearer(request)

            insert_payload = {
                "name": name_val,
                "text": text,
                "risk_score": avg_score,
                "level": level,
                "categories_summary": result.get("categories_summary"),
                "details": result.get("details"),
                
                # user_id may be null if we couldn't extract it
                "user_id": user_id
            }

            # Remove None values (but keep empty dicts as JSON strings if present)
            insert_payload = {k: v for k, v in insert_payload.items() if v is not None}

            supabase.table("contracts").insert(insert_payload).execute()
    except Exception as e:
        # log but do not fail the request
        print("⚠️ Supabase insert failed (evaluate):", e)

    return result


@router.post("/upload")
async def upload_contract(
    file: UploadFile = File(...),
    user_id: str | None = Form(None),
    name: str | None = Form(None)
):
    text = await extract_text(file)

    if not text.strip():
        return {
            "success": False,
            "message": "Could not extract text from file. Unsupported or corrupted file.",
            "user_id": user_id,
            "file_name": file.filename
        }

    result = evaluate_contract(text)

    # Add a risk_level fallback
    if result and "average_risk_score" in result:
        avg = result["average_risk_score"]
        if avg <= 1.5:
            risk_label = "Low"
        elif avg <= 2.3:
            risk_label = "Medium"
        else:
            risk_label = "High"
        result["risk_level"] = risk_label

    # Save to Supabase
    try:
        payload = {
            "name": name or file.filename,
            "text": text,
            "risk_score": result.get("average_risk_score"),
            "level": result.get("risk_level"),
            "user_id": user_id,
            "categories_summary": result.get("categories_summary"),
            "details": result.get("details")
        }
        payload = {k: v for k, v in payload.items() if v is not None}

        supabase.table("contracts").insert(payload).execute()
    except Exception as e:
        print("Supabase insert failed (upload):", e)


    return result


@router.get("/ai-status/{job_id}")
async def get_ai_status(job_id: str):
    from services.clause_service import AI_RESULTS

    if job_id not in AI_RESULTS:
        return {"status": "processing"}

    return AI_RESULTS[job_id]

@router.get("/stream-ai/{job_id}")
async def stream_ai(job_id: str):

    async def event_generator():
        import asyncio

        last_sent = set()

        while True:
            if job_id in AI_RESULTS:
                data = AI_RESULTS[job_id]

                # send updates clause-by-clause
                for idx, clause in enumerate(data.get("details", [])):
                    ai_text = clause.get("ai_optimized_clause")

                    if ai_text and idx not in last_sent:
                        last_sent.add(idx)

                        payload = {
                            "index": idx,
                            "text": ai_text
                        }

                        yield f"data: {json.dumps(payload)}\n\n"

                if data.get("status") == "completed":
                    yield "data: DONE\n\n"
                    break

            await asyncio.sleep(0.5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")
