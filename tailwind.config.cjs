/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        steel: {
          50: '#d9ecff',
          100: '#b7d6f6',
          300: '#6f97c8',
          500: '#345579',
          700: '#1b2c44',
          900: '#0c1421'
        },
        accent: {
          400: '#4bd6ff',
          500: '#1fb8ef'
        }
      },
      boxShadow: {
        glass: '0 10px 40px rgba(2, 10, 20, 0.45)',
        glow: '0 0 20px rgba(75, 214, 255, 0.32)'
      },
      fontFamily: {
        display: ['Motiva Sans', 'Trebuchet MS', 'Arial', 'sans-serif'],
        body: ['Motiva Sans', 'Trebuchet MS', 'Arial', 'sans-serif']
      }
    }
  },
  plugins: []
};
