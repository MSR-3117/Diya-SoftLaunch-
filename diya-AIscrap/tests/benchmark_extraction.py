import asyncio
import time
import os
import sys

# Add the app directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.services.asset_extractor import AssetExtractor

async def benchmark_url(extractor, url):
    print(f"\n--- Benchmarking: {url} ---")
    start = time.time()
    try:
        assets = await extractor.extract_assets(url)
        elapsed = time.time() - start
        
        print(f"✅ Success! Generated in {elapsed:.2f}s")
        print(f"   Company: {assets.company_name}")
        print(f"   Colors:  {assets.colors.primary}, {assets.colors.secondary}")
        print(f"   Logo:    {assets.logo.url if assets.logo else 'None'}")
        print(f"   Summary: {assets.company_summary[:100]}...")
        
        return elapsed
    except Exception as e:
        print(f"❌ Failed: {e}")
        return None

async def main():
    extractor = AssetExtractor()
    urls = [
        "https://apple.com",
        "https://linear.app",
        "https://stripe.com"
    ]
    
    results = []
    for url in urls:
        elapsed = await benchmark_url(extractor, url)
        if elapsed:
            results.append(elapsed)
            
    if results:
        avg = sum(results) / len(results)
        print(f"\n{'='*40}")
        print(f"AVERAGE LATENCY: {avg:.2f}s")
        print(f"{'='*40}\n")
    else:
        print("No successful benchmarks.")

if __name__ == "__main__":
    asyncio.run(main())
