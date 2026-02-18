"""
Fast Brand Asset Extractor — 2-Layer Pipeline (No Chromium)

Layer 1: HTTP + BeautifulSoup (text, logo, CSS colors, fonts) — ~1-3s
         Also fetches external CSS files for colors/fonts
Layer 2: Gemini Flash text-only (summary, strategy, vibe, colors, fonts) — ~3-5s

Total: ~4-8s (no browser launch needed)
"""
import re
import asyncio
import json
from typing import Optional, List, Tuple
from datetime import datetime
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from app.models.brand_assets import BrandAssets, ColorPalette, FontInfo, ExtractedLogo, StrategicAnalysis
from app.services.gemini_service import GeminiService

load_dotenv()

# Generic font families to skip
GENERIC_FONTS = {
    "inherit", "initial", "unset", "revert", "sans-serif", "serif",
    "monospace", "cursive", "fantasy", "system-ui", "ui-sans-serif",
    "ui-serif", "ui-monospace", "-apple-system", "blinkmacsystemfont",
    "segoe ui", "arial", "helvetica", "times new roman", "times",
    "courier new", "courier", "verdana", "georgia", "tahoma",
    # Emoji & symbol fonts
    "apple color emoji", "segoe ui emoji", "segoe ui symbol",
    "noto color emoji", "noto emoji", "android emoji",
    "emojisymbols", "symbola",
    # System mono fonts
    "sfmono-regular", "sf mono", "menlo", "consolas", "monaco",
    "liberation mono", "lucida console", "dejavu sans mono",
    "droid sans mono", "ubuntu mono", "source code pro",
    # Other system fonts
    "roboto", "noto sans", "liberation sans", "cantarell",
    "fira sans", "droid sans", "oxygen", "ubuntu",
}

def _is_valid_font(name: str) -> bool:
    """Check if a font name is a real font (not a CSS variable or generic)."""
    if not name:
        return False
    lower = name.lower().strip()
    # Remove !important suffix properly
    if lower.endswith("!important"):
        lower = lower[:-10].strip()
    if not lower:
        return False
    # Skip CSS variables
    if lower.startswith("var(") or lower.startswith("--"):
        return False
    # Skip generic font families
    if lower in GENERIC_FONTS:
        return False
    # Skip names containing emoji/symbol/icon keywords
    if any(kw in lower for kw in ("emoji", "symbol", "icon")):
        return False
    # Skip very short names
    if len(lower) < 3:
        return False
    # Skip names with special chars (malformed CSS)
    if lower.endswith(")") or lower.endswith('"') or "!" in lower:
        return False
    return True


class AssetExtractor:
    """Fast brand asset extractor — pure HTTP + Gemini, no browser."""

    def __init__(self):
        self.gemini_service = GeminiService()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "DNT": "1",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Sec-Fetch-User": "?1"
        }

    async def extract_assets(self, url: str) -> BrandAssets:
        """Main extraction — 8-stage optimized pipeline."""
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        import time
        start_time = time.time()
        print(f"\n{'='*60}")
        print(f"⚡ OPTIMIZED BRAND ANALYSIS: {url}")
        print(f"{'='*60}")

        # ═══════════════════════════════════════════════════
        # STAGE 1: BrandFetch First Enrichment
        # ═══════════════════════════════════════════════════
        print("  📡 Stage 1: BrandFetch Enrichment...")
        brand_name_hint = urlparse(url).netloc.replace("www.", "").split(".")[0]
        brandfetch_assets = {}
        try:
            from app.brand_fetcher import fetch_brand_assets
            brandfetch_assets = fetch_brand_assets(brand_name_hint)
        except Exception as e:
            print(f"  ⚠️ BrandFetch failed: {e}")

        # ═══════════════════════════════════════════════════
        # STAGE 2: Parallel Multi-Page Crawling
        # ═══════════════════════════════════════════════════
        print("  📡 Stage 2: Parallel Multi-Page Crawling...")
        layer1_start = time.time()

        all_html_contents = []
        pages_data = [] # List of {url, html, soup}
        final_url = url
        
        async with httpx.AsyncClient(
            headers=self.headers, follow_redirects=True, timeout=10.0
        ) as client:
            # First fetch homepage to find internal links
            try:
                response = await client.get(url)
                html_content = response.text
                final_url = str(response.url)
                soup = BeautifulSoup(html_content, "html.parser")
                pages_data.append({"url": final_url, "html": html_content, "soup": soup})
            except Exception as e:
                print(f"  ⚠️ Initial HTTP fetch failed: {e}")
                raise ValueError(f"Failed to load website: {str(e)}")

            # Identify internal links (About, Services, Contact)
            internal_links = self._identify_internal_links(soup, final_url)
            print(f"  🔍 Found internal links: {internal_links}")

            # Fetch internal pages in parallel
            if internal_links:
                tasks = [client.get(link) for link in internal_links]
                link_responses = await asyncio.gather(*tasks, return_exceptions=True)
                
                for i, resp in enumerate(link_responses):
                    if isinstance(resp, httpx.Response) and resp.status_code == 200:
                        l_url = str(resp.url)
                        l_html = resp.text
                        l_soup = BeautifulSoup(l_html, "html.parser")
                        pages_data.append({"url": l_url, "html": l_html, "soup": l_soup})
                        # Progressive extraction check would happen here
                    else:
                        print(f"  ⚠️ Failed to fetch internal link {internal_links[i]}")

            # Extract data from all collected pages
            # (Aggregation for Layer 2 AI)
            all_text_parts = []
            html_colors = []
            html_fonts = []
            possible_logos = []
            
            # If BrandFetch provided assets, seed them
            if brandfetch_assets:
                if brandfetch_assets.get('logo', {}).get('url'):
                    possible_logos.append(brandfetch_assets['logo']['url'])
                if brandfetch_assets.get('colors'):
                    # Convert dict values to list if needed
                    bf_colors = brandfetch_assets['colors']
                    if isinstance(bf_colors, dict):
                        html_colors.extend([c for c in bf_colors.values() if c])
                if brandfetch_assets.get('fonts'):
                    bf_fonts = brandfetch_assets['fonts']
                    if isinstance(bf_fonts, dict):
                        html_fonts.extend([f for f in bf_fonts.values() if f])

            # Process all pages
            css_tasks = []
            for p in pages_data:
                p_soup = p["soup"]
                p_url = p["url"]
                p_html = p["html"]
                
                # Extract text
                all_text_parts.append(f"--- SOURCE: {p_url} ---\n{self._extract_page_text(p_soup)}")
                
                # Extract logos
                logo = self._extract_logo_from_html(p_soup, p_url)
                if logo: possible_logos.append(logo)
                
                # Extract colors/fonts from inline
                html_colors.extend(self._extract_colors_from_css(p_soup, p_html))
                html_fonts.extend(self._extract_fonts_from_html(p_soup, p_html))
                
                # Prepare external CSS fetch
                css_tasks.append(self._fetch_external_css(p_soup, p_url, client))

            # Fetch all external CSS in parallel across all pages
            css_results = await asyncio.gather(*css_tasks)
            for colors, fonts in css_results:
                html_colors.extend(colors)
                html_fonts.extend(fonts)

            # De-duplicate
            html_colors = list(dict.fromkeys(html_colors))
            html_fonts = list(dict.fromkeys(html_fonts))
            
            company_name = self._extract_company_name(pages_data[0]["soup"])
            meta_description = self._extract_description(pages_data[0]["soup"])
            favicon = self._extract_favicon(pages_data[0]["soup"], final_url)
            page_text = "\n\n".join(all_text_parts)

        layer1_time = time.time() - layer1_start
        print(f"  ✅ Layer 1 done in {layer1_time:.1f}s — "
              f"Colors: {len(html_colors)}, Fonts: {len(html_fonts)}")

        # ═══════════════════════════════════════════════════
        # STAGE 7 & 8: Single-Pass AI Synthesis (Premium)
        # ═══════════════════════════════════════════════════
        print("  🧠 Stage 7-8: Single-Pass Premium Synthesis (Gemini Pro)...")
        ai_start = time.time()
        
        # 1. Condense the text for the AI (Goal: max 3-4k chars for ultra speed)
        condensed_text = self._condense_text(page_text, max_chars=3500)
        
        # 2. Build deterministic hints
        hints = {
            "colors": html_colors[:10],
            "fonts": html_fonts[:3],
            "logo": possible_logos[0] if possible_logos else None,
            "name": company_name,
            "desc": meta_description[:200]
        }

        # 3. Streamlined Synthesis Prompt (Reduced fluff for speed)
        synthesis_prompt = f"""
        JSON ONLY. Brand Profile Synthesis for '{company_name}'.
        Website: {final_url}
        Data: {json.dumps(hints)}
        Content: {condensed_text}
        
        Return JSON:
        {{
            "company_name": "Name",
            "company_summary": "2-sentence summary (executive tone).",
            "brand_vibe": ["word1", "word2", "word3", "word4"],
            "brand_colors": ["#PRIMARY", "#SECONDARY", "#ACCENT", "#BACKGROUND", "#TEXT"],
            "brand_fonts": ["Heading Font", "Body Font"],
            "strategy": {{
                "brand_archetype": "Archetype - 1 sentence",
                "brand_voice": "Tone",
                "content_pillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"],
                "visual_style_guide": ["R1", "R2", "R3"],
                "recommended_post_types": ["T1", "T2", "T3"],
                "campaign_ideas": ["I1", "I2", "I3"],
                "target_audience": "Audience details",
                "key_strengths": ["S1", "S2", "S3"],
                "design_style": "Style"
            }}
        }}
        """


        executive_summary = ""
        vibe = []
        gemini_colors = []
        gemini_fonts = []
        raw_strategy = {}

        try:
            # OPTIMIZATION: Use Gemini 2.0/2.5 Flash for the single pass. 
            # It's significantly faster than Pro while 2.0+ Flash quality is excellent for this task.
            model = self.gemini_service.get_model_for_task("fast") 
            
            # Final tuning: temperature=0 and response_mime_type="application/json" for speed/consistency
            response = model.generate_content(
                synthesis_prompt,
                generation_config={"response_mime_type": "application/json", "temperature": 0.0}
            )
            
            text = response.text.strip()
            # If the model follows JSON mode strictly, we don't need regex, but keeping it for safety
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                synthesis = json.loads(json_match.group(0))
                
                # Extract results
                company_name = synthesis.get("company_name", company_name)
                executive_summary = synthesis.get("company_summary", "")
                vibe = synthesis.get("brand_vibe", [])
                gemini_colors = synthesis.get("brand_colors", [])
                gemini_fonts = synthesis.get("brand_fonts", [])
                raw_strategy = synthesis.get("strategy", {})
        except Exception as e:
            print(f"  ⚠️ Single-pass synthesis failed: {e}")


        ai_time = time.time() - ai_start
        print(f"  ✅ AI Synthesis done in {ai_time:.1f}s")


        # ═══════════════════════════════════════════════════
        # MERGE & FINALIZE
        # ═══════════════════════════════════════════════════
        
        # Use AI suggested colors but anchor with cluster-validated colors
        colors = self._build_color_palette(html_colors, gemini_colors)
        colors.all_colors = list(dict.fromkeys(html_colors))[:10]

        # Fonts
        if not gemini_fonts:
            gemini_fonts = ["Inter", "Roboto"]
        
        fonts = []
        for i, font_name in enumerate(gemini_fonts):
            fonts.append(FontInfo(
                family=font_name,
                style="Display" if i == 0 else "Body",
                is_primary=(i == 0),
                is_body=(i == 1),
                source="AI Inferred"
            ))

        # Logo stabilization
        logo = None
        logo_url = possible_logos[0] if possible_logos else None
        if logo_url:
            fmt = logo_url.split(".")[-1].lower().split("?")[0].split("#")[0]
            if len(fmt) > 4 or not fmt.isalpha(): fmt = "png"
            logo = ExtractedLogo(url=logo_url, format=fmt, is_svg=("svg" in fmt))

        if not raw_strategy:
            raw_strategy = {
                "brand_archetype": "The Creator",
                "brand_voice": "Professional",
                "content_pillars": ["Expertise"],
                "visual_style_guide": ["Clean"],
                "recommended_post_types": ["Updates"],
                "campaign_ideas": ["Showcase"],
                "target_audience": "Professional",
                "key_strengths": ["Innovation"],
                "design_style": "Modern",
            }
        
        final_strategy = StrategicAnalysis(**self._normalize_strategy(raw_strategy))

        # FINAL FALLBACK for name
        if not company_name:
            domain = urlparse(final_url).netloc.replace("www.", "").split(".")[0]
            company_name = domain.title()

        total_time = time.time() - start_time
        print(f"\n{'─'*60}")
        print(f"  ⏱️  TOTAL TIME: {total_time:.1f}s")
        print(f"  📊  Name: {company_name} | Colors: {len(colors.all_colors)} | "
              f"Fonts: {len(fonts)} | Logo: {'✅' if logo else '❌'}")
        print(f"{'='*60}\n")

        return BrandAssets(
            website_url=final_url,
            company_name=company_name,
            company_summary=executive_summary or f"A comprehensive brand analysis for {company_name}.",
            logo=logo,
            colors=colors,
            fonts=fonts,
            favicon_url=favicon,
            meta_description=meta_description,
            extraction_timestamp=datetime.now().isoformat(),
            brand_vibe=vibe or ["Professional", "Modern"],
            strategy=final_strategy,
        )

    def _condense_text(self, text: str, max_chars: int = 7000) -> str:
        """Heuristic text condensation: removes boilerplate and focuses on semantic gems."""
        if not text: return ""
        
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        
        # Remove common boilerplate lines
        boilerplate = {"cookie", "privacy policy", "terms of use", "all rights reserved", 
                       "subscribe to our newsletter", "facebook", "twitter", "instagram", 
                       "linkedin", "copyright", "log in", "sign up"}
        
        filtered = []
        for line in lines:
            ll = line.lower()
            if any(b in ll for b in boilerplate) and len(line) < 100:
                continue
            if line not in filtered: # Basic deduplication
                filtered.append(line)
        
        result = "\n".join(filtered)
        return result[:max_chars]


    def _identify_internal_links(self, soup: BeautifulSoup, base_url: str) -> List[str]:
        """Find key internal pages (About, Services, Contact) for broader brand signal."""
        if not soup: return []
        links = []
        keywords = ["about", "service", "product", "solut", "work", "expert", "capab", "contact"]
        seen_paths = {urlparse(base_url).path.rstrip("/")}
        
        domain = urlparse(base_url).netloc
        for a in soup.find_all("a", href=True):
            href = a["href"]
            full_url = urljoin(base_url, href)
            parsed = urlparse(full_url)
            
            # Only internal links
            if parsed.netloc != domain and parsed.netloc != "": continue
            
            path = parsed.path.rstrip("/")
            if path in seen_paths or not path: continue
            
            if any(k in path.lower() for k in keywords):
                links.append(full_url)
                seen_paths.add(path)
            
            if len(links) >= 3: break
        return links

    # ═══════════════════════════════════════════════════════
    # EXTERNAL CSS FETCHING
    # ═══════════════════════════════════════════════════════

    async def _fetch_external_css(
        self, soup: BeautifulSoup, base_url: str, client: httpx.AsyncClient
    ) -> Tuple[List[str], List[str]]:
        """Fetch and parse external CSS files for colors and fonts."""
        if not soup:
            return [], []

        css_links = []
        for link in soup.find_all("link", rel=lambda x: x and "stylesheet" in str(x).lower()):
            href = link.get("href")
            if href:
                # Skip CDN libraries (bootstrap, fontawesome, owl, etc.)
                lower = href.lower()
                if any(skip in lower for skip in [
                    "cdn.jsdelivr", "cdnjs.cloudflare", "fonts.googleapis",
                    "unpkg.com", "stackpath", "maxcdn"
                ]):
                    continue
                css_links.append(urljoin(base_url, href))

        if not css_links:
            return [], []

        all_colors = []
        all_fonts = []
        seen_colors = set()
        seen_fonts = set()

        # Fetch up to 3 app CSS files in parallel
        async def fetch_one(css_url: str):
            try:
                r = await client.get(css_url, timeout=5.0)
                return r.text if r.status_code == 200 else ""
            except Exception:
                return ""

        tasks = [fetch_one(u) for u in css_links[:3]]
        results = await asyncio.gather(*tasks)

        hex_pattern = re.compile(r'#([0-9a-fA-F]{6})\b')
        rgb_pattern = re.compile(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)')
        hsl_pattern = re.compile(r'hsl\(\s*(\d+)\s*,\s*(\d+)%?\s*,\s*(\d+)%?\s*\)')
        font_pattern = re.compile(r'font-family\s*:\s*([^;}{]+)')

        for css_text in results:
            if not css_text:
                continue

            # Extract hex colors
            for match in hex_pattern.finditer(css_text):
                c = f"#{match.group(1).upper()}"
                if c not in seen_colors:
                    all_colors.append(c)
                    seen_colors.add(c)

            # Extract rgb colors
            for match in rgb_pattern.finditer(css_text):
                r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
                c = f"#{r:02X}{g:02X}{b:02X}"
                if c not in seen_colors:
                    all_colors.append(c)
                    seen_colors.add(c)

            # Extract HSL colors
            for match in hsl_pattern.finditer(css_text):
                h, s, l = int(match.group(1)), int(match.group(2)), int(match.group(3))
                hex_c = self._hsl_to_hex(h, s, l)
                if hex_c not in seen_colors:
                    all_colors.append(hex_c)
                    seen_colors.add(hex_c)

            # Extract CSS variable colors
            var_pattern = re.compile(r'--[\w-]+\s*:\s*#([0-9a-fA-F]{6})\b')
            for match in var_pattern.finditer(css_text):
                c = f"#{match.group(1).upper()}"
                if c not in seen_colors:
                    # CSS variable colors are high priority — insert at front
                    all_colors.insert(0, c)
                    seen_colors.add(c)

            # Extract fonts
            for match in font_pattern.finditer(css_text):
                raw = match.group(1).strip()
                for part in raw.split(","):
                    name = part.strip().strip("'\"").strip()
                    if _is_valid_font(name) and name.lower() not in seen_fonts:
                        all_fonts.append(name)
                        seen_fonts.add(name.lower())

        # Filter out very common/boring colors
        boring = {"#FFFFFF", "#000000", "#333333", "#666666", "#999999",
                  "#CCCCCC", "#EEEEEE", "#F5F5F5", "#FAFAFA", "#808080"}
        interesting = [c for c in all_colors if c not in boring]
        boring_found = [c for c in all_colors if c in boring]

        # Return interesting colors first, then boring ones
        return (interesting + boring_found)[:20], all_fonts[:5]

    @staticmethod
    def _hsl_to_hex(h: int, s: int, l: int) -> str:
        """Convert HSL to hex color."""
        s /= 100
        l /= 100
        c = (1 - abs(2 * l - 1)) * s
        x = c * (1 - abs((h / 60) % 2 - 1))
        m = l - c / 2
        if h < 60:     r1, g1, b1 = c, x, 0
        elif h < 120:  r1, g1, b1 = x, c, 0
        elif h < 180:  r1, g1, b1 = 0, c, x
        elif h < 240:  r1, g1, b1 = 0, x, c
        elif h < 300:  r1, g1, b1 = x, 0, c
        else:          r1, g1, b1 = c, 0, x
        r = int((r1 + m) * 255)
        g = int((g1 + m) * 255)
        b = int((b1 + m) * 255)
        return f"#{r:02X}{g:02X}{b:02X}"

    @staticmethod
    def _color_saturation(hex_color: str) -> float:
        """Calculate color saturation (0-1). Higher = more vibrant."""
        try:
            h = hex_color.lstrip("#")
            r, g, b = int(h[0:2], 16) / 255, int(h[2:4], 16) / 255, int(h[4:6], 16) / 255
            max_c, min_c = max(r, g, b), min(r, g, b)
            diff = max_c - min_c
            if max_c == 0:
                return 0
            return diff / max_c
        except Exception:
            return 0

    # ═══════════════════════════════════════════════════════
    # COLOR PALETTE BUILDER
    # ═══════════════════════════════════════════════════════


    async def _cluster_colors(self, colors: List[str]) -> List[str]:
        """Group similar colors and return the most representative ones."""
        if not colors:
            return []
            
        clusters = [] # List of {color: (r,g,b), count: int}
        
        def color_dist(c1, c2):
            return sum((a - b) ** 2 for a, b in zip(c1, c2)) ** 0.5

        for c in colors:
            try:
                h = c.lstrip("#")
                rgb = (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
            except: continue
            
            matched = False
            for cluster in clusters:
                if color_dist(rgb, cluster["rgb"]) < 30: # Threshold for similarity
                    cluster["count"] += 1
                    matched = True
                    break
            if not matched:
                clusters.append({"color": c, "rgb": rgb, "count": 1})
        
        # Sort by count
        clusters.sort(key=lambda x: x["count"], reverse=True)
        return [c["color"] for c in clusters]

    def _build_color_palette(self, css_colors: List[str], gemini_colors: List[str]) -> ColorPalette:
        """Build a ColorPalette from extracted colors. Prioritize vibrant colors."""
        # Near-neutral colors (very low saturation / common gray shades)
        neutrals = {"#FFFFFF", "#000000", "#333333", "#666666", "#999999",
                    "#CCCCCC", "#EEEEEE", "#F5F5F5", "#FAFAFA", "#808080",
                    "#FFF", "#000", "#E5E5E5", "#D4D4D4", "#F4F4F4",
                    "#EDEDED", "#EFEFEF", "#9CA3AF", "#6B7280", "#D1D5DB",
                    "#F3F4F6", "#F9FAFB", "#E5E7EB", "#374151", "#4B5563",
                    "#1F2937", "#111827", "#030712"}

        # Cluster the CSS colors to find dominant ones
        clusters = []
        for c in css_colors:
            try:
                h = c.lstrip("#")
                rgb = (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))
                matched = False
                for cluster in clusters:
                    dist = sum((a - b) ** 2 for a, b in zip(rgb, cluster["rgb"])) ** 0.5
                    if dist < 45: # Aggressive clustering
                        cluster["count"] += 1
                        matched = True
                        break
                if not matched:
                    clusters.append({"color": c, "rgb": rgb, "count": 1})
            except: continue
        
        clusters.sort(key=lambda x: x["count"], reverse=True)
        dominant_css = [c["color"] for c in clusters]

        # Sort dominant by vibrancy
        vibrant = sorted(
            [c for c in dominant_css if c.upper() not in neutrals
             and self._color_saturation(c) > 0.15],
            key=lambda c: self._color_saturation(c),
            reverse=True
        )

        # Gemini colors (validated hex)
        gemini_hex = [c.upper() for c in gemini_colors
                      if isinstance(c, str) and re.match(r'^#[0-9a-fA-F]{6}$', c)]
        gemini_vibrant = [c for c in gemini_hex if c not in neutrals
                         and self._color_saturation(c) > 0.15]

        # Combined pool: CSS vibrant first, then Gemini vibrant
        pool = vibrant + [c for c in gemini_vibrant if c not in vibrant]

        # Pick primary: most vibrant color
        primary = pool[0] if pool else (gemini_hex[0] if gemini_hex else "#4A90D9")

        # Pick secondary: next different color
        secondary = None
        for c in pool[1:] + gemini_hex:
            if c != primary:
                secondary = c
                break

        # Pick accent
        accent = None
        used = {primary, secondary}
        for c in pool[2:] + gemini_hex:
            if c not in used:
                accent = c
                break

        # Background: light color from CSS or default
        background = "#FFFFFF"
        light_shades = {"#FAFAFA", "#F5F5F5", "#F8F8F8", "#F0F0F0",
                        "#F9FAFB", "#F3F4F6", "#F4F4F4"}
        for c in css_colors:
            if c.upper() in light_shades:
                background = c.upper()
                break

        # Text: dark color from CSS or default
        text_color = "#1A1A1A"
        dark_shades = {"#111111", "#1A1A1A", "#212121", "#222222",
                       "#232323", "#2D2D2D", "#333333", "#0F172A", "#1E293B",
                       "#111827", "#1F2937"}
        for c in css_colors:
            if c.upper() in dark_shades:
                text_color = c.upper()
                break

        print(f"    🎨 Intelligence Palette: primary={primary} secondary={secondary} accent={accent}")

        return ColorPalette(
            primary=primary,
            secondary=secondary,
            accent=accent,
            background=background,
            text=text_color,
        )


    # ═══════════════════════════════════════════════════════
    # HTML EXTRACTION METHODS
    # ═══════════════════════════════════════════════════════

    def _extract_company_name(self, soup: BeautifulSoup) -> str:
        """Extract company name with multiple fallbacks."""
        if not soup:
            return ""
        
        # 1. Try OpenGraph
        og_name = soup.find("meta", property="og:site_name")
        if og_name and og_name.get("content"):
            return og_name["content"].strip()
            
        # 2. Try Title Tag (extract shortest part)
        if soup.title and soup.title.string:
            raw = soup.title.string.strip()
            for sep in ["|", " - ", " – ", " — ", ":"]:
                if sep in raw:
                    parts = [p.strip() for p in raw.split(sep)]
                    valid = [p for p in parts if len(p) > 1]
                    if valid:
                        # Pick the shortest valid part (usually the brand name)
                        return min(valid, key=len)
            return raw[:50]
            
        return "" # Return empty string, let the caller handle domain fallback

    def _extract_description(self, soup: BeautifulSoup) -> str:
        if not soup:
            return ""
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            return desc["content"]
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            return og_desc["content"]
        return ""

    def _extract_favicon(self, soup: BeautifulSoup, base_url: str) -> str:
        if not soup:
            return urljoin(base_url, "/favicon.ico")
        icon_link = soup.find(
            "link",
            rel=lambda x: x and isinstance(x, list)
            and any("icon" in r.lower() for r in x),
        )
        if not icon_link:
            icon_link = soup.find(
                "link",
                rel=lambda x: x and isinstance(x, str) and "icon" in x.lower(),
            )
        if icon_link and icon_link.get("href"):
            return urljoin(base_url, icon_link["href"])
        return urljoin(base_url, "/favicon.ico")

    def _extract_logo_from_html(
        self, soup: BeautifulSoup, base_url: str
    ) -> Optional[str]:
        if not soup:
            return None

        def resolve_url(src: str) -> Optional[str]:
            if not src:
                return None
            if src.startswith("data:"):
                return None
            if src.startswith("//"):
                src = "https:" + src
            if src.startswith(("http://", "https://")):
                return src
            return urljoin(base_url, src)

        def get_real_src(el) -> Optional[str]:
            for attr in ("data-src", "data-lazy-src", "data-original"):
                val = el.get(attr)
                if val:
                    resolved = resolve_url(val.split(",")[0].strip().split(" ")[0])
                    if resolved:
                        return resolved
            resolved = resolve_url(el.get("src"))
            if resolved:
                return resolved
            return resolve_url(el.get("content"))

        # --- Priority 1: Find logo from HTML selectors ---
        selectors = [
            lambda: soup.select_one("header img, nav img, .navbar img"),
            lambda: soup.find("img", attrs={
                "class": lambda x: x and "logo" in str(x).lower()
            }),
            lambda: soup.find("img", attrs={
                "id": lambda x: x and "logo" in str(x).lower()
            }),
            lambda: soup.find("img", attrs={
                "alt": lambda x: x and "logo" in str(x).lower()
            }),
            lambda: soup.find("img", attrs={
                "src": lambda x: (x and isinstance(x, str)
                                  and any(k in x.lower() for k in ["logo", "brand", "mark"])
                                  and not x.startswith("data:"))
            }),
            lambda: soup.find("a", attrs={
                "class": lambda x: x and any(k in str(x).lower() for k in ["brand", "logo", "navbar-brand"])
            }),

        ]
        for selector in selectors:
            try:
                el = selector()
                if el:
                    if el.name == "a":
                        nested_img = el.find("img")
                        if nested_img:
                            el = nested_img
                        else:
                            continue
                    url = get_real_src(el)
                    if url:
                        return url
            except Exception:
                continue

        # --- Priority 2: SVGs in header/logo containers ---
        header_svgs = soup.select("header svg, nav svg, .logo svg, .navbar svg, #logo svg")
        if header_svgs:
            # For SVGs, we might not get a URL easily if it's inline, 
            # but we can at least note the presence or try to find a background-image URL
            pass 

        # --- Priority 3: apple-touch-icon (high-res, most sites have it) ---
        apple_icon = soup.find("link", rel=lambda x: x and isinstance(x, list)
                               and any("apple-touch-icon" in r.lower() for r in x))
        if not apple_icon:
            apple_icon = soup.find("link", rel=lambda x: x and isinstance(x, str)
                                   and "apple-touch-icon" in x.lower())
        if apple_icon and apple_icon.get("href"):
            resolved = resolve_url(apple_icon["href"])
            if resolved:
                return resolved

        # --- Priority 4: og:image (social sharing image) ---
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            resolved = resolve_url(og_image["content"])
            if resolved:
                return resolved

        # --- Priority 5: Clearbit Logo Fallback (High Reliability) ---
        try:
            domain = urlparse(base_url).netloc.replace("www.", "")
            if domain:
                return f"https://logo.clearbit.com/{domain}"
        except:
            pass

        # --- Priority 6: Google Favicon API (128px, always works) ---
        try:
            domain = urlparse(base_url).netloc.replace("www.", "")
            if domain:
                return (f"https://t3.gstatic.com/faviconV2?client=SOCIAL"
                        f"&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
                        f"&url=https://{domain}&size=128")
        except Exception:
            pass

        return None

    def _extract_colors_from_css(
        self, soup: BeautifulSoup, html: str
    ) -> List[str]:
        """Extract colors with DOM-weighted intelligence."""
        colors = []
        weighted_colors = [] # List of (color, weight)
        seen = set()
        if not html: return colors

        hex_pattern = re.compile(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b")

        # 1. High Weight: Header, Nav, Hero section
        priority_sections = soup.select("header, nav, [class*='hero'], [id*='hero'], [class*='banner']") if soup else []
        for section in priority_sections:
            for match in hex_pattern.finditer(str(section)):
                raw = match.group(1).upper()
                c = f"#{raw}" if len(raw) == 6 else f"#{raw[0]*2}{raw[1]*2}{raw[2]*2}"
                weighted_colors.append((c, 5)) # high priority

        # 2. Medium Weight: Root variables
        if soup:
            for style_tag in soup.find_all("style"):
                if style_tag.string:
                    if ":root" in style_tag.string:
                        for match in hex_pattern.finditer(style_tag.string):
                            raw = match.group(1).upper()
                            c = f"#{raw}" if len(raw) == 6 else f"#{raw[0]*2}{raw[1]*2}{raw[2]*2}"
                            weighted_colors.append((c, 3))

        # 3. Standard Weight: rest of the page
        for match in hex_pattern.finditer(html[:50000]):
            raw = match.group(1).upper()
            c = f"#{raw}" if len(raw) == 6 else f"#{raw[0]*2}{raw[1]*2}{raw[2]*2}"
            weighted_colors.append((c, 1))

        # Sort by weight
        weighted_colors.sort(key=lambda x: x[1], reverse=True)
        
        for c, w in weighted_colors:
            if c not in seen:
                colors.append(c)
                seen.add(c)
        
        return colors[:30]


    def _extract_fonts_from_html(
        self, soup: BeautifulSoup, html: str
    ) -> List[str]:
        fonts = []
        seen = set()
        if not soup:
            return fonts

        # Google Fonts links
        for link in soup.find_all("link", href=True):
            href = link["href"]
            if "fonts.googleapis.com" in href:
                family_match = re.findall(r"family=([^&:]+)", href)
                for fam in family_match:
                    for name in fam.split("|"):
                        clean = name.replace("+", " ").split(":")[0].strip()
                        if (clean and clean.lower() not in seen
                                and clean.lower() not in GENERIC_FONTS):
                            fonts.append(clean)
                            seen.add(clean.lower())

        # Inline style font-family
        for style_tag in soup.find_all("style"):
            if style_tag.string:
                for match in re.finditer(
                    r"font-family\s*:\s*['\"]?([^;'\"}\n]+)", style_tag.string
                ):
                    name = match.group(1).strip().strip("'\"").split(",")[0].strip()
                    if _is_valid_font(name) and name.lower() not in seen:
                        fonts.append(name)
                        seen.add(name.lower())

        return fonts[:5]

    def _extract_page_text(self, soup: BeautifulSoup) -> str:
        if not soup:
            return ""
        # Remove non-content elements
        for tag in soup.find_all(
            ["script", "style", "noscript", "iframe", "svg"]
        ):
            tag.decompose()
        text_parts = []
        for el in soup.find_all(
            ["h1", "h2", "h3", "h4", "p", "li", "td", "span", "a",
             "div", "section", "article"]
        ):
            text = el.get_text(strip=True)
            if text and len(text) > 5:
                text_parts.append(text)
        # Deduplicate
        seen = set()
        unique = []
        for t in text_parts:
            if t not in seen:
                unique.append(t)
                seen.add(t)
        return "\n".join(unique[:200])

    # ═══════════════════════════════════════════════════════
    # UTILITY
    # ═══════════════════════════════════════════════════════

    @staticmethod
    def _normalize_strategy(strategy: dict) -> dict:
        list_fields = [
            "content_pillars", "visual_style_guide",
            "recommended_post_types", "campaign_ideas", "key_strengths",
        ]
        for field in list_fields:
            items = strategy.get(field)
            if not items or not isinstance(items, list):
                continue
            normalized = []
            for item in items:
                if isinstance(item, str):
                    normalized.append(item)
                elif isinstance(item, dict):
                    parts = []
                    if item.get("title"):
                        parts.append(item["title"])
                    if item.get("description"):
                        parts.append(item["description"])
                    if not parts:
                        parts = [str(v) for v in item.values() if v]
                    normalized.append(
                        ": ".join(parts) if parts else str(item)
                    )
                else:
                    normalized.append(str(item))
            strategy[field] = normalized
        return strategy
