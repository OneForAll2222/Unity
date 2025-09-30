// App Color Palette - Black and Gold Gradient
export const COLORS = {
  // Main gradient colors
  DEEP_BLACK: '#000000',     // Pure black
  RICH_GOLD: '#FFD700',      // Rich gold
  DARK_GOLD: '#B8860B',      // Dark gold
  
  // Additional shades
  CHARCOAL: '#1C1C1C',       // Dark charcoal
  DARK_GRAY: '#2D2D2D',      // Dark gray
  LIGHT_GOLD: '#FFF8DC',     // Light gold/cream
  BRONZE: '#CD7F32',         // Bronze
  AMBER: '#FFBF00',          // Amber gold
  ANTIQUE_GOLD: '#C9B037',   // Antique gold
  
  // Utility colors
  WHITE: '#FFFFFF',
  BLACK: '#000000',
  TRANSPARENT: 'transparent',
  
  // Text colors
  TEXT_PRIMARY: '#FFD700',   // Gold text
  TEXT_SECONDARY: 'rgba(255, 215, 0, 0.9)',  // Semi-transparent gold
  TEXT_TERTIARY: 'rgba(255, 215, 0, 0.7)',   // More transparent gold
  TEXT_ON_GOLD: '#000000',   // Black text on gold backgrounds
  
  // Background overlays
  OVERLAY_LIGHT: 'rgba(255, 215, 0, 0.2)',   // Light gold overlay
  OVERLAY_MEDIUM: 'rgba(255, 215, 0, 0.15)', // Medium gold overlay
  OVERLAY_DARK: 'rgba(0, 0, 0, 0.7)',        // Dark black overlay
} as const;

// Main app gradient
export const MAIN_GRADIENT = [COLORS.DEEP_BLACK, COLORS.CHARCOAL, COLORS.RICH_GOLD] as const;

// Tab bar gradient
export const TAB_GRADIENT = [COLORS.DEEP_BLACK, COLORS.DARK_GRAY, COLORS.DARK_GOLD] as const;

// Message gradients
export const USER_MESSAGE_GRADIENT = [COLORS.DARK_GOLD, COLORS.AMBER, COLORS.RICH_GOLD] as const;
// Center-highlighted gold gradient for AI messages (light center, darker edges)
export const AI_MESSAGE_GRADIENT = [COLORS.DARK_GOLD, COLORS.RICH_GOLD, COLORS.DARK_GOLD] as const;
export const AI_MESSAGE_LOCATIONS = [0, 0.5, 1] as readonly [number, number, ...number[]];

// Button gradients
export const PRIMARY_BUTTON_GRADIENT = [COLORS.RICH_GOLD, COLORS.DARK_GOLD] as const;
export const SECONDARY_BUTTON_GRADIENT = [COLORS.DEEP_BLACK, COLORS.CHARCOAL] as const;
export const ACCENT_BUTTON_GRADIENT = [COLORS.AMBER, COLORS.ANTIQUE_GOLD] as const;