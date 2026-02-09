// State management
let brandData = null;
let calendarData = null;

// DOM Elements
const homeSection = document.getElementById('home');
const brandSection = document.getElementById('brand');
const calendarSection = document.getElementById('calendar');

const navLinks = document.querySelectorAll('.nav-link');
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

const analyzeUrlBtn = document.getElementById('analyze-url-btn');
const websiteUrl = document.getElementById('website-url');
const manualBrandForm = document.getElementById('manual-brand-form');

const loadingDiv = document.getElementById('loading');
const brandProfile = document.getElementById('brand-profile');
const brandError = document.getElementById('brand-error');
const generateCalendarBtn = document.querySelector('.btn-generate-calendar');

const contentToneSelect = document.getElementById('content-tone');
const regenerateBtn = document.getElementById('regenerate-btn');
const calendarContainer = document.getElementById('calendar-container');
const calendarError = document.getElementById('calendar-error');
const calendarLoading = document.getElementById('calendar-loading');

// Navigation
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = e.target.dataset.section;
        navigateToSection(section);
    });
});

function navigateToSection(sectionName) {
    // Update nav links
    navLinks.forEach(link => link.classList.remove('active'));
    document.querySelector(`[data-section="${sectionName}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(sectionName).classList.add('active');
}

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab;

        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        tabContents.forEach(content => content.classList.remove('active'));
        document.getElementById(tabName).classList.add('active');
    });
});

// URL Analysis
analyzeUrlBtn.addEventListener('click', async () => {
    const url = websiteUrl.value.trim();
    if (!url) {
        showError(brandError, 'Please enter a valid URL');
        return;
    }

    await analyzeBrand('url', { url });
});

// Manual Form Submission
manualBrandForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const manualData = {
        brandName: document.getElementById('brand-name').value,
        brandDescription: document.getElementById('brand-description').value,
        industry: document.getElementById('industry').value,
        tagline: document.getElementById('tagline').value,
        logoUrl: document.getElementById('logo-url').value,
        colors: parseColors(document.getElementById('brand-colors').value)
    };

    await analyzeBrand('manual', manualData);
});

function parseColors(colorString) {
    return colorString
        .split(',')
        .map(c => c.trim())
        .filter(c => c)
        .slice(0, 5);
}

async function analyzeBrand(source, data) {
    try {
        showElement(loadingDiv);
        hideElement(brandError);

        const response = await fetch('/brand/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                source,
                ...data
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to analyze brand');
        }

        brandData = result.brand_data;
        displayBrandProfile(brandData);
        hideElement(loadingDiv);
        navigateToSection('brand');

    } catch (error) {
        hideElement(loadingDiv);
        showError(brandError, error.message);
        console.error('Error:', error);
    }
}

function displayBrandProfile(data) {
    // Clear previous content
    showElement(brandProfile);
    hideElement(brandError);

    // Set brand info
    document.getElementById('profile-name').textContent = data.name || 'Brand Name';
    document.getElementById('profile-tagline').textContent = data.tagline || 'Your brand tagline';
    document.getElementById('profile-description').textContent = data.description || 'Brand description will appear here';

    // Logo
    if (data.logo_url) {
        document.getElementById('profile-logo-img').src = data.logo_url;
    } else {
        document.getElementById('profile-logo-img').src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect width="100" height="100" fill="%2310B981"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dy=".3em" fill="white"%3E' + (data.name || 'B')[0] + '%3C/text%3E%3C/svg%3E';
    }

    // Colors
    const colorPalette = document.getElementById('profile-colors');
    colorPalette.innerHTML = '';

    if (data.colors && data.colors.length > 0) {
        data.colors.forEach(colorItem => {
            const [hex, name] = Array.isArray(colorItem) ? colorItem : [colorItem, 'Color'];
            const colorDiv = document.createElement('div');
            colorDiv.className = 'color-item';
            colorDiv.innerHTML = `
                <div class="color-box" style="background-color: ${hex};" title="${hex}"></div>
                <div class="color-name">${name}</div>
            `;
            colorPalette.appendChild(colorDiv);
        });
    }

    // Images
    const imagesGrid = document.getElementById('profile-images');
    if (imagesGrid) {
        imagesGrid.innerHTML = '';
        if (data.images && data.images.length > 0) {
            data.images.forEach(imgSrc => {
                const img = document.createElement('img');
                img.src = imgSrc;
                img.onclick = () => window.open(imgSrc, '_blank');
                img.title = 'Click to view full size';
                imagesGrid.appendChild(img);
            });
        } else {
            imagesGrid.innerHTML = '<p style="color: #666; font-size: 0.9em; font-style: italic;">No specific brand images found.</p>';
        }
    }

    // Fonts
    const fontsList = document.getElementById('profile-fonts');
    fontsList.innerHTML = '';
    if (data.fonts && data.fonts.length > 0) {
        data.fonts.forEach(font => {
            const li = document.createElement('li');
            li.textContent = font;
            li.style.fontFamily = font;
            fontsList.appendChild(li);
        });
    }

    // Summary
    // Use marked to parse markdown (we will add the library to index.html)
    const summaryEl = document.getElementById('profile-summary');
    if (window.marked && data.content_summary) {
        summaryEl.innerHTML = marked.parse(data.content_summary);
    } else {
        summaryEl.textContent = data.content_summary || 'Brand content summary will appear here';
    }

    // Pages analyzed
    const pagesList = document.getElementById('profile-pages');
    pagesList.innerHTML = '';
    if (data.pages_analyzed && data.pages_analyzed.length > 0) {
        data.pages_analyzed.forEach(page => {
            const li = document.createElement('li');
            const urlObj = new URL(page);
            const displayPath = urlObj.pathname === '/' ? 'Home' : urlObj.pathname;
            li.innerHTML = `<a href="${page}" target="_blank">${displayPath}</a>`;
            pagesList.appendChild(li);
        });
    }
}

// Generate Calendar
generateCalendarBtn.addEventListener('click', async () => {
    await generateCalendar();
});

regenerateBtn.addEventListener('click', async () => {
    await generateCalendar();
});

async function generateCalendar() {
    if (!brandData) {
        showError(calendarError, 'Please analyze a brand first');
        return;
    }

    try {
        showElement(calendarLoading);
        hideElement(calendarError);
        hideElement(calendarContainer);

        const tone = contentToneSelect.value;

        const response = await fetch('/calendar/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                brand_data: brandData,
                tone
            })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Failed to generate calendar');
        }

        calendarData = result.calendar;
        displayCalendar(calendarData);
        hideElement(calendarLoading);
        showElement(calendarContainer);
        navigateToSection('calendar');

    } catch (error) {
        hideElement(calendarLoading);
        showError(calendarError, error.message);
        console.error('Error:', error);
    }
}

function displayCalendar(calendar) {
    calendarContainer.innerHTML = '';

    calendar.forEach((day, index) => {
        const card = document.createElement('div');
        card.className = 'calendar-card';
        card.innerHTML = `
            <div class="card-header">
                <div class="card-day">${day.day}</div>
                <div class="card-date">${day.date}</div>
                <div class="card-type">${day.content_type}</div>
            </div>
            <div class="card-content">
                ${day.image_url ? `<img src="${day.image_url}" class="calendar-img" alt="Post Image" style="width:100%; height:150px; object-fit:cover; border-radius:4px; margin-bottom:10px;">` : ''}
                <div class="post-text">${day.content}</div>
            </div>
            <div class="card-footer">
                <div class="card-status">Status: ${day.status}</div>
                <button class="btn btn-secondary btn-copy" data-index="${index}">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <rect x="6" y="2" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.5"/>
                        <path d="M2 6H5V12C5 12.5 5.5 13 6 13H12" stroke="currentColor" stroke-width="1.5"/>
                    </svg>
                    Copy
                </button>
            </div>
        `;
        calendarContainer.appendChild(card);
    });

    // Add copy functionality
    document.querySelectorAll('.btn-copy').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = btn.dataset.index;
            const content = calendarData[index].content;
            navigator.clipboard.writeText(content);

            const originalText = btn.innerHTML;
            btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8L6 11L13 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Copied!';

            setTimeout(() => {
                btn.innerHTML = originalText;
            }, 2000);
        });
    });
}

// Utility Functions
function showElement(el) {
    if (el) el.classList.remove('hidden');
}

function hideElement(el) {
    if (el) el.classList.add('hidden');
}

function showError(el, message) {
    if (el) {
        el.textContent = message;
        showElement(el);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Brand Content Studio loaded');
    navigateToSection('home');
});
