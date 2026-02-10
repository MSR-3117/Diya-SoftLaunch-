import uuid
from flask import Blueprint, render_template, request, jsonify, session
from app.brand_scraper import scrape_brand_from_url
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
            
            # Fetch additional assets from BrandFetch
            # Safely extract brand name from URL (handle missing protocol)
            try:
                from urllib.parse import urlparse
                parsed = urlparse(url if url.startswith('http') else f'https://{url}')
                domain = parsed.netloc or parsed.path.split('/')[0]
                brand_name = brand_data.get('name') or domain.replace('www.', '').split('.')[0]
            except:
                brand_name = brand_data.get('name', 'brand')
            brand_assets = fetch_brand_assets(brand_name)
            
            # Smart merge: prioritize scraped data for colors/fonts, but allow BrandFetch logo
            if brand_assets.get('logo', {}).get('url'):
                 brand_data['logo_url'] = brand_assets['logo']['url']
                 
            # Only use BrandFetch colors/fonts if we failed to scrape any
            # And ensure we format it correctly as a list if we do use it
            if not brand_data.get('colors') and brand_assets.get('colors'):
                # Convert dict to list
                colors_dict = brand_assets['colors']
                brand_data['colors'] = list(colors_dict.values())
            
            if not brand_data.get('fonts') and brand_assets.get('fonts'):
                fonts_dict = brand_assets['fonts']
                brand_data['fonts'] = list(fonts_dict.values())
            
        elif source == 'manual':
            brand_data = {
                'name': data.get('brandName', ''),
                'description': data.get('brandDescription', ''),
                'industry': data.get('industry', ''),
                'tagline': data.get('tagline', ''),
                'colors': data.get('colors', []),
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

@main_bp.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})
