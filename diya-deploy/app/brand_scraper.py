from bs4 import BeautifulSoup
import requests
from urllib.parse import urljoin
from collections import Counter
import re
from app.content_generator import generate_brand_summary

def scrape_brand_from_url(url):
    """
    Scrape brand information from website
    Analyzes first 5 pages for comprehensive brand profile
    """
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        
        brand_data = {
            'name': '',
            'description': '',
            'tagline': '',
            'pages_analyzed': [],
            'colors': [],
            'fonts': [],
            'images': [],
            'headings': [],
            'content_summary': ''
        }
        
        # Fetch and analyze multiple pages
        pages_to_crawl = [url]
        visited_urls = set()
        pages_content = []
        
        # Helper to get normalized URL (no scheme, no www, no trailing slash, no fragments)
        def normalize_url(u):
            u = u.strip().lower()
            # Remove fragment and query
            u = u.split('#')[0].split('?')[0]
            # Remove scheme
            if '://' in u:
                u = u.split('://', 1)[1]
            # Remove www prefix
            if u.startswith('www.'):
                u = u[4:]
            # Remove trailing slash
            if u.endswith('/'):
                u = u[:-1]
            return u
            
        base_domain = url.split('//')[-1].split('/')[0].replace('www.', '')
        
        content_buffer = []
        
        # Crawl until we have analyzed 5 pages (limit reduced from 10)
        while pages_to_crawl and len(pages_content) < 5:
            current_url = pages_to_crawl.pop(0)
            normalized_current = normalize_url(current_url)
            
            # CRITICAL: Check duplicates before request
            if normalized_current in visited_urls:
                print(f"Skipping cached duplicate: {current_url}")
                continue
            
            try:
                print(f"Scraping page: {current_url}")
                # Add delay to avoid blocking
                response = requests.get(current_url, timeout=4, headers={
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                })
                
                # Mark as visited irrelevant of status to avoid retrying bad URLs
                visited_urls.add(normalized_current)
                
                # CRITICAL: Also mark the final URL (after redirects) as visited
                if response.url:
                    visited_urls.add(normalize_url(response.url))
                
                if response.status_code != 200 or 'text/html' not in response.headers.get('Content-Type', ''):
                    print(f"Skipping non-HTML or failed URL: {current_url} (Status: {response.status_code})")
                    continue
                
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # cleanup
                for tag in soup(["script", "style", "nav", "footer"]):
                    tag.decompose()
                
                # Extract main content more intelligently
                # Prioritize main content areas (main, article, section) over all text
                main_content = ""
                main_sections = soup.find_all(['main', 'article', 'section', 'div'], class_=re.compile(r'content|main|body|post', re.I))
                
                if main_sections:
                    # Extract from main content areas first
                    for section in main_sections[:3]:  # Limit to top 3 sections
                        section_text = section.get_text(separator=' ', strip=True)
                        if len(section_text) > 200:  # Only meaningful sections
                            main_content += section_text + "\n\n"
                
                # Fallback to full page text if no main sections found
                if not main_content or len(main_content) < 500:
                    page_text = soup.get_text(separator=' ', strip=True)
                    main_content = page_text
                
                # Extract key paragraphs (longer ones are usually more meaningful)
                paragraphs = [p.get_text(strip=True) for p in soup.find_all('p') if len(p.get_text(strip=True)) > 100]
                if paragraphs:
                    # Add top paragraphs to ensure we get key content
                    key_paragraphs = "\n\n".join(paragraphs[:10])  # Top 10 paragraphs
                    if key_paragraphs not in main_content:
                        main_content = key_paragraphs + "\n\n" + main_content
                
                # Increase per-page limit to 8000 chars to capture more content
                page_content = main_content[:8000] if len(main_content) > 8000 else main_content
                content_buffer.append(f"--- SOURCE: {current_url} ---\n{page_content}")
                
                print(f"Extracted {len(page_content)} characters from {current_url}")
                
                # Extract basic data for frontend display
                page_data = {
                    'url': current_url,
                    'title': soup.title.string.strip() if soup.title else 'No Title',
                    'html_content': response.text, # Keep for color/font extraction
                    'paragraphs': [p.get_text(strip=True) for p in soup.find_all('p') if len(p.get_text(strip=True)) > 50][:5]
                }
                
                pages_content.append(page_data)
                brand_data['pages_analyzed'].append(current_url)
                
                # Only look for further pages if we are on the homepage (the start)
                # This ensures we only crawl the "Main" pages linked from home, not deep links
                if len(pages_content) == 1:
                    candidates = []
                    
                    # 1. Identify "Nav" links for scoring
                    nav_links = []
                    nav_areas = soup.find_all(['nav', 'header'])
                    for area in nav_areas:
                        for link in area.find_all('a', href=True):
                             nav_links.append(link['href'])

                    for link in soup.find_all('a', href=True):
                        href = link['href']
                        full_url = urljoin(current_url, href)
                        norm_link = normalize_url(full_url)
                        
                        # Domain check
                        link_domain = full_url.split('//')[-1].split('/')[0].replace('www.', '')
                        
                        if link_domain == base_domain:
                            if norm_link not in visited_urls and full_url != current_url:
                                
                                # Scoring System
                                score = 0
                                lower_url = full_url.lower()
                                
                                # Priority 1: Is in Navbar/Header?
                                is_in_nav = any(href in nl for nl in nav_links)
                                if is_in_nav:
                                    score += 20
                                
                                # Priority 2: Keyword match
                                if any(x in lower_url for x in ['about', 'contact', 'services', 'portfolio', 'work', 'blog', 'pricing', 'team']):
                                    score += 15
                                
                                # Priority 3: Short URL Depth (Prefer top-level pages like /about)
                                # Count slashes. 'http://site.com/about' = 3 parts. 'http://site.com/prod/sub/page' = 5 parts
                                depth = len(full_url.rstrip('/').split('/')) 
                                score -= (depth * 2) # Penalize depth
                                
                                candidates.append({
                                    'url': full_url,
                                    'score': score
                                })

                    # Sort by score desc
                    candidates.sort(key=lambda x: x['score'], reverse=True)
                    
                    # Take top 4 unique, valid links to reach total 5 pages
                    seen_candidates = set()
                    for c in candidates:
                         u = c['url']
                         norm = normalize_url(u)
                         if norm not in seen_candidates and norm not in visited_urls:
                             pages_to_crawl.append(u)
                             seen_candidates.add(norm)
                             if len(pages_to_crawl) >= 4:
                                 break
                    
                    print(f"Selected top pages to crawl: {pages_to_crawl}")
            except Exception as e:
                print(f"Failed to crawl {current_url}: {e}")
                continue
                
        # Fill brand_data fields if not set from homepage
        if pages_content:
            first_page = pages_content[0]
            if not brand_data['name']:
                brand_data['name'] = first_page['title'].split('|')[0].strip()
        
        # Aggregate content for the summary generator
        brand_data['content_summary_source'] = "\n\n".join(content_buffer)
        
        # Log summary of what was scraped
        total_chars = len(brand_data['content_summary_source'])
        print(f"\n=== SCRAPING SUMMARY ===")
        print(f"Total pages scraped: {len(pages_content)}")
        print(f"Total content extracted: {total_chars} characters")
        for i, page in enumerate(pages_content, 1):
            matching_buffers = [b for b in content_buffer if page['url'] in b]
            page_chars = len(matching_buffers[0]) if matching_buffers else 0
            print(f"  Page {i}: {page['url']} - {page_chars} chars - Title: {page.get('title', 'N/A')[:50]}")
        print(f"========================\n")
        
        # Extract assets (colors/fonts) from all gathered HTML
        brand_data['colors'] = extract_colors_from_pages(pages_content)
        brand_data['fonts'] = extract_fonts_from_pages(pages_content)
        
        # Generate the massive summary using the aggregated text
        full_text = brand_data['content_summary_source']
        if len(full_text) < 500: # fallback if crawl failed to get text
             full_text = " ".join([p for page in pages_content for p in page['paragraphs']])
             
        brand_data['content_summary'] = generate_brand_summary(full_text, fallback_text=brand_data.get('description'))
        
        # New: Extract Images
        # We separate "Content Images" (for posts) from "Logos" (branding)
        content_images = []
        possible_logos = []
        
        # Common junk keywords in filenames or classes
        junk_image_keywords = ['facebook', 'twitter', 'linkedin', 'instagram', 'pixel', 'analytics', 
                               'icon', 'button', 'user', 'cart', 'search', 'arrow', 'flag', 'placeholder', 
                               'avatar', 'download', 'spinner', 'loading',
                               # "Marquee" junk - client logos, awards, etc.
                               'client', 'partner', 'sponsor', 'award', 'badge', 'testimonial', 'review']
        
        for page in pages_content:
             try:
                 soup = BeautifulSoup(page.get('html_content', ''), 'html.parser')
                 # Find all img tags (not just those with src)
                 for img in soup.find_all('img'):
                     # Handle lazy loading: check data-src, data-lazy-src, data-original, then src
                     src = (img.get('data-src') or 
                           img.get('data-lazy-src') or 
                           img.get('data-original') or 
                           img.get('src') or 
                           img.get('data-srcset') or
                           '')
                     
                     # Handle srcset (take first URL if present)
                     if not src and img.get('srcset'):
                         srcset = img.get('srcset')
                         # Extract first URL from srcset (format: "url size, url2 size2")
                         if srcset:
                             src = srcset.split(',')[0].strip().split()[0]
                     
                     if not src or src.startswith('data:'):
                         continue
                         
                     full_src = urljoin(page['url'], src)
                     lower_src = full_src.lower()
                     
                     # Get alt text and surrounding context for better relevance scoring
                     alt_text = img.get('alt', '').lower()
                     img_class = ' '.join(img.get('class', [])).lower()
                     
                     # 1. Logo Detection (Keep this separate)
                     # We want logos for the profile header
                     if any(x in lower_src for x in ['logo', 'brand-mark']) or 'logo' in alt_text:
                         if full_src not in possible_logos:
                             possible_logos.append(full_src)
                         # Don't add obvious logos to "Content Images" unless we are desperate
                         continue

                     # 2. Filter Junk for Content Images
                     # Check dimensions if available
                     width = img.get('width')
                     height = img.get('height')
                     if width and width.isdigit() and int(width) < 100: continue
                     if height and height.isdigit() and int(height) < 100: continue

                     # Enhanced keyword filtering (check alt text and class too)
                     combined_text = f"{lower_src} {alt_text} {img_class}"
                     if any(x in combined_text for x in junk_image_keywords):
                         continue
                     
                     # 3. Score/Prioritize Content Images
                     # We prefer JPG/WEBP (photos) over PNG/SVG (graphics) for content
                     score = 0
                     if any(ext in lower_src for ext in ['.jpg', '.jpeg', '.webp']):
                         score += 10
                     if any(keyword in lower_src for keyword in ['hero', 'banner', 'main', 'feature', 'cover', 'background']):
                         score += 20
                     # Boost score if alt text suggests relevance
                     if alt_text and len(alt_text) > 10:
                         score += 5
                     # Boost for larger images (likely more important)
                     if width and width.isdigit() and int(width) > 400:
                         score += 5
                     if height and height.isdigit() and int(height) > 400:
                         score += 5
                     
                     if full_src not in [c['url'] for c in content_images]:
                         content_images.append({'url': full_src, 'score': score, 'alt': alt_text})
                 
                 # Also extract background images from CSS (common in modern sites)
                 # Look for elements with inline style background-image
                 for elem in soup.find_all(style=True):
                     style = elem.get('style', '')
                     # Match url(...) patterns in background-image
                     bg_matches = re.findall(r'background-image:\s*url\(["\']?([^"\'()]+)["\']?\)', style, re.IGNORECASE)
                     for bg_url in bg_matches:
                         if bg_url.startswith('data:'):
                             continue
                         full_bg_src = urljoin(page['url'], bg_url)
                         lower_bg_src = full_bg_src.lower()
                         
                         # Skip logos and junk
                         if any(x in lower_bg_src for x in ['logo', 'brand-mark']):
                             continue
                         if any(x in lower_bg_src for x in junk_image_keywords):
                             continue
                         
                         # Score background images (slightly lower priority than img tags)
                         bg_score = 5  # Base score for background images
                         if any(ext in lower_bg_src for ext in ['.jpg', '.jpeg', '.webp']):
                             bg_score += 10
                         if any(keyword in lower_bg_src for keyword in ['hero', 'banner', 'main', 'feature', 'cover']):
                             bg_score += 15
                         
                         if full_bg_src not in [c['url'] for c in content_images]:
                             content_images.append({'url': full_bg_src, 'score': bg_score, 'alt': ''})
                         
             except Exception:
                 continue
        
        # Sort content images by score (higher scores first)
        content_images.sort(key=lambda x: x['score'], reverse=True)
        
        # Retrieve all images (no limit) - sorted by relevance score
        brand_data['images'] = [c['url'] for c in content_images]
        
        # Use found logo if available and we don't have one
        if not brand_data.get('logo_url') and possible_logos:
            brand_data['logo_url'] = possible_logos[0]

        # NEW: Ensure tagline and description are filled if missing
        if not brand_data.get('tagline') or not brand_data.get('description') or len(brand_data.get('description', '')) < 50:
            from app.content_generator import generate_brand_metadata
            metadata = generate_brand_metadata(full_text)
            if not brand_data.get('tagline'):
                brand_data['tagline'] = metadata.get('tagline', '')
            if not brand_data.get('description') or len(brand_data.get('description')) < 50:
                brand_data['description'] = metadata.get('description', '')

        return brand_data
    
    except Exception as e:
        raise Exception(f"Failed to scrape brand from URL: {str(e)}")

def extract_colors_from_pages(pages_content):
    """Extract dominant colors from page content and linked CSS"""
    all_content = []
    
    # 1. Add HTML content
    for page in pages_content:
        all_content.append(page.get('html_content', ''))
        
        # 2. Find and fetch CSS files
        try:
            soup = BeautifulSoup(page.get('html_content', ''), 'html.parser')
            for link in soup.find_all('link', rel='stylesheet'):
                css_url = link.get('href')
                if css_url:
                    full_css_url = urljoin(page['url'], css_url)
                    try:
                        # Fetch CSS with a timeout
                        css_response = requests.get(full_css_url, timeout=2)
                        if css_response.status_code == 200:
                            all_content.append(css_response.text)
                    except:
                        continue
        except Exception:
            continue
            
    # Combine all content
    full_text = " ".join(all_content)
    
    # Hex color pattern - expanded to capture 3-digit hex too
    hex_pattern = r'#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b'
    matches = re.findall(hex_pattern, full_text)
    
    # Normalize to uppercase and 6-digit
    normalized_colors = []
    for c in matches:
        c = c.upper()
        if len(c) == 3:
            c = "".join([x*2 for x in c])
        normalized_colors.append(f"#{c}")
    
    # Filter common "boring" colors if we have enough variety
    boring_colors = {'#FFFFFF', '#000000', '#F2F2F2', '#CCCCCC', '#333333'}
    
    color_counts = Counter(normalized_colors)
    
    # Remove boring colors only if we have other options
    filtered_counts = {k: v for k, v in color_counts.items() if k not in boring_colors}
    
    if len(filtered_counts) >= 3:
        top_colors = Counter(filtered_counts).most_common(5)
    else:
        top_colors = color_counts.most_common(5)
    
    results = []
    for color, count in top_colors:
        results.append((color, "Custom Color"))
        
    if not results:
        return [('#000000', 'Black'), ('#FFFFFF', 'White')]
        
    return results

def extract_fonts_from_pages(pages_content):
    """Extract font families from pages and CSS"""
    # Note: We re-fetch CSS here or rely on the fact that we should have stored it? 
    # For efficiency we might want to do it once, but for now copying logic is safer than refactoring the whole flow.
    # In a real app, we'd cache the CSS.
    
    all_content = []
    for page in pages_content:
        all_content.append(page.get('html_content', ''))
        
        # Basic CSS fetch (light version of above)
        try:
            soup = BeautifulSoup(page.get('html_content', ''), 'html.parser')
            for link in soup.find_all('link', rel='stylesheet'):
                css_url = link.get('href')
                if css_url:
                    full_css_url = urljoin(page['url'], css_url)
                    try:
                        css_response = requests.get(full_css_url, timeout=1)
                        if css_response.status_code == 200:
                            all_content.append(css_response.text)
                    except:
                        pass
        except:
            pass
            
    full_text = " ".join(all_content)
    
    # Font family pattern - improved to capture multi-word fonts
    font_pattern = r'font-family:\s*([^;}]+)'
    matches = re.findall(font_pattern, full_text)
    
    cleaned_fonts = []
    for font_str in matches:
        # Split by comma to get the primary font
        fonts = [f.strip().strip('"\'') for f in font_str.split(',')]
        for f in fonts:
            # Filter generic keywords and invalid junk
            if f.lower() not in ['sans-serif', 'serif', 'monospace', 'inherit', 'initial'] and len(f) > 2:
                cleaned_fonts.append(f)
                break # Just take the first valid one from the stack
            
    font_counts = Counter(cleaned_fonts)
    top_fonts = [f[0] for f in font_counts.most_common(3)]
    
    if not top_fonts:
        return ['Inter', 'System UI', 'Sans-serif']
        
    return top_fonts
