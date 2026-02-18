# Brand Extraction: 8-Stage Pipeline

The `AssetExtractor` service (`app/services/asset_extractor.py`) implements a high-performance 2-layer pipeline that avoids heavy browser automation (Chromium) in favor of fast HTTP requests and AI synthesis.

## Processing Stages

### Stage 1: BrandFetch Enrichment
- Queries the BrandFetch API using the domain hint.
- Seeds the pipeline with "verified" logos, colors, and fonts before scanning the website.

### Stage 2: Parallel Multi-Page Crawling
- Fetches the homepage HTML.
- Identifies internal links (About, Services, Contact) using keyword heuristics.
- Fetches up to 3 internal pages in parallel to broaden the context for AI summary.

### Stage 3: Technical Asset Discovery (Parallelized)
- **Logos:** Scans HTML selectors (header, nav) and attributes (class="logo").
- **Colors:** Extracts HEX, RGB, and HSL from `<style>` tags and root variables.
- **Fonts:** Identifies custom fonts from CSS and Google Fonts links.

### Stage 4: External CSS Analysis
- Fetches external stylesheet files linked in the HTML.
- Extracts "Interesting" colors (ignoring standard grays/whites) and font families.

### Stage 5: DOM-Weighted Scoring
- Colors and assets found in high-priority sections (header, hero, banner) are given higher weights in the final palette selection.

### Stage 6: Text Condensation
- Strips boilerplate (cookies, privacy links, footers).
- Condenses multi-page text into a ~3,500 character "semantic diamond" for efficient AI processing.

### Stage 7: Single-Pass AI Synthesis
- Sends the condensed text and technical hints to **Gemini Flash**.
- Performs a single JSON-mode pass to derive archetype, voice, and strategy.

### Stage 8: Palette Cluster & Merge
- Performs aggressive color clustering to ensure the final palette is visually distinct and usable in the UI.
- Merges technical findings from the website with the BrandFetch "official" data.
