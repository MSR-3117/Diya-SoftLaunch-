// API Service for DIYA React Frontend
// Communicates with brand_content_studio Flask backend

const API_BASE_URL = 'http://localhost:5001';

/**
 * Analyze brand from URL
 * @param {string} url - Website URL to analyze
 * @returns {Promise<Object>} Brand data including name, tagline, colors, fonts, content_summary
 */
export async function analyzeBrand(url) {
    const response = await fetch(`${API_BASE_URL}/brand/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            source: 'url',
            url: url
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Brand analysis failed');
    }

    return data.brand_data;
}

/**
 * Generate content calendar
 * @param {Object} brandData - Brand data from analysis
 * @param {string} tone - Content tone (professional, casual, inspirational, educational, playful)
 * @returns {Promise<Array>} 7-day content calendar
 */
export async function generateCalendar(brandData, tone = 'professional') {
    const response = await fetch(`${API_BASE_URL}/calendar/generate`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            brand_data: brandData,
            tone: tone
        }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.error || 'Calendar generation failed');
    }

    return data.calendar;
}

/**
 * Health check for backend connection
 * @returns {Promise<boolean>} True if backend is healthy
 */
export async function checkHealth() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const data = await response.json();
        return data.status === 'ok';
    } catch {
        return false;
    }
}
