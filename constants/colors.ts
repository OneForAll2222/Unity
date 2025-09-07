// App Color Palette - Darker Purple, Baby Blue, Baby Pink
export const COLORS = {
  // Main gradient colors
  DARK_PURPLE:'#990497', // Darker purple
  BABY_BLUE: '#18CAD1',   // Baby blue
  BABY_PINK: '#206BC7',   // Baby pink
  
  // Additional shades
  DARK_PURPLE_LIGHT: '#5B21B6',
  DARK_PURPLE_DARK: '#3C1A78',
  BABY_BLUE_LIGHT: '#B0E0E6',
  BABY_BLUE_DARK: '#6BB6FF',
  BABY_PINK_LIGHT: '#FFE4E1',
  BABY_PINK_DARK: '#F5A9B8',
  
  // Utility colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  
  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.9)',
  TEXT_TERTIARY: 'rgba(255, 255, 255, 0.7)',
  
  // Background overlays
  OVERLAY_LIGHT: 'rgba(255, 255, 255, 0.2)',
  OVERLAY_MEDIUM: 'rgba(255, 255, 255, 0.15)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.3)',
} as const;

// Main app gradient
export const MAIN_GRADIENT = [COLORS.DARK_PURPLE, COLORS.BABY_BLUE, COLORS.BABY_PINK] as const;

// Tab bar gradient
export const TAB_GRADIENT = [COLORS.DARK_PURPLE, COLORS.BABY_BLUE, COLORS.BABY_PINK] as const;

// Message gradients
export const USER_MESSAGE_GRADIENT = [COLORS.BABY_PINK, COLORS.BABY_BLUE, COLORS.DARK_PURPLE_LIGHT] as const;
export const AI_MESSAGE_GRADIENT = [COLORS.DARK_PURPLE, COLORS.DARK_PURPLE_LIGHT, COLORS.BABY_PINK] as const;

// Button gradients
export const PRIMARY_BUTTON_GRADIENT = [COLORS.DARK_PURPLE, COLORS.BABY_BLUE] as const;
export const SECONDARY_BUTTON_GRADIENT = [COLORS.BABY_PINK, COLORS.BABY_BLUE] as const;
export const ACCENT_BUTTON_GRADIENT = [COLORS.BABY_BLUE, COLORS.BABY_PINK] as const;