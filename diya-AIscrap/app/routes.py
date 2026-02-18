import uuid
from flask import Blueprint, render_template, request, jsonify, session
from app.ai_scraper import scrape_brand_from_url
from app.brand_fetcher import fetch_brand_assets
# from app.content_generator import generate_weekly_content # Not used in this file
import json
from datetime import datetime

main_bp = Blueprint('main', __name__)
brand_bp = Blueprint('brand', __name__, url_prefix='/brand')
calendar_bp = Blueprint('calendar', __name__, url_prefix='/calendar')

@brand_bp.route('/analyze', methods=['POST'])
def analyze_brand():
    """Analyze brand from URL or manual input"""
    try:
        data = request.json
        source = data.get('source')  # 'url' or 'manual'
        
        brand_data = {}
        
        if source == 'url':
            url = data.get('url')
            if not url:
                return jsonify({'error': 'URL is required'}), 400
            
            # Scrape brand information from website
            brand_data = scrape_brand_from_url(url)
            
            # Smart merge: prioritize scraped data for colors/fonts
            brand_name = brand_data.get('name')
            if not brand_name or brand_name.lower() == 'unknown':
                try:
                    from urllib.parse import urlparse
                    parsed = urlparse(url if url.startswith('http') else f'https://{url}')
                    domain = parsed.netloc or parsed.path.split('/')[0]
                    brand_name = domain.replace('www.', '').split('.')[0].title()
                except:
                    brand_name = 'Your Brand'
            
            brand_data['name'] = brand_name
            brand_assets = fetch_brand_assets(brand_name)
            
            # Smart merge: prioritize scraped data for colors/fonts, but allow BrandFetch logo
            if brand_assets.get('logo', {}).get('url'):
                 brand_data['logo_url'] = brand_assets['logo']['url']
                 
            # MERGE COLORS: Convert BrandFetch colors (dict) to [hex, label] format
            bf_colors = []
            if brand_assets.get('colors'):
                for label, hex_val in brand_assets['colors'].items():
                    if hex_val:
                        bf_colors.append((hex_val, label.title()))
            
            # Combine: Scraped first, then unique BrandFetch colors
            scraped_colors = brand_data.get('colors') or []
            scraped_hexes = [c[0].lower() for c in scraped_colors if isinstance(c, (list, tuple)) and len(c) > 0]
            
            for bf_c in bf_colors:
                if bf_c[0].lower() not in scraped_hexes:
                    scraped_colors.append(bf_c)
            brand_data['colors'] = scraped_colors

            # MERGE FONTS
            scraped_fonts = brand_data.get('fonts') or []
            bf_fonts = list(brand_assets.get('fonts', {}).values())
            for f in bf_fonts:
                if f and f not in scraped_fonts:
                    scraped_fonts.append(f)
            brand_data['fonts'] = scraped_fonts

            # MERGE EXTRA METADATA
            if not brand_data.get('tagline') and brand_assets.get('brand_guidelines', {}).get('tagline'):
                brand_data['tagline'] = brand_assets['brand_guidelines']['tagline']
            
            if brand_assets.get('brand_guidelines'):
                brand_data['industry'] = brand_assets['brand_guidelines'].get('industry', brand_data.get('industry', ''))
                brand_data['mission'] = brand_assets['brand_guidelines'].get('mission', '')
                brand_data['values'] = brand_assets['brand_guidelines'].get('values', [])

        elif source == 'manual':
            brand_data = {
                'name': data.get('brandName', ''),
                'description': data.get('brandDescription', ''),
                'industry': data.get('industry', ''),
                'tagline': data.get('tagline', ''),
                'colors': data.get('colors', []), # Expected [hex, label] from manual UI too
                'fonts': data.get('fonts', []),
                'logo_url': data.get('logoUrl', '')
            }
        
        # Initialize content summary fallback
        if not brand_data.get('content_summary'):
             brand_data['content_summary'] = brand_data.get('description', '')

        # STATELESS: Return all data to client. No server-side storage.
        
        return jsonify({
            'success': True,
            'brand_data': brand_data
        })
    
    except Exception as e:
        import traceback
        print(f"Error in analyze_brand: {e}")
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/generate', methods=['POST'])
def generate_calendar():
    """Generate content calendar based on platforms and frequency"""
    try:
        data = request.json
        
        # Get platforms and frequency from request
        platforms = data.get('platforms', ['instagram'])
        frequency = data.get('frequency', '3/week')  # e.g., "3/week" or "12/month"
        
        # Parse frequency
        parts = frequency.split('/')
        num_posts = int(parts[0]) if len(parts) >= 1 else 3
        period = parts[1] if len(parts) >= 2 else 'week'
        
        # If monthly, convert to weekly amount
        if period == 'month':
            num_posts = max(1, num_posts // 4)
        
        # Get brand data DIRECTLY from request (Stateless)
        brand_data = data.get('brand_data')
             
        tone = data.get('tone', 'professional')
        
        if not brand_data:
            return jsonify({'error': 'Brand data is required in the request body'}), 400
        
        # Import the content generator
        from app.content_generator import generate_posts_for_calendar
        
        # Generate posts using Gemini (or fallback)
        posts = generate_posts_for_calendar(
            brand_data=brand_data,
            platforms=platforms,
            num_posts=num_posts,
            tone=tone
        )
        
        return jsonify({
            'success': True,
            'posts': posts,
            'calendar': posts  # backward compatibility
        })
    
    except Exception as e:
        print(f"Error in generate_calendar: {e}")
        return jsonify({'error': str(e)}), 500

@calendar_bp.route('/generate-image', methods=['POST'])
def generate_post_visual():
    """Generates a layered image for a specific post."""
    try:
        data = request.json
        brand_data = data.get('brand_data')
        content = data.get('content') # { headline, body, ... }
        platform = data.get('platform', 'instagram')
        
        if not brand_data:
             return jsonify({'error': 'Brand data required'}), 400
             
        from app.services.image_generator import generate_layered_image
        
        result = generate_layered_image(brand_data, content, platform)
        
        return jsonify(result)
        
    except Exception as e:
        print(f"Error in generate_post_visual: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@main_bp.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})
