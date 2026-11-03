/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cinema: {
          dark: '#080c14',       // Deepest navy/black
          card: '#0f172a',       // Dark navy slate
          cardLight: '#1e293b',
          border: '#334155',
          accent: '#e50914',     // Netflix/Cinematic Red
          accentHover: '#b80710',
          amber: '#f59e0b',      // Golden amber for ratings
          available: '#10b981',  // Emerald Green for available seats
          selected: '#3b82f6',   // Bright Blue for selected seats
          booked: '#ef4444',     // Red for booked seats
        },
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        'glow-red': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'glow-blue': '0 0 25px -5px rgba(59, 130, 246, 0.4)',
      },
    },
  },
  plugins: [],
}
