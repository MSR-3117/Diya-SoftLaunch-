import uuid
from flask import Blueprint, render_template, request, jsonify, session
from app.brand_scraper import scrape_brand_from_url
from app.brand_fetcher import fetch_brand_assets
from app.content_generator import generate_weekly_content
import json
from datetime import datetime

# Server-side store for brand data to avoid cookie size limits
BRAND_DATA_STORE = {}

main_bp = Blueprint('main', __name__)
brand_bp = Blueprint('brand', __name__, url_prefix='/brand')
calendar_bp = Blueprint('calendar', __name__, url_prefix='/calendar')

@main_bp.route('/')
def index():
    """Home page with brand input"""
    return render_template('index.html')

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

        # Store in server-side memory instead of cookie
        brand_id = str(uuid.uuid4())
        BRAND_DATA_STORE[brand_id] = brand_data
        session['brand_id'] = brand_id
        
        # Clear old data if any (optional cleanup)
        if 'brand_data' in session:
            session.pop('brand_data')
        
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
    """Generate 7-day content calendar"""
    try:
        data = request.json
        # Client sends brand_data, but we prefer the server-side one if available
        # or use what client sent if checks pass
        
        brand_data = None
        
        # Try to get from server store
        brand_id = session.get('brand_id')
        if brand_id and brand_id in BRAND_DATA_STORE:
            brand_data = BRAND_DATA_STORE[brand_id]
        
        # Fallback to client provided data
        if not brand_data:
             brand_data = data.get('brand_data')
             
        tone = data.get('tone', 'professional')
        
        if not brand_data:
            return jsonify({'error': 'Brand data is required (session expired or invalid)'}), 400
        
        # Generate AI-powered content calendar
        calendar_content = generate_weekly_content(brand_data, tone)
        
        return jsonify({
            'success': True,
            'calendar': calendar_content
        })
    
    except Exception as e:
        print(f"Error in generate_calendar: {e}")
        return jsonify({'error': str(e)}), 500

@main_bp.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({'status': 'ok'})
