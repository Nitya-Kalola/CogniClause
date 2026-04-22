import json
import csv
import os

data_path = os.path.join("data", "CUADv1.json")  # Adjust if needed
output_path = os.path.join("data", "legal_clauses.csv")


with open(data_path, "r", encoding="utf-8") as f:
    data = json.load(f)



fields = ["clause_text", "category", "risk_level"]
rows = []

def infer_risk(category):
    cat = category.lower()
    if any(word in cat for word in ["liability", "termination", "indemnification", "damages"]):
        return "High"
    elif any(word in cat for word in ["confidentiality", "data", "compliance", "security"]):
        return "Medium"
    else:
        return "Low"

# Detect structure
if isinstance(data, dict):
    if "data" in data and isinstance(data["data"], list):
        documents = data["data"]  # CUAD official format
    else:
        documents = data.values()  # Fallback if dict-of-documents
elif isinstance(data, list):
    documents = data
else:
    raise TypeError("Unsupported CUAD format")



# Extract all clauses
for doc in documents:
    paragraphs = doc.get("paragraphs", [])
    for para in paragraphs:
        context = para.get("context", "").strip()
        for qa in para.get("qas", []):
            category = qa.get("question", "Unknown Category")
            risk = infer_risk(category)
            rows.append([context, category, risk])

os.makedirs("data", exist_ok=True)
with open(output_path, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(fields)
    writer.writerows(rows)

