/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        deep: '#0a1628',
        mid: '#1e3a5f',
        surface: '#2563eb',
        light: '#60a5fa',
        foam: '#e0f2fe',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Noto Sans KR', 'sans-serif'],
      },
      animation: {
        slideUp: 'slideUp 0.3s ease forwards',
      },
      keyframes: {
        slideUp: {
          from: {
            opacity: '0',
            transform: 'translateY(10px)',
          },
          to: {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      transitionDuration: {
        '400': '400ms',
      },
    },
  },
  plugins: [],
}
