import os
import json
import google.generativeai as genai
from typing import Optional
from app.models.brand_assets import ColorPalette, FontInfo

class GeminiService:
    """Service to analyze brand assets using Gemini 2.0 Flash/Pro."""

    def __init__(self):
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            # We don't raise here to allow app startup, but methods will fail
            print("WARNING: GOOGLE_API_KEY not set.")
        else:
            genai.configure(api_key=api_key)
            
            
            self.available_models = {
                "fast": None,      # e.g., gemini-1.5-flash
                "reasoning": None, # e.g., gemini-1.5-pro
                "vision": None,    # Any model with vision capabilities
                "image": None      # e.g., imagen-3.0-generate-001
            }
            self._identify_models()

    def _identify_models(self):
        """
        Dynamically scans available models and selects the best ones for each task.
        Logs all discovered models for transparency.
        """
        try:
            print("\n" + "=" * 70)
            print("🔍 DISCOVERING AVAILABLE GEMINI MODELS...")
            print("=" * 70)

            # 1. Fetch all models
            all_models = list(genai.list_models())

            # Categorize models
            text_models = []
            image_models = []
            other_models = []

            for m in all_models:
                name = m.name.lower()
                methods = getattr(m, 'supported_generation_methods', [])
                
                if 'gemini' in name and 'generateContent' in methods:
                    text_models.append(m)
                elif 'image' in name or 'imagen' in name:
                    image_models.append(m)
                else:
                    other_models.append(m)

            # Log categorized models
            print(f"\n📋 Total models: {len(all_models)}")
            print(f"   ├── Text/Chat models: {len(text_models)}")
            print(f"   ├── Image models:     {len(image_models)}")
            print(f"   └── Other models:     {len(other_models)}")

            print("\n┌─────────────────────────────────────────────────────────┐")
            print("│  TEXT / CHAT MODELS                                     │")
            print("├─────────────────────────────────────────┬───────────────┤")
            for m in text_models:
                score = self._model_score(m.name)
                print(f"│  {m.name:<40}│ score: {score:>5} │")
            print("└─────────────────────────────────────────┴───────────────┘")

            if image_models:
                print("\n┌─────────────────────────────────────────────────────────┐")
                print("│  IMAGE GENERATION MODELS                                │")
                print("├─────────────────────────────────────────┬───────────────┤")
                for m in image_models:
                    prio = self._get_image_model_priority(m.name)
                    print(f"│  {m.name:<40}│ prio:  {prio:>5} │")
                print("└─────────────────────────────────────────┴───────────────┘")

            # 2. Sort text models by score (highest = best)
            text_models.sort(key=lambda m: self._model_score(m.name), reverse=True)

            # 3. Select REASONING model (best overall — prefer Pro > Flash)
            reasoning_model = None
            for m in text_models:
                if 'pro' in m.name.lower():
                    reasoning_model = m.name
                    break
            if not reasoning_model and text_models:
                reasoning_model = text_models[0].name  # Best scored
            self.available_models["reasoning"] = reasoning_model or "models/gemini-1.5-pro"

            # 4. Select FAST model (prefer Flash for speed)
            fast_model = None
            for m in text_models:
                if 'flash' in m.name.lower() and 'thinking' not in m.name.lower():
                    fast_model = m.name
                    break
            self.available_models["fast"] = fast_model or self.available_models["reasoning"]

            # 5. Select VISION model (same as reasoning — all Gemini models support vision)
            self.available_models["vision"] = self.available_models["reasoning"]

            # 6. Select IMAGE GENERATION model
            image_models.sort(key=lambda m: self._get_image_model_priority(m.name))
            if image_models:
                self.available_models["image"] = image_models[0].name
            else:
                # Try to find a Gemini model with image generation
                for m in text_models:
                    if 'image' in m.name.lower():
                        self.available_models["image"] = m.name
                        break
                if not self.available_models.get("image"):
                    self.available_models["image"] = "gemini-2.0-flash-exp-image-generation"

            # Print final selection
            print("\n" + "=" * 70)
            print("✅ FINAL MODEL SELECTION:")
            print("─" * 70)
            for task, model in self.available_models.items():
                emoji = {"reasoning": "🧠", "fast": "⚡", "vision": "👁️", "image": "🎨"}.get(task, "•")
                print(f"   {emoji} {task.upper():12} → {model}")
            print("=" * 70 + "\n")

        except Exception as e:
            print(f"\n⚠️ WARNING: Model Auto-Discovery Failed ({e})")
            print("Using fail-safe defaults...")
            import traceback
            traceback.print_exc()

            # Fail-safe defaults
            self.available_models["reasoning"] = "models/gemini-1.5-pro"
            self.available_models["fast"] = "models/gemini-1.5-flash"
            self.available_models["vision"] = "models/gemini-1.5-pro"
            self.available_models["image"] = "gemini-2.0-flash-exp-image-generation"

    @staticmethod
    def _model_score(name: str) -> int:
        """Score a model name — higher = better for selection."""
        name = name.lower()
        score = 0
        # Version scoring (newer = better)
        if '2.5' in name: score += 300
        if '2.0' in name: score += 200
        if '1.5' in name: score += 100
        if '1.0' in name: score += 50
        # Tier scoring
        if 'pro' in name: score += 50
        if 'flash' in name: score += 10
        # Freshness scoring
        if 'latest' in name: score += 5
        if '002' in name: score += 3
        if '001' in name: score += 1
        # Penalties
        if 'exp' in name: score -= 5     # Experimental
        if 'thinking' in name: score -= 10  # Thinking models are slower
        if 'legacy' in name: score -= 50
        return score

    def _get_image_model_priority(self, model_name: str) -> int:
        """Returns priority for image models (lower = better)."""
        name = model_name.lower()
        
        # Best: Imagen 4.0 (Newest)
        if 'imagen-4' in name:
            return 1
        # Second: Imagen 3.0
        if 'imagen-3' in name:
            return 2
        # Third: Imagen 2.0
        if 'imagen-2' in name:
            return 3
        # Fourth: Gemini Dedicated Image Gen (if Imagen not available)
        if 'gemini' in name and 'image-generation' in name:
            return 4
        # Fifth: Gemini Flash Image (Experimental)
        if 'gemini' in name and 'flash-image' in name:
            return 5
        # Default
        return 10

    def get_model_for_task(self, task_type: str = "reasoning"):
        """Returns the appropriate model object for the task."""
        model_name = self.available_models.get(task_type) or self.available_models["reasoning"]
        print(f"DEBUG: Using model '{model_name}' for task '{task_type}'")
        return genai.GenerativeModel(model_name)

    async def research_company(self, company_name: str, url: str) -> dict:
        """
        Performs deep research on the company using Google Search Grounding.
        Returns a dictionary matching the StrategicAnalysis model structure.
        """
        if not os.getenv("GOOGLE_API_KEY"):
            print("WARNING: API Key missing for research.")
            return {}

        # Use the "reasoning" model (Gemini 1.5 Pro) for search synthesis
        model = self.get_model_for_task("reasoning")
        
        # Enable Google Search Grounding
        tools = [{'google_search': {}}] # Standard tool definition for genai SDK

        prompt = f"""
        You are an elite Brand Strategist and Market Researcher.
        Conduct deep research on the company "{company_name}" (Website: {url}).
        Use Google Search to find real-world information about them.
        
        Answer these specific strategic questions to build a comprehensive report.
        **CRITICAL: KEEP ANSWERS CONCISE. Use short, punchy bullet points. Max 2 sentences per point.**
        
        1.  **Executive Summary**: What does this company do, and what is their unique value proposition? (Max 50 words)
        2.  **Target Audience**: Who exactly are they selling to? (Demographics/Psychographics)
        3.  **Brand Archetype**: What is their primary brand archetype? (e.g., The Creator, The Ruler, The Sage)
        4.  **Content Pillars**: What are 4 key topics they should be posting about? (Short titles + 1 sentence description)
        5.  **Campaign Concepts**: Generate 3 concrete, creative campaign ideas. (Short Title + 1 sentence hook)
        
        Return a valid JSON object matching this structure (no markdown):
        {{
            "company_summary": "...",
            "strategy": {{
                "brand_archetype": "...",
                "brand_voice": "...",
                "content_pillars": ["...", "...", ...],
                "visual_style_guide": ["...", ...],
                "recommended_post_types": ["...", ...],
                "campaign_ideas": ["...", ...],
                "target_audience": "...",
                "key_strengths": ["...", ...],
                "design_style": "To be inferred from their actual industry standards"
            }}
        }}
        
        Synthesize the search results into high-quality, professional insights. Avoid fluff.
        """

        try:
            # We must run this in a thread executor or similar if the SDK is sync, 
            # but usually manage via async wrapper or just call straight if acceptable.
            # verify tools kwarg support in loaded SDK version.
            response = model.generate_content(
                prompt,
                tools=tools # Use the standard list based tool definition
            )
            
            # Note: The SDK might vary on 'google_search_retrieval' string vs object. 
            # If string fails, we'll try the object in next iteration.
            
            text = response.text.strip()
            
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
                
            print(f"DEBUG: Research JSON: {text[:200]}...")
            return json.loads(text)

        except Exception as e:
            print(f"Research Failed ({e}). Falling back to internal knowledge.")
            # Fallback without search if tool fails
            try:
                response = model.generate_content(prompt) # No tools
                text = response.text.strip()
                import re
                json_match = re.search(r'\{.*\}', text, re.DOTALL)
                if json_match: return json.loads(json_match.group(0))
            except:
                pass
            return {}

    async def generate_brand_analysis(self, company_name: str, description: str, 
                                        page_text: str, url: str) -> dict:
        """
        TEXT-ONLY brand analysis — no screenshot needed.
        Generates brand summary, strategy, vibe from scraped text content.
        Uses Flash model for maximum speed (~3-5s vs ~15s for image analysis).
        """
        if not os.getenv("GOOGLE_API_KEY"):
            return {}

        # Truncate page text to avoid token limits (keep first 4000 chars)
        truncated_text = page_text[:4000] if page_text else ""

        prompt = f"""You are an elite CMO and Brand Strategist.
Analyze this company and generate a comprehensive brand profile.

Company: {company_name}
Website: {url}
Meta Description: {description}

Page Content:
{truncated_text}

Return a valid JSON object (no markdown code blocks, just raw JSON):
{{
    "company_summary": "A concise 2-3 sentence summary of what this company does and their unique value proposition.",
    "brand_vibe": ["keyword1", "keyword2", "keyword3", "keyword4"],
    "strategy": {{
        "brand_archetype": "The [Archetype] — one sentence why",
        "brand_voice": "Brief description of tone and personality",
        "content_pillars": ["Pillar 1: brief description", "Pillar 2: brief description", "Pillar 3: brief description", "Pillar 4: brief description"],
        "visual_style_guide": ["Directive 1", "Directive 2", "Directive 3"],
        "recommended_post_types": ["Type 1", "Type 2", "Type 3"],
        "campaign_ideas": ["Idea 1: Hook description", "Idea 2: Hook description", "Idea 3: Hook description"],
        "target_audience": "Demographics and psychographics in 1-2 sentences",
        "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
        "design_style": "Brief visual design style description"
    }}
}}

Be specific to this company. Avoid generic content. Keep answers concise and punchy."""

        try:
            model = self.get_model_for_task("fast")
            print(f"DEBUG: Using model '{model._model_name}' for text-only brand analysis")
            response = model.generate_content(prompt)
            
            text = response.text.strip()
            
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
            
            result = json.loads(text)
            print(f"DEBUG: Text-only analysis complete for '{company_name}'")
            return result

        except Exception as e:
            print(f"Text-only brand analysis failed: {e}")
            return {}

    async def analyze_brand(self, image_bytes: bytes, use_fast: bool = False) -> dict:
        """
        Sends the website screenshot to Gemini and asks for brand analysis.
        Returns a dictionary with colors, fonts, and vibe.
        use_fast=True uses Flash model (3-5x faster) instead of Pro.
        """
        if not os.getenv("GOOGLE_API_KEY"):
            raise ValueError("GOOGLE_API_KEY is not set in environment variables.")

        prompt = """
        You are an elite CMO and Creative Director. 
        Analyze this website screenshot to extract the brand identity and formulate a comprehensive marketing strategy.
        
        Return a valid JSON object with the following structure (do not use markdown code blocks, just raw JSON):
        {
            "company_name": "Inferred Company Name",
            "company_summary": "A concise 2-3 sentence executive summary of what this company does and their unique value proposition.",
            "colors": {
                "primary": "#hex",
                "secondary": "#hex" (or null),
                "accent": "#hex" (or null),
                "background": "#hex" (main page background),
                "text": "#hex" (main body text),
                "all_colors": ["#hex", "#hex", ...]
            },
            "fonts": [
                {
                    "family": "FontName",
                    "style": "serif/sans-serif/display/etc",
                    "is_primary": true,
                    "is_body": false
                },
                {
                    "family": "FontName",
                    "style": "...",
                    "is_primary": false,
                    "is_body": true
                }
            ],
            "brand_vibe": ["keyword1", "keyword2", "keyword3", "keyword4"],
            "strategy": {
                "brand_archetype": "The [Archetype] (e.g., The Magician, The Hero, The Sage)",
                "brand_voice": "Brief description of the tone (e.g., Authoritative yet accessible, Playful and witty)",
                "content_pillars": ["Theme 1", "Theme 2", "Theme 3", "Theme 4"],
                "visual_style_guide": ["Directive 1 (e.g. Use minimalist flat lay)", "Directive 2", "Directive 3"],
                "recommended_post_types": ["Format 1", "Format 2", "Format 3"],
                "campaign_ideas": ["Idea 1: Hook...", "Idea 2: Hook...", "Idea 3: Hook..."],
                "target_audience": "Inferred target audience demographics and psychographics",
                "key_strengths": ["Strength 1", "Strength 2", "Strength 3"],
                "design_style": "Brief description of the visual design style"
            }
        }
        
        Be precise with hex codes. Infer the strategy deeply from the visual cues and copy visible in the screenshot.
        """

        try:
            # Use fast model for speed when requested, reasoning model for deep analysis
            task = "fast" if use_fast else "reasoning"
            model = self.get_model_for_task(task)
            response = model.generate_content([
                {'mime_type': 'image/png', 'data': image_bytes},
                prompt
            ])
            
            text = response.text.strip()
            
            # Robust JSON extraction using regex
            import re
            json_match = re.search(r'\{.*\}', text, re.DOTALL)
            if json_match:
                text = json_match.group(0)
            
            print(f"DEBUG: Parsed JSON text: {text[:500]}...") # Log start of JSON
            
            data = json.loads(text)
            return data
            
        except Exception as e:
            print(f"Gemini Analysis Failed: {e}")
            print(f"DEBUG: Failed text was: {response.text if 'response' in locals() else 'No response'}")
            # Return empty/default structure on failure
            return None
