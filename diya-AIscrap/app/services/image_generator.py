import os
import io
import base64
import httpx
import traceback
from PIL import Image, ImageDraw, ImageFont

# ────────────────────────────────────────────────────────────
# Configuration & Helper Functions
# ────────────────────────────────────────────────────────────

CANVAS_SIZES = {
    "instagram": (1080, 1080),
    "linkedin": (1200, 627),
    "facebook": (1200, 630),
    "x": (1200, 675),
    "story": (1080, 1920),
}

def _hex_to_rgb(hex_color):
    """Convert hex string (e.g., '#FF0000') to RGB tuple."""
    h = hex_color.lstrip('#')
    if len(h) == 3:
        h = h[0]*2 + h[1]*2 + h[2]*2
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def _darken(rgb, factor=0.6):
    """Darken an RGB color."""
    return tuple(max(0, int(c * factor)) for c in rgb)

def _draw_gradient(draw, width, height, color1, color2):
    """Draw a vertical gradient."""
    for y in range(height):
        ratio = y / height
        r = int(color1[0] * (1 - ratio) + color2[0] * ratio)
        g = int(color1[1] * (1 - ratio) + color2[1] * ratio)
        b = int(color1[2] * (1 - ratio) + color2[2] * ratio)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

def _center_crop_resize(img, target_w, target_h):
    """Aspect-ratio-aware resize + center crop."""
    img_ratio = img.width / img.height
    target_ratio = target_w / target_h

    if img_ratio > target_ratio:
        # Image is wider → scale by height, crop width
        new_height = target_h
        new_width = int(new_height * img_ratio)
    else:
        # Image is taller → scale by width, crop height
        new_width = target_w
        new_height = int(new_width / img_ratio)

    img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
    left = (new_width - target_w) // 2
    top = (new_height - target_h) // 2
    return img.crop((left, top, left + target_w, top + target_h))

def _fetch_logo_b64(logo_url):
    """Download logo and return as base64 data URI."""
    if not logo_url: return None
    try:
        resp = httpx.get(logo_url, timeout=10, follow_redirects=True)
        if resp.status_code == 200:
            ct = resp.headers.get("content-type", "image/png").split(";")[0]
            b64 = base64.b64encode(resp.content).decode()
            return f"data:{ct};base64,{b64}"
    except Exception as e:
        print(f"⚠️ Logo fetch failed: {e}")
    return None

# ────────────────────────────────────────────────────────────
# AI Generation Logic (Gemini/Imagen)
# ────────────────────────────────────────────────────────────

def _get_scene_prompt(client, brand_data, content):
    """
    Uses Gemini to craft a visual prompt for the background scene.
    Ensures the scene is strictly visual (no text).
    """
    company = brand_data.get("name", "Brand")
    industry = brand_data.get("industry", "Business")
    vibe = ", ".join(brand_data.get("brand_vibe", [])[:3]) or "Professional"
    headline = content.get("headline", "")
    
    prompt = f"""
    Act as a Commercial Photographer. Create a prompt for a high-end product lifestyle shot.
    
    BRAND CONTEXT:
    - Company: {company} ({industry})
    - Vibe: {vibe}
    - Content Topic: "{headline}"
    
    TASK:
    Write a prompt for a photorealistic, cinematic image.
    - Style: High-quality advertising photography, depth of field, natural lighting, premium feel.
    - Composition: Centered subject with negative space at the top or center for text.
    - CRITICAL: NO TEXT, NO LOGOS, NO WATERMARKS in the image.
    
    OUTPUT ONLY THE PROMPT.
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=prompt
        )
        return response.text.strip()
    except Exception as e:
        print(f"⚠️ Prompt generation failed: {e}")
        return f"Photorealistic lifestyle photography for {company} {industry}, cinematic lighting, high resolution, negative space for text."

def _generate_scene_image(brand_data, content, width, height):
    """
    Generates the background image using Gemini 2.0 Flash (Image Gen capability).
    """
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        print("⚠️ No GOOGLE_API_KEY found.")
        return None

    try:
        from google import genai
        from google.genai import types
        client = genai.Client(api_key=api_key)
        
        # 1. Get detailed visual prompt
        scene_prompt = _get_scene_prompt(client, brand_data, content)
        print(f"🎨 Generating Scene: {scene_prompt[:60]}...")
        
        # 2. Generate Image
        # Using gemini-2.0-flash experimental for image generation
        response = client.models.generate_content(
            model='gemini-2.0-flash', 
            contents=scene_prompt,
            config=types.GenerateContentConfig(
                response_modalities=['Image']
            )
        )
        
        # 3. Extract and Process
        if response.candidates:
            for part in response.candidates[0].content.parts:
                if hasattr(part, 'inline_data') and part.inline_data:
                    img_bytes = base64.b64decode(part.inline_data.data)
                    
                    # Convert to PIL for resizing
                    img = Image.open(io.BytesIO(img_bytes)).convert("RGB")
                    img = _center_crop_resize(img, width, height)
                    
                    # Return as Base64
                    buf = io.BytesIO()
                    img.save(buf, format="PNG")
                    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()
                    
        print("⚠️ No image returned from Gemini.")
        
    except Exception as e:
        print(f"❌ Image Generation Error: {e}")
        traceback.print_exc()
        
    return None

def _generate_fallback_background(width, height, colors):
    """
    Generates a simple gradient background if AI fails.
    """
    canvas = Image.new("RGB", (width, height), (30, 30, 30))
    draw = ImageDraw.Draw(canvas)
    
    flat_colors = [c[0] if isinstance(c, list) else c for c in colors]
    if len(flat_colors) >= 2:
        c1, c2 = _hex_to_rgb(flat_colors[0]), _hex_to_rgb(flat_colors[1])
    else:
        c1, c2 = (60, 60, 80), (20, 20, 30)
        
    _draw_gradient(draw, width, height, c1, _darken(c2, 0.5))
    
    buf = io.BytesIO()
    canvas.save(buf, format="PNG")
    return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()

# ────────────────────────────────────────────────────────────
# Main Entry Point
# ────────────────────────────────────────────────────────────

def generate_layered_image(brand_data, content, platform="instagram"):
    """
    Generates a scene and returns structured layer data for Fabric.js.
    
    Returns:
    {
        "background": "data:image/png;base64,...",
        "layers": [ ...list of fabric.js object definitions... ],
        "canvas": { width, height }
    }
    """
    width, height = CANVAS_SIZES.get(platform, (1080, 1080))
    
    # 1. Generate Background (AI or Fallback)
    bg_b64 = _generate_scene_image(brand_data, content, width, height)
    if not bg_b64:
        bg_b64 = _generate_fallback_background(width, height, brand_data.get("colors", []))
        
    # 2. Fetch Logo
    logo_b64 = _fetch_logo_b64(brand_data.get("logo_url", ""))
    
    # 3. Construct Layers
    
    headline = content.get("headline", "Headline")
    body = content.get("body", "Body text goes here.")
    
    # Dynamic sizing based on canvas
    h_fontSize = int(width * 0.055)
    b_fontSize = int(width * 0.035)
    
    layers = []
    
    # Layer 1: Gradient Overlay (Subtle bottom fade instead of box)
    layers.append({
        "type": "rect",
        "left": 0,
        "top": 0,
        "width": width,
        "height": height,
        "fill": "transparent",
        "selectable": False,
        "evented": False,
        "name": "gradient-overlay"
    })
    
    # Layer 2: Headline Text (Big, Bold, Shadowed)
    layers.append({
        "type": "text",
        "text": headline.upper(), # Uppercase for impact
        "left": width / 2,
        # Move up slightly to be center-top
        "top": int(height * 0.45),
        "fontSize": int(width * 0.12),
        "fontFamily": "Inter", 
        "fontWeight": "900",
        "fill": "#ffffff",
        "textAlign": "center",
        "originX": "center",
        "originY": "center",
        "width": int(width * 0.9),
        "splitByGrapheme": False,
        "name": "headline",
        "shadow": {
            "color": "rgba(0,0,0,0.8)",
            "blur": 20,
            "offsetX": 0,
            "offsetY": 4
        }
    })
    
    # Layer 3: Body/Script Text
    layers.append({
        "type": "text",
        "text": body,
        "left": width / 2,
        "top": int(height * 0.60),
        "fontSize": int(width * 0.05),
        "fontFamily": "Inter", # Frontend will map to Script if user chooses
        "fontStyle": "italic",
        "fill": "#ffffff",
        "textAlign": "center",
        "originX": "center",
        "originY": "top",
        "width": int(width * 0.8),
        "name": "body",
        "shadow": {
            "color": "rgba(0,0,0,0.8)",
            "blur": 15,
            "offsetX": 0,
            "offsetY": 2
        }
    })
    
    # Layer 4: Logo (Bottom Right)
    if logo_b64:
        layers.append({
            "type": "image",
            "src": logo_b64,
            "left": int(width * 0.95),
            "top": int(height * 0.95),
            "scaleX": 0.15, 
            "scaleY": 0.15,
            "originX": "right",
            "originY": "bottom",
            "name": "logo"
        })
        
    return {
        "success": True,
        "background": bg_b64,
        "layers": layers,
        "canvas": {"width": width, "height": height}
    }
