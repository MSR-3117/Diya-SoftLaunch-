import React, { createContext, useContext, useState, useCallback } from 'react';
import { analyzeBrand as analyzeBrandAPI, generateContent as generateContentAPI } from '../services/api';

// Create the context
const BrandContext = createContext(null);

// Provider component
export function BrandProvider({ children }) {
    // The URL being analyzed
    const [url, setUrl] = useState('');

    // Brand data from API response
    const [brandData, setBrandData] = useState(null);

    // Content settings from ContentDirection page
    const [contentSettings, setContentSettings] = useState({
        platforms: [],
        frequency: '3/week'
    });

    // Generated posts from AI
    const [generatedPosts, setGeneratedPosts] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Analyze brand from URL
    const analyzeBrand = useCallback(async (brandUrl) => {
        setLoading(true);
        setError(null);

        try {
            const data = await analyzeBrandAPI(brandUrl);
            setBrandData(data);
            return data;
        } catch (err) {
            setError(err.message || 'Failed to analyze brand');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // Generate content calendar
    const generateContent = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const posts = await generateContentAPI(
                brandData,
                contentSettings.platforms,
                contentSettings.frequency
            );
            setGeneratedPosts(posts);
            return posts;
        } catch (err) {
            setError(err.message || 'Failed to generate content');
            throw err;
        } finally {
            setLoading(false);
        }
    }, [brandData, contentSettings]);

    // Clear all data (for reset/logout)
    const clearBrandData = useCallback(() => {
        setUrl('');
        setBrandData(null);
        setContentSettings({ platforms: [], frequency: '3/week' });
        setGeneratedPosts([]);
        setError(null);
    }, []);

    const value = {
        // State
        url,
        brandData,
        contentSettings,
        generatedPosts,
        loading,
        error,

        // Actions
        setUrl,
        setBrandData,
        setContentSettings,
        setGeneratedPosts,
        analyzeBrand,
        generateContent,
        clearBrandData,
    };

    return (
        <BrandContext.Provider value={value}>
            {children}
        </BrandContext.Provider>
    );
}

// Custom hook to use the context
export function useBrand() {
    const context = useContext(BrandContext);
    if (!context) {
        throw new Error('useBrand must be used within a BrandProvider');
    }
    return context;
}

export default BrandContext;
