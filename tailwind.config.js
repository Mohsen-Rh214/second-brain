/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#0D1117',      // Very dark, slightly blue-black
        'surface': 'rgba(21, 28, 39, 0.7)', // Translucent, slightly lighter dark blue
        'outline': 'rgba(139, 148, 158, 0.2)', // Soft gray outline for glass effect
        'outline-dark': 'rgba(139, 148, 158, 0.3)', // Slightly more prominent outline

        'accent': '#22D3EE',              // Bright Cyan
        'accent-hover': '#67E8F9',        // Lighter Cyan for hover
        'accent-content': '#0D1117',      // Dark text on accent for contrast

        'secondary': 'rgba(30, 41, 59, 0.7)', // Translucent Slate-800
        'secondary-hover': 'rgba(51, 65, 85, 0.7)', // Translucent Slate-700
        'secondary-content': '#F1F5F9',   // Slate-100

        'neutral': 'rgba(255, 255, 255, 0.05)', // Subtle light hover on dark
        'neutral-hover': 'rgba(255, 255, 255, 0.1)', // Slightly brighter hover
        'neutral-content': '#94A3B8',          // Slate-400

        'text-primary': '#F1F5F9',         // Slate-100
        'text-secondary': '#94A3B8',       // Slate-400
        'text-tertiary': '#64748B',        // Slate-500

        'destructive': '#F43F5E',          // Rose-500
        'destructive-hover': '#E11D48',    // Rose-600
        'destructive-content': '#FFFFFF',  // White text
        
        'vibrant-purple': '#C084FC', // for graph nodes

        // Vibrant palette for priorities
        'priority-high': '#F43F5E',        // Rose-500
        'priority-high-bg': 'rgba(244, 63, 94, 0.15)',
        'priority-medium': '#22D3EE',      // Cyan-400
        'priority-medium-bg': 'rgba(34, 211, 238, 0.15)',
        'priority-low': '#4ADE80',         // Green-400
        'priority-low-bg': 'rgba(74, 222, 128, 0.15)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'sm': '0 2px 4px 0 rgb(0 0 0 / 0.03)',
        'DEFAULT': '0 4px 12px 0 rgb(0 0 0 / 0.05)',
        'md': '0 8px 16px 0 rgb(0 0 0 / 0.05)',
        'lg': '0 16px 32px -8px rgb(0 0 0 / 0.07)',
      },
      borderRadius: {
        'lg': '1rem', // 16px
        'xl': '1.25rem', // 20px
        'full': '9999px',
      },
      backdropBlur: {
        'xl': '24px',
      }
    },
  },
  plugins: [],
}