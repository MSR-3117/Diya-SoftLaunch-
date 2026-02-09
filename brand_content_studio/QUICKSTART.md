# Quick Start Guide

## Installation (2 minutes)

### Step 1: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Set Up Environment
```bash
# Copy example env file
copy .env.example .env

# Edit .env and add your API keys (optional but recommended)
# For AI content generation: Get ANTHROPIC_API_KEY from console.anthropic.com
# For brand assets: Get BRANDFETCH_API_KEY from brandfetch.com/developers
```

### Step 3: Run the App
```bash
python run.py
```

Open browser to: **http://localhost:5000**

## First Use (3 minutes)

### Option 1: Test with URL
1. Go to home page
2. Paste any website URL (e.g., `apple.com`)
3. Click "Analyze"
4. Wait for brand profile
5. Click "Generate Content Calendar"
6. Select tone and wait for calendar

### Option 2: Test with Manual Entry
1. Click "Manual Entry" tab
2. Fill in your brand details
3. Click "Analyze Brand"
4. Generate content calendar

## What You Get

✅ Brand profile with colors, fonts, description
✅ 7 AI-generated content pieces
✅ Professional single-page web app
✅ Copy-to-clipboard functionality

## API Keys (Optional)

The app works WITHOUT API keys using fallback content. For best results:

1. **Anthropic** (for AI content):
   - Sign up at console.anthropic.com
   - Get API key
   - Add to `.env`: `ANTHROPIC_API_KEY=sk-ant-...`

2. **BrandFetch** (for brand logos/colors):
   - Sign up at brandfetch.com/developers
   - Get API key  
   - Add to `.env`: `BRANDFETCH_API_KEY=...`

## Troubleshooting

**Port 5000 in use?**
```bash
python run.py --port 5001
```

**Module errors?**
```bash
pip install -r requirements.txt --upgrade
```

**Scraping not working?**
- Try manual entry instead
- Some sites block scraping
- Check internet connection

## Next Steps

- Explore all 3 content tones
- Try different websites
- Customize brand colors
- Export content for your platform

---

Enjoy! 🎉
