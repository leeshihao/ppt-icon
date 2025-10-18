import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { extractSVG, validateSVG, sanitizeSVG, fixSVG } from '../../../utils/svgValidator';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const ICON_GENERATION_PROMPT = `You are an expert icon designer. Generate a minimalist SVG icon based on the user's description.

STRICT REQUIREMENTS:
- Output ONLY the SVG code, nothing else (no markdown, no explanations)
- viewBox must be "0 0 32 32"
- Background must be transparent (no background elements)
- Use ONLY these colors: #FFFFFF (white), #000000 (black), or #808080 (grey)
- Use ONLY geometric primitives: <circle>, <rect>, <line>, <polygon>, <path>
- All strokes must be exactly 2px width
- Keep the design minimal - use 3-7 shapes maximum
- No gradients, shadows, or effects
- No text elements

EXAMPLES:

Home icon:
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <polygon points="16,6 6,16 10,16 10,26 22,26 22,16 26,16" fill="none" stroke="#000000" stroke-width="2"/>
</svg>

Settings gear:
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="16" r="5" fill="none" stroke="#000000" stroke-width="2"/>
  <rect x="15" y="4" width="2" height="6" fill="#000000"/>
  <rect x="15" y="22" width="2" height="6" fill="#000000"/>
  <rect x="4" y="15" width="6" height="2" fill="#000000"/>
  <rect x="22" y="15" width="6" height="2" fill="#000000"/>
</svg>

User profile:
<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <circle cx="16" cy="12" r="6" fill="none" stroke="#000000" stroke-width="2"/>
  <path d="M8 26c0-4.4 3.6-8 8-8s8 3.6 8 8" fill="none" stroke="#000000" stroke-width="2"/>
</svg>

USER DESCRIPTION: {description}

Generate the SVG now (always use black #000000 for all elements):`;

const FALLBACK_PROMPT = `Create a simple SVG icon. Use ONLY this exact format:

<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <!-- Your shapes here -->
</svg>

RULES:
- Use only: circle, rect, line, polygon, path
- Colors: #000000 (black) only
- Stroke width: 2px
- No fill, only stroke
- 3-5 shapes maximum

Description: {description}

SVG:`;

export async function POST(request: NextRequest) {
  try {
    const { description } = await request.json();

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    const prompt = ICON_GENERATION_PROMPT
      .replace('{description}', description);

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: prompt
      }]
    });

    let svgContent = response.content[0].type === 'text' ? response.content[0].text : '';
    
    // Extract SVG from response
    const extractedSVG = extractSVG(svgContent);
    if (!extractedSVG) {
      return NextResponse.json(
        { error: 'No valid SVG found in response' },
        { status: 500 }
      );
    }

    // Sanitize and fix the SVG
    let processedSVG = sanitizeSVG(extractedSVG);
    processedSVG = fixSVG(processedSVG);

    // Validate the SVG
    const validation = validateSVG(processedSVG);
    
    if (!validation.isValid) {
      console.warn('SVG validation errors, trying fallback prompt:', validation.errors);
      
      // Try fallback prompt
      try {
        const fallbackPrompt = FALLBACK_PROMPT
          .replace('{description}', description);

        const fallbackResponse = await anthropic.messages.create({
          model: "claude-sonnet-4-5-20250929",
          max_tokens: 500,
          messages: [{
            role: "user",
            content: fallbackPrompt
          }]
        });

        const fallbackSVG = extractSVG(fallbackResponse.content[0].type === 'text' ? fallbackResponse.content[0].text : '');
        if (fallbackSVG) {
          const processedFallback = sanitizeSVG(fallbackSVG);
          const fixedFallback = fixSVG(processedFallback);
          const fallbackValidation = validateSVG(fixedFallback);
          
          if (fallbackValidation.isValid) {
            return NextResponse.json({ 
              svg: fixedFallback,
              warnings: [...validation.warnings, ...fallbackValidation.warnings, 'Used fallback prompt']
            }, {
              headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              }
            });
          }
        }
      } catch (fallbackError) {
        console.error('Fallback prompt also failed:', fallbackError);
      }

      return NextResponse.json(
        { 
          error: 'Generated SVG does not meet requirements',
          details: validation.errors,
          warnings: validation.warnings
        },
        { 
          status: 500,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
    }

    // Log warnings for debugging
    if (validation.warnings.length > 0) {
      console.warn('SVG validation warnings:', validation.warnings);
    }

    return NextResponse.json({ 
      svg: processedSVG,
      warnings: validation.warnings
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error generating icon:', error);
    return NextResponse.json(
      { error: 'Failed to generate icon' },
      { status: 500 }
    );
  }
}
