AI Icon Builder - Product Requirements Document
Project Overview
Timeline: 3 hours
Goal: Generate consistent, minimalist icons from text descriptions using AI
Primary Model: Claude (Sonnet 4.5)
Stretch Goal: Multi-model comparison

User Flow

User enters icon description (e.g., "save button", "growth concept", "user profile")
Click "Generate Icon"
AI generates SVG with enforced style constraints
Icon displays with transparent background
User downloads SVG or regenerates for variation


Core Features (Must-Have)
1. Input Interface

Text input field for icon description
Placeholder examples: "home icon", "notification bell", "save button"
Generate button
Optional: Color selector (White/Black/Grey) - applied before generation

2. AI Generation Engine
Model: Claude API (Sonnet 4.5)
Prompt Template:

Enforces transparent background
Limits to geometric shapes (circles, rectangles, lines, triangles)
Restricts colors to white (#FFFFFF), black (#000000), or grey (#808080)
Sets 32x32 viewBox
Enforces 2px consistent stroke width
Requires minimalist, clean design

Output: Raw SVG code
3. Icon Display

Preview area: Shows generated icon at visible size (128px or 256px display)
Transparent background (checkerboard pattern to show transparency)
Actual size: 32x32 viewport in SVG

4. Controls

Regenerate button - same description, new variation
Download SVG button - saves file as icon-[timestamp].svg
Optional: Edit description - modify and regenerate

5. Style System (Enforced via AI Prompt)

Background: Always transparent
Fill colors: White OR Black OR Grey (#808080) only
Shapes: Geometric primitives only (circle, rect, line, polygon)
Stroke: 2px consistent width
Style: Minimalist, flat, no gradients or effects


Technical Specifications
Stack

Frontend: Next.js 15.5.6 with React 19
Styling: Tailwind CSS 4
API: Claude API via Anthropic SDK
SVG Rendering: Direct DOM injection
Backend: Next.js API Routes

API Integration
```javascript
// API Route: /app/api/generate-icon/route.ts
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: Request) {
  const { description, color } = await request.json();
  
  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1000,
    messages: [{
      role: "user",
      content: ICON_GENERATION_PROMPT.replace('{description}', description).replace('{color}', color)
    }]
  });
  
  return Response.json({ svg: response.content[0].text });
}
```

Environment Setup
```bash
# .env.local
ANTHROPIC_API_KEY=your_api_key_here
```

Prompt Template (Primary)

SVG Validation & Processing
- Extract SVG from response using regex: /<svg[\s\S]*?<\/svg>/i
- Basic validation: Check for viewBox="0 0 32 32"
- Fallback: If invalid SVG, show error message with retry option
- Sanitization: Basic XML validation to prevent XSS

### File Structure
```
/src
  /app
    /api/generate-icon
      route.ts              // API endpoint
    /components
      IconGenerator.tsx     // Main component
      IconPreview.tsx       // Display area
      IconControls.tsx      // Buttons & inputs
      LoadingSpinner.tsx    // Loading state
    /utils
      promptTemplate.ts     // SVG generation prompt
      svgValidator.ts       // SVG validation logic
    globals.css
    layout.tsx
    page.tsx
  .env.local               // API keys
```

Loading States & UX
- Generate button shows spinner and "Generating..." text during API call
- Button disabled during generation to prevent multiple requests
- Loading spinner: Simple CSS spinner or Tailwind animate-spin
- Initial state: Empty preview with placeholder text "Enter description to generate icon"

Error Handling
- API failures: Show "Generation failed. Please try again." with retry button
- Invalid SVG: Show "Invalid icon generated. Try again." with retry button
- Empty input: Disable generate button, show "Enter a description" hint
- Network timeout: Show "Request timed out. Check connection and try again."
- Rate limiting: Show "Too many requests. Please wait a moment."

Out of Scope (3-Hour Limit)
Won't Build

❌ Icon editing after generation
❌ Save/load projects
❌ Icon library/history
❌ Batch generation
❌ Custom color pickers
❌ Animation
❌ Multiple sizes in one generation

Stretch Goals (If Time Permits)

✅ Model selector dropdown (GPT-4, Gemini, Manus)
✅ Gallery of generated icons in session
✅ Copy SVG code button
✅ Dark/light mode toggle for preview

Success Criteria
Functional

✅ User can generate icon from description in <10 seconds
✅ All icons maintain consistent style (geometric, minimal)
✅ Downloaded SVG has transparent background
✅ At least 90% of generations follow color constraints

Demo Quality

✅ Works reliably for 5+ consecutive generations
✅ UI is clean and intuitive
✅ Fast response time (<5 seconds per generation)
✅ Error handling for API failures

Example Descriptions to Test

"home icon"
"settings gear"
"user profile"
"save/download"
"notification bell"
"search magnifying glass"
"the concept of growth"
"connection between people"
```

The key additions include:

1. **Technical Stack Details**: Next.js API routes, environment setup
2. **Complete Prompt Template**: Ready-to-use template with placeholders
3. **SVG Validation Strategy**: Regex extraction and basic validation
4. **Loading States**: Specific UX for spinner and button states
5. **Error Handling**: Comprehensive error scenarios with user-friendly messages
6. **File Structure**: Updated to reflect Next.js 13+ app directory structure
7. **API Integration**: Complete code example for the API route
