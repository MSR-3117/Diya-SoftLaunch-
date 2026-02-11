"""
Fast Brand Asset Extractor — 2-Layer Pipeline (No Chromium)

Layer 1: HTTP + BeautifulSoup (text, logo, CSS colors, fonts) — ~1-3s
         Also fetches external CSS files for colors/fonts
Layer 2: Gemini Flash text-only (summary, strategy, vibe, colors, fonts) — ~3-5s

Total: ~4-8s (no browser launch needed)
"""
import re
import asyncio
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
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                          "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }

    async def extract_assets(self, url: str) -> BrandAssets:
        """Main extraction — 2 layers, no Chromium needed."""
        if not url.startswith(("http://", "https://")):
            url = f"https://{url}"

        import time
        start_time = time.time()
        print(f"\n{'='*60}")
        print(f"⚡ FAST BRAND ANALYSIS (no browser): {url}")
        print(f"{'='*60}")

        # ═══════════════════════════════════════════════════
        # LAYER 1: HTTP + BeautifulSoup + External CSS
        # ═══════════════════════════════════════════════════
        print("  📡 Layer 1: Fetching HTML + CSS...")
        layer1_start = time.time()

        html_content = ""
        final_url = url
        async with httpx.AsyncClient(
            headers=self.headers, follow_redirects=True, timeout=15.0
        ) as client:
            try:
                response = await client.get(url)
                html_content = response.text
                final_url = str(response.url)
            except Exception as e:
                print(f"  ⚠️ HTTP fetch failed: {e}")
                raise ValueError(f"Failed to load website: {str(e)}")

            soup = BeautifulSoup(html_content, "html.parser") if html_content else None

            # Extract from HTML
            company_name = self._extract_company_name(soup)
            meta_description = self._extract_description(soup)
            favicon = self._extract_favicon(soup, final_url)
            logo_url = self._extract_logo_from_html(soup, final_url)
            page_text = self._extract_page_text(soup)

            # Extract colors/fonts from inline CSS
            html_colors = self._extract_colors_from_css(soup, html_content)
            html_fonts = self._extract_fonts_from_html(soup, html_content)

            # Also fetch external CSS files for more colors/fonts
            css_colors, css_fonts = await self._fetch_external_css(
                soup, final_url, client
            )
            # Merge (external CSS results appended)
            for c in css_colors:
                if c not in html_colors:
                    html_colors.append(c)
            for f in css_fonts:
                if f.lower() not in {x.lower() for x in html_fonts}:
                    html_fonts.append(f)

        layer1_time = time.time() - layer1_start
        print(f"  ✅ Layer 1 done in {layer1_time:.1f}s — "
              f"Name: '{company_name}', Colors: {len(html_colors)}, "
              f"Fonts: {len(html_fonts)}")

        # ═══════════════════════════════════════════════════
        # LAYER 2: Gemini Flash text-only
        # ═══════════════════════════════════════════════════
        print("  🧠 Layer 2: Gemini Flash analysis...")
        layer2_start = time.time()

        gemini_data = {}
        try:
            gemini_data = await self.gemini_service.generate_brand_analysis(
                company_name=company_name,
                description=meta_description,
                page_text=page_text,
                url=final_url
            )
        except Exception as e:
            print(f"  ⚠️ Gemini analysis failed: {e}")

        layer2_time = time.time() - layer2_start
        print(f"  ✅ Layer 2 done in {layer2_time:.1f}s")

        # ═══════════════════════════════════════════════════
        # MERGE DATA
        # ═══════════════════════════════════════════════════
        print("  🔗 Merging data...")

        # ── COLORS ──
        # Gemini may suggest brand colors too
        gemini_colors = gemini_data.get("brand_colors", [])
        if isinstance(gemini_colors, list):
            for c in gemini_colors:
                if isinstance(c, str) and re.match(r'^#[0-9a-fA-F]{6}$', c):
                    c = c.upper()
                    if c not in html_colors:
                        html_colors.append(c)

        # Build final palette
        colors = self._build_color_palette(html_colors, gemini_colors)
        all_colors = list(dict.fromkeys(html_colors))[:10]
        colors.all_colors = all_colors

        # ── FONTS ──
        gemini_fonts = gemini_data.get("brand_fonts", [])
        if isinstance(gemini_fonts, list):
            for f in gemini_fonts:
                if isinstance(f, str) and f.lower() not in {x.lower() for x in html_fonts} and f.lower() not in GENERIC_FONTS:
                    html_fonts.append(f)

        fonts = []
        for i, font_name in enumerate(html_fonts[:5]):
            fonts.append(FontInfo(
                family=font_name,
                style="Display" if i == 0 else "Body",
                is_primary=(i == 0),
                is_body=(i == 1),
                source="CSS" if i < len(html_fonts) - len(gemini_fonts) else "AI Inferred"
            ))
        if not fonts:
            # Use Gemini suggestions or default
            default_font = gemini_fonts[0] if gemini_fonts else "Inter"
            fonts = [FontInfo(family=default_font, source="AI Inferred")]

        # ── LOGO ──
        logo = None
        if logo_url:
            fmt = logo_url.split(".")[-1].lower().split("?")[0].split("#")[0]
            if len(fmt) > 4 or not fmt.isalpha():
                fmt = "png"
            logo = ExtractedLogo(
                url=logo_url, format=fmt, is_svg=("svg" in fmt)
            )

        # ── STRATEGY + VIBE ──
        vibe = gemini_data.get("brand_vibe", [])
        company_summary = gemini_data.get("company_summary", "")
        raw_strategy = gemini_data.get("strategy")

        if not raw_strategy:
            print("  ⚠️ No strategy from Gemini — using defaults")
            raw_strategy = {
                "brand_archetype": "The Creator",
                "brand_voice": "Professional and trustworthy",
                "content_pillars": ["Industry Trends", "Company Updates",
                                    "Thought Leadership", "Product Tips"],
                "visual_style_guide": ["Clean and modern",
                                       "Consistent use of brand colors"],
                "recommended_post_types": ["Educational", "Promotional"],
                "campaign_ideas": ["Showcase unique value proposition",
                                   "Highlight customer success stories"],
                "target_audience": "General Professional Audience",
                "key_strengths": ["Innovation", "Reliability"],
                "design_style": "Modern Professional",
            }

        raw_strategy = self._normalize_strategy(raw_strategy)

        total_time = time.time() - start_time
        print(f"\n{'─'*60}")
        print(f"  ⏱️  TOTAL TIME: {total_time:.1f}s")
        print(f"  📊  Name: {company_name} | Colors: {len(all_colors)} | "
              f"Fonts: {len(fonts)} | Logo: {'✅' if logo else '❌'}")
        print(f"{'='*60}\n")

        return BrandAssets(
            website_url=final_url,
            company_name=company_name,
            company_summary=(company_summary or meta_description
                             or f"Analysis for {company_name}"),
            logo=logo,
            colors=colors,
            fonts=fonts,
            favicon_url=favicon,
            meta_description=meta_description,
            extraction_timestamp=datetime.now().isoformat(),
            brand_vibe=vibe,
            strategy=StrategicAnalysis(**raw_strategy),
        )

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

    # ═══════════════════════════════════════════════════════
    # COLOR PALETTE BUILDER
    # ═══════════════════════════════════════════════════════

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

    def _build_color_palette(self, css_colors: List[str], gemini_colors: List[str]) -> ColorPalette:
        """Build a ColorPalette from extracted colors. Prioritize vibrant colors."""
        # Near-neutral colors (very low saturation / common gray shades)
        neutrals = {"#FFFFFF", "#000000", "#333333", "#666666", "#999999",
                    "#CCCCCC", "#EEEEEE", "#F5F5F5", "#FAFAFA", "#808080",
                    "#FFF", "#000", "#E5E5E5", "#D4D4D4", "#F4F4F4",
                    "#EDEDED", "#EFEFEF", "#9CA3AF", "#6B7280", "#D1D5DB",
                    "#F3F4F6", "#F9FAFB", "#E5E7EB", "#374151", "#4B5563",
                    "#1F2937", "#111827", "#030712"}

        # Sort CSS colors by vibrancy (saturation)
        vibrant = sorted(
            [c for c in css_colors if c.upper() not in neutrals
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

        print(f"    🎨 Palette: primary={primary} secondary={secondary} accent={accent}")

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
        if not soup:
            return "Unknown"
        og_name = soup.find("meta", property="og:site_name")
        if og_name and og_name.get("content"):
            return og_name["content"].strip()
        if soup.title and soup.title.string:
            raw = soup.title.string.strip()
            for sep in ["|", " - ", " – ", " — ", ":"]:
                if sep in raw:
                    parts = [p.strip() for p in raw.split(sep)]
                    valid = [p for p in parts if len(p) > 1]
                    if valid:
                        return min(valid, key=len)
            return raw[:50]
        return "Unknown Company"

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
                                  and "logo" in x.lower()
                                  and not x.startswith("data:"))
            }),
            lambda: soup.find("a", attrs={
                "class": lambda x: x and ("brand" in str(x).lower()
                                          or "logo" in str(x).lower())
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

        # --- Priority 2: apple-touch-icon (high-res, most sites have it) ---
        apple_icon = soup.find("link", rel=lambda x: x and isinstance(x, list)
                               and any("apple-touch-icon" in r.lower() for r in x))
        if not apple_icon:
            apple_icon = soup.find("link", rel=lambda x: x and isinstance(x, str)
                                   and "apple-touch-icon" in x.lower())
        if apple_icon and apple_icon.get("href"):
            resolved = resolve_url(apple_icon["href"])
            if resolved:
                return resolved

        # --- Priority 3: og:image (social sharing image) ---
        og_image = soup.find("meta", property="og:image")
        if og_image and og_image.get("content"):
            resolved = resolve_url(og_image["content"])
            if resolved:
                return resolved

        # --- Priority 4: Google Favicon API (128px, always works) ---
        try:
            parsed = urlparse(base_url)
            domain = parsed.netloc or parsed.hostname
            if domain:
                domain = domain.replace("www.", "")
                return (f"https://t3.gstatic.com/faviconV2?client=SOCIAL"
                        f"&type=FAVICON&fallback_opts=TYPE,SIZE,URL"
                        f"&url=https://{domain}&size=128")
        except Exception:
            pass

        return None

    def _extract_colors_from_css(
        self, soup: BeautifulSoup, html: str
    ) -> List[str]:
        colors = []
        seen = set()
        if not html:
            return colors

        hex_pattern = re.compile(r"#([0-9a-fA-F]{6})\b")
        hex3_pattern = re.compile(r"#([0-9a-fA-F]{3})\b")

        if soup:
            for style_tag in soup.find_all("style"):
                if style_tag.string:
                    for match in hex_pattern.finditer(style_tag.string):
                        c = f"#{match.group(1).upper()}"
                        if c not in seen:
                            colors.append(c)
                            seen.add(c)
                    for match in hex3_pattern.finditer(style_tag.string):
                        short = match.group(1).upper()
                        c = f"#{short[0]*2}{short[1]*2}{short[2]*2}"
                        if c not in seen:
                            colors.append(c)
                            seen.add(c)

            for el in soup.find_all(attrs={"style": True}):
                style = el.get("style", "")
                for match in hex_pattern.finditer(style):
                    c = f"#{match.group(1).upper()}"
                    if c not in seen:
                        colors.append(c)
                        seen.add(c)

        # RGB values from HTML
        rgb_pattern = re.compile(r"rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)")
        search_text = str(soup)[:50000] if soup else html[:50000]
        for match in rgb_pattern.finditer(search_text):
            r, g, b = int(match.group(1)), int(match.group(2)), int(match.group(3))
            c = f"#{r:02X}{g:02X}{b:02X}"
            if c not in seen:
                colors.append(c)
                seen.add(c)

        return colors[:20]

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
