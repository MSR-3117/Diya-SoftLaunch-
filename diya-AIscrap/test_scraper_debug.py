import sys
import os
import json

# Add current directory to path
sys.path.append('/Users/rahmanms/Dev/Diya-SoftLaunch-/diya-AIscrap')

from app.ai_scraper import scrape_brand_from_url

def test_scrape(url):
    print(f"Scraping {url}...")
    result = scrape_brand_from_url(url)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "apple.com"
    test_scrape(url)
