/**
 * Helali brand — teal-emerald derived from landing hero (`landing.jpg`).
 * Structure keeps the hero depth; primary is lifted for readable UI.
 * Keep in sync with `src/app/globals.css` and `.cursor/rules/ui.mdc`.
 * Distinct from Jaryan green (`#006b3f`).
 */
export const BRAND_COLORS = {
  primary: '#0f6e61',
  primaryHover: '#0c574d',
  primarySoft: '#edf7f5',
  primaryForeground: '#ffffff',
  accent: '#178a7a',
  accentHover: '#146f63',
  accentForeground: '#ffffff',
  structure: '#164842',
  ink: '#12201e',
  paper: '#f7faf9',
} as const;

export const BRAND_COLORS_DARK = {
  primary: '#3ecfba',
  primaryHover: '#5fd9c8',
  primarySoft: '#12302c',
  primaryForeground: '#06221e',
  accent: '#5fd9c8',
  accentHover: '#8ae4d7',
  accentForeground: '#06221e',
  structure: '#164842',
  ink: '#f3faf8',
  paper: '#0b1412',
} as const;
