"""
Fast Brand Asset Extractor — 3-Layer Pipeline

Layer 1: HTTP + BeautifulSoup (text, logo, CSS colors, fonts) — ~1-2s
Layer 2: Playwright computed styles (supplement) — ~3-5s (parallel)
Layer 3: Gemini Flash text-only (summary, strategy, vibe) — ~3-5s (parallel)

Total: ~7-12s (vs ~30-45s with screenshot-based approach)
"""
import re
import asyncio
import base64
from typing import Optional, List
from datetime import datetime
from urllib.parse import urljoin, urlparse

import httpx
from bs4 import BeautifulSoup
from dotenv import load_dotenv

from app.models.brand_assets import BrandAssets, ColorPalette, FontInfo, ExtractedLogo, StrategicAnalysis
from app.services.browser_service import BrowserService
from app.services.gemini_service import GeminiService

load_dotenv()


class AssetExtractor:
    """Fast brand asset extractor using 3-layer parallel pipeline."""

    def __init__(self):
        self.browser_service = BrowserService()
        self.gemini_service = GeminiService()
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }

    async def extract_assets(self, url: str) -> BrandAssets:
        """
        Main extraction pipeline — 3 layers running in parallel.
        """
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        import time
        start_time = time.time()
        print(f"\n{'='*60}")
        print(f"⚡ FAST BRAND ANALYSIS: {url}")
        print(f"{'='*60}")

        # ═══════════════════════════════════════════════════════
        # LAYER 1: HTTP + BeautifulSoup (synchronous, fast)
        # ═══════════════════════════════════════════════════════
        print("  📡 Layer 1: Fetching HTML...")
        layer1_start = time.time()

        html_content = ""
        final_url = url
        async with httpx.AsyncClient(headers=self.headers, follow_redirects=True, timeout=10.0) as client:
            try:
                response = await client.get(url)
                html_content = response.text
                final_url = str(response.url)
            except Exception as e:
                print(f"  ⚠️ HTTP fetch failed: {e}")

        soup = BeautifulSoup(html_content, "html.parser") if html_content else None

        # Extract everything we can from HTML
        company_name = self._extract_company_name(soup)
        meta_description = self._extract_description(soup)
        favicon = self._extract_favicon(soup, final_url)
        html_logo = self._extract_logo_from_html(soup, final_url)
        html_colors = self._extract_colors_from_css(soup, html_content)
        html_fonts = self._extract_fonts_from_html(soup, html_content)
        page_text = self._extract_page_text(soup)

        layer1_time = time.time() - layer1_start
        print(f"  ✅ Layer 1 done in {layer1_time:.1f}s — Name: '{company_name}', Colors: {len(html_colors)}, Fonts: {len(html_fonts)}")

        # ═══════════════════════════════════════════════════════
        # LAYERS 2 & 3: Run in PARALLEL
        # ═══════════════════════════════════════════════════════
        print("  🔄 Layers 2+3: Starting parallel (Browser + Gemini)...")

        async def run_browser():
            """Layer 2: Playwright for computed styles."""
            try:
                result = await self.browser_service.capture_and_extract(url)
                return result.get('styles', {})
            except Exception as e:
                print(f"  ⚠️ Browser extraction failed: {e}")
                return {}

        async def run_gemini():
            """Layer 3: Gemini Flash text-only analysis."""
            try:
                result = await self.gemini_service.generate_brand_analysis(
                    company_name=company_name,
                    description=meta_description,
                    page_text=page_text,
                    url=final_url
                )
                return result
            except Exception as e:
                print(f"  ⚠️ Gemini analysis failed: {e}")
                return {}

        parallel_start = time.time()
        computed_styles, gemini_data = await asyncio.gather(run_browser(), run_gemini())
        parallel_time = time.time() - parallel_start
        print(f"  ✅ Layers 2+3 done in {parallel_time:.1f}s")

        # ═══════════════════════════════════════════════════════
        # MERGE DATA (Priority: Playwright > CSS parsed > Gemini > defaults)
        # ═══════════════════════════════════════════════════════
        print("  🔗 Merging data...")

        # COMPANY NAME: HTML > Gemini
        # (HTML is usually more accurate for name)

        # COLORS: Playwright computed > CSS parsed > defaults
        primary_color = self._rgb_to_hex(computed_styles.get("primary_color")) or \
                        (html_colors[0] if html_colors else None) or \
                        "#000000"
        background_color = self._rgb_to_hex(computed_styles.get("background_color")) or \
                           "#ffffff"

        # If primary == background, try next CSS color
        if primary_color == background_color and len(html_colors) > 1:
            primary_color = html_colors[1]

        # Build all_colors from CSS-parsed colors (deduplicated)
        all_colors = list(dict.fromkeys(html_colors))  # preserve order, remove dupes

        colors = ColorPalette(
            primary=primary_color,
            secondary=html_colors[1] if len(html_colors) > 1 else None,
            accent=html_colors[2] if len(html_colors) > 2 else None,
            background=background_color,
            text=html_colors[3] if len(html_colors) > 3 else "#000000",
            all_colors=all_colors[:10]  # Cap at 10
        )

        # FONTS: Playwright computed > HTML parsed > default
        fonts = []
        if computed_styles.get("heading_font"):
            fonts.append(FontInfo(
                family=computed_styles["heading_font"],
                style="Display", is_primary=True, source="Computed Style"
            ))
        if computed_styles.get("body_font"):
            fonts.append(FontInfo(
                family=computed_styles["body_font"],
                style="Body", is_body=True, source="Computed Style"
            ))
        
        # Add HTML-parsed fonts that aren't already in the list
        existing_families = {f.family.lower() for f in fonts}
        for font_name in html_fonts:
            if font_name.lower() not in existing_families:
                fonts.append(FontInfo(family=font_name, source="CSS Parsed"))
                existing_families.add(font_name.lower())

        if not fonts:
            fonts = [FontInfo(family="Inter", source="Default")]

        # LOGO: Playwright > HTML parsed
        logo = None
        logo_url = computed_styles.get("logo_url") or html_logo
        if logo_url:
            fmt = logo_url.split(".")[-1].lower().split("?")[0]
            if len(fmt) > 4: fmt = "png"
            logo = ExtractedLogo(url=logo_url, format=fmt, is_svg="svg" in fmt)

        # BRAND VIBE & STRATEGY from Gemini
        vibe = gemini_data.get("brand_vibe", [])
        company_summary = gemini_data.get("company_summary", "")
        raw_strategy = gemini_data.get("strategy")

        if not raw_strategy:
            print("  ⚠️ No strategy from Gemini — using defaults")
            raw_strategy = {
                "brand_archetype": "The Creator",
                "brand_voice": "Professional and trustworthy",
                "content_pillars": ["Industry Trends", "Company Updates", "Thought Leadership", "Product Tips"],
                "visual_style_guide": ["Clean and modern", "Consistent use of brand colors"],
                "recommended_post_types": ["Educational", "Promotional"],
                "campaign_ideas": ["Showcase unique value proposition", "Highlight customer success stories"],
                "target_audience": "General Professional Audience",
                "key_strengths": ["Innovation", "Reliability"],
                "design_style": "Modern Professional"
            }

        # Normalize strategy (Gemini sometimes returns dicts instead of strings)
        raw_strategy = self._normalize_strategy(raw_strategy)

        total_time = time.time() - start_time
        print(f"\n{'─'*60}")
        print(f"  ⏱️  TOTAL TIME: {total_time:.1f}s")
        print(f"  📊  Name: {company_name} | Colors: {len(all_colors)} | Fonts: {len(fonts)} | Logo: {'✅' if logo else '❌'}")
        print(f"{'='*60}\n")

        return BrandAssets(
            website_url=final_url,
            company_name=company_name,
            company_summary=company_summary or meta_description or f"Analysis for {company_name}",
            logo=logo,
            colors=colors,
            fonts=fonts,
            favicon_url=favicon,
            meta_description=meta_description,
            extraction_timestamp=datetime.now().isoformat(),
            brand_vibe=vibe,
            strategy=StrategicAnalysis(**raw_strategy)
        )

    # ═══════════════════════════════════════════════════════
    # LAYER 1 HELPERS: Pure HTML/CSS Extraction
    # ═══════════════════════════════════════════════════════

    def _extract_company_name(self, soup: BeautifulSoup) -> str:
        if not soup: return "Unknown"
        # og:site_name is usually the cleanest
        og_name = soup.find("meta", property="og:site_name")
        if og_name and og_name.get("content"):
            return og_name["content"].strip()
        # Fallback to title tag
        if soup.title and soup.title.string:
            raw = soup.title.string.strip()
            # Clean separators: "Page Title | Brand" → "Brand"
            for sep in ['|', ' - ', ' – ', ' — ', ':']:
                if sep in raw:
                    parts = [p.strip() for p in raw.split(sep)]
                    # Return shortest meaningful part (usually the brand name)
                    valid = [p for p in parts if len(p) > 1]
                    if valid:
                        return min(valid, key=len)
            return raw[:50]
        return "Unknown Company"

    def _extract_description(self, soup: BeautifulSoup) -> str:
        if not soup: return ""
        desc = soup.find("meta", attrs={"name": "description"})
        if desc and desc.get("content"):
            return desc["content"]
        og_desc = soup.find("meta", property="og:description")
        if og_desc and og_desc.get("content"):
            return og_desc["content"]
        return ""

    def _extract_favicon(self, soup: BeautifulSoup, base_url: str) -> str:
        if not soup: return urljoin(base_url, "/favicon.ico")
        icon_link = soup.find("link", rel=lambda x: x and isinstance(x, list) and any("icon" in r.lower() for r in x))
        if not icon_link:
            icon_link = soup.find("link", rel=lambda x: x and isinstance(x, str) and "icon" in x.lower())
        if icon_link and icon_link.get("href"):
            return urljoin(base_url, icon_link["href"])
        return urljoin(base_url, "/favicon.ico")

    def _extract_logo_from_html(self, soup: BeautifulSoup, base_url: str) -> Optional[str]:
        """Extract logo URL from HTML — checks header, nav, common patterns."""
        if not soup: return None

        # Priority order for logo detection
        selectors = [
            # 1. Images inside header/nav
            lambda: soup.select_one("header img, nav img"),
            # 2. Images with 'logo' in class/id/alt/src
            lambda: soup.find("img", attrs={"class": lambda x: x and "logo" in str(x).lower()}),
            lambda: soup.find("img", attrs={"id": lambda x: x and "logo" in str(x).lower()}),
            lambda: soup.find("img", attrs={"alt": lambda x: x and "logo" in str(x).lower()}),
            lambda: soup.find("img", attrs={"src": lambda x: x and "logo" in str(x).lower()}),
            # 3. SVG with logo class
            lambda: soup.find("svg", attrs={"class": lambda x: x and "logo" in str(x).lower()}),
            # 4. og:image fallback
            lambda: soup.find("meta", property="og:image"),
        ]

        for selector in selectors:
            try:
                el = selector()
                if el:
                    src = el.get("src") or el.get("content") or el.get("href")
                    if src:
                        return urljoin(base_url, src)
            except Exception:
                continue

        return None

    def _extract_colors_from_css(self, soup: BeautifulSoup, html: str) -> List[str]:
        """Extract brand colors from inline CSS, <style> tags, and common patterns."""
        colors = []
        seen = set()

        if not html:
            return colors

        # 1. Find all hex colors in inline styles and <style> tags
        hex_pattern = re.compile(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b')
        
        # From <style> tags
        if soup:
            for style_tag in soup.find_all("style"):
                if style_tag.string:
                    for match in hex_pattern.finditer(style_tag.string):
                        hex_color = f"#{match.group(1).upper()}"
                        if len(hex_color) == 4:  # Convert #ABC to #AABBCC
                            hex_color = f"#{hex_color[1]*2}{hex_color[2]*2}{hex_color[3]*2}"
                        if hex_color not in seen and hex_color not in ("#FFFFFF", "#000000", "#FFF", "#FFFFF"):
                            colors.append(hex_color)
                            seen.add(hex_color)

        # 2. From inline style attributes
        if soup:
            for el in soup.find_all(attrs={"style": True}):
                style = el.get("style", "")
                for match in hex_pattern.finditer(style):
                    hex_color = f"#{match.group(1).upper()}"
                    if len(hex_color) == 4:
                        hex_color = f"#{hex_color[1]*2}{hex_color[2]*2}{hex_color[3]*2}"
                    if hex_color not in seen and hex_color not in ("#FFFFFF", "#000000"):
                        colors.append(hex_color)
                        seen.add(hex_color)

        # 3. Also extract rgb() colors from styles
        rgb_pattern = re.compile(r'rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)')
        full_text = str(soup) if soup else html
        for match in rgb_pattern.finditer(full_text[:50000]):  # Limit scan
            r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
            hex_color = f"#{r:02X}{g:02X}{b:02X}"
            if hex_color not in seen and hex_color not in ("#FFFFFF", "#000000"):
                colors.append(hex_color)
                seen.add(hex_color)
        
        return colors[:15]  # Cap at 15 unique colors

    def _extract_fonts_from_html(self, soup: BeautifulSoup, html: str) -> List[str]:
        """Extract font names from CSS @font-face, Google Fonts links, and inline styles."""
        fonts = []
        seen = set()

        if not soup:
            return fonts

        # 1. Google Fonts <link> tags
        for link in soup.find_all("link", href=True):
            href = link["href"]
            if "fonts.googleapis.com" in href:
                # Parse family names from URL
                family_match = re.findall(r'family=([^&:]+)', href)
                for fam in family_match:
                    # Handle URL-encoded names: "Open+Sans" → "Open Sans"
                    for name in fam.split("|"):
                        clean = name.replace("+", " ").split(":")[0].strip()
                        if clean and clean.lower() not in seen:
                            fonts.append(clean)
                            seen.add(clean.lower())

        # 2. @font-face in <style> tags
        for style_tag in soup.find_all("style"):
            if style_tag.string:
                font_face_pattern = re.compile(r"font-family\s*:\s*['\"]?([^;'\"}\n]+)")
                for match in font_face_pattern.finditer(style_tag.string):
                    name = match.group(1).strip().strip("'\"").split(",")[0].strip()
                    if name and name.lower() not in seen and name.lower() not in ("inherit", "initial", "sans-serif", "serif", "monospace"):
                        fonts.append(name)
                        seen.add(name.lower())

        return fonts[:5]  # Cap at 5 fonts

    def _extract_page_text(self, soup: BeautifulSoup) -> str:
        """Extract clean visible text from the page for Gemini analysis."""
        if not soup:
            return ""

        # Remove script/style/nav/footer elements
        for tag in soup.find_all(["script", "style", "nav", "footer", "noscript", "iframe"]):
            tag.decompose()

        # Get text from meaningful elements
        text_parts = []
        for el in soup.find_all(["h1", "h2", "h3", "h4", "p", "li", "td", "span", "a"]):
            text = el.get_text(strip=True)
            if text and len(text) > 3:  # Skip tiny fragments
                text_parts.append(text)

        # Deduplicate and join
        seen_text = set()
        unique_parts = []
        for t in text_parts:
            if t not in seen_text:
                unique_parts.append(t)
                seen_text.add(t)

        return "\n".join(unique_parts[:200])  # Cap at 200 text blocks

    # ═══════════════════════════════════════════════════════
    # UTILITY METHODS
    # ═══════════════════════════════════════════════════════

    @staticmethod
    def _rgb_to_hex(rgb_str) -> Optional[str]:
        """Convert 'rgb(r, g, b)' to '#RRGGBB'."""
        if not rgb_str or 'rgb' not in str(rgb_str):
            return None
        nums = re.findall(r'\d+', str(rgb_str))
        if len(nums) >= 3:
            return '#{:02X}{:02X}{:02X}'.format(int(nums[0]), int(nums[1]), int(nums[2]))
        return None

    @staticmethod
    def _normalize_strategy(strategy: dict) -> dict:
        """
        Gemini sometimes returns list fields as dicts instead of strings.
        e.g. campaign_ideas: [{title: ..., description: ...}] instead of ["..."]
        This normalizes all list fields to contain only strings.
        """
        list_fields = [
            'content_pillars', 'visual_style_guide', 'recommended_post_types',
            'campaign_ideas', 'key_strengths'
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
                    if item.get('title'):
                        parts.append(item['title'])
                    if item.get('description'):
                        parts.append(item['description'])
                    if not parts:
                        parts = [str(v) for v in item.values() if v]
                    normalized.append(': '.join(parts) if parts else str(item))
                else:
                    normalized.append(str(item))
            strategy[field] = normalized
        return strategy
