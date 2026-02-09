# Brand Content Studio

A sleek, professional Flask web application for brand analysis and AI-powered content generation.

## Features

- **Brand URL Scraping**: Paste your website URL to automatically extract brand information from the first 5 pages
- **Manual Brand Entry**: Manually input brand details if preferred
- **BrandFetch Integration**: Fetch logo, colors, fonts, and brand guidelines
- **AI Content Generation**: Generate 7-day content calendar with Claude AI
- **Beautiful UI**: Clean, professional design with white theme and green accents
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Project Structure

```
brand_content_studio/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── routes.py                # All route handlers
│   ├── brand_scraper.py         # BeautifulSoup web scraping
│   ├── brand_fetcher.py         # BrandFetch API integration
│   ├── content_generator.py     # AI content generation with Claude
│   ├── templates/
│   │   └── index.html           # Main single-page application
│   └── static/
│       ├── css/
│       │   └── style.css        # Professional styling
│       └── js/
│           └── main.js          # Frontend logic
├── run.py                       # Application entry point
├── requirements.txt             # Python dependencies
└── README.md                    # This file
```

## Installation

### 1. Create a virtual environment

```bash
python -m venv venv
venv\Scripts\activate  # On Windows
# or
source venv/bin/activate  # On macOS/Linux
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Set up environment variables

Create a `.env` file in the project root:

```env
# Flask settings
FLASK_ENV=development
SECRET_KEY=your-secret-key-here

# API Keys (Optional)
ANTHROPIC_API_KEY=your-anthropic-api-key  # For AI content generation
BRANDFETCH_API_KEY=your-brandfetch-api-key  # For brand asset fetching
```

**Getting API Keys:**

- **Anthropic API Key**: Get from [console.anthropic.com](https://console.anthropic.com)
- **BrandFetch API Key**: Get from [brandfetch.com/developers](https://brandfetch.com/developers)

## Running the Application

```bash
python run.py
```

The application will be available at `http://localhost:5000`

## Usage

### Step 1: Analyze Your Brand

Choose one of two methods:

**Option A: From Website URL**
- Paste your brand's website URL
- The app will scrape the first 5 pages to extract:
  - Brand name, description, and tagline
  - Color palette
  - Typography
  - Images and assets
  - Content summary

**Option B: Manual Entry**
- Enter brand details manually:
  - Brand name
  - Industry
  - Description
  - Tagline
  - Logo URL
  - Brand colors (hex codes)

### Step 2: Review Brand Profile

- View all extracted brand information
- See colors, fonts, and brand summary
- Review which pages were analyzed

### Step 3: Generate Content Calendar

- Select desired tone (Professional, Casual, Inspirational, Educational, Playful)
- Click "Generate Content Calendar"
- Get 7 days of AI-generated, engaging content
- Content types vary daily: tips, insights, features, stories, case studies, etc.

### Step 4: Manage Content

- View all 7 days of content
- Copy content to clipboard with one click
- Ready to post on your preferred social media platforms

## Technology Stack

### Backend
- **Flask**: Lightweight Python web framework
- **BeautifulSoup4**: Web scraping and HTML parsing
- **Requests**: HTTP library for API calls
- **Anthropic SDK**: Claude AI integration for content generation
- **Flask-CORS**: Cross-origin resource sharing

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables and grid
- **Vanilla JavaScript**: No dependencies, lightweight frontend

### Design
- **Theme**: Professional white background with green accent (#10B981)
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: WCAG-compliant color contrast and semantics

## Features Breakdown

### Brand Scraping
- Analyzes up to 5 pages from your website
- Extracts titles, descriptions, headings, paragraphs
- Collects images and color information
- Creates comprehensive brand summary

### Brand Asset Fetching
- Optional BrandFetch API integration
- Fetches official brand guidelines
- Retrieves logo in multiple formats
- Gets brand colors and typography

### AI Content Generation
- Uses Claude 3.5 Sonnet for superior content quality
- Generates unique, engaging content for each day
- Respects brand voice and tone
- Includes relevant hashtags and CTAs
- Fallback content generator if API unavailable

### Content Tones
- **Professional**: Business-appropriate, credible
- **Casual & Friendly**: Approachable, conversational
- **Inspirational**: Motivational, uplifting
- **Educational**: Informative, insightful
- **Playful & Fun**: Witty, entertaining

## API Endpoints

### Brand Analysis
- **POST** `/brand/analyze`
  - Body: `{ source: 'url'|'manual', ... }`
  - Returns: Brand data with all extracted information

### Calendar Generation
- **POST** `/calendar/generate`
  - Body: `{ brand_data: {...}, tone: string }`
  - Returns: Array of 7-day content with scheduled posts

### Health Check
- **GET** `/health`
  - Returns: `{ status: 'ok' }`

## Configuration

### Flask Settings

In `app/__init__.py`, you can modify:
- `SECRET_KEY`: Change for production
- `DEBUG`: Set to False for production
- `HOST`: Default `0.0.0.0`
- `PORT`: Default `5000`

### CSS Customization

All colors are defined as CSS variables in `static/css/style.css`:

```css
:root {
    --primary-color: #10B981;      /* Green */
    --text-color: #1F2937;         /* Dark Gray */
    --bg-color: #FFFFFF;           /* White */
    /* ... more variables */
}
```

## Troubleshooting

### Issue: "Module not found" error
**Solution**: Make sure virtual environment is activated and all requirements are installed
```bash
pip install -r requirements.txt
```

### Issue: Port 5000 already in use
**Solution**: Change port in `run.py`
```python
app.run(port=5001)  # Use different port
```

### Issue: API key errors
**Solution**: Verify `.env` file exists and contains correct API keys. The app will fallback to sample content if keys are missing.

### Issue: Website scraping returns empty data
**Solution**: 
- Check if website is accessible
- Some websites may block scraping - try manual entry instead
- Ensure URL format is correct (include https://)

## Performance Tips

- **First Load**: Brand scraping may take 10-15 seconds for 5 pages
- **Content Generation**: AI content generation takes 15-30 seconds depending on API
- **Caching**: Consider adding caching for frequently accessed brands

## Security Notes

- Change `SECRET_KEY` before deployment
- Don't commit `.env` file with sensitive keys
- Use HTTPS in production
- Validate all user inputs
- Consider rate limiting for production use

## Development

### Extending the App

1. **Add More Scraping Data**: Edit `brand_scraper.py`
2. **Custom Content Types**: Modify `content_types` in `content_generator.py`
3. **New Tones**: Add new tone handling in `generate_weekly_content()`
4. **UI Changes**: Update `templates/index.html` and `static/css/style.css`

### Testing

Add tests in a `tests/` folder:
```python
# tests/test_scraper.py
def test_brand_scraping():
    # Test scraping functionality
    pass
```

## Future Enhancements

- [ ] Save and manage multiple brands
- [ ] Export calendar as CSV/PDF
- [ ] Direct social media posting
- [ ] Content scheduling
- [ ] Analytics dashboard
- [ ] Collaboration features
- [ ] Template library
- [ ] Multi-language support

## License

MIT License - Feel free to use and modify

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review API documentation for each service
3. Check console for error messages

## Credits

Built with Flask, BeautifulSoup, and Anthropic Claude API

---

**Last Updated**: January 2026

Enjoy creating amazing brand content! 🚀
