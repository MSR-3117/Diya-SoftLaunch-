import os
import requests
from PIL import ImageFont

class FontManager:
    """
    Manages local font library and maps brand styles to available TTF files.
    Auto-downloads fonts if missing.
    """
    
    FONTS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "assets", "fonts")
    
    # Map generic categories to specific Google Fonts
    FONT_MAP = {
        "sans-serif": "Inter-Bold.ttf",
        "serif": "PlayfairDisplay-Bold.ttf",
        "display": "Oswald-Bold.ttf",
        "handwriting": "DancingScript-Bold.ttf",
        "monospace": "JetBrainsMono-Bold.ttf"
    }
    
    # STABLE direct download URLs from GitHub google/fonts repository
    DOWNLOAD_URLS = {
        "Inter-Bold.ttf": "https://raw.githubusercontent.com/rsms/inter/master/docs/font-files/Inter-Bold.otf",
        "PlayfairDisplay-Bold.ttf": "https://raw.githubusercontent.com/googlefonts/Playfair/main/fonts/variable/PlayfairDisplay%5Bwght%5D.ttf",
        "Oswald-Bold.ttf": "https://raw.githubusercontent.com/googlefonts/OswaldFont/main/fonts/ttf/Oswald-Bold.ttf",
        "DancingScript-Bold.ttf": "https://raw.githubusercontent.com/googlefonts/DancingScript/main/fonts/ttf/DancingScript-Bold.ttf",
        "JetBrainsMono-Bold.ttf": "https://raw.githubusercontent.com/JetBrains/JetBrainsMono/master/fonts/ttf/JetBrainsMono-Bold.ttf"
    }

    def __init__(self):
        os.makedirs(self.FONTS_DIR, exist_ok=True)
        self._ensure_fonts_exist()

    def _ensure_fonts_exist(self):
        """Downloads missing fonts on startup."""
        for font_file, url in self.DOWNLOAD_URLS.items():
            path = os.path.join(self.FONTS_DIR, font_file)
            if not os.path.exists(path):
                print(f"FontManager: Downloading {font_file}...")
                try:
                    resp = requests.get(url, timeout=30, headers={"User-Agent": "Mozilla/5.0"})
                    if resp.status_code == 200 and len(resp.content) > 1000:  # Sanity check
                        with open(path, "wb") as f:
                            f.write(resp.content)
                        print(f"FontManager: Downloaded {font_file} ({len(resp.content)} bytes)")
                    else:
                        print(f"FontManager: Failed to download {font_file}: HTTP {resp.status_code}, {len(resp.content)} bytes")
                except Exception as e:
                    print(f"FontManager: Error downloading {font_file}: {e}")

    def get_font(self, family_name: str, style_category: str = "sans-serif", size: int = 60) -> ImageFont.FreeTypeFont:
        """
        Returns a PIL ImageFont object.
        1. Tries to match specific family name (simple mapping).
        2. Fallback to style_category.
        3. Fallback to Inter (default sans-serif).
        """
        filename = "Inter-Bold.ttf"  # Default sans-serif
        
        # Normalize inputs
        family = family_name.lower().strip() if family_name else ""
        category = style_category.lower().strip() if style_category else "sans-serif"
        
        # Simple heuristic matching
        if "serif" in family or ("serif" in category and "sans" not in category):
            filename = self.FONT_MAP["serif"]
        elif "hand" in family or "script" in family or "handwriting" in category or "dancing" in family:
            filename = self.FONT_MAP["handwriting"]
        elif "mono" in family or "code" in family or "monospace" in category or "jetbrains" in family:
            filename = self.FONT_MAP["monospace"]
        elif "oswald" in family or "display" in category or "impact" in family:
            filename = self.FONT_MAP["display"]
        else:
            filename = self.FONT_MAP["sans-serif"]
             
        font_path = os.path.join(self.FONTS_DIR, filename)
        
        # Primary: Try our downloaded font
        try:
            font = ImageFont.truetype(font_path, size)
            print(f"FontManager: Loaded {filename} at size {size}")
            return font
        except Exception as e:
            print(f"FontManager: Failed to load {font_path}: {e}")
        
        # Fallback 1: macOS System Font (TTC needs index parameter)
        try:
            font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", size)
            print(f"FontManager: Using macOS Arial Bold fallback at size {size}")
            return font
        except Exception as e:
            print(f"FontManager: macOS fallback failed: {e}")
        
        # Fallback 2: Linux System Font (Common)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", size)
            print(f"FontManager: Using Linux DejaVu fallback at size {size}")
            return font
        except Exception as e:
            print(f"FontManager: Linux fallback failed: {e}")
        
        # Fallback 3: Pillow's built-in default (very small, last resort)
        print("FontManager: All fallbacks failed. Using bitmap default (small size warning).")
        return ImageFont.load_default()

