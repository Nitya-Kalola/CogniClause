# utils/cluster_categories.py
import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
import json
import os

model = SentenceTransformer("nlpaueb/legal-bert-base-uncased")

DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/legal_clauses.pkl")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "../data/auto_category_map.json")

df = pd.read_pickle(DATA_PATH)

# ✅ Use correct column names
clauses = df["clause_text"].dropna().tolist()
categories = df["category"].dropna().tolist()


# 🔹 Embed all clauses using LegalBERT
embeddings = model.encode(clauses, show_progress_bar=True)

# 🔹 Cluster clauses into 20 groups (you can tune this)
n_clusters = 20

kmeans = KMeans(n_clusters=n_clusters, random_state=42)
kmeans.fit(embeddings)

# Map cluster labels back to clauses and categories
cluster_map = {}
for i, label in enumerate(kmeans.labels_):
    cluster_map.setdefault(int(label), []).append({
        "clause_text": clauses[i],
        "category": categories[i],
        "risk_level": df.iloc[i]["risk_level"]
    })

# Save to JSON
with open(OUTPUT_PATH, "w") as f:
    json.dump(cluster_map, f, indent=2)


