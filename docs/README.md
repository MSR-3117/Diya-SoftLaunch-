# DIYA Backend Documentation

This directory contains technical documentation for DIYA's backend services and data flows. The documentation is organized by "Flows" to facilitate future UI changes and feature expansions.

## Active Backend Flows

### 1. [Brand Extraction](./brand-extraction/architecture.md)
The core engine for scraping websites, fetching verified brand assets, and synthesizing a brand profile using AI.

### 2. [Image Generation](../image-generation-flow/docs/architecture.md)
Composes branded social media post images using brand persona assets (logo, fonts, colors). Returns position metadata for editing.

### 3. [Image Editor](../image-editor-flow/docs/architecture.md)
Handles image transformations including text editing and logo repositioning on generated images.

### 4. Content Calendar Generation (Planned)
The system for generating platform-specific social posts and scheduling.

---

## Documentation Strategy

Documentation is split into specific subfolders for each major backend flow. This allows developers to:
- Understand the data lifecycle independently of the current UI.
- Modify UI components while maintaining consistent API integration.
- Track external dependencies (Gemini, BrandFetch) used in each flow.
