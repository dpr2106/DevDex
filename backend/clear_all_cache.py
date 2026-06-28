import os
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Delete all rows by using a filter that matches everything (e.g., id is not null)
response = supabase.table("analyses").delete().neq("github_username", "dummy_value_that_doesnt_exist").execute()
print(f"Cleared all cache: {len(response.data)} records deleted.")
