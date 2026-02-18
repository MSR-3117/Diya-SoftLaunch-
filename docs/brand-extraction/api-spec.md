# Brand Extraction: API Specification

The Brand Extraction flow is accessible via a single POST endpoint on the Flask backend.

## Endpoint: `/brand/analyze` [POST]

Analyzes a brand based on a URL or manual input.

### Request Body

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `source` | `string` | Yes | Either `"url"` or `"manual"`. |
| `url` | `string` | No* | The website URL to analyze (Required if `source="url"`). |
| `brandName` | `string` | No** | Manual brand name (Required if `source="manual"`). |
| `brandDescription` |`string` | No | Manual description. |

### Response Schema (`BrandAssets`)

```json
{
  "success": true,
  "brand_data": {
    "name": "Brand Name",
    "description": "Short meta description or summary.",
    "tagline": "Inferred or official tagline.",
    "colors": [["#HEX", "Label"], ...],
    "fonts": ["Font Family", ...],
    "logo_url": "URL to active logo",
    "content_summary": "Extensive AI-generated brand profile.",
    "strategy": {
      "brand_archetype": "string",
      "brand_voice": "string",
      "content_pillars": ["string", ...],
      "visual_style_guide": ["string", ...],
      "target_audience": "string"
    },
    "brand_vibe": ["word", ...],
    "pages_analyzed": ["url", ...]
  }
}
```

## Integration Checklist for UI Changes

When modifying the Frontend `BrandIntake.jsx` or creating a new extraction UI, ensure:
1. **Stateless Hand-off:** The `brand_data` returned from this API must be stored in the `BrandContext`.
2. **Fallback Handling:** If the API returns `success: false` or a partial object, the UI should provide a "Manual Correction" state.
3. **Data Mapping:** The UI components should read from the `strategy` object for richer content cues, not just the basic `description`.
