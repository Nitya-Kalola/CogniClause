# backend/services/clause_service.py

from typing import Dict, List
from sentence_transformers import util
from sentence_transformers import SentenceTransformer, util
from services.suggestion_service import generate_clause_suggestion
from services.suggestion_service import generate_batch_suggestions
import numpy as np
import re
import copy
import uuid
import threading
from concurrent.futures import ThreadPoolExecutor


# =========================
# Model & Category Setup
# =========================

MODEL_NAME = "all-MiniLM-L6-v2"
model = SentenceTransformer(MODEL_NAME)

AI_RESULTS= {}

RUNNING_JOBS = set()

executor = ThreadPoolExecutor(max_workers=3)

from services.category_info import (
    CATEGORIES,
    CATEGORY_PROTOTYPES,
    CATEGORY_RISK_MAP,
    ISSUES,
    SUGGESTIONS, FINE_GRAINED_LABELS, RISK_BOOSTING_KEYWORDS
)

# =========================
# Helper Functions
# =========================

def split_into_sentences(text: str):
    return [
        s.strip()
        for s in re.split(r'(?<=[.!?])\s+', text)
        if len(s.strip()) > 20
    ]

# simple keyword boost
keywords = ["confidential", "data", "secret", "disclosure"]

def has_overlap(a, b):
    return any(k in a.lower() and k in b.lower() for k in keywords)


def split_into_clauses(text: str) -> List[str]:
    if not text:
        return []

    sentences = split_into_sentences(text)

    if len(sentences) <= 2:
        return sentences

    embeddings = model.encode(
        sentences,
        convert_to_tensor=True,
        normalize_embeddings=True
    )

    clauses = []
    current_clause = [sentences[0]]

    for i in range(1, len(sentences)):
        sim = util.cos_sim(embeddings[i - 1], embeddings[i]).item()

        if sim > 0.5:
            current_clause.append(sentences[i])
        else:
            clauses.append(" ".join(current_clause))
            current_clause = [sentences[i]]

    clauses.append(" ".join(current_clause))

    return clauses[:45]  # limit to 45 clauses for performance


def normalize_risk(risk: str) -> str:
    """
    Ensures risk level is always High / Medium / Low
    """
    if risk in ("High", "Medium", "Low"):
        return risk
    return "Low"


def compute_overall_risk(risk_counts: dict) -> str:
    high = risk_counts.get("High", 0)
    medium = risk_counts.get("Medium", 0)
    low = risk_counts.get("Low", 0)

    total = high + medium + low
    if total == 0:
        return "Unknown"

    score = (3 * high + 2 * medium + 1 * low) / total

    if score >= 2.3:
        return "High"
    elif score >= 1.6:
        return "Medium"
    else:
        return "Low"



# =========================
# Core Clause Analysis
# =========================

def analyze_clause(clause: str, category_embeddings, clause_embedding, category_map) -> Dict:
    """
    Analyze a single clause and return classification & risk.
    """

    similarities = util.cos_sim(clause_embedding, category_embeddings)[0]
    best_idx = int(torch_argmax(similarities))
    similarity_score = float(similarities[best_idx])

    matched_category = category_map[best_idx]
    risk_level = normalize_risk(CATEGORY_RISK_MAP.get(matched_category, "Low"))
    

    return {
    "sentence": clause,
    "matched_category": matched_category,
    "cluster_id": best_idx,
    "similarity_score": round(similarity_score, 3),
    "risk_level": risk_level,
    "issue": ISSUES.get(matched_category, ""),
    "suggested_optimization": SUGGESTIONS.get(matched_category, ""),
    "ai_optimized_clause": None
}


def torch_argmax(tensor):
    """
    Safe argmax without torch import issues.
    """
    return int(np.argmax(tensor.cpu().numpy()))

def run_ai_background(job_id, details, top_indices):
    if job_id in RUNNING_JOBS:
        return
    RUNNING_JOBS.add(job_id)
    try:
        top_clauses = [details[i] for i in top_indices]

        suggestions = generate_batch_suggestions(top_clauses)

        for idx, suggestion in zip(top_indices, suggestions):
            if suggestion and "AI_UNAVAILABLE" not in suggestion:
                details[idx]["ai_optimized_clause"] = suggestion
                details[idx]["source"] = "llm"
                details[idx]["ai_loading"] = False
            else:
                details[idx]["ai_optimized_clause"] = details[idx]["suggested_optimization"]
                details[idx]["source"] = "fallback"
                details[idx]["ai_loading"] = False

        # 🔥 Assign fallback to NON-top clauses
        for i in range(len(details)):
            if i not in top_indices:
                details[i]["ai_optimized_clause"] = details[i]["suggested_optimization"]
                details[i]["source"] = "rule-based"

        # 🔥 Separate AI and non-AI clauses
        ai_clauses = [d for d in details if d.get("source") == "llm"]
        fallback_clauses = [d for d in details if d.get("source") != "llm"]

        # 🎯 Combine with AI first
        ordered_details = ai_clauses + fallback_clauses

        AI_RESULTS[job_id] = {
            "status": "completed",
            "details": ordered_details
        }

    except Exception as e:
        AI_RESULTS[job_id] = {
            "status": "failed",
            "error": str(e)
        }
    RUNNING_JOBS.remove(job_id)

# =========================
# Main Public API Function
# =========================

def evaluate_contract(contract_text: str) -> Dict:
    
    clauses = split_into_clauses(contract_text)

    if not clauses:
        return {
            "overall_risk": "Unknown",
            "risk_counts": {"High": 0, "Medium": 0, "Low": 0},
            "clause_count": 0,
            "details": [],
        }
    
    category_texts = []
    category_map = []

    for category, examples in CATEGORY_PROTOTYPES.items():
        for ex in examples:
            category_texts.append(ex)
            category_map.append(category)

    clause_embeddings = model.encode(
        clauses,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    category_embeddings = model.encode(
        category_texts,
        convert_to_tensor=True,
        normalize_embeddings=True,
    )

    details = []
    risk_counts = {"High": 0, "Medium": 0, "Low": 0}

    

    for idx, clause in enumerate(clauses):
        result = analyze_clause(
            clause=clause,
            category_embeddings=category_embeddings,
            clause_embedding=clause_embeddings[idx],
            category_map=category_map
        )
        risk = normalize_risk(result["risk_level"])
        risk_counts[risk] += 1
        details.append(result)

    overall_risk = compute_overall_risk(risk_counts)

    # =========================
    # ✅ PREPARE BACKGROUND AI
    # =========================
    # 🎯 Importance-based ranking (risk + similarity)
    RISK_SCORE = {"High": 3, "Medium": 2, "Low": 1}

    for i in range(len(details)):
        risk = details[i]["risk_level"]
        sim = details[i]["similarity_score"]

        details[i]["importance"] = (RISK_SCORE.get(risk, 1) * 0.7) + (sim * 0.3)

    # Sort by importance
    sorted_indices = sorted(
        range(len(details)),
        key=lambda i: details[i]["importance"],
        reverse=True
    )

    # ✅ Select TOP 15 only
    MAX_AI_CLAUSES = 15

    top_indices = sorted_indices[:MAX_AI_CLAUSES]

    # 🔥 STEP: Mark AI + static BEFORE sending to frontend

    top_index_set = set(top_indices)

    for i in range(len(details)):
        if i in top_index_set:
            details[i]["source"] = "llm"
            details[i]["ai_loading"] = True
        else:
            details[i]["source"] = "rule-based"
            details[i]["ai_loading"] = False

    job_id = str(uuid.uuid4())

    # 🔥 Run background AI properly
    AI_RESULTS[job_id] = {"status": "processing"}

    # 🚫 prevent duplicate execution
    if job_id not in RUNNING_JOBS:
        executor.submit(run_ai_background, job_id, details, top_indices)
        

    # 🔥 Ensure AI clauses appear FIRST from initial render
    ai_clauses = [details[i] for i in top_indices]
    other_clauses = [details[i] for i in range(len(details)) if i not in top_indices]

    details = ai_clauses + other_clauses

    return {   
        "details": details,
        "job_id": job_id,
        "status": "processing", 
        "risk_level": overall_risk,    
        "overall_risk": overall_risk,
        "risk_counts": risk_counts,
        "clause_count": len(details),
        "average_risk_score": round(
            (3 * risk_counts["High"] + 2 * risk_counts["Medium"] + 1 * risk_counts["Low"]) / len(details), 2
        ) if details else 0,
        "categories_summary": {cat: {"count": sum(1 for d in details if d["matched_category"] == cat), "risk_levels": [d["risk_level"] for d in details if d["matched_category"] == cat]} for cat in CATEGORIES}
        
    }