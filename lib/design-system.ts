/**
 * Kendraa Design System
 * Unified color palette, spacing, and styling constants for consistent UI across the application
 */

// Primary Brand Colors
export const COLORS = {
  // Primary Blue (Kendraa Blue)
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#007fff', // Main brand color
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
  },
  
  // Secondary Colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  
  // Accent Colors
  accent: {
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7c3aed',
      800: '#6b21a8',
      900: '#581c87',
    },
    orange: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316',
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },
  },
  
  // Status Colors
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
  
  // Neutral Colors
  neutral: {
    white: '#ffffff',
    black: '#000000',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
} as const;

// Background Gradients
export const BACKGROUNDS = {
  // Page Backgrounds
  page: {
    primary: 'bg-gradient-to-br from-blue-50 via-white to-purple-50',
    secondary: 'bg-gradient-to-br from-white via-blue-50/30 to-white',
    tertiary: 'bg-gradient-to-br from-gray-50 via-white to-gray-50',
  },
  
  // Card Backgrounds
  card: {
    primary: 'bg-white',
    secondary: 'bg-gray-50',
    elevated: 'bg-white shadow-sm border border-gray-100',
  },
  
  // Button Backgrounds
  button: {
    primary: 'bg-[#007fff] hover:bg-[#007fff]/90',
    secondary: 'bg-white border-2 border-[#007fff] text-[#007fff] hover:bg-[#007fff]/5',
    ghost: 'bg-transparent hover:bg-gray-100',
    danger: 'bg-red-600 hover:bg-red-700',
    success: 'bg-green-600 hover:bg-green-700',
  },
} as const;

// Text Colors
export const TEXT_COLORS = {
  primary: 'text-gray-900',
  secondary: 'text-gray-600',
  tertiary: 'text-gray-500',
  accent: 'text-[#007fff]',
  white: 'text-white',
  success: 'text-green-600',
  warning: 'text-orange-600',
  error: 'text-red-600',
} as const;

// Border Colors
export const BORDER_COLORS = {
  primary: 'border-gray-200',
  secondary: 'border-gray-100',
  accent: 'border-[#007fff]',
  focus: 'border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10',
} as const;

// Spacing System
export const SPACING = {
  xs: '0.5rem',    // 8px
  sm: '0.75rem',   // 12px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
} as const;

// Border Radius
export const RADIUS = {
  sm: 'rounded-lg',
  md: 'rounded-xl',
  lg: 'rounded-2xl',
  full: 'rounded-full',
} as const;

// Shadows
export const SHADOWS = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
} as const;

// Typography
export const TYPOGRAPHY = {
  heading: {
    h1: 'text-3xl font-bold text-gray-900',
    h2: 'text-2xl font-bold text-gray-900',
    h3: 'text-xl font-bold text-gray-900',
    h4: 'text-lg font-semibold text-gray-900',
    h5: 'text-base font-semibold text-gray-900',
    h6: 'text-sm font-semibold text-gray-900',
  },
  body: {
    large: 'text-lg text-gray-600',
    medium: 'text-base text-gray-600',
    small: 'text-sm text-gray-600',
    xs: 'text-xs text-gray-500',
  },
  accent: {
    primary: 'text-[#007fff] font-medium',
    secondary: 'text-gray-700 font-medium',
  },
} as const;

// Component Styles
export const COMPONENTS = {
  // Cards
  card: {
    base: 'bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden',
    header: 'px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white',
    content: 'p-6',
    footer: 'px-6 py-4 border-t border-gray-100 bg-gray-50',
  },
  
  // Buttons
  button: {
    primary: 'inline-flex items-center justify-center px-6 py-3 bg-[#007fff] text-white rounded-xl hover:bg-[#007fff]/90 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl',
    secondary: 'inline-flex items-center justify-center px-6 py-3 bg-white text-[#007fff] border-2 border-[#007fff] rounded-xl hover:bg-[#007fff]/5 transition-all duration-200 font-semibold',
    ghost: 'inline-flex items-center justify-center px-6 py-3 bg-transparent text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200 font-medium',
    danger: 'inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 font-semibold',
  },
  
  // Input Fields
  input: {
    base: 'w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-200 bg-white',
    textarea: 'w-full p-4 border-2 border-[#007fff]/20 rounded-xl focus:outline-none focus:border-[#007fff] focus:ring-4 focus:ring-[#007fff]/10 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-none',
  },
  
  // Badges
  badge: {
    primary: 'px-3 py-1 bg-[#007fff]/10 text-[#007fff] rounded-full text-sm font-medium',
    secondary: 'px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium',
    success: 'px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium',
    warning: 'px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium',
    error: 'px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium',
  },
  
  // Icons
  icon: {
    primary: 'w-5 h-5 text-[#007fff]',
    secondary: 'w-5 h-5 text-gray-600',
    accent: 'w-5 h-5 text-gray-400',
  },
} as const;

// Layout Constants
export const LAYOUT = {
  // Container widths
  container: {
    sm: 'max-w-2xl mx-auto px-4 sm:px-6',
    md: 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
    lg: 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8',
    xl: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
  },
  
  // Grid systems
  grid: {
    '2': 'grid grid-cols-1 md:grid-cols-2 gap-6',
    '3': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
    '4': 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6',
  },
  
  // Flex layouts
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
  },
} as const;

// Animation Classes
export const ANIMATIONS = {
  transition: 'transition-all duration-200',
  hover: 'hover:scale-[1.02] hover:shadow-lg',
  focus: 'focus:outline-none focus:ring-4 focus:ring-[#007fff]/10',
} as const;

// Event Type Colors (for events page)
export const EVENT_TYPE_COLORS = {
  conference: 'bg-blue-100 text-blue-700',
  webinar: 'bg-purple-100 text-purple-700',
  workshop: 'bg-green-100 text-green-700',
  seminar: 'bg-orange-100 text-orange-700',
  networking: 'bg-pink-100 text-pink-700',
  training: 'bg-red-100 text-red-700',
  default: 'bg-gray-100 text-gray-700',
} as const;

// Notification Type Colors
export const NOTIFICATION_TYPE_COLORS = {
  connection_request: 'text-[#007fff] bg-[#007fff]/10',
  post_like: 'text-[#007fff] bg-[#007fff]/10',
  comment: 'text-[#007fff] bg-[#007fff]/10',
  job_application: 'text-[#007fff] bg-[#007fff]/10',
  default: 'text-gray-600 bg-gray-100',
} as const;

// Export utility functions
export const getEventTypeColor = (type: string) => {
  return EVENT_TYPE_COLORS[type as keyof typeof EVENT_TYPE_COLORS] || EVENT_TYPE_COLORS.default;
};

export const getNotificationTypeColor = (type: string) => {
  return NOTIFICATION_TYPE_COLORS[type as keyof typeof NOTIFICATION_TYPE_COLORS] || NOTIFICATION_TYPE_COLORS.default;
};
