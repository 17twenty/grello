/**
 * Calculates the relative luminance of a color
 * Based on WCAG 2.0 guidelines
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const sRGB = c / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Parses a color string (hex, rgb, rgba) and returns RGB values
 */
function parseColor(color: string): { r: number; g: number; b: number; a?: number } | null {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      return {
        r: parseInt(hex[0] + hex[0], 16),
        g: parseInt(hex[1] + hex[1], 16),
        b: parseInt(hex[2] + hex[2], 16),
      };
    }
    if (hex.length === 6) {
      return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
      };
    }
  }

  // Handle rgb/rgba colors
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3]),
      a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : undefined,
    };
  }

  return null;
}

/**
 * Gets the computed background color of an element, accounting for transparency
 */
export function getEffectiveBackgroundColor(element: HTMLElement): string {
  let currentElement: HTMLElement | null = element;
  const colors: Array<{ r: number; g: number; b: number; a: number }> = [];

  // Traverse up the DOM tree collecting background colors
  while (currentElement) {
    const style = window.getComputedStyle(currentElement);
    const bgColor = style.backgroundColor;
    
    if (bgColor && bgColor !== 'transparent' && bgColor !== 'rgba(0, 0, 0, 0)') {
      const parsed = parseColor(bgColor);
      if (parsed) {
        colors.push({
          r: parsed.r,
          g: parsed.g,
          b: parsed.b,
          a: parsed.a ?? 1,
        });
        
        // If we hit a fully opaque color, we can stop
        if ((parsed.a ?? 1) >= 1) {
          break;
        }
      }
    }
    
    currentElement = currentElement.parentElement;
  }

  // If no colors found, assume white background
  if (colors.length === 0) {
    return 'rgb(255, 255, 255)';
  }

  // Composite colors from top to bottom
  let r = 255, g = 255, b = 255; // Start with white background
  
  for (let i = colors.length - 1; i >= 0; i--) {
    const color = colors[i];
    const alpha = color.a;
    r = Math.round(color.r * alpha + r * (1 - alpha));
    g = Math.round(color.g * alpha + g * (1 - alpha));
    b = Math.round(color.b * alpha + b * (1 - alpha));
  }

  return `rgb(${r}, ${g}, ${b})`;
}

/**
 * Determines if light or dark text should be used based on background color
 * @param backgroundColor - CSS color string (hex, rgb, rgba)
 * @param lightColor - Color to use for light text (default: white)
 * @param darkColor - Color to use for dark text (default: dark gray)
 * @returns The appropriate text color
 */
export function getContrastColor(
  backgroundColor: string,
  lightColor: string = '#ffffff',
  darkColor: string = '#1f2937'
): string {
  const parsed = parseColor(backgroundColor);
  if (!parsed) {
    return darkColor; // Default to dark if we can't parse
  }

  const luminance = getLuminance(parsed.r, parsed.g, parsed.b);
  
  // WCAG threshold: 0.5 is a good middle ground
  // For semi-transparent backgrounds, adjust threshold based on alpha
  const threshold = parsed.a !== undefined ? 0.5 + (1 - parsed.a) * 0.2 : 0.5;
  
  return luminance > threshold ? darkColor : lightColor;
}

/**
 * React hook to dynamically determine text color based on element's background
 */
export function useContrastColor(
  elementRef: React.RefObject<HTMLElement>,
  lightColor: string = '#ffffff',
  darkColor: string = '#1f2937'
): string {
  const [textColor, setTextColor] = React.useState(darkColor);

  React.useEffect(() => {
    if (!elementRef.current) return;

    const updateTextColor = () => {
      if (!elementRef.current) return;
      const bgColor = getEffectiveBackgroundColor(elementRef.current);
      const color = getContrastColor(bgColor, lightColor, darkColor);
      setTextColor(color);
    };

    updateTextColor();

    // Update on resize or when background might change
    const observer = new MutationObserver(updateTextColor);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'style'],
      subtree: true,
    });

    window.addEventListener('resize', updateTextColor);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateTextColor);
    };
  }, [elementRef, lightColor, darkColor]);

  return textColor;
}

// Export React for the hook
import React from 'react';
