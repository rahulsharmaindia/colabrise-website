import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0a1a',
          800: '#111127',
          700: '#1a1a3e',
          600: '#252550',
        },
        brand: {
          pink: '#f472b6',
          violet: '#a855f7',
          cyan: '#22d3ee',
          purple: '#8b5cf6',
        },
      },
      fontFamily: {
        sans: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Syne', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%': { opacity: '0.5' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}

export default config
