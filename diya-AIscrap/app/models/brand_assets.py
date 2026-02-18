"""
Pydantic models for brand assets extracted from websites.
"""
from typing import Optional
from pydantic import BaseModel, Field, HttpUrl


class ColorPalette(BaseModel):
    """Extracted color palette from a website."""
    primary: str = Field(..., description="Primary brand color in hex format")
    secondary: Optional[str] = Field(None, description="Secondary brand color in hex format")
    accent: Optional[str] = Field(None, description="Accent color in hex format")
    background: str = Field("#ffffff", description="Background color in hex format")
    text: str = Field("#000000", description="Primary text color in hex format")
    all_colors: list[str] = Field(default_factory=list, description="All detected colors from the website")


class ExtractedLogo(BaseModel):
    """Extracted logo information."""
    url: str = Field(..., description="URL or base64 data of the logo")
    format: str = Field(..., description="Image format (png, svg, jpg, etc.)")
    width: Optional[int] = Field(None, description="Logo width in pixels")
    height: Optional[int] = Field(None, description="Logo height in pixels")
    is_svg: bool = Field(False, description="Whether the logo is an SVG")
    base64_data: Optional[str] = Field(None, description="Base64 encoded logo data")


class FontInfo(BaseModel):
    """Font information extracted from website."""
    family: str = Field(..., description="Font family name")
    weight: Optional[str] = Field(None, description="Font weight")
    style: Optional[str] = Field(None, description="Font style (normal, italic)")
    source: Optional[str] = Field(None, description="Font source URL (Google Fonts, etc.)")
    is_primary: bool = Field(False, description="Whether this is the primary heading font")
    is_body: bool = Field(False, description="Whether this is the body text font")



class StrategicAnalysis(BaseModel):
    """Deep strategic analysis of the brand."""
    brand_archetype: str = Field(..., description="Brand archetype (e.g., The Ruler, The Magician)")
    brand_voice: str = Field(..., description="Description of the brand voice")
    content_pillars: list[str] = Field(default_factory=list, description="Core content themes")
    visual_style_guide: list[str] = Field(default_factory=list, description="Visual style directives")
    recommended_post_types: list[str] = Field(default_factory=list, description="Recommended social post formats")
    campaign_ideas: list[str] = Field(default_factory=list, description="Strategic campaign concepts")
    target_audience: str = Field(..., description="Inferred target audience")
    key_strengths: list[str] = Field(default_factory=list, description="Key brand strengths")
    design_style: str = Field(..., description="Brief description of visual style")


class BrandAssets(BaseModel):
    """Complete brand assets extracted from a company website."""
    website_url: HttpUrl = Field(..., description="The source website URL")
    company_name: Optional[str] = Field(None, description="Detected company name")
    company_summary: Optional[str] = Field(None, description="Concise 2-3 sentence summary of the company")
    logo: Optional[ExtractedLogo] = Field(None, description="Extracted logo")
    colors: ColorPalette = Field(..., description="Extracted color palette")
    fonts: list[FontInfo] = Field(default_factory=list, description="Extracted fonts")
    favicon_url: Optional[str] = Field(None, description="Favicon URL")
    meta_description: Optional[str] = Field(None, description="Website meta description")
    extraction_timestamp: str = Field(..., description="ISO timestamp of extraction")
    brand_vibe: list[str] = Field(default_factory=list, description="Keywords describing the brand aesthetic")
    strategy: Optional[StrategicAnalysis] = Field(None, description="Deep strategic brand analysis")


class WebsiteAnalysisRequest(BaseModel):
    """Request to analyze a website for brand assets."""
    url: HttpUrl = Field(..., description="Website URL to analyze")


class WebsiteAnalysisResponse(BaseModel):
    """Response containing extracted brand assets."""
    success: bool = Field(..., description="Whether extraction was successful")
    message: str = Field(..., description="Status message")
    assets: Optional[BrandAssets] = Field(None, description="Extracted brand assets")
    errors: list[str] = Field(default_factory=list, description="Any errors during extraction")
