import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from supabase import create_client, Client
from dotenv import load_dotenv

from github_service import gather_github_data
from github_service import gather_github_data
from ai_service import generate_developer_insights, enhance_resume_text, generate_cover_letter
from pydantic import BaseModel

load_dotenv()

app = FastAPI(
    title="GitScope AI API",
    description="Backend API for GitScope AI platform",
    version="1.0.0"
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Welcome to the GitScope AI API!"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

@app.get("/api/analyze/{username}")
async def analyze_github_user(username: str, force_refresh: bool = False):
    """
    Analyzes a GitHub user. Checks cache (Supabase) first, unless force_refresh is True.
    """
    try:
        # 1. Check if we already have this user in Supabase (and we aren't forcing a refresh)
        if not force_refresh:
            response = supabase.table("analyses").select("*").eq("github_username", username.lower()).execute()
            if response.data and len(response.data) > 0:
                print(f"Returning cached analysis for {username}")
                cached_data = response.data[0]
                try:
                    github_data = await gather_github_data(username)
                    cached_data["raw_profile"] = github_data.get("raw_profile", {})
                    cached_data["raw_repos"] = github_data.get("raw_repos", [])
                    # Merge developer wrapped data securely
                    cached_data["developer_wrapped"] = cached_data.get("developer_wrapped", {})
                except Exception as e:
                    print(f"Failed to fetch live github data for cache: {e}")
                return cached_data
        
        print(f"Generating new analysis for {username}...")
        
        # 2. Fetch raw data from GitHub
        try:
            github_data = await gather_github_data(username)
        except ValueError as e:
            raise HTTPException(status_code=404, detail=str(e))
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"GitHub API Error: {str(e)}")

        # 3. Generate AI Insights with Groq
        try:
            ai_insights = await generate_developer_insights(github_data)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Generation Error: {str(e)}")

        # 4. Prepare data for database insertion
        developer_wrapped = ai_insights.get("developer_wrapped", {})
        developer_wrapped["raw_stats"] = github_data.get("stats", {})

        db_payload = {
            "github_username": username.lower(),
            "dna_type": ai_insights.get("dna_type", "Unknown"),
            "ai_summary": ai_insights.get("ai_summary", ""),
            "consistency_analysis": ai_insights.get("consistency_analysis", {}),
            "repo_intelligence": ai_insights.get("repo_intelligence", []),
            "recruiter_mode": ai_insights.get("recruiter_mode", {}),
            "roadmap": ai_insights.get("roadmap", {}),
            "developer_wrapped": developer_wrapped,
            "raw_profile": github_data.get("raw_profile", {}),
            "raw_repos": github_data.get("raw_repos", []),
            "raw_events": github_data.get("raw_events", [])
        }

        # 5. Save to Supabase (Upsert so it updates if it already exists)
        try:
            save_response = supabase.table("analyses").upsert(db_payload, on_conflict="github_username").execute()
            if save_response.data and len(save_response.data) > 0:
                ret = save_response.data[0]
                return ret
        except Exception as db_error:
            print(f"Supabase cache save failed (likely RLS policy): {db_error}")
            
        # Return the payload directly if DB save fails
        return db_payload

    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during analysis.")

@app.get("/api/battle/{user1}/{user2}")
async def battle_users(user1: str, user2: str):
    """Fetches data for two users and pits them against each other."""
    try:
        # Check cache for both users first to save API calls
        user1_data = None
        user2_data = None
        
        try:
            r1 = supabase.table("analyses").select("*").eq("github_username", user1.lower()).execute()
            if r1.data and len(r1.data) > 0:
                user1_data = r1.data[0]
                
            r2 = supabase.table("analyses").select("*").eq("github_username", user2.lower()).execute()
            if r2.data and len(r2.data) > 0:
                user2_data = r2.data[0]
        except Exception as e:
            print(f"Supabase cache read failed for battle: {e}")

        # If missing from cache, fetch raw data (we don't need full AI insights for the battle, just raw data)
        if not user1_data:
            user1_data = await gather_github_data(user1)
            user1_data["github_username"] = user1.lower()
        if not user2_data:
            user2_data = await gather_github_data(user2)
            user2_data["github_username"] = user2.lower()

        # Generate battle insights
        from ai_service import generate_battle_insights
        battle_result = await generate_battle_insights(user1_data, user2_data)
        
        return {
            "player1": user1_data,
            "player2": user2_data,
            "battle": battle_result
        }

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        print(f"Unexpected error in battle: {e}")
        raise HTTPException(status_code=500, detail="An unexpected error occurred during the battle.")

class EnhanceRequest(BaseModel):
    text: str
    section: str

@app.post("/api/enhance")
async def enhance_text_endpoint(request: EnhanceRequest):
    """Enhances raw text using AI."""
    if not request.text.strip():
        return {"enhanced_text": ""}
    
    enhanced = await enhance_resume_text(request.text, request.section)
    return {"enhanced_text": enhanced}

class CoverLetterRequest(BaseModel):
    username: str
    target_role: str
    company_name: str

@app.post("/api/cover-letter")
async def generate_cover_letter_endpoint(request: CoverLetterRequest):
    """Generates a cover letter based on user's GitHub data."""
    try:
        # Check cache first for github data
        response = supabase.table("analyses").select("*").eq("github_username", request.username.lower()).execute()
        if response.data and len(response.data) > 0:
            cached_data = response.data[0]
            # Convert cached format back to standard github_data format
            github_data = {
                "raw_profile": cached_data.get("raw_profile", {}),
                "raw_repos": cached_data.get("raw_repos", []),
                "stats": cached_data.get("developer_wrapped", {}).get("raw_stats", {})
            }
        else:
            # If not in cache, fetch it live
            github_data = await gather_github_data(request.username)
            
        cover_letter = await generate_cover_letter(github_data, request.target_role, request.company_name)
        return {"cover_letter": cover_letter}
    except Exception as e:
        print(f"Error in cover letter endpoint: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate cover letter.")
