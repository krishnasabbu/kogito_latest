/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Wells Fargo Brand Colors
        'wells-red': '#C40404',
        'wells-red-hover': '#E03535',
        'wells-gold': '#FFD700',
        
        // Light Mode Colors
        light: {
          bg: '#FFFFFF',
          surface: '#F5F5F5',
          'text-primary': '#1E1E1E',
          'text-secondary': '#444444',
          border: '#E5E5E5',
          hover: '#F0F0F0',
        },
        
        // Dark Mode Colors
        dark: {
          bg: '#121212',
          surface: '#1A1A1A',
          'surface-alt': '#2A2A2A',
          'text-primary': '#FFFFFF',
          'text-default': '#E0E0E0',
          'text-secondary': '#B0B0B0',
          border: '#333333',
          hover: '#2A2A2A',
        },
        
        // Status Colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      width: {
        'card': '28rem',
      },
      borderRadius: {
        'card': '1.25rem',
      },
      boxShadow: {
        'card': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'card-dark': '0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.2)',
      },
      fontFamily: {
        'wells': ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
