# backend/services/suggestion_service.py

import os
from time import time
import requests
from typing import Optional
from concurrent.futures import ThreadPoolExecutor
# from openai import OpenAI
# =========================
# Configuration
# =========================
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "phi3")

LLM_PROVIDER = os.getenv("LLM_PROVIDER", "openai")  # "openai" or "ollama"

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "gpt-4o-mini")  # A smaller, faster model for testing; switch to "gpt-4o" for better quality when ready

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")  # Default to smaller model for testing; switch to "gpt-4o" for better quality when ready
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"


   # A smaller, faster model for testing; switch to "gpt-4o" for better quality when ready

print("LLM_PROVIDER:", LLM_PROVIDER)
print("MODEL:", OPENROUTER_MODEL)

# =========================
# Prompt Builder
# =========================

def build_prompt(clause: str, category: str, risk_level: str) -> str:
    """
    Builds a consistent legal optimization prompt.  
    """

    prompt = f"""
    You are a senior contracts attorney specializing in commercial law.

    ORIGINAL CLAUSE:
    {clause}

    CATEGORY: {category}

    Your task is to produce an OPTIMIZED alternative clause.

    STRICT OUTPUT FORMAT (DO NOT DEVIATE):

    ISSUES FOUND:
    1. <clear, specific legal issue>
    2. <clear, specific legal issue>
    3. <clear, specific legal issue>

    ---
    OPTIMIZED CLAUSE:
    <Rewrite the clause in clear, legally enforceable language. Keep it concise and precise.>

    IMPORTANT:
    - Issues must be specific (no generic statements)
    - Do NOT repeat the original clause
    - Do NOT leave placeholders
    - Ensure optimized clause fixes ALL listed issues
    """
    return prompt.strip()


# =========================
# OpenAI Suggestion
# =========================

def generate_openai_suggestion(prompt: str) -> Optional[str]:
    """
    Generate suggestion using OpenAI API.
    """

    if not OPENROUTER_API_KEY:
        return None

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": OPENROUTER_MODEL,
        "messages": [
            {"role": "system", "content": "You are a legal contract optimization assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }

    # payload = {
    #     "model": OPENROUTER_MODEL,
    #     "messages": [
    #         {
    #             "role": "user",
    #             "content": prompt
    #         }
    #     ],
    #     "temperature": 0.2,
    #     "max_tokens": 1024
    # }
    

    try:
        response = requests.post(OPENROUTER_URL, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        data = response.json()

        return data["choices"][0]["message"]["content"].strip()

    except Exception as e:
        print("⚠️ OPENROUTER suggestion failed:", e)
        return "AI_UNAVAILABLE"


# =========================
# Ollama Suggestion
# =========================

def generate_ollama_suggestion(prompt: str):

    print("Using Ollama model:", OLLAMA_MODEL)

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": prompt,
        "stream": False
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=120
        )

        if response.status_code != 200:
        
            return None

        data = response.json()

    

        if "response" in data:
            return data["response"].strip()

        if "message" in data and "content" in data["message"]:
            return data["message"]["content"].strip()

        return str(data)

   
        return None

    except Exception as e:
        print("Ollama request failed:", e)
        return None

# =========================
# Public Suggestion Function
# =========================

def generate_clause_suggestion(
    clause: str,
    category: str,
    risk_level: str
) -> Optional[str]:
    """
    Main suggestion entry point used by clause_service.
    """
    # Only generate suggestions for Medium/High risk
    if risk_level not in ("High", "Medium"):
        return None

    prompt = build_prompt(clause, category, risk_level)
    print("Calling LLM for clause:", clause[:60])

    if LLM_PROVIDER == "ollama":
        return generate_ollama_suggestion(prompt)

    return call_with_retry(prompt)

def generate_batch_suggestions(clauses):
    """
    Parallel AI suggestions using threads (safe version).
    """
    def process_clause(c):
        
        return generate_clause_suggestion(
            clause=c["sentence"],
            category=c["matched_category"],
            risk_level=c["risk_level"]
            
        )

    
    with ThreadPoolExecutor(max_workers=4) as executor:
        results = list(executor.map(process_clause, clauses))
    return results

def call_with_retry(prompt, retries=2):
    for attempt in range(retries):
        result = generate_openai_suggestion(prompt)

        if result and "AI_UNAVAILABLE" not in result:
            return result

        time.sleep(2 ** attempt)

    return "AI_UNAVAILABLE"