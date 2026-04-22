# backend/utils/build_cluster_centroids.py
import os
import json
import pickle
from sentence_transformers import SentenceTransformer
import numpy as np

# Paths
BASE = os.path.join(os.path.dirname(__file__), "..")
DATA_DIR = os.path.join(BASE, "data")
CLUSTERS_PATH = os.path.join(DATA_DIR, "auto_category_map.json")
LABELS_PATH = os.path.join(DATA_DIR, "cluster_labels.json")
OUT_PATH = os.path.join(DATA_DIR, "cluster_centroids.pkl")

# Check files
if not os.path.exists(CLUSTERS_PATH):
    raise FileNotFoundError(f"Missing {CLUSTERS_PATH}")
if not os.path.exists(LABELS_PATH):
    raise FileNotFoundError(f"Missing {LABELS_PATH}")

# Load resources
with open(CLUSTERS_PATH, "r", encoding="utf-8") as f:
    clusters = json.load(f)

with open(LABELS_PATH, "r", encoding="utf-8") as f:
    cluster_labels = json.load(f)

print("🔹 Loading LegalBERT model (this may take a moment)...")
model = SentenceTransformer("nlpaueb/legal-bert-base-uncased")

centroids = {}

for cid, items in clusters.items():
    # items may be list[str] or list[dict]; normalize to text list
    texts = []
    if isinstance(items, dict):
        items = list(items.values())
    for it in items:
        if isinstance(it, str):
            texts.append(it)
        elif isinstance(it, dict):
            # common keys
            if "clause_text" in it:
                texts.append(it["clause_text"])
            elif "clause" in it:
                texts.append(it["clause"])
            elif "text" in it:
                texts.append(it["text"])
            else:
                texts.append(str(it))
        else:
            texts.append(str(it))

    if not texts:
       
        continue

    # embed in batches to avoid memory spikes
    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=False, batch_size=32)
    centroid = np.mean(embeddings, axis=0)
    centroids[str(cid)] = centroid

# Dump centroids + labels
with open(OUT_PATH, "wb") as f:
    pickle.dump({
        "centroids": centroids,          # dict cid -> numpy array
        "labels": cluster_labels         # dict cid -> human label
    }, f)


