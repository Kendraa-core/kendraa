/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        azure: {
          50: '#f0f8ff',
          100: '#e0f0ff',
          200: '#b3d9ff',
          300: '#80bfff',
          400: '#4da6ff',
          500: '#007FFF', // Azure Blue
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        primary: {
          50: '#f0f8ff',
          100: '#e0f0ff',
          200: '#b3d9ff',
          300: '#80bfff',
          400: '#4da6ff',
          500: '#007FFF', // Azure Blue
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        secondary: {
          50: '#f0f8ff',
          100: '#e0f0ff',
          200: '#b3d9ff',
          300: '#80bfff',
          400: '#4da6ff',
          500: '#007FFF', // Azure Blue
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        accent: {
          50: '#f0f8ff',
          100: '#e0f0ff',
          200: '#b3d9ff',
          300: '#80bfff',
          400: '#4da6ff',
          500: '#007FFF', // Azure Blue
          600: '#0066cc',
          700: '#004d99',
          800: '#003366',
          900: '#001a33',
        },
        neutral: {
          50: '#fafafa',   /* Pure backgrounds */
          100: '#f5f5f5',  /* Light backgrounds */
          200: '#e5e5e5',  /* Borders, dividers */
          300: '#d4d4d4',  /* Disabled states */
          400: '#a3a3a3',  /* Placeholder text */
          500: '#737373',  /* Secondary text */
          600: '#525252',  /* Primary text */
          700: '#404040',  /* Headings */
          800: '#262626',  /* Strong emphasis */
          900: '#171717',  /* Maximum contrast */
          950: '#0a0a0a',  /* Pure black alternative */
        },
        // Medical-specific colors
        medical: {
          'scrub-green': '#016064',  /* Traditional medical scrubs */
          'mint': '#98e4d6',         /* Calming mint for backgrounds */
          'navy': '#1e40af',         /* Professional navy for headers */
          'silver': '#e5e7eb',       /* Medical equipment silver */
        },
        // Semantic colors
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        warning: {
          50: '#fffbeb',
          100: '#fef3c7',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        },
        info: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        // Legacy colors (keeping for compatibility)
        'linkedin-primary': '#0a66c2',
        'linkedin-secondary': '#004182',
        'linkedin-accent': '#0073b1',
        'linkedin-light': '#eef3f8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
        glacial: ['Glacial Indifference', 'sans-serif'],
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-out',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 20%, 53%, 80%, 100%': { transform: 'translateY(0)' },
          '40%, 43%': { transform: 'translateY(-4px)' },
          '70%': { transform: 'translateY(-2px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(20, 184, 166, 0.3)' },
          '100%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.4)' },
        },
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'medical-gradient': 'linear-gradient(135deg, #14b8a6 0%, #22c55e 100%)',
        'medical-gradient-subtle': 'linear-gradient(135deg, #f0fdfa 0%, #f0fdf4 100%)',
        'medical-gradient-warm': 'linear-gradient(135deg, #14b8a6 0%, #eab308 100%)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'medical': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'medical-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'medical-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        'medical-glow': '0 0 20px rgba(20, 184, 166, 0.3)',
        'medical-glow-lg': '0 0 30px rgba(34, 197, 94, 0.4)',
        'medical-brand': '0 4px 14px 0 rgba(20, 184, 166, 0.2)',
      },
    },
  },
  plugins: [],
}; 