// src/components/VirtualKeyboard.js
// Realistic interactive keyboard for the Typing workspace.
// - Live pressed state (from physical keyboard)
// - Next-key guidance glow
// - Wrong-key flash feedback
// - Finger guidance zones + labels
// - Click-to-type support

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export const FINGERS = {
  q: 'Left Pinky', w: 'Left Ring', e: 'Left Middle', r: 'Left Index', t: 'Left Index',
  y: 'Right Index', u: 'Right Index', i: 'Right Middle', o: 'Right Ring', p: 'Right Pinky',
  a: 'Left Pinky', s: 'Left Ring', d: 'Left Middle', f: 'Left Index', g: 'Left Index',
  h: 'Right Index', j: 'Right Index', k: 'Right Middle', l: 'Right Ring',
  z: 'Left Pinky', x: 'Left Ring', c: 'Left Middle', v: 'Left Index', b: 'Left Index',
  n: 'Right Index', m: 'Right Index',
  '1': 'Left Pinky', '2': 'Left Ring', '3': 'Left Middle', '4': 'Left Index', '5': 'Left Index',
  '6': 'Right Index', '7': 'Right Index', '8': 'Right Middle', '9': 'Right Ring', '0': 'Right Pinky',
  '`': 'Left Pinky', '-': 'Right Pinky', '=': 'Right Pinky',
  '[': 'Right Pinky', ']': 'Right Pinky', '\\': 'Right Pinky',
  ';': 'Right Pinky', "'": 'Right Pinky', ',': 'Right Middle', '.': 'Right Ring', '/': 'Right Pinky',
  ' ': 'Left or Right Thumb',
};

const FINGER_COLORS = {
  'Left Pinky': 'rgba(244,63,94,0.20)',
  'Left Ring': 'rgba(245,158,11,0.20)',
  'Left Middle': 'rgba(34,197,94,0.20)',
  'Left Index': 'rgba(14,116,144,0.20)',
  'Right Index': 'rgba(59,130,246,0.20)',
  'Right Middle': 'rgba(139,92,246,0.20)',
  'Right Ring': 'rgba(45,212,191,0.20)',
  'Right Pinky': 'rgba(251,113,133,0.20)',
};

// Map an expected character to its keyboard key id
export const keyIdForChar = (ch) => {
  if (ch === undefined || ch === null || ch === '') return null;
  const code = ch.charCodeAt(0);
  if (ch === ' ') return 'space';
  if (/[a-zA-Z0-9]/.test(ch)) return ch.toLowerCase();
  const map = {
    ',': ',', '.': '.', ';': ';', "'": "'", '/': '/', '\\': '\\',
    '[': '[', ']': ']', '-': '-', '=': '=', '`': '`', '!': '1',
    '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7',
    '*': '8', '(': '9', ')': '0', '_': '-', '+': '=', ':': ';',
    '"': "'", '?': '/', '|': '\\', '{': '[', '}': ']', '~': '`',
    '<': ',', '>': '.',
  };
  return map[ch] || null;
};

const ROWS = [
  [
    { label: '`', id: '`', flex: 1 }, { label: '1', id: '1', flex: 1 },
    { label: '2', id: '2', flex: 1 }, { label: '3', id: '3', flex: 1 },
    { label: '4', id: '4', flex: 1 }, { label: '5', id: '5', flex: 1 },
    { label: '6', id: '6', flex: 1 }, { label: '7', id: '7', flex: 1 },
    { label: '8', id: '8', flex: 1 }, { label: '9', id: '9', flex: 1 },
    { label: '0', id: '0', flex: 1 }, { label: '-', id: '-', flex: 1 },
    { label: '=', id: '=', flex: 1 },
    { label: 'Backspace', id: 'backspace', flex: 1.7, wide: true, glyph: true },
  ],
  [
    { label: 'Tab', id: 'tab', flex: 1.4, wide: true },
    { label: 'Q', id: 'q', flex: 1 }, { label: 'W', id: 'w', flex: 1 },
    { label: 'E', id: 'e', flex: 1 }, { label: 'R', id: 'r', flex: 1 },
    { label: 'T', id: 't', flex: 1 }, { label: 'Y', id: 'y', flex: 1 },
    { label: 'U', id: 'u', flex: 1 }, { label: 'I', id: 'i', flex: 1 },
    { label: 'O', id: 'o', flex: 1 }, { label: 'P', id: 'p', flex: 1 },
    { label: '[', id: '[', flex: 1 }, { label: ']', id: ']', flex: 1 },
    { label: '\\', id: '\\', flex: 1 },
  ],
  [
    { label: 'Caps', id: 'caps', flex: 1.7, wide: true },
    { label: 'A', id: 'a', flex: 1 }, { label: 'S', id: 's', flex: 1 },
    { label: 'D', id: 'd', flex: 1 }, { label: 'F', id: 'f', flex: 1 },
    { label: 'G', id: 'g', flex: 1 }, { label: 'H', id: 'h', flex: 1 },
    { label: 'J', id: 'j', flex: 1 }, { label: 'K', id: 'k', flex: 1 },
    { label: 'L', id: 'l', flex: 1 }, { label: ';', id: ';', flex: 1 },
    { label: "'", id: "'", flex: 1 },
    { label: 'Enter', id: 'enter', flex: 1.9, wide: true, glyph: true },
  ],
  [
    { label: 'Shift', id: 'shift_l', flex: 2.1, wide: true },
    { label: 'Z', id: 'z', flex: 1 }, { label: 'X', id: 'x', flex: 1 },
    { label: 'C', id: 'c', flex: 1 }, { label: 'V', id: 'v', flex: 1 },
    { label: 'B', id: 'b', flex: 1 }, { label: 'N', id: 'n', flex: 1 },
    { label: 'M', id: 'm', flex: 1 }, { label: ',', id: ',', flex: 1 },
    { label: '.', id: '.', flex: 1 }, { label: '/', id: '/', flex: 1 },
    { label: 'Shift', id: 'shift_r', flex: 2.1, wide: true },
  ],
  [
    { label: 'Ctrl', id: 'ctrl', flex: 1.4, wide: true },
    { label: 'Win', id: 'win', flex: 1.2, wide: true },
    { label: 'Alt', id: 'alt', flex: 1.2, wide: true },
    { label: ' ', id: 'space', flex: 5.4, space: true },
    { label: 'Alt', id: 'alt_r', flex: 1.2, wide: true },
    { label: 'Menu', id: 'menu', flex: 1.2, wide: true },
    { label: 'Ctrl', id: 'ctrl_r', flex: 1.4, wide: true },
  ],
];

const GLYPHS = {
  backspace: '⌫',
  enter: '⏎',
};

// Kruti Dev (Remington) ka har key jo devanagari char produce karta hai.
// VirtualKeyboard par yahi label dikhte hain jab hindi + Kruti Dev selected ho.
export const KRUTI_KEYCAPS = {
  d: 'क', x: 'ग', p: 'च', t: 'ज', r: 'त', n: 'द', u: 'न', i: 'प',
  c: 'ब', e: 'म', j: 'र', y: 'ल', o: 'व', l: 'स', g: 'ह', ';': 'य',
  m: 'उ', b: 'इ', ',': 'ए', v: 'अ', V: 'ट', B: 'ठ', M: 'ड', N: 'छ',
  '>': 'झ', Q: 'फ', '?': 'घ', '/': 'ध', '[': 'ख', '<': 'ढ', '.': 'ण',
  F: 'थ', H: 'भ', "'": 'श', '"': 'ष', k: 'ा', f: 'ि', h: 'ी', q: 'ु',
  w: 'ू', '`': 'ृ', s: 'े', S: 'ै', a: 'ं', W: 'ॅ', '%': 'ः',
  '1': '१', '2': '२', '3': '३', '4': '४', '5': '५',
  '6': '६', '7': '७', '8': '८', '9': '९', '0': '०',
};

function VirtualKeyboardInner({
  pressedId = null,
  nextId = null,
  wrongId = null,
  correctId = null,
  showKeyboard = true,
  showFingerGuide = false,
  showNextKey = true,
  size = 'md',
  onKeyPress = () => {},
  keyLabels = null,
}) {
  if (!showKeyboard) return null;

  const compact = size === 'sm';

  return (
    <View style={styles.wrap}>
      {ROWS.map((row, rIdx) => (
        <View key={rIdx} style={styles.row}>
          {row.map((k) => {
            const isPressed = pressedId === k.id;
            const isNext = showNextKey && !isPressed && nextId === k.id;
            const isWrong = wrongId === k.id;
            const isCorrectFlash = correctId === k.id;
            const fingerName = k.id !== 'space' ? FINGERS[k.id] : 'Left or Right Thumb';
            const fingerColor = showFingerGuide ? FINGER_COLORS[fingerName] : null;

            const overlay = keyLabels ? keyLabels[k.id] : null;
            const label = k.space
              ? ''
              : k.glyph
                ? GLYPHS[k.id] || k.label
                : overlay || k.label;

            return (
              <TouchableOpacity
                key={k.id}
                onPress={() => onKeyPress(k.id)}
                activeOpacity={0.7}
                style={[
                  styles.key,
                  { flex: k.flex },
                  compact && styles.keyCompact,
                  fingerColor ? { backgroundColor: fingerColor } : null,
                  k.space && styles.spaceKey,
                ]}
              >
                <View
                  style={[
                    styles.keyInner,
                    k.wide && styles.keyInnerWide,
                    isWrong && styles.keyWrong,
                    isCorrectFlash && styles.keyCorrect,
                    isNext && styles.keyNext,
                    isPressed && styles.keyPressed,
                  ]}
                >
                  <Text
                    style={[
                      styles.keyLabel,
                      overlay && styles.keyLabelOverlay,
                      compact && styles.keyLabelCompact,
                      k.wide && styles.keyLabelWide,
                      k.space && styles.keyLabelSpace,
                      isPressed && styles.keyLabelPressed,
                      isNext && styles.keyLabelNext,
                    ]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                  {k.id !== 'space' && (
                    <Text style={[styles.keySub, compact && { fontSize: 7 }]} numberOfLines={1}>
                      {showFingerGuide
                        ? fingerName.replace(' or Left or Right Thumb', '').split(' ')[1] || ''
                        : overlay
                          ? k.label
                          : ''}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const VirtualKeyboard = memo(VirtualKeyboardInner);
export default VirtualKeyboard;

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
    padding: 6,
    paddingTop: 2,
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
    gap: 4,
  },
  key: {
    height: 52,
  },
  keyCompact: {
    height: 28,
  },
  keyInner: {
    flex: 1,
    minWidth: 0,
    borderRadius: 8,
    backgroundColor: '#1a2542',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  keyInnerWide: {
    paddingHorizontal: 4,
  },
  spaceKey: {
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  keyLabel: {
    fontSize: 15,
    color: '#cdd9f0',
    fontFamily: 'Calibri',
    fontWeight: '700',
    includeFontPadding: false,
  },
  keyLabelOverlay: {
    fontSize: 17,
    color: '#fff',
  },
  keyLabelCompact: {
    fontSize: 12,
  },
  keyLabelWide: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  keyLabelSpace: {
    fontSize: 11,
    color: '#7d8bb0',
  },
  keySub: {
    position: 'absolute',
    bottom: 1,
    fontSize: 8,
    color: 'rgba(205,217,240,0.7)',
    fontFamily: 'Calibri',
    fontWeight: '700',
  },
  keyPressed: {
    backgroundColor: '#14b8a6',
    borderColor: '#5eead4',
    transform: [{ scale: 0.95 }],
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  keyLabelPressed: {
    color: '#ffffff',
  },
  keyNext: {
    backgroundColor: 'rgba(14,116,144,0.22)',
    borderColor: '#0e7490',
    shadowColor: '#0e7490',
    shadowOpacity: 0.7,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 6,
  },
  keyLabelNext: {
    color: '#0e7490',
  },
  keyWrong: {
    backgroundColor: '#f43f5e',
    borderColor: '#fb7185',
  },
  keyCorrect: {
    backgroundColor: '#22c55e',
    borderColor: '#4ade80',
  },
});