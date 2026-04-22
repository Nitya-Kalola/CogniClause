import pandas as pd
df = pd.read_pickle("data/legal_clauses.pkl")
print(df.columns.tolist())
