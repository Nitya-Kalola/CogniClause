import os
import json
import re

# ---------------------------
#  Category keyword mapping
# ---------------------------
CATEGORY_KEYWORDS = {
    "confidentiality": [
        "confidential", "nda", "non-disclosure", "privacy", "secret",
        "proprietary information", "sensitive", "data", "information sharing"
    ],
    "liability": [
        "liability", "indemnity", "indemnification", "damages",
        "loss", "responsibility", "hold harmless"
    ],
    "termination": [
        "terminate", "termination", "breach", "cancel", "expiry",
        "suspend", "notice period"
    ],
    "payment": [
        "payment", "invoice", "fees", "billing", "charges", "price",
        "compensation", "cost"
    ],
    "governing law": [
        "jurisdiction", "law", "governing", "arbitration", "venue",
        "court", "dispute", "applicable law"
    ],
    "data protection": [
        "gdpr", "data", "security", "processing", "breach",
        "information security"
    ],
    "intellectual property": [
        "intellectual", "ip", "patent", "copyright",
        "ownership", "license"
    ],
    "representations": [
        "representation", "warranty", "guarantee", "assure", "certify"
    ],
    "force majeure": [
        "force majeure", "act of god", "disaster", "pandemic",
        "unforeseeable"
    ],
    "audit": [
        "audit", "inspection", "verify", "examination", "records"
    ],
    "compliance": [
        "compliance", "regulation", "policy", "standards"
    ],
    "insurance": [
        "insurance", "coverage", "insured", "policy"
    ],
    "assignment": [
        "assign", "transfer", "delegate", "successor"
    ],
    "dispute resolution": [
        "dispute", "arbitration", "litigation", "mediation",
        "settlement"
    ],
    "miscellaneous": []
}

# ---------------------------
#  File Paths
# ---------------------------
DATA_DIR = os.path.join(os.path.dirname(__file__), "../data")
INPUT_PATH = os.path.join(DATA_DIR, "auto_category_map.json")
OUTPUT_PATH = os.path.join(DATA_DIR, "cluster_labels.json")

if not os.path.exists(INPUT_PATH):
    raise FileNotFoundError(f"Could not find {INPUT_PATH}")

with open(INPUT_PATH, "r", encoding="utf-8") as f:
    clusters = json.load(f)



# ---------------------------
#  Helper: build text for a cluster
# ---------------------------
def cluster_to_text(clauses):
    """
    Accepts clauses which may be:
     - list of strings, or
     - list of dicts with 'clause_text' key (older format)
    Returns a single joined lowercased string.
    """
    texts = []
    for item in clauses:
        if isinstance(item, str):
            texts.append(item)
        elif isinstance(item, dict):
            # try common keys
            if "clause_text" in item:
                texts.append(item["clause_text"])
            elif "clause" in item:
                texts.append(item["clause"])
            elif "text" in item:
                texts.append(item["text"])
            else:
                # fallback: stringify
                texts.append(str(item))
        else:
            texts.append(str(item))
    return " ".join(texts).lower()

# ---------------------------
#  Guess category using keywords
# ---------------------------
def guess_category_from_text(text):
    for category, keywords in CATEGORY_KEYWORDS.items():
        for kw in keywords:
            if re.search(rf"\b{re.escape(kw)}\b", text):
                return category.title()
    return "General / Miscellaneous"

# ---------------------------
#  Build labels
# ---------------------------
cluster_labels = {}
for cluster_id, clauses in clusters.items():
    # robust: ensure clauses is a list
    if isinstance(clauses, dict):
        # some pipelines output dict {index: clause} — convert to list
        candidate_clauses = list(clauses.values())
    else:
        candidate_clauses = clauses

    text = cluster_to_text(candidate_clauses)
    label = guess_category_from_text(text)
    cluster_labels[str(cluster_id)] = label

# Save output
with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
    json.dump(cluster_labels, f, indent=2, ensure_ascii=False)


