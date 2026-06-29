import os
import json
from groq import AsyncGroq
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
client = AsyncGroq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """You are DevDex, an elite software engineering career coach, senior technical recruiter, and highly perceptive developer analyst.
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
You are the Announcer of 'Developer Kombat', a competitive arena where coders face off.
You will be provided with the GitHub profiles and core statistics of two developers.

Your job is to analyze their stats (stars, commits, PRs, top languages, repos) and determine a WINNER and a LOSER.
Keep the tone competitive and fun, like a friendly esports match. Do not be overly mean or ruthless.

Return a JSON object EXACTLY matching this structure:
{
  "winner": "github_username of the winner",
  "winner_power_level": 8453, // Calculate a dynamic RPG-style 'power level' (100 to 9999). Base this on stats, but if a player has missing or zero stats, give them a baseline score of at least 300 to 500 based on their account age or simple existence so no one gets a zero.
  "loser_power_level": 1205, // Calculate a dynamic power level for the loser. Must be lower than the winner. Give a baseline of at least 300 to 500 even if their stats are empty.
  "verdict_title": "FLAWLESS VICTORY", // 1-3 words (e.g., FLAWLESS VICTORY, CLOSE CALL, GOOD FIGHT)
  "battle_summary": "A 2-3 sentence fun, competitive summary of the match. Highlight the winner's strengths.",
  "stat_comparison": {
    "winner_advantage": "One short sentence explaining what gave the winner the edge (e.g., 'A massive lead in open source contributions.')",
    "loser_weakness": "One short constructive sentence pointing out where the loser fell behind (e.g., 'Needs to push more code to catch up.')"
  },
  "fatal_blow": "A fun final one-liner"
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

SQUAD_PROMPT = """You are DevDex, an elite Engineering Manager and Technical Strategist.
You will be provided with an array of GitHub developer profiles.
Analyze this group as a potential engineering team (a "Squad").
Determine their collective strengths, missing technical skills, and how they complement each other.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "team_name": "string (A creative, cool startup name for this team based on their combined skills)",
  "synergy_score": "integer (0-100)",
  "synergy_report": "string (A professional, insightful 2-paragraph analysis of how this team functions together, their combined strengths, and potential bottlenecks)",
  "combined_skill_matrix": [
    {
      "skill": "string (e.g., 'Frontend Architecture', 'Data Engineering', 'DevOps')",
      "level": "integer (1-100 representing the team's combined proficiency)"
    }
  ],
  "missing_skills": ["string (e.g., 'Cloud Infrastructure', 'UI/UX Design')"]
}
"""

async def generate_squad_insights(users_data: list) -> Dict[str, Any]:
    """Passes a list of GitHub user data to Groq to generate team synergy insights."""
    
    mini_team_data = []
    for data in users_data:
        mini_team_data.append({
            "username": data.get("raw_profile", {}).get("username") or data.get("raw_profile", {}).get("login"),
            "bio": data.get("raw_profile", {}).get("bio"),
            "stats": data.get("stats", {}),
            "top_repos": [r.get("language") for r in data.get("raw_repos", [])[:5] if r.get("language")]
        })
        
    user_prompt = json.dumps(mini_team_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": SQUAD_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating squad insights: {e}")
        return {
            "team_name": "The Unresolved Promises",
            "synergy_score": 0,
            "synergy_report": "Failed to analyze team synergy due to an API error.",
            "combined_skill_matrix": [],
            "missing_skills": []
        }

REPO_HEALTH_PROMPT = """You are DevDex, a Staff DevOps Engineer and Senior Software Architect.
You will receive raw JSON data about a GitHub repository (including stats, languages, and recent commits).
Analyze the project's architecture, maintainability, and production readiness.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "production_readiness_score": "integer (0-100)",
  "architecture_summary": "string (A professional 2-paragraph overview of the repository's tech stack, apparent patterns, and code structure)",
  "tech_debt_warning": "string (Identify potential red flags like lack of tests, messy commits, or outdated dependencies)",
  "maintainability_index": {
    "score": "integer (0-100)",
    "reasoning": "string (1 sentence explaining the maintainability score)"
  }
}
"""

async def generate_repo_health_insights(repo_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates repository health insights using Groq."""
    
    # Minify for token limits
    repo_info = repo_data.get("repo_info", {})
    recent_commits = repo_data.get("recent_commits", [])
    
    mini_data = {
        "name": repo_info.get("full_name"),
        "description": repo_info.get("description"),
        "language": repo_info.get("language"),
        "stars": repo_info.get("stargazers_count"),
        "forks": repo_info.get("forks_count"),
        "open_issues": repo_info.get("open_issues_count"),
        "has_wiki": repo_info.get("has_wiki"),
        "has_pages": repo_info.get("has_pages"),
        "recent_commits": [
            {
                "message": c.get("commit", {}).get("message"),
                "date": c.get("commit", {}).get("author", {}).get("date")
            }
            for c in recent_commits[:10]
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": REPO_HEALTH_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating repo insights: {e}")
        return {
            "production_readiness_score": 0,
            "architecture_summary": "Failed to analyze repository due to an API error.",
            "tech_debt_warning": "N/A",
            "maintainability_index": {"score": 0, "reasoning": "Error"}
        }

TRAJECTORY_PROMPT = """You are DevDex, a Senior Technical Career Coach.
You will receive raw JSON data about a developer's oldest and newest repositories on GitHub.
Analyze their professional evolution, focusing on how their tech stack, architecture, and coding patterns have changed.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "growth_summary": "string (A professional 2-paragraph summary of their entire career trajectory, written in the THIRD-PERSON e.g. 'This developer started out doing X... today they build Y...')",
  "early_days_stack": ["string (e.g. 'HTML', 'Vanilla JS', 'PHP')"],
  "current_stack": ["string (e.g. 'TypeScript', 'Next.js', 'Go')"],
  "milestones": [
    {
      "year": "string (e.g. '2019')",
      "title": "string (e.g. 'The Frontend Awakening')",
      "description": "string (1 sentence about what they learned or built that year)"
    }
  ]
}
"""

async def generate_career_trajectory(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates career trajectory insights based on repo history."""
    
    repos = github_data.get("raw_repos", [])
    if not repos:
        raise ValueError("No repositories found to analyze trajectory.")
        
    # Sort repos by created_at
    sorted_repos = sorted(repos, key=lambda x: x.get("created_at", ""))
    
    # Take 3 oldest and 3 newest
    oldest = sorted_repos[:3]
    newest = sorted_repos[-3:] if len(sorted_repos) > 3 else sorted_repos
    
    mini_data = {
        "username": github_data.get("raw_profile", {}).get("login"),
        "oldest_repos": [
            {
                "name": r.get("name"),
                "language": r.get("language"),
                "created_at": r.get("created_at")
            } for r in oldest
        ],
        "newest_repos": [
            {
                "name": r.get("name"),
                "language": r.get("language"),
                "created_at": r.get("created_at")
            } for r in newest
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": TRAJECTORY_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating trajectory insights: {e}")
        return {
            "growth_summary": "Failed to analyze career trajectory due to an API error.",
            "early_days_stack": [],
            "current_stack": [],
            "milestones": []
        }

INTERVIEW_PROMPT = """You are DevDex, a Principal Staff Engineer acting as a technical interviewer.
You will receive JSON data about a developer's GitHub repositories, focusing on their top languages and projects.
Your goal is to generate 5 highly specific, technical interview questions tailored EXACTLY to the code they have written.
Do not ask generic LeetCode questions. Ask questions about the architectural patterns, state management, or potential pitfalls of the specific tech stack they use in their top repos.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "candidate_summary": "string (A brief 1-sentence technical profile of the candidate)",
  "questions": [
    {
      "question": "string (The technical interview question)",
      "why_ask_this": "string (Context for the interviewer on why this is a good question based on their repos)",
      "expected_answer_concepts": "string (What a good answer sounds like / key concepts to listen for)"
    }
  ] // Must contain exactly 5 questions
}
"""

async def generate_interview_questions(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates tailored interview questions based on repo history."""
    
    repos = github_data.get("raw_repos", [])
    if not repos:
        raise ValueError("No repositories found to generate questions.")
        
    # Take top 10 repos sorted by stars to gauge their best work
    sorted_repos = sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:10]
    
    mini_data = {
        "username": github_data.get("raw_profile", {}).get("login"),
        "top_languages": list(github_data.get("developer_wrapped", {}).get("raw_stats", {}).get("languages", {}).keys())[:5],
        "top_repos": [
            {
                "name": r.get("name"),
                "language": r.get("language"),
                "description": r.get("description")
            } for r in sorted_repos
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": INTERVIEW_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.8,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating interview questions: {e}")
        return {
            "candidate_summary": "Error generating interview questions.",
            "questions": []
        }

MATCHMAKER_PROMPT = """You are DevDex, a Principal Open-Source Tech Lead.
You will receive JSON data about a developer's GitHub repositories and their top programming languages.
Your goal is to recommend 3 REAL, ACTIVE, HIGH-QUALITY open-source repositories on GitHub that they are perfectly suited to contribute to based on their tech stack.
Use real, popular open-source projects (e.g., 'facebook/react', 'django/django', 'vercel/next.js', etc.). Do not invent projects.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "match_reasoning": "string (A brief 2-sentence summary of why these projects fit their specific profile)",
  "recommendations": [
    {
      "project_name": "string (The owner/repo format, e.g. 'facebook/react')",
      "language": "string (The primary language of the project)",
      "description": "string (A brief description of what the project does)",
      "why_you": "string (Why this developer is specifically suited to contribute to this project based on their repos)"
    }
  ] // Must contain exactly 3 recommendations
}
"""

async def generate_oss_matches(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates open-source project recommendations based on repo history."""
    
    repos = github_data.get("raw_repos", [])
    if not repos:
        raise ValueError("No repositories found to generate matches.")
        
    # Take top 10 repos sorted by stars to gauge their best work
    sorted_repos = sorted(repos, key=lambda x: x.get("stargazers_count", 0), reverse=True)[:10]
    
    mini_data = {
        "username": github_data.get("raw_profile", {}).get("login"),
        "top_languages": list(github_data.get("developer_wrapped", {}).get("raw_stats", {}).get("languages", {}).keys())[:5],
        "top_repos": [
            {
                "name": r.get("name"),
                "language": r.get("language"),
                "description": r.get("description")
            } for r in sorted_repos
        ]
    }
    
    user_prompt = json.dumps(mini_data, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": MATCHMAKER_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.7,
            max_tokens=1500,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating OSS matches: {e}")
        return {
            "match_reasoning": "Failed to generate matches due to an API error.",
            "recommendations": []
        }

WRAPPED_PROMPT = """You are DevDex, a sassy, highly energetic host presenting a Spotify-Wrapped style year-in-review for a developer's GitHub profile.
You will receive JSON data about their GitHub stats (commits, stars, top languages).
Your goal is to generate a highly personalized, slightly roasted, and extremely fun narrative of their coding habits.
Make it punchy, humorous, and engaging.

You MUST respond with a valid JSON object strictly matching this schema:
{
  "vibe_check": "string (A short 1-sentence roast or hype-up of their overall coding style)",
  "top_language_roast": "string (A funny comment specifically targeting their #1 most used language)",
  "work_life_balance": "string (A joke about their commit frequency, repo count, or overall stats)",
  "final_verdict": "string (A fun summary title for the developer, e.g. 'The Midnight Bug-Creator', 'The TypeScript Tryhard')"
}
"""

async def generate_github_wrapped(github_data: Dict[str, Any]) -> Dict[str, Any]:
    """Generates a Spotify-Wrapped style narrative based on GitHub stats."""
    
    stats = github_data.get("developer_wrapped", {}).get("raw_stats", {})
    if not stats:
        raise ValueError("No stats found to generate wrapped.")
    
    # We pass the pre-calculated stats which already have languages, commits, stars, etc.
    user_prompt = json.dumps(stats, indent=2)
    
    try:
        chat_completion = await client.chat.completions.create(
            messages=[
                {"role": "system", "content": WRAPPED_PROMPT},
                {"role": "user", "content": user_prompt}
            ],
            model="llama-3.1-8b-instant",
            temperature=0.9,
            max_tokens=800,
            response_format={"type": "json_object"}
        )
        return json.loads(chat_completion.choices[0].message.content)
    except Exception as e:
        print(f"Error generating GitHub Wrapped: {e}")
        return {
            "vibe_check": "Failed to generate your Wrapped due to an API error.",
            "top_language_roast": "We couldn't analyze your languages, so we'll just assume you write in Brainfuck.",
            "work_life_balance": "You broke our servers, which means you probably code too much.",
            "final_verdict": "The Unwrappable Enigma"
        }
