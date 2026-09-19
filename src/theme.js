import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Desktop detection
export const IS_DESKTOP = Platform.OS === 'web' && SCREEN_W >= 900;

// Breakpoints
export const BREAKPOINTS = {
  mobile: 600,
  tablet: 900,
  desktop: 1200,
  wide: 1600,
};

// Max-width container for content
export const CONTENT_MAX_WIDTH = 1100;
export const TYPING_MAX_WIDTH = 900;
export const SIDEBAR_WIDTH = 220;
export const HEADER_HEIGHT = 48;

// Scale font - desktop uses fixed sizes, mobile scales with screen
export const scaleFont = (size) => {
  if (IS_DESKTOP) return size;
  return Math.round(size * Math.min(SCREEN_W / 390, 1.2));
};

// Scale size - desktop uses fixed sizes, mobile scales with screen
export const scaleSize = (size) => {
  if (IS_DESKTOP) return size;
  return Math.round(size * Math.min(SCREEN_W / 390, 1.2));
};

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

export const BG = '#111111';
export const BG_SIDEBAR = '#0d0d0d';
export const BG_HEADER = '#141414';

export const COLORS = {
  green: '#4ade80',
  amber: '#fbbf24',
  rose: '#fb7185',
  teal: '#2dd4bf',
  textWhite: '#ffffff',
  textLight: '#e5e5e5',
  textMuted: '#a3a3a3',
  textDim: '#525252',
  cardBg: 'rgba(255,255,255,0.06)',
  cardBgSolid: '#1c1c1c',
  cardBorder: 'rgba(255,255,255,0.08)',
  red: '#ef4444',
  sidebarBg: '#0d0d0d',
  sidebarActive: 'rgba(45,212,191,0.12)',
  sidebarHover: 'rgba(255,255,255,0.04)',
  headerBg: '#141414',
  headerBorder: 'rgba(255,255,255,0.08)',
};

// Helper: centered content container style
export const centeredContainer = {
  maxWidth: CONTENT_MAX_WIDTH,
  width: '100%',
  alignSelf: 'center',
};

// Helper: typing area container
export const typingContainer = {
  maxWidth: TYPING_MAX_WIDTH,
  width: '100%',
  alignSelf: 'center',
};
