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
export const CONTENT_MAX_WIDTH = 1180;
export const TYPING_MAX_WIDTH = 1100;
export const SIDEBAR_WIDTH = 236;
export const HEADER_HEIGHT = 56;

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

// Dark Navy professional theme
export const BG = '#0a0e1a';
export const BG_DEEP = '#070b14';
export const BG_SIDEBAR = '#0b1120';
export const BG_HEADER = '#0d1424';

export const GRADIENTS = {
  primary: ['#0d9488', '#2dd4bf'],
  accent: ['#0d9488', '#34d399'],
  success: ['#10b981', '#34d399'],
  warning: ['#f59e0b', '#fbbf24'],
  danger: ['#ef4444', '#f87171'],
  purple: ['#f97316', '#fbbf24'],
};

export const COLORS = {
  // Brand / accent (no blue / purple tones)
  blue: '#14b8a6',
  blueBright: '#5eead4',
  cyan: '#0e7490',
  navy: '#0b1120',
  green: '#22c55e',
  amber: '#f59e0b',
  rose: '#f43f5e',
  teal: '#2dd4bf',
  purple: '#f97316',
  red: '#ef4444',
  indigo: '#fb923c',

  // Text
  textWhite: '#ffffff',
  textLight: '#dbe4f3',
  textMuted: '#8ea0bf',
  textDim: '#4c5b7a',

  // Surfaces
  cardBg: 'rgba(45, 58, 82, 0.45)',
  cardBgSolid: '#0f1830',
  cardBorder: 'rgba(148, 163, 184, 0.65)',
  cardBorderStrong: 'rgba(148, 163, 184, 0.8)',
  inputBg: 'rgba(13, 20, 36, 0.8)',

  // Nav
  sidebarBg: '#0b1120',
  sidebarActive: 'rgba(13, 148, 136, 0.22)',
  sidebarHover: 'rgba(45, 212, 191, 0.10)',
  headerBg: '#0d1424',
  headerBorder: 'rgba(148, 163, 184, 0.5)',

  // Keyboard
  keyBg: '#1a2542',
  keyBgAlt: '#141d36',
  keyBorder: 'rgba(148, 163, 184, 0.45)',
  keyText: '#cdd9f0',
  keyPressed: '#14b8a6',
  keyNext: '#0e7490',
  keyCorrect: '#22c55e',
  keyWrong: '#f43f5e',
  keyRowBg: 'rgba(10, 16, 30, 0.6)',

  // Misc
  glow: '#14b8a6',
  online: '#22c55e',
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

// Shared card style
export const card = {
  backgroundColor: COLORS.cardBgSolid,
  borderRadius: 16,
  borderWidth: 1.5,
  borderColor: COLORS.cardBorderStrong,
  padding: 18,
};

// Shared spectral glow style for buttons
export const glowPrimary = {
  backgroundColor: '#0d9488',
  shadowColor: '#0d9488',
  shadowOpacity: 0.45,
  shadowOffset: { width: 0, height: 6 },
  shadowRadius: 16,
  elevation: 8,
};

// Level names based on best WPM
export const levelForWpm = (wpm) => {
  if (!wpm || wpm <= 0) return { name: 'Rookie', next: 15, color: '#94a3b8' };
  if (wpm < 20) return { name: 'Beginner Typist', next: 20, color: COLORS.green };
  if (wpm < 35) return { name: 'Learning Typist', next: 35, color: COLORS.teal };
  if (wpm < 50) return { name: 'Intermediate Typist', next: 50, color: COLORS.blue };
  if (wpm < 70) return { name: 'Advanced Typist', next: 70, color: COLORS.cyan };
  if (wpm < 90) return { name: 'Speed Typist', next: 90, color: COLORS.purple };
  return { name: 'Master Typist', next: null, color: COLORS.amber };
};