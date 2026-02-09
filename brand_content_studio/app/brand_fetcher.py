import requests
import json
from typing import Dict, Any

def fetch_brand_assets(brand_name: str) -> Dict[str, Any]:
    """
    Fetch brand assets from BrandFetch API
    Includes logo, colors, fonts, and other brand guidelines
    
    Note: Requires BRANDFETCH_API_KEY environment variable
    """
    try:
        # BrandFetch API endpoint (requires API key)
        # You can get a free API key from brandfetch.com
        
        # For demonstration, returning sample brand assets structure
        brand_assets = {
            'logo': {
                'url': '',
                'formats': []
            },
            'colors': {
                'primary': '#10B981',
                'secondary': '#34D399',
                'tertiary': '#6EE7B7',
                'background': '#FFFFFF',
                'text': '#1F2937'
            },
            'fonts': {
                'primary': 'Inter',
                'secondary': 'Segoe UI',
                'heading': 'Inter'
            },
            'brand_guidelines': {
                'tagline': '',
                'mission': '',
                'values': [],
                'industry': ''
            }
        }
        
        # Attempt to fetch from BrandFetch API if key is available
        try:
            api_key = os.getenv('BRANDFETCH_API_KEY')
            if api_key:
                headers = {'Authorization': f'Bearer {api_key}'}
                response = requests.get(
                    f'https://api.brandfetch.io/v2/brands/{brand_name}',
                    headers=headers,
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    
                    # Parse BrandFetch response
                    if 'logo' in data:
                        brand_assets['logo']['url'] = data['logo'].get('url', '')
                    
                    if 'colors' in data:
                        colors_list = data['colors']
                        if colors_list:
                            brand_assets['colors']['primary'] = colors_list[0]
                            if len(colors_list) > 1:
                                brand_assets['colors']['secondary'] = colors_list[1]
                    
                    if 'fonts' in data:
                        fonts_list = data['fonts']
                        if fonts_list:
                            brand_assets['fonts']['primary'] = fonts_list[0].get('name', 'Inter')
        
        except Exception as e:
            print(f"BrandFetch API error: {str(e)}")
        
        return brand_assets
    
    except Exception as e:
        raise Exception(f"Failed to fetch brand assets: {str(e)}")

import os
