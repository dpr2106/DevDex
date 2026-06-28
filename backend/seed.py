import urllib.request
import urllib.error
import time

top_devs = [
    "torvalds",      # Linux
    "yyx990803",     # Vue
    "gaearon",       # React
    "sindresorhus",  # Open source legend
    "tj",            # Node.js pioneer
    "antfu",         # Vue/Vite ecosystem
    "mrdoob",        # Three.js
    "bradtraversy",  # Educator
    "dpr2106",       # The creator
    "kamranahmedse", # Developer Roadmaps
    "ryanflorence",  # Remix/React Router
    "taylorotwell",  # Laravel
    "dhh",           # Ruby on Rails
    "fabpot",        # Symfony
    "sebmarkbage"    # React core
]

print("Starting to seed the database with real AI analysis for top developers...")
for dev in top_devs:
    print(f"Analyzing {dev}...")
    try:
        req = urllib.request.Request(f"http://127.0.0.1:8000/api/analyze/{dev}", headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=60) as response:
            if response.status == 200:
                print(f"Success for {dev}!")
            else:
                print(f"Failed for {dev}: {response.status}")
    except urllib.error.HTTPError as e:
        print(f"HTTP Error for {dev}: {e.code}")
    except urllib.error.URLError as e:
        print(f"URL Error for {dev}: {e.reason}")
    except Exception as e:
        print(f"Error for {dev}: {e}")
    time.sleep(1) # Be nice to the API

print("Finished seeding!")
