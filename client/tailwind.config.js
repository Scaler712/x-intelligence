/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'electric-lime': '#d4ff4a',
        'electric-lime-glow': 'rgba(212, 255, 74, 0.3)',
        'electric-dark': '#0a0a0a',
        'electric-muted': '#1a1a1a',
        'electric-border': '#2a2a2a',
        'electric-text': '#ffffff',
        'electric-text-muted': '#a0a0a0'
      }
    },
  },
  plugins: [],
}

