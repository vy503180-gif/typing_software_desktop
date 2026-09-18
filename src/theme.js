import { Dimensions } from 'react-native';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// Phone sizes stay consistent, cap scaling so laptop doesn't get huge
export const scaleFont = (size) => Math.round(size * Math.min(SCREEN_W / 390, 1.2));
export const scaleSize = (size) => Math.round(size * Math.min(SCREEN_W / 390, 1.2));

export const SCREEN = { width: SCREEN_W, height: SCREEN_H };

export const BG = '#111111';

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
};
