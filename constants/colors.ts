// App Color Palette - Soft Black and Muted Gold
export const COLORS = {
  // Main gradient colors
  DEEP_BLACK: '#000000',
  RICH_GOLD: '#E6C979',
  DARK_GOLD: '#8E7B3A',

  // Additional shades
  CHARCOAL: '#1C1C1C',
  DARK_GRAY: '#2D2D2D',
  LIGHT_GOLD: '#F7EEDB',
  BRONZE: '#B18B5E',
  AMBER: '#D9B24A',
  ANTIQUE_GOLD: '#B7A260',

  // Utility colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',

  // Text colors
  TEXT_PRIMARY: '#FFFFFF',
  TEXT_SECONDARY: 'rgba(255, 255, 255, 0.9)',
  TEXT_TERTIARY: 'rgba(255, 255, 255, 0.7)',
  TEXT_ON_GOLD: '#1C1C1C',

  // Background overlays
  OVERLAY_LIGHT: 'rgba(230, 201, 121, 0.18)',
  OVERLAY_MEDIUM: 'rgba(230, 201, 121, 0.12)',
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',
} as const;

// Main app gradient (softer gold accent)
export const MAIN_GRADIENT = [COLORS.DEEP_BLACK, COLORS.CHARCOAL, COLORS.ANTIQUE_GOLD] as const;

// Tab bar gradient (muted gold)
export const TAB_GRADIENT = [COLORS.DEEP_BLACK, COLORS.DARK_GRAY, COLORS.DARK_GOLD] as const;

// Message gradients (reduced saturation)
export const USER_MESSAGE_GRADIENT = [COLORS.DARK_GOLD, COLORS.AMBER, COLORS.ANTIQUE_GOLD] as const;
export const AI_MESSAGE_GRADIENT = [COLORS.DARK_GOLD, COLORS.RICH_GOLD, COLORS.DARK_GOLD] as const;
export const AI_MESSAGE_LOCATIONS = [0, 0.5, 1] as readonly [number, number, ...number[]];

// Button gradients
export const PRIMARY_BUTTON_GRADIENT = [COLORS.RICH_GOLD, COLORS.DARK_GOLD] as const;
export const SECONDARY_BUTTON_GRADIENT = [COLORS.DEEP_BLACK, COLORS.CHARCOAL] as const;
export const ACCENT_BUTTON_GRADIENT = [COLORS.AMBER, COLORS.ANTIQUE_GOLD] as const;