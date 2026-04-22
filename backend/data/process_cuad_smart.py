import json
import pandas as pd
import os
from tqdm import tqdm

DATA_PATH = os.path.join(os.path.dirname(__file__), "CUAD_v1.json")
OUTPUT_CSV = os.path.join(os.path.dirname(__file__), "legal_clauses.csv")
OUTPUT_PKL = os.path.join(os.path.dirname(__file__), "legal_clauses.pkl")

def load_json_streaming(path):
    """Stream-load the CUAD JSON file safely."""
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data

print("📖 Loading CUAD dataset safely...")
data = load_json_streaming(DATA_PATH)

if isinstance(data, dict) and "data" in data:
    data = data["data"]



clauses = []

for doc in tqdm(data, desc="Processing CUAD"):
    doc_title = doc.get("title", "Untitled Document")

    for para in doc.get("paragraphs", []):
        context = para.get("context", "").strip()
        if not context:
            continue

        # Each paragraph has multiple QAs (questions about legal clauses)
        for qa in para.get("qas", []):
            clause_text = context
            category = qa.get("question", "Unknown Category")
            answers = qa.get("answers", [])
            # Use heuristic: risk_level = High if question contains risky terms
            risk_level = "Medium"
            q_lower = category.lower()
            if any(k in q_lower for k in ["termination", "liability", "penalty", "indemnity"]):
                risk_level = "High"
            elif any(k in q_lower for k in ["confidentiality", "obligation", "payment", "data"]):
                risk_level = "Medium"
            else:
                risk_level = "Low"

            clauses.append({
                "clause_text": clause_text[:5000],  # truncate to avoid oversized cells
                "category": category,
                "risk_level": risk_level,
                "document": doc_title
            })


# Save to CSV (streaming mode)
chunk_size = 2000
for i in range(0, len(clauses), chunk_size):
    chunk = pd.DataFrame(clauses[i:i+chunk_size])
    mode = 'a' if i > 0 else 'w'
    header = False if i > 0 else True
    chunk.to_csv(OUTPUT_CSV, index=False, mode=mode, header=header, encoding='utf-8')



# Save also as pickle (faster loading for backend)
df = pd.read_csv(OUTPUT_CSV)
df.to_pickle(OUTPUT_PKL)

