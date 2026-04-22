def infer_risk(clause: str, category: str) -> str:
    c = clause.lower()

    high_risk_keywords = [
        "unlimited liability",
        "without limitation",
        "indemnify",
        "hold harmless",
        "full liability"
    ]

    medium_risk_keywords = [
        "termination",
        "payment",
        "delay",
        "penalty",
        "confidential",
        "data"
    ]

    if any(k in c for k in high_risk_keywords):
        return "High"

    if any(k in c for k in medium_risk_keywords):
        return "Medium"

    if category and any(k in category.lower() for k in ["liability", "indemnity"]):
        return "High"

    if category and any(k in category.lower() for k in ["payment", "termination"]):
        return "Medium"

    return "Low"