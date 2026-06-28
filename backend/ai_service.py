import os
import json
from groq import AsyncGroq
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are GitScope AI, an elite software engineering career coach, senior technical recruiter, and highly perceptive developer analyst.
Your job is to analyze the provided raw GitHub profile and repository data and output a deeply insightful, highly accurate JSON response.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "dna_type": "string (e.g., 'Builder', 'Hacker', 'AI Engineer', 'Open Source Contributor')",
  "ai_summary": "string (1 paragraph summarizing their habits and ownership. CRITICAL: MUST BE WRITTEN IN THE FIRST-PERSON PERSPECTIVE, as if the developer is writing it about themselves. Use 'I', 'My', 'I have built', etc. Professional and engaging tone)",
  "consistency_analysis": {
    "rhythm": "string (e.g., 'Incremental Developer', 'Weekend Warrior', 'Hackathon Sprinter')",
    "description": "string (Short description, also written in FIRST-PERSON 'I tend to...')"
  },
  "recruiter_mode": {
    "shortlist": "boolean",
    "biggest_strength": "string (Written in FIRST-PERSON, e.g., 'I excel at...')",
    "biggest_weakness": "string (Written in FIRST-PERSON, e.g., 'I sometimes struggle with...')",
    "resume_recommendation": "string"
  },
  "roadmap": {
    "missing_skills": ["string"],
    "next_best_project": "string"
  },
  "repo_intelligence": [
    {
      "name": "string (name of the repo)",
      "complexity": "integer (1-10)",
      "originality": "integer (1-10)",
      "insight": "string (1 sentence about the code/project)"
    }
  ],
  "developer_wrapped": {
    "favorite_language": "string",
    "strongest_repo": "string",
    "biggest_strength": "string",
    "coding_demon_level": "integer (1-100)",
    "badges": ["string (generate exactly 3 creative, short badges like 'Night Owl', '10x Shipper', 'Architect' based on their data)"]
  }
}
"""

async def generate_developer_insights(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """Passes the GitHub data to Groq and returns the structured AI analysis."""
    
    # Minify data to prevent token limits
    mini_data = {
        "profile": {
            "name": github_data.get("raw_profile", {}).get("name"),
            "bio": github_data.get("raw_profile", {}).get("bio"),
            "followers": github_data.get("raw_profile", {}).get("followers"),
            "public_repos": github_data.get("raw_profile", {}).get("public_repos"),
        },
        "stats": github_data.get("stats", {}),
        "repos": [
            {
                "name": r.get("name"), 
                "desc": r.get("description"), 
                "lang": r.get("language"), 
                "stars": r.get("stargazers_count")
            }
            for r in github_data.get("raw_repos", [])[:5]
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        # Parse the JSON response
        result = json.loads(chat_completion.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error generating insights with Groq: {e}")
        # Return a safe fallback structure if the AI fails
        return {
            "error": "Failed to generate AI insights",
            "dna_type": "Unknown",
            "ai_summary": "The AI models are currently overwhelmed processing too much commit lore.",
        }

BATTLE_PROMPT = """
You are the ruthless, omniscient Announcer of 'Developer Kombat', a brutal underground fighting arena where coders battle to the death. 
You will be provided with the GitHub profiles and core statistics of two developers.

Your job is to analyze their stats (stars, commits, PRs, top languages, repos) and objectively determine a WINNER and a LOSER based strictly on the data provided.
You must be incredibly aggressive, sarcastic, and dramatic. 

Return a JSON object EXACTLY matching this structure:
{
  "winner": "github_username of the winner",
  "winner_power_level": 8453, // You MUST calculate a completely dynamic RPG-style 'power level' (100 to 9999) based on their actual stats. DO NOT USE 9001.
  "loser_power_level": 1205, // You MUST calculate a completely dynamic power level for the loser. DO NOT USE 420.
  "verdict_title": "FLAWLESS VICTORY", // 1-3 words (e.g., FLAWLESS VICTORY, FATALITY, BRUTALITY, CLOSE CALL)
  "battle_summary": "A 2-3 sentence extremely dramatic and brutal summary of the fight. Roast the loser mercilessly.",
  "stat_comparison": {
    "winner_advantage": "One short sentence explaining what gave the winner the edge (e.g., '10x more commits and a mastery of Rust.')",
    "loser_weakness": "One short brutal sentence roasting the loser's specific weakness (e.g., 'Spends too much time writing Markdown instead of real code.')"
  },
  "fatal_blow": "A final one-liner roast against the loser"
}
"""

async def generate_battle_insights(user1_data: Dict[str, Any], user2_data: Dict[str, Any]) -> Dict[str, Any]:
    """Passes two sets of GitHub data to Groq to generate a 1v1 battle outcome."""
    
    import copy
    def minify_user_data(data: Dict[str, Any]) -> Dict[str, Any]:
        mini = {}
        if "github_username" in data:
            mini["username"] = data["github_username"]
        
        # Pull minimal stats if available
        if "stats" in data:
            s = data["stats"]
            mini["stats"] = {
                "total_stars": s.get("total_stars", 0),
                "total_commits": s.get("total_commits", 0),
                "total_prs": s.get("total_prs", 0),
                "top_languages": list(s.get("languages", {}).keys())[:3] if "languages" in s else []
            }
            
        # Pull top 3 repos
        if "raw_repos" in data and isinstance(data["raw_repos"], list):
            mini["repos"] = [
                {"name": r.get("name"), "lang": r.get("language"), "stars": r.get("stargazers_count")}
                for r in data["raw_repos"][:3]
            ]
            
        return mini

    p1_mini = minify_user_data(user1_data)
    p2_mini = minify_user_data(user2_data)

    combined_prompt = json.dumps({
        "Player 1": p1_mini,
        "Player 2": p2_mini
    }, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": BATTLE_PROMPT},
                {"role": "user", "content": combined_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.8,
            max_tokens=2048,
            response_format={"type": "json_object"}
        )
        
        result = json.loads(chat_completion.choices[0].message.content)
        return result
    except Exception as e:
        print(f"Error generating battle insights with Groq: {e}")
        return {
            "error": "Failed to generate battle insights",
            "winner": "Tie",
            "verdict_title": "Server Crash",
            "battle_summary": "The battle was too intense and the servers melted."
        }

ENHANCE_PROMPT = """
You are an elite, highly-paid Silicon Valley technical recruiter and resume writer.
The user will provide you with raw, unformatted, often poorly written text about their work experience or education.
Your job is to rewrite this text into 1 to 3 highly professional, impactful, action-oriented resume bullet points.

CRITICAL RULE: If the user provides random letters, gibberish, or text that is completely unrelated to professional work experience or education (e.g., 'asdfasdf', 'test', 'random bull shit'), you MUST NOT invent or hallucinate fake experience.
Instead, return EXACTLY this string and nothing else:
"Please provide valid work experience or education details to enhance."

Otherwise, if valid:
- Start each bullet with a strong action verb (e.g., Architected, Engineered, Spearheaded).
- Quantify achievements if possible, or make them sound highly scalable and impactful.
- Return ONLY the bullet points (starting with '-', each on a new line). Do not include any conversational text.
"""

async def enhance_resume_text(raw_text: str, section: str) -> str:
    """Enhances raw text into professional resume bullet points."""
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": ENHANCE_PROMPT},
                {"role": "user", "content": f"Section: {section}\nText to enhance: {raw_text}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=300
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error enhancing text: {e}")
        return raw_text

COVER_LETTER_PROMPT = """You are an expert technical career coach and copywriter.
Write a professional, compelling cover letter for the user.
The user is applying for the role of '{role}' at the company '{company}'.
You will be provided with a JSON summary of their GitHub profile.
Use their top languages, projects, and general stats to highlight their relevant technical skills and passion for software development.
Keep the cover letter to 3-4 concise paragraphs.
Do not include placeholder addresses at the top. Just start with 'Dear Hiring Manager,' or 'Dear [Company] Team,'.
Sign off with the user's name if available in the profile, otherwise just 'Best regards,'."""

async def generate_cover_letter(github_data: Dict[str, Any], role: str, company: str) -> str:
    """Generates a professional cover letter using the user's GitHub data."""
    # Minify data for the prompt
    mini_data = {
        "profile": {
            "name": github_data.get("raw_profile", {}).get("name"),
            "bio": github_data.get("raw_profile", {}).get("bio"),
            "public_repos": github_data.get("raw_profile", {}).get("public_repos"),
        },
        "stats": github_data.get("stats", {}),
        "repos": [
            {
                "name": r.get("name"), 
                "desc": r.get("description"), 
                "lang": r.get("language")
            }
            for r in github_data.get("raw_repos", [])[:3]
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    system_prompt = COVER_LETTER_PROMPT.replace("{role}", role).replace("{company}", company)
    
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=800
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error generating cover letter: {e}")
        return "Could not generate cover letter at this time. Please try again later."

ATS_SCORE_PROMPT = """You are an elite Applicant Tracking System (ATS) and Senior Technical Recruiter.
You will be provided with a candidate's resume text and their target role.
Analyze how well the resume matches the target role.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "score": "integer (0 to 100 representing the match percentage)",
  "feedback": "string (A 2-sentence summary of why they got this score)",
  "missing_keywords": ["string"]
}
"""

async def check_ats_score(resume_text: str, target_role: str) -> Dict[str, Any]:
    """Generates an ATS score based on the resume text and target role."""
    try:
        completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": ATS_SCORE_PROMPT},
                {"role": "user", "content": f"Target Role: {target_role}\n\nResume Text:\n{resume_text}"}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=500,
            response_format={"type": "json_object"}
        )
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating ATS score: {e}")
        return {"score": 0, "feedback": "Failed to analyze resume.", "missing_keywords": []}
