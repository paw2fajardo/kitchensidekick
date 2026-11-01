import type { Config } from 'tailwindcss';

export const designTokens = {
  colors: {
    canvas: '#F5F5F0',
    surface: '#FFFFFF',
    'surface-subtle': '#ECEDE7',
    'text-primary': '#20251F',
    'text-secondary': '#5F675F',
    'text-disabled': '#8E968E',
    border: '#D9DDD4',
    'border-strong': '#8E968E',
    primary: '#245C43',
    'primary-hover': '#194A35',
    'primary-subtle': '#E4EEE7',
    'on-primary': '#FFFFFF',
    success: '#287A4B',
    warning: '#A86416',
    danger: '#B33B32',
    info: '#356B8C',
    focus: '#245C43',
    phase: {
      prep: '#537B60',
      sauce: '#B17A3D',
      'sauce-text': '#8A5A22',
      cooking: '#A65B45',
    },
  },
  fontSize: {
    display: ['clamp(2rem, 4vw, 2.5rem)', { lineHeight: '1.2', fontWeight: '700' }],
    page: ['clamp(1.625rem, 3vw, 2rem)', { lineHeight: '1.25', fontWeight: '700' }],
    section: ['clamp(1.25rem, 2.2vw, 1.5rem)', { lineHeight: '1.3', fontWeight: '650' }],
    instruction: ['clamp(1.25rem, 2vw, 1.5rem)', { lineHeight: '1.5', fontWeight: '500' }],
    'task-title': ['clamp(1.125rem, 1.8vw, 1.375rem)', { lineHeight: '1.35', fontWeight: '600' }],
    body: ['clamp(1rem, 1.5vw, 1.125rem)', { lineHeight: '1.5', fontWeight: '400' }],
    supporting: ['clamp(0.875rem, 1.2vw, 1rem)', { lineHeight: '1.4', fontWeight: '400' }],
    micro: ['0.75rem', { lineHeight: '1.3', fontWeight: '600' }],
  },
  borderRadius: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '14px',
    '2xl': '16px',
  },
  boxShadow: {
    none: 'none',
    overlay: '0 4px 20px rgba(0, 0, 0, 0.08)',
  },
  minHeight: {
    touch: '48px',
    cta: '56px',
    card: '72px',
  },
  minWidth: {
    touch: '48px',
  },
};

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: designTokens.colors,
      fontSize: designTokens.fontSize,
      borderRadius: designTokens.borderRadius,
      boxShadow: designTokens.boxShadow,
      minHeight: designTokens.minHeight,
      minWidth: designTokens.minWidth,
    },
  },
  plugins: [],
};

export default config;
