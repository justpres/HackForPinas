/**
 * Universal "Design 3's" Framework - Design Tokens Specification
 * Version 2.0.0 (Universal Edition)
 */

export const DESIGN_3_TOKENS = {
  // 1. Spacing (4pt Grid System)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 40,
  },

  // 2. Radii
  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    sheet: 24,
    pill: 999,
  },

  // 3. Typography Scale
  typography: {
    display: { size: 28, lineHeight: 34, weight: '800', letterSpacing: -0.5 },
    headline: { size: 22, lineHeight: 28, weight: '700', letterSpacing: -0.3 },
    title: { size: 18, lineHeight: 24, weight: '700', letterSpacing: 0 },
    subTitle: { size: 16, lineHeight: 22, weight: '600', letterSpacing: 0 },
    body: { size: 15, lineHeight: 22, weight: '400', letterSpacing: 0 },
    bodyMuted: { size: 14, lineHeight: 20, weight: '400', letterSpacing: 0 },
    caption: { size: 12, lineHeight: 16, weight: '500', letterSpacing: 0 },
    labelUpper: { size: 11, lineHeight: 14, weight: '700', letterSpacing: 0.8, transform: 'uppercase' },
  },

  // 4. Elevation & Depth
  elevation: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.08,
      shadowRadius: 3,
      elevation: 2,
    },
    modal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
} as const;

export type DesignTokens = typeof DESIGN_3_TOKENS;
