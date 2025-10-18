// Extract SVG from response text
export function extractSVG(text: string): string | null {
  const svgRegex = /<svg[\s\S]*?<\/svg>/i;
  const match = text.match(svgRegex);
  return match ? match[0] : null;
}

// Comprehensive SVG validation
export function validateSVG(svg: string): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if it's a valid SVG
  if (!svg.includes('<svg') || !svg.includes('</svg>')) {
    errors.push('Not a valid SVG element');
    return { isValid: false, errors, warnings };
  }

  // Check for viewBox
  if (!svg.includes('viewBox="0 0 32 32"')) {
    errors.push('Missing or incorrect viewBox (must be "0 0 32 32")');
  }

  // Check for allowed colors only
  const colorRegex = /(?:fill|stroke)="(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|none)"/g;
  const matches = svg.match(colorRegex);
  if (matches) {
    const allowedColors = ['#ffffff', '#000000', '#808080', '#fff', '#000', 'none'];
    for (const match of matches) {
      const color = match.match(/(#[0-9A-Fa-f]{6}|#[0-9A-Fa-f]{3}|none)/)?.[0];
      if (color && !allowedColors.includes(color.toLowerCase())) {
        errors.push(`Invalid color: ${color} (only #FFFFFF, #000000, #808080, or none allowed)`);
      }
    }
  }

  // Check for stroke width consistency
  const strokeWidthRegex = /stroke-width="([^"]*)"/g;
  const strokeMatches = svg.match(strokeWidthRegex);
  if (strokeMatches) {
    for (const match of strokeMatches) {
      const width = match.match(/stroke-width="([^"]*)"/)?.[1];
      if (width && width !== '2') {
        warnings.push(`Stroke width should be 2px, found: ${width}px`);
      }
    }
  }

  // Check for allowed elements only
  const allowedElements = ['circle', 'rect', 'line', 'polygon', 'path', 'svg'];
  const elementRegex = /<(\w+)/g;
  const elementMatches = svg.match(elementRegex);
  if (elementMatches) {
    for (const match of elementMatches) {
      const element = match.match(/<(\w+)/)?.[1];
      if (element && !allowedElements.includes(element.toLowerCase())) {
        warnings.push(`Unexpected element: ${element} (only circle, rect, line, polygon, path allowed)`);
      }
    }
  }

  // Check for forbidden attributes
  const forbiddenAttrs = ['gradient', 'filter', 'shadow', 'blur', 'text'];
  for (const attr of forbiddenAttrs) {
    if (svg.toLowerCase().includes(attr)) {
      warnings.push(`Found potentially forbidden attribute: ${attr}`);
    }
  }


  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// Sanitize SVG for security
export function sanitizeSVG(svg: string): string {
  // Remove any script tags or event handlers
  return svg
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '');
}

// Fix common SVG issues
export function fixSVG(svg: string): string {
  let fixed = svg;

  // Ensure proper viewBox
  if (!fixed.includes('viewBox=')) {
    fixed = fixed.replace('<svg', '<svg viewBox="0 0 32 32"');
  }

  // Ensure xmlns
  if (!fixed.includes('xmlns=')) {
    fixed = fixed.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  // Fix stroke-width if missing
  if (fixed.includes('stroke=') && !fixed.includes('stroke-width=')) {
    fixed = fixed.replace(/stroke="[^"]*"/g, (match) => `${match} stroke-width="2"`);
  }

  return fixed;
}

// Transform SVG colors
export function transformSVGColor(svg: string, newColor: string): string {
  const allowedColors = ['#ffffff', '#000000', '#808080'];
  if (!allowedColors.includes(newColor.toLowerCase())) {
    throw new Error('Invalid color. Only #FFFFFF, #000000, or #808080 allowed.');
  }

  // Replace all color values with the new color
  return svg
    .replace(/fill="#[0-9A-Fa-f]{6}"/g, `fill="${newColor}"`)
    .replace(/fill="#[0-9A-Fa-f]{3}"/g, `fill="${newColor}"`)
    .replace(/stroke="#[0-9A-Fa-f]{6}"/g, `stroke="${newColor}"`)
    .replace(/stroke="#[0-9A-Fa-f]{3}"/g, `stroke="${newColor}"`);
}
