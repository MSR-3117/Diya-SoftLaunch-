import openai
from datetime import datetime, timedelta
from typing import Dict, List, Any
import json
import os
import random
from app.services.gemini_service import GeminiService

# TODO: Add your Gemini API key here
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY', '')

# POLLINATION REMOVED - Using Gemini/Imagen only





def clean_brand_name(raw_name: str) -> str:
    """
    Extract a clean brand name from a long title string.
    Example: "AI Solutions | DCI" -> "DCI"
    """
    if not raw_name:
        return "Brand"
        
    # Common separators
    separators = ['|', ' - ', ' – ', ':', '•']
    
    # Check if any separator exists
    for sep in separators:
        if sep in raw_name:
            parts = [p.strip() for p in raw_name.split(sep)]
            # Usually the brand name is the shortest part, or the last part
            # Filter out generic terms
            valid_parts = [p for p in parts if len(p) > 1 and 'home' not in p.lower()]
            if valid_parts:
                # Return the shortest valid part (most likely the brand name)
                return min(valid_parts, key=len)
    
    # If no separators, or just one long string
    if len(raw_name) > 30:
        # Try to take the first few words? Or just start
        return raw_name[:30] + "..."
        
    return raw_name


def generate_posts_for_calendar(
    brand_data: Dict[str, Any],
    platforms: List[str],
    num_posts: int = 3,
    tone: str = 'professional'
) -> List[Dict[str, Any]]:
    """
    Generate calendar posts using Gemini AI (with fallbacks).
    
    Args:
        brand_data: Brand information from scraping
        platforms: List of platform IDs (instagram, linkedin, x, facebook)
        num_posts: Number of posts to generate per week
        tone: Content tone (professional, casual, inspirational, educational, playful)
    
    Returns:
        List of post objects with id, title, caption, image_url, platform, scheduled_date, color
    """
    try:
        posts = []
        raw_name = brand_data.get('name', 'Brand')
        brand_name = clean_brand_name(raw_name)
        brand_summary = brand_data.get('content_summary', brand_data.get('description', ''))
        available_images = brand_data.get('images', [])
        
        # Generate scheduled dates (spread across the week)
        today = datetime.now()
        schedule_days = distribute_posts_across_week(num_posts)
        
        # Color palette for visual variety
        colors = ['pink', 'green', 'yellow', 'purple', 'blue']
        
        # Generate content using Gemini (or fallback)
        if GEMINI_API_KEY:
            # TODO: Implement actual Gemini API call
            # posts = generate_with_gemini(brand_data, platforms, num_posts, tone)
            pass
        
        # Try to use OpenAI for high-quality text generation if available
        OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
        
        # Fallback: Generate mock content for now (API to be added)
        for i in range(num_posts):
            platform = platforms[i % len(platforms)] if platforms else 'instagram'
            
            # Schedule at a reasonable posting time (9am-12pm)
            post_hour = 9 + (i % 4)  # 9am, 10am, 11am, 12pm
            schedule_date = (today + timedelta(days=schedule_days[i])).replace(
                hour=post_hour, 
                minute=0, 
                second=0, 
                microsecond=0
            )
            
            # Generate content based on brand
            post_content = None
            
            # 1. Try OpenAI first
            if OPENAI_API_KEY:
                try:
                    post_content = generate_text_with_openai(
                        brand_name=brand_name,
                        brand_summary=brand_summary,
                        platform=platform,
                        tone=tone
                    )
                except Exception as e:
                    print(f"OpenAI generation failed: {e}")
            
            # 2. Key available but failed, or no key -> Use fallback
            if not post_content:
                post_content = generate_fallback_post_content(
                    brand_name=brand_name,
                    brand_summary=brand_summary,
                    platform=platform,
                    tone=tone,
                    post_number=i + 1
                )
            
            # Generate a unique image per post using Gemini/Imagen
            image_url = generate_post_image(
                description=post_content['title'],
                brand_name=brand_name,
                platform=platform,
                post_index=i
            )
            
            posts.append({
                'id': i + 1,
                'title': post_content['title'],
                'caption': post_content['caption'],
                'image_url': image_url,
                'platform': platform,
                'scheduled_date': schedule_date.isoformat(),
                'color': colors[i % len(colors)]
            })
        
        return posts
        
    except Exception as e:
        print(f"Error generating posts: {e}")
        return generate_minimal_fallback_posts(brand_data, platforms, num_posts)


def distribute_posts_across_week(num_posts: int) -> List[int]:
    """Distribute posts evenly across the week (days 0-6)."""
    if num_posts <= 0:
        return []
    if num_posts >= 7:
        return list(range(7))
    
    # Spread posts evenly, favoring weekdays
    weekday_preference = [1, 2, 3, 4, 5, 0, 6]  # Mon-Fri, then Sun, Sat
    return weekday_preference[:num_posts]


def generate_fallback_post_content(
    brand_name: str,
    brand_summary: str,
    platform: str,
    tone: str,
    post_number: int
) -> Dict[str, str]:
    """Generate fallback content when AI is unavailable."""
    
    # Platform-specific formats
    platform_formats = {
        'instagram': {
            'titles': ['Behind the Scenes', 'Product Spotlight', 'Customer Story', 'Team Feature', 'Tips & Tricks'],
            'hashtags': True,
            'max_length': 2200
        },
        'linkedin': {
            'titles': ['Industry Insights', 'Team Achievement', 'Thought Leadership', 'Company Update', 'Career Opportunities'],
            'hashtags': False,
            'max_length': 3000
        },
        'x': {
            'titles': ['Quick Tip', 'Daily Inspiration', 'Hot Take', 'Question for You', 'Breaking News'],
            'hashtags': True,
            'max_length': 280
        },
        'facebook': {
            'titles': ['Community Update', 'Event Announcement', 'Fan Feature', 'Weekly Roundup', 'Success Story'],
            'hashtags': False,
            'max_length': 5000
        }
    }
    
    format_info = platform_formats.get(platform, platform_formats['instagram'])
    titles = format_info['titles']
    
    title = titles[(post_number - 1) % len(titles)]
    
    # Generate caption based on tone
    tone_intros = {
        'professional': f"At {brand_name}, we believe in",
        'casual': f"Hey friends! {brand_name} here with",
        'inspirational': f"Dream big with {brand_name}.",
        'educational': f"Did you know? {brand_name} brings you",
        'playful': f"Guess what? {brand_name} has something fun!"
    }
    
    intro = tone_intros.get(tone, tone_intros['professional'])
    
    caption = f"{intro} excellence and innovation every day. {title.lower()} - this is what drives us forward. Stay tuned for more updates!"
    
    if format_info['hashtags']:
        caption += f"\n\n#{brand_name.replace(' ', '')} #ContentCreation #SocialMedia"
    
    return {
        'title': title,
        'caption': caption
    }


def generate_minimal_fallback_posts(
    brand_data: Dict[str, Any],
    platforms: List[str],
    num_posts: int
) -> List[Dict[str, Any]]:
    """Absolute minimal fallback when everything fails."""
    brand_name = brand_data.get('name', 'Your Brand')
    posts = []
    today = datetime.now()
    colors = ['pink', 'green', 'yellow', 'purple', 'blue']
    
    for i in range(num_posts):
        platform = platforms[i % len(platforms)] if platforms else 'instagram'
        posts.append({
            'id': i + 1,
            'title': f'Post {i + 1}',
            'caption': f'Exciting content from {brand_name}! Stay tuned for more updates.',
            'image_url': None,
            'platform': platform,
            'scheduled_date': (today + timedelta(days=i)).isoformat(),
            'color': colors[i % len(colors)]
        })
    
    return posts


# ===============================================
# PLACEHOLDER: Gemini API Integration
# ===============================================
# TODO: Add Gemini API key to .env and implement this function
def generate_with_gemini(
    brand_data: Dict[str, Any],
    platforms: List[str],
    num_posts: int,
    tone: str
) -> List[Dict[str, Any]]:
    """
    Generate posts using Google Gemini API.
    
    To implement:
    1. Add GEMINI_API_KEY to your .env file
    2. Install google-generativeai: pip install google-generativeai
    3. Uncomment and implement this function
    """
    # import google.generativeai as genai
    # genai.configure(api_key=GEMINI_API_KEY)
    # model = genai.GenerativeModel('gemini-pro')
    # 
    # prompt = f'''Generate {num_posts} social media posts for {brand_data.get('name')}.
    # Platforms: {platforms}
    # Tone: {tone}
    # Brand info: {brand_data.get('content_summary', '')}
    # 
    # Return as JSON array with: title, caption, platform, scheduled_date'''
    # 
    # response = model.generate_content(prompt)
    # return json.loads(response.text)
    pass


# ===============================================
# Image Generation (Imagen Only)
# ===============================================
def generate_post_image(description: str, brand_name: str, platform: str = 'instagram', post_index: int = 0) -> str:
    """
    Generate a UNIQUE image for each post using Google's Imagen (via GeminiService).
    """
    try:
        svc = GeminiService()
        # Fallback to default if no specific image model found (GeminiService handles this)
        
        # Construct a good prompt for Imagen
        # Add visual interest based on post type/platform
        visual_styles = [
            "photorealistic, cinematic lighting",
            "minimalist, clean composition",
            "vibrant, high contrast",
            "soft focus, lifestyle photography"
        ]
        style = visual_styles[post_index % len(visual_styles)]
        
        prompt = (
            f"Professional social media photo for {brand_name}. "
            f"Subject: {description}. "
            f"Style: {style}, high quality, 4k. "
            f"No text overlay, no logos."
        )
        
        image_url = svc.generate_image(prompt)
        
        if image_url:
            print(f"    🖼️ Generated image {post_index + 1} (Imagen)")
            return image_url
        else:
            print(f"    ⚠️ Imagen generation returned None for post {post_index + 1}")
            return ""
            
    except Exception as e:
        print(f"Imagen generation failed: {e}")
        return ""



# ===============================================
# OpenAI Text Generation
# ===============================================
def generate_text_with_openai(
    brand_name: str,
    brand_summary: str,
    platform: str,
    tone: str
) -> Dict[str, str]:
    """
    Generate high-quality post content using OpenAI.
    Prioritizes brand name and relevance.
    """
    try:
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        system_prompt = f"""You are a professional social media manager for the brand "{brand_name}".
Your goal is to create highly relevant, engaging content based on the brand's summary: "{brand_summary}".
Tone: {tone}.
Platform: {platform}.

CRITICAL INSTRUCTIONS:
1. ALWAYS use the exact brand name "{brand_name}" in the text.
2. The content MUST be relevant to what the brand actually does (based on summary).
3. Do not invent generic facts. Use the summary as the source of truth.
4. Return JSON with 'title' (max 5 words) and 'caption' (appropriate length for platform).
"""

        user_prompt = f"Write a {platform} post for {brand_name} about a relevant topic for their audience."
        
        response = client.chat.completions.create(
            model="gpt-4o",  # Use a smart model
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7
        )
        
        content = json.loads(response.choices[0].message.content)
        return {
            'title': content.get('title', 'Brand Update'),
            'caption': content.get('caption', '')
        }
    except Exception as e:
        print(f"Error generating text with OpenAI: {e}")
        return None


def generate_image_with_dalle(content_description: str, brand_name: str, style: str = "professional") -> str:
    """
    Generate an image using DALL-E when no relevant image is found.
    Returns the image URL or empty string if generation fails.
    """
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return ""
        
        client = openai.OpenAI(api_key=api_key)
        
        # Create a prompt for image generation based on content
        image_prompt = f"""
        Create a professional, modern social media image for {brand_name} that visually represents: {content_description}
        
        Style: {style}, clean, modern, suitable for social media post. 
        Avoid text overlays, focus on visual representation of the concept.
        """
        
        response = client.images.generate(
            model="dall-e-3",
            prompt=image_prompt.strip(),
            size="1024x1024",
            quality="standard"
        )
        
        return response.data[0].url if response.data else ""
        
    except Exception as e:
        print(f"Error generating image with DALL-E: {e}")
        return ""

def generate_weekly_content(brand_data: Dict[str, Any], tone: str = 'professional') -> List[Dict[str, str]]:
    """
    Generate 7-day content calendar with AI-powered content
    Prevents duplicate images and generates new images when needed
    """
    try:
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return generate_fallback_content(brand_data, tone)
            
        client = openai.OpenAI(api_key=api_key)
        
        brand_name = brand_data.get('name', 'Brand')
        brand_desc = brand_data.get('description', '')
        industry = brand_data.get('industry', 'General')
        summary = brand_data.get('content_summary', '')
        
        calendar = []
        start_date = datetime.now()
        
        days_of_week = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        
        # Get content images if available (flatten list of urls)
        available_images = brand_data.get('images', [])
        
        # Track used images to prevent duplicates
        used_image_indices = set()
        used_image_urls = set()
        
        # Use full brand summary (or up to 6000 chars to include all services/topics)
        # Increased from 4000 to ensure all services from multiple pages are included
        full_summary = summary[:6000] if summary else brand_desc
        
        # STEP 1: Create a content plan that distributes different services across 7 days
        planning_prompt = f"""
        You are an expert social media strategist. Analyze the Brand Summary below and create a 7-day content plan.
        
        Brand Name: {brand_name}
        Brand Description: {brand_desc}
        
        FULL BRAND SUMMARY:
        {full_summary}
        
        Your task: 
        1. Carefully read the Brand Summary above and identify ALL distinct services, offerings, or major topics mentioned.
        2. Look for sections like "Core Offerings", "Services", or any list of what the company does.
        3. Create a plan that assigns a DIFFERENT service/topic to each of the 7 days.
        
        Examples of services (if mentioned in summary):
        - AI Solutions / AI Services / AI Development
        - Mobile App Development / App Development
        - Web Development / Web Design
        - SEO Services / LLM SEO
        - Performance Marketing / Digital Marketing
        - Chatbot Development / Voicebot Development
        - Computer Vision Systems
        - Generative AI
        - Prompt Engineering
        - Enterprise Solutions
        - Startup App Development
        - UI/UX Design
        
        IMPORTANT: 
        - Extract services from the "Core Offerings" section if present
        - If the summary mentions multiple AI services, break them down (e.g., "AI Chatbots", "AI Computer Vision", "Generative AI")
        - If the summary mentions both AI and non-AI services, ensure BOTH are represented
        - Prioritize non-AI services if AI is overrepresented
        
        Return JSON format with a plan for 7 days:
        {{
            "day_1": {{"service": "Specific Service Name 1", "content_type": "Tip"}},
            "day_2": {{"service": "Specific Service Name 2", "content_type": "Insight"}},
            "day_3": {{"service": "Specific Service Name 3", "content_type": "Case Study"}},
            "day_4": {{"service": "Specific Service Name 4", "content_type": "Tip"}},
            "day_5": {{"service": "Specific Service Name 5", "content_type": "Industry Trend"}},
            "day_6": {{"service": "Specific Service Name 6", "content_type": "How-To"}},
            "day_7": {{"service": "Specific Service Name 7", "content_type": "Success Story"}}
        }}
        
        CRITICAL RULES:
        1. Each day MUST focus on a DIFFERENT service - NO REPEATS
        2. If there are both AI and non-AI services, ensure at least 3-4 days cover non-AI services
        3. Vary content types across days
        4. Use the EXACT service names from the summary when possible
        5. Maximum diversity is required - do not create 7 posts about AI if other services exist
        """
        
        try:
            planning_response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a content strategist. Return only valid JSON with a 7-day content plan."},
                    {"role": "user", "content": planning_prompt}
                ],
                response_format={ "type": "json_object" }
            )
            
            content_plan = json.loads(planning_response.choices[0].message.content)
            print(f"Content plan created: {content_plan}")
        except Exception as e:
            print(f"Error creating content plan: {e}")
            # Fallback: create a simple plan
            content_plan = {}
            for i in range(7):
                content_plan[f"day_{i+1}"] = {"service": f"Service {i+1}", "content_type": "Tip"}
        
        # STEP 2: Generate posts based on the plan
        base_prompt_setup = f"""
        You are an expert social media strategist creating content for {brand_name}, a {industry} company.
        
        Brand Name: {brand_name}
        Brand Description: {brand_desc}
        
        FULL BRAND SUMMARY (This includes content from MULTIPLE pages):
        {full_summary}
        
        Content Tone: {tone}
        """
        
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            day_name = days_of_week[current_date.weekday()]
            
            # Create available images list excluding used ones
            unused_images = []
            unused_indices = []
            for idx, img_url in enumerate(available_images):
                if idx not in used_image_indices and img_url not in used_image_urls:
                    unused_images.append(img_url)
                    unused_indices.append(idx)
            
            # Create image list string with only unused images
            image_list_str = ""
            if unused_images:
                # Show up to 30 unused images to keep prompt manageable
                display_images = unused_images[:30]
                display_indices = unused_indices[:30]
                image_list_str = "\n".join([f"  [{orig_idx}] {url}" for orig_idx, url in zip(display_indices, display_images)])
                if len(unused_images) > 30:
                    image_list_str += f"\n  ... and {len(unused_images) - 30} more unused images"
            
            # Build prompt with used images context
            used_images_info = ""
            if used_image_indices:
                used_list = sorted(list(used_image_indices))[:10]  # Show first 10 used
                used_images_info = f"\n\nIMPORTANT: The following image indices have already been used for previous days: {', '.join(map(str, used_list))}. DO NOT reuse these images. "
                if len(used_image_indices) > 10:
                    used_images_info += f"({len(used_image_indices)} total images already used)"
            
            # Get the assigned service for this day from the plan
            day_plan = content_plan.get(f"day_{i+1}", {})
            assigned_service = day_plan.get("service", "General Services")
            assigned_content_type = day_plan.get("content_type", "Tip")
            
            # Track which services have been used
            used_services = []
            for j in range(i):
                prev_plan = content_plan.get(f"day_{j+1}", {})
                if prev_plan.get("service"):
                    used_services.append(prev_plan.get("service"))
            
            day_prompt = f"""
            {base_prompt_setup}
            
            CRITICAL ASSIGNMENT FOR {day_name.upper()}:
            You MUST create a post specifically about: "{assigned_service}"
            Content Type: {assigned_content_type}
            
            Services already covered in previous days (DO NOT repeat these): {', '.join(used_services) if used_services else 'None'}
            
            Available Unused Brand Images (use the index number to reference):
            {image_list_str if image_list_str else "No unused images available"}
            {used_images_info}
            
            Generate a high-quality, brand-relevant social media post for {day_name} that focuses SPECIFICALLY on "{assigned_service}".
            
            Requirements:
            1. Content Type: Use "{assigned_content_type}" (or a similar type like "Tip", "Insight", "Case Study", etc.)
            2. Caption: Write engaging content (2-4 sentences) that focuses on "{assigned_service}". 
               - Reference specific details about this service from the Brand Summary
               - Explain benefits, features, or insights related to THIS SPECIFIC SERVICE
               - DO NOT mention other services - focus only on "{assigned_service}"
            3. Hashtags: Include 3-5 relevant hashtags that match "{assigned_service}" and the brand's industry.
            4. Image Selection: 
               - Choose the image index that BEST matches "{assigned_service}" theme
               - The image should visually represent or relate to "{assigned_service}"
               - If no unused images match well, return -1 for image_index to indicate we should generate a new image
               - DO NOT select an image index that has already been used (see list above)
            
            Return JSON format: {{"content_type": "...", "content": "...", "hashtags": "#tag1 #tag2", "image_index": 0, "image_relevance": "high/medium/low/none"}}
            
            REMEMBER: This post MUST be about "{assigned_service}" specifically. Do not create generic content or content about other services.
            """
            
            try:
                response = client.chat.completions.create(
                    model="gpt-3.5-turbo",
                    messages=[
                        {"role": "system", "content": "You are a social media expert. Return only valid JSON. Be strict about image relevance - if no image truly matches, return -1 for image_index."},
                        {"role": "user", "content": day_prompt}
                    ],
                    response_format={ "type": "json_object" }
                )
                
                result = json.loads(response.choices[0].message.content)
                content_text = f"{result.get('content')} {result.get('hashtags', '')}"
                content_type = result.get('content_type', 'Social Post')
                img_idx = result.get('image_index', 0)
                image_relevance = result.get('image_relevance', 'medium')
                
                # Image Selection Logic with duplicate prevention
                selected_image = ""
                should_generate = False
                
                if isinstance(img_idx, int):
                    if img_idx == -1:
                        # AI determined no relevant image exists
                        should_generate = True
                    elif img_idx in used_image_indices:
                        # Prevent duplicate - find next best unused image
                        if unused_indices:
                            img_idx = unused_indices[0]
                        else:
                            should_generate = True
                    elif 0 <= img_idx < len(available_images):
                        if img_idx in used_image_indices or available_images[img_idx] in used_image_urls:
                            # Already used, find alternative
                            if unused_indices:
                                img_idx = unused_indices[0]
                            else:
                                should_generate = True
                        else:
                            selected_image = available_images[img_idx]
                            used_image_indices.add(img_idx)
                            used_image_urls.add(selected_image)
                
                # If no good image found or relevance is low, generate one
                if should_generate or (image_relevance in ['low', 'none'] and not selected_image):
                    print(f"Generating new image for {day_name} - no relevant image found")
                    print(f"Generating new image for {day_name} - no relevant image found")
                    generated_image_url = generate_post_image(
                        description=f"{content_type}: {content_text[:200]}",
                        brand_name=brand_name,
                        platform='instagram',
                        post_index=day_index
                    )
                    if generated_image_url:
                        selected_image = generated_image_url
                        print(f"Generated image successfully for {day_name}")
                    elif unused_indices:
                        # Fallback to unused image if generation fails
                        selected_image = available_images[unused_indices[0]]
                        used_image_indices.add(unused_indices[0])
                        used_image_urls.add(selected_image)
                
                # Final fallback
                if not selected_image and available_images:
                    # Use first unused or first available
                    if unused_indices:
                        selected_image = available_images[unused_indices[0]]
                        used_image_indices.add(unused_indices[0])
                        used_image_urls.add(selected_image)
                    else:
                        selected_image = available_images[0]
                
            except Exception as e:
                print(f"Gen Error: {e}")
                # Fallback if JSON parsing fails or simple generation
                content_text = f"Discover more with {brand_name} today! #{industry}"
                content_type = "Update"
                # Try to use an unused image
                if unused_indices:
                    selected_image = available_images[unused_indices[0]]
                    used_image_indices.add(unused_indices[0])
                    used_image_urls.add(selected_image)
                elif available_images:
                    selected_image = available_images[0]
                else:
                    selected_image = ""
            
            calendar.append({
                'day': day_name,
                'date': current_date.strftime('%B %d, %Y'),
                'content_type': content_type,
                'content': content_text,
                'image_url': selected_image,
                'status': 'draft'
            })
        
        return calendar
    
    except Exception as e:
        print(f"Error generating content: {str(e)}")
        return generate_fallback_content(brand_data, tone)

def generate_fallback_content(brand_data: Dict[str, Any], tone: str = 'professional') -> List[Dict[str, str]]:
    """
    Fallback content generation without API
    """
    brand_name = brand_data.get('name', 'Brand')
    industry = brand_data.get('industry', 'General')
    
    # ... (Same fallback list logic as before, abbreviated for brevity in replacement)
    # Recreating the list here to ensure file integrity
    fallback_content = []
    
    content_types = ['Motivation', 'Insight', 'Product', 'Team', 'Success Story', 'Tip', 'Trend']
    
    for i in range(7):
        day = (datetime.now() + timedelta(days=i)).strftime('%A')
        date = (datetime.now() + timedelta(days=i)).strftime('%B %d, %Y')
        ctype = content_types[i]
        
        fallback_content.append({
            'day': day,
            'date': date,
            'content_type': ctype,
            'content': f"Engage with {brand_name} this {day}! We are leading the way in {industry}. #{ctype} #{brand_name.replace(' ', '')}",
            'status': 'draft'
        })
        
    return fallback_content

def generate_brand_summary(raw_text: str, fallback_text: str = None, tone: str = 'professional') -> str:
    """
    Generate a comprehensive 'Blaze.ai style' brand summary using OpenAI
    """
    try:
        # Initialize OpenAI client
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            if fallback_text and len(fallback_text) > 10:
                return fallback_text
            return raw_text[:300] + "..." if len(raw_text) > 300 else raw_text
        
        client = openai.OpenAI(api_key=api_key)
        
        # Increase limit significantly to include content from all pages
        # For 5 pages with ~8000 chars each = ~40000 chars max
        # Use up to 35000 chars to stay within token limits but capture all pages
        content_for_summary = raw_text[:35000] if len(raw_text) > 35000 else raw_text
        
        # Log how much content we're using
        print(f"Generating summary from {len(content_for_summary)} characters (out of {len(raw_text)} total)")
        
        prompt = f"""
        You are an elite brand consultant. Analyze the provided website content from MULTIPLE pages to produce a comprehensive brand summary.
        
        IMPORTANT: The content below comes from multiple pages (indicated by "--- SOURCE: URL ---" markers). 
        Ensure your summary represents ALL pages and services, not just the first page. Include diverse topics and services mentioned across all pages.

        Raw Content from Multiple Pages:
        {content_for_summary} 

        CRITICAL INSTRUCTIONS:
        1. Review content from ALL pages (look for "--- SOURCE: URL ---" markers)
        2. Identify the MAIN TOPIC of each page
        3. Ensure your summary covers ALL services, offerings, and topics mentioned across different pages
        4. Do NOT focus only on the first page - give equal weight to all pages
        5. If pages discuss different services (e.g., AI services, app development, SEO), mention ALL of them
        
        OUTPUT FORMAT RULES (VERY IMPORTANT):
        - Write in clean, flowing prose paragraphs
        - DO NOT use any markdown formatting (no #, ##, *, **, -, bullet points)
        - DO NOT use asterisks or hash symbols
        - Write in professional, natural language as if for a business presentation
        - Use line breaks between paragraphs for readability
        - Keep it concise but comprehensive (400-500 words)
        
        Structure your response as flowing paragraphs covering:
        - A powerful opening that captures the brand's essence
        - Their core products and services
        - Who they serve and their brand personality  
        - What makes them stand out in the market
        - Content strategy insights
        
        Make it sound premium, insightful, and professional. Write like a senior brand strategist presenting to executives.
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a brand strategist. Output clean professional prose without any markdown formatting, asterisks, or special symbols."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=800
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        print(f"Error generating summary: {str(e)}")
        if fallback_text:
            return fallback_text
        return raw_text[:500] + "..." if len(raw_text) > 500 else raw_text

def generate_brand_metadata(raw_text: str) -> Dict[str, str]:
    """
    Generate missing metadata (tagline, brief description) using AI.
    Returns JSON.
    """
    try:
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            return {'tagline': '', 'description': ''}
            
        client = openai.OpenAI(api_key=api_key)
        
        prompt = f"""
        Extract or generate a brand tagline and a brief description (1-2 sentences) for the following context.
        
        Context:
        {raw_text[:4000]}
        
        Return JSON only: {{"tagline": "...", "description": "..."}}
        """
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "Return valid JSON."},
                {"role": "user", "content": prompt}
            ],
            response_format={ "type": "json_object" }
        )
        
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        print(f"Error generating metadata: {e}")
        return {'tagline': '', 'description': ''}
