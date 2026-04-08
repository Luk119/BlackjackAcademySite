import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        felt: {
          DEFAULT: '#1a4731',
          dark: '#0f2d1e',
          light: '#245c3f',
        },
        gold: {
          DEFAULT: '#d4af37',
          light: '#f0cc5f',
          dark: '#a88a1c',
        },
        chip: {
          red: '#e53e3e',
          blue: '#3182ce',
          green: '#38a169',
          black: '#1a1a1a',
        },
      },
      fontFamily: {
        casino: ['Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'card-deal': 'cardDeal 0.3s ease-out',
        'card-flip': 'cardFlip 0.4s ease-in-out',
        'chip-slide': 'chipSlide 0.25s ease-out',
        'pulse-gold': 'pulseGold 2s infinite',
        'count-change': 'countChange 0.3s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'win-glow': 'winGlow 1s ease-in-out 3',
      },
      keyframes: {
        cardDeal: {
          '0%': { transform: 'translateY(-100px) rotate(-5deg)', opacity: '0' },
          '100%': { transform: 'translateY(0) rotate(0)', opacity: '1' },
        },
        cardFlip: {
          '0%': { transform: 'rotateY(0)' },
          '50%': { transform: 'rotateY(90deg)' },
          '100%': { transform: 'rotateY(0)' },
        },
        chipSlide: {
          '0%': { transform: 'translateX(-20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGold: {
          '0%, 100%': { boxShadow: '0 0 5px #d4af37' },
          '50%': { boxShadow: '0 0 20px #d4af37, 0 0 40px #d4af37' },
        },
        countChange: {
          '0%': { transform: 'scale(1.4)', color: '#fbbf24' },
          '100%': { transform: 'scale(1)', color: 'inherit' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-4px)' },
          '75%': { transform: 'translateX(4px)' },
        },
        winGlow: {
          '0%, 100%': { boxShadow: 'none' },
          '50%': { boxShadow: '0 0 20px #38a169, 0 0 40px #38a169' },
        },
      },
      backgroundImage: {
        'felt-texture': "url('/felt-texture.svg')",
        'card-back': "url('/card-back.svg')",
      },
    },
  },
  plugins: [],
};

export default config;
