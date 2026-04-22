import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = None

if not SUPABASE_URL or not SUPABASE_KEY:
    print("[WARN] SUPABASE_URL or SUPABASE_KEY not set - Supabase disabled")
else:
    try:
        supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("[INFO] Supabase client initialized successfully")
    except Exception as e:
        print("[ERROR] Failed to initialize Supabase client:", e)

