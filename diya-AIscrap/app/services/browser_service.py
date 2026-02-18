import base64
from playwright.async_api import async_playwright

class BrowserService:
    """Service to capture screenshots and extract styles using Playwright."""

    async def capture_and_extract(self, url: str) -> dict:
        """
        Single browser session: captures screenshot + extracts computed styles.
        This is 2x faster than launching two separate browsers.
        
        Returns: {
            'screenshot': bytes,
            'styles': dict
        }
        """
        async with async_playwright() as p:
            browser = await p.chromium.launch()
            
            context = await browser.new_context(
                viewport={"width": 1920, "height": 1080},
                user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
            
            page = await context.new_page()
            screenshot_bytes = None
            styles = {}
            
            try:
                # Navigate once — try networkidle with short timeout, fallback to domcontentloaded
                try:
                    await page.goto(url, wait_until="networkidle", timeout=15000)
                except Exception:
                    print("Networkidle timed out, proceeding with current state.")
                
                # 1. Screenshot (fast — page is already loaded)
                screenshot_bytes = await page.screenshot(type="png")
                
                # 2. Extract computed styles (runs JS in same page — no extra navigation)
                styles = await page.evaluate("""() => {
                    // 1. COLORS
                    const primaryCandidates = [];
                    
                    document.querySelectorAll('button, a[class*="btn"], input[type="submit"], [role="button"]').forEach(el => {
                        const style = window.getComputedStyle(el);
                        const bg = style.backgroundColor;
                        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)' && bg !== 'rgb(0, 0, 0)') {
                            primaryCandidates.push(bg);
                        }
                    });
                    
                    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
                    
                    // 2. FONTS
                    const headingFonts = [];
                    document.querySelectorAll('h1, h2, h3').forEach(el => {
                        const font = window.getComputedStyle(el).fontFamily;
                        if (font) headingFonts.push(font.split(',')[0].replace(/['"]/g, ''));
                    });
                    
                    const bodyFont = window.getComputedStyle(document.body).fontFamily.split(',')[0].replace(/['"]/g, '');
                    
                    // 3. LOGO
                    let logoUrl = null;
                    const logoImg = document.querySelector('header img, nav img, .logo img, img[src*="logo"]');
                    if (logoImg) {
                        logoUrl = logoImg.src;
                    }
                    
                    return {
                        primary_color: primaryCandidates.length > 0 ? primaryCandidates[0] : null,
                        background_color: bodyBg,
                        heading_font: headingFonts.length > 0 ? headingFonts[0] : null,
                        body_font: bodyFont,
                        logo_url: logoUrl
                    };
                }""")
                
            except Exception as e:
                # Fallback: try domcontentloaded
                try:
                    await page.goto(url, wait_until="domcontentloaded", timeout=20000)
                    screenshot_bytes = await page.screenshot(type="png")
                except Exception as inner_e:
                    await browser.close()
                    raise ValueError(f"Failed to load site: {str(e)} | {str(inner_e)}")
            finally:
                await browser.close()
            
            return {
                'screenshot': screenshot_bytes,
                'styles': styles
            }

    # Keep legacy methods for backward compat
    async def capture_screenshot(self, url: str) -> bytes:
        result = await self.capture_and_extract(url)
        return result['screenshot']

    async def extract_styles(self, url: str) -> dict:
        result = await self.capture_and_extract(url)
        return result['styles']
