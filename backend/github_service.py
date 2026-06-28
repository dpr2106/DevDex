import os
import httpx
from typing import Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Headers required for GitHub API
HEADERS = {
    "Accept": "application/vnd.github.v3+json",
    "Authorization": f"Bearer {GITHUB_TOKEN}" if GITHUB_TOKEN else ""
}

async def fetch_github_profile(username: str) -> Dict[str, Any]:
    """Fetches the user's basic GitHub profile data."""
    url = f"https://api.github.com/users/{username}"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS)
        if response.status_code == 404:
            raise ValueError(f"GitHub user '{username}' not found.")
        response.raise_for_status()
        return response.json()

async def fetch_user_repositories(username: str) -> List[Dict[str, Any]]:
    """Fetches all public repositories for a user."""
    # Using per_page=100 to get as many as possible in one request.
    # In a full app, we would paginate this.
    url = f"https://api.github.com/users/{username}/repos?per_page=100&sort=updated"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()

async def fetch_user_events(username: str) -> List[Dict[str, Any]]:
    """Fetches recent events (e.g. commits) for a user."""
    url = f"https://api.github.com/users/{username}/events/public?per_page=30"
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS)
        if response.status_code == 404:
            return []
        response.raise_for_status()
        return response.json()

async def gather_github_data(username: str) -> Dict[str, Any]:
    """Combines profile and repo data into a single summary payload for the AI."""
    profile = await fetch_github_profile(username)
    repos = await fetch_user_repositories(username)
    events = await fetch_user_events(username)
    
    # Calculate some basic stats to feed to the AI
    total_stars = sum(repo.get("stargazers_count", 0) for repo in repos)
    total_forks = sum(repo.get("forks_count", 0) for repo in repos)
    
    # Get top languages
    languages = {}
    for repo in repos:
        lang = repo.get("language")
        if lang:
            languages[lang] = languages.get(lang, 0) + 1
            
    top_languages = sorted(languages.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        "profile": {
            "username": profile.get("login"),
            "name": profile.get("name"),
            "bio": profile.get("bio"),
            "followers": profile.get("followers"),
            "following": profile.get("following"),
            "public_repos": profile.get("public_repos"),
            "created_at": profile.get("created_at"),
            "avatar_url": profile.get("avatar_url"),
        },
        "stats": {
            "total_stars_received": total_stars,
            "total_forks_received": total_forks,
            "top_languages": dict(top_languages)
        },
        "repositories": [
            {
                "name": r.get("name"),
                "description": r.get("description"),
                "language": r.get("language"),
                "stars": r.get("stargazers_count"),
                "size_kb": r.get("size"),
                "updated_at": r.get("updated_at")
            }
            for r in repos if not r.get("fork")  # We mainly care about original projects
        ][:20], # Limit to 20 most recently updated original repos so we don't blow up the AI token context
        "raw_profile": profile,
        "raw_repos": repos,
        "raw_events": [e for e in events if e.get("type") in ["PushEvent", "CreateEvent", "PullRequestEvent"]][:15]
    }

async def fetch_repo_data(owner: str, repo: str) -> Dict[str, Any]:
    """Fetches details for a specific repository (repo info, recent commits)."""
    repo_url = f"https://api.github.com/repos/{owner}/{repo}"
    commits_url = f"https://api.github.com/repos/{owner}/{repo}/commits?per_page=10"
    
    async with httpx.AsyncClient() as client:
        # Fetch Repo Details
        repo_resp = await client.get(repo_url, headers=HEADERS)
        if repo_resp.status_code == 404:
            raise ValueError(f"Repository '{owner}/{repo}' not found.")
        repo_resp.raise_for_status()
        repo_info = repo_resp.json()
        
        # Fetch Recent Commits
        commits_resp = await client.get(commits_url, headers=HEADERS)
        commits_info = []
        if commits_resp.status_code == 200:
            commits_info = commits_resp.json()
            
    return {
        "repo_info": repo_info,
        "recent_commits": commits_info
    }
