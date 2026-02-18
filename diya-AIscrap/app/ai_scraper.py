"""
AI Brand Scraper - Adapter Module

Wraps Simbli's async AssetExtractor (Playwright + Gemini) to provide
a sync `scrape_brand_from_url()` function matching DIYA's expected format.
"""
import asyncio


def scrape_brand_from_url(url: str) -> dict:
    """
    Scrape brand data from a URL using Playwright + Gemini AI.
    
    Returns dict matching DIYA's expected format:
    {
        'name': str,
        'description': str,
        'tagline': str,
        'colors': list of (hex, label) tuples,
        'fonts': list of str,
        'content_summary': str,
        'images': list,
        'logo_url': str,
        'strategy': dict (brand archetype, content pillars, etc.)
    }
    """
    from app.services.asset_extractor import AssetExtractor

    extractor = AssetExtractor()

    # Run the async extractor in a sync context (Flask)
    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        brand_assets = loop.run_until_complete(extractor.extract_assets(url))
        loop.close()
    except Exception as e:
        print(f"AI Scraper Error: {e}")
        # Return minimal data so the frontend doesn't break
        return _fallback_scrape(url, str(e))

    # Convert BrandAssets (Pydantic) → DIYA dict format
    return _convert_to_diya_format(brand_assets, url)


def _convert_to_diya_format(assets, url: str) -> dict:
    """Convert Simbli BrandAssets to DIYA's expected dict format."""

    # Colors: DIYA expects list of (hex, label) tuples
    colors = []
    if assets.colors:
        if assets.colors.primary:
            colors.append((assets.colors.primary, 'Primary'))
        if assets.colors.secondary:
            colors.append((assets.colors.secondary, 'Secondary'))
        if assets.colors.accent:
            colors.append((assets.colors.accent, 'Accent'))
        if assets.colors.background:
            colors.append((assets.colors.background, 'Background'))
        if assets.colors.text:
            colors.append((assets.colors.text, 'Text'))
        # Add any extra detected colors
        for c in (assets.colors.all_colors or []):
            if c not in [x[0] for x in colors]:
                colors.append((c, 'Detected'))

    # Fonts: DIYA expects list of strings
    fonts = []
    for f in (assets.fonts or []):
        if f.family and f.family not in fonts:
            fonts.append(f.family)

    # Logo URL
    logo_url = ''
    if assets.logo:
        logo_url = assets.logo.url or ''

    # Strategy data (new — richer than old scraper)
    strategy = {}
    if assets.strategy:
        strategy = {
            'brand_archetype': assets.strategy.brand_archetype,
            'brand_voice': assets.strategy.brand_voice,
            'content_pillars': assets.strategy.content_pillars,
            'visual_style_guide': assets.strategy.visual_style_guide,
            'recommended_post_types': assets.strategy.recommended_post_types,
            'campaign_ideas': assets.strategy.campaign_ideas,
            'target_audience': assets.strategy.target_audience,
            'key_strengths': assets.strategy.key_strengths,
            'design_style': assets.strategy.design_style,
        }

    # Content summary: combine company summary + strategy insights
    content_summary = assets.company_summary or ''
    if strategy.get('brand_voice'):
        content_summary += f"\n\nBrand Voice: {strategy['brand_voice']}"
    if strategy.get('target_audience'):
        content_summary += f"\nTarget Audience: {strategy['target_audience']}"

    # Description from meta or summary
    description = assets.meta_description or assets.company_summary or ''

    # Tagline: infer from strategy or brand vibe
    tagline = ''
    if assets.brand_vibe:
        tagline = ' · '.join(assets.brand_vibe[:4])

    return {
        'name': assets.company_name or '',
        'description': description,
        'tagline': tagline,
        'colors': colors,
        'fonts': fonts,
        'content_summary': content_summary,
        'images': [],
        'logo_url': logo_url,
        'strategy': strategy,
        'brand_vibe': assets.brand_vibe or [],
        'pages_analyzed': [str(assets.website_url)],
    }


def _fallback_scrape(url: str, error: str) -> dict:
    """Minimal fallback if AI scraping fails entirely."""
    from urllib.parse import urlparse
    parsed = urlparse(url if url.startswith('http') else f'https://{url}')
    domain = parsed.netloc or parsed.path.split('/')[0]
    name = domain.replace('www.', '').split('.')[0].title()

    return {
        'name': name,
        'description': f'Brand analysis for {domain}',
        'tagline': '',
        'colors': [('#000000', 'Default'), ('#FFFFFF', 'Default')],
        'fonts': ['Inter'],
        'content_summary': f'Unable to complete full AI analysis: {error}',
        'images': [],
        'logo_url': '',
        'strategy': {},
        'brand_vibe': [],
        'pages_analyzed': [],
    }
