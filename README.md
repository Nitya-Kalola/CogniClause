# ⚖️ CogniClause
### AI-Powered Contract Intelligence & Risk Evaluation

**CogniClause** is a state-of-the-art legal tech platform designed to streamline contract review. It uses Natural Language Processing (NLP) to parse legal documents, categorize clauses, and identify potential risks before they become liabilities.

---

## ✨ Key Features
- **🔍 Semantic Clause Analysis**: Automatically extracts and identifies specific legal clauses (Indemnification, Liability, Termination, etc.) using semantic similarity.
- **⚠️ Risk Scoring engine**: Evaluates each clause and assigns a risk level (Low, Medium, High) based on legal benchmarks.
- **🤖 AI-Driven Optimization**: Leverages LLMs (via OpenRouter, Groq, or local Ollama) to suggest safer, more balanced legal language.
- **📄 Document Support**: Native support for PDF and DOCX uploads with high-fidelity text extraction.
- **📊 Intelligence Dashboard**: Track contract history and visualize risk distribution across your legal portfolio.

---

## 🛠️ Tech Stack
- **Frontend**: React + Vite, Tailwind CSS, Framer Motion (Animations), Three.js (3D Visuals).
- **Backend**: FastAPI (Python), Sentence-Transformers (NLP), PyMuPDF (Parser).
- **Database**: Supabase (Postgres) with Row Level Security (RLS).
- **AI/LLM**: Support for OpenRouter (GPT-4o), Groq (Llama 3.3), and Ollama.

---

## 🚀 Quick Start

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Installation
```bash
# Clone the repo
git clone https://github.com/Nitya-Kalola/CogniClause.git
cd CogniClause

# Run the automated setup
npm run setup
```

### 3. Configuration
Copy `.env.example` to `.env` in both `frontend` and `backend` directories and fill in your Supabase and LLM credentials.

### 4. Run Development
```bash
npm run dev
```

---

## 🔒 Security
CogniClause is built with privacy in mind. Using Supabase RLS ensures that your legal documents are only visible to you. For maximum privacy, you can switch the backend provider to **Ollama** to run logic entirely on your own hardware.
