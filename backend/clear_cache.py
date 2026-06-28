import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

response = supabase.table("analyses").delete().eq("github_username", "dpr2106").execute()
print(f"Deleted cache for dpr2106: {response.data}")
