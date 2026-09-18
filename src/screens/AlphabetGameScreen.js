// src/screens/AlphabetGameScreen.js
// A-Z Circle game:
// Ek circle me saare letters A-Z lage hote hain. User ko highlighted letter
// type karna hai (A -> Z order). Neeche live timer chalta hai jo
// minutes : seconds : milliseconds dikhata hai. Game khatam par time,
// mistakes aur accuracy ka result dikhta hai.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Pressable,
  Platform,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const SCREEN_W = SCREEN.width;

// Saare 26 letters A-Z
const LETTERS_AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const LETTERS_ZA = 'ZYXWVUTSRQPONMLKJIHGFEDCBA'.split('');
const NUMBERS_10 = ['1','2','3','4','5','6','7','8','9','10'];
const NUMBERS_10_REV = ['10','9','8','7','6','5','4','3','2','1'];

const MODES = [
  { id: 'az', label: 'A - Z', data: LETTERS_AZ },
  { id: 'za', label: 'Z - A', data: LETTERS_ZA },
  { id: 'num', label: '1 - 10', data: NUMBERS_10 },
  { id: 'numrev', label: '10 - 1', data: NUMBERS_10_REV },
];

// Har mode ka apna accent color
const MODE_COLORS = {
  az: COLORS.teal,
  za: COLORS.green,
  num: COLORS.amber,
  numrev: COLORS.rose,
};

// Circle ki size - screen ke hisaab se (chhota phone par bhi fit)
const CIRCLE_SIZE = Math.min(SCREEN_W - 32, 390);
const RADIUS = CIRCLE_SIZE / 2 - 42;
const CHIP = 40; // har letter chip ka size

// Letter ki position circle me (top se shuru, ghadi ki tarah ghoomta hai)
const letterPos = (i, total) => {
  const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
  const cx = CIRCLE_SIZE / 2;
  const cy = CIRCLE_SIZE / 2;
  return {
    left: cx + RADIUS * Math.cos(angle) - CHIP / 2,
    top: cy + RADIUS * Math.sin(angle) - CHIP / 2,
  };
};

// mm : ss . ms format me time
const fmtTime = (ms) => {
  const total = Math.max(0, ms);
  const mins = Math.floor(total / 60000);
  const secs = Math.floor((total % 60000) / 1000);
  const milli = total % 1000;
  return `${mins}:${String(secs).padStart(2, '0')}.${String(milli).padStart(3, '0')}`;
};

export default function AlphabetGameScreen({ onBack, mode: initialMode }) {
  const [mode, setMode] = useState(initialMode || 'az');
  const [showDropdown, setShowDropdown] = useState(false);
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [feedback, setFeedback] = useState(null); // { type: 'ok'|'bad', text, id }
  const [typedBuf, setTypedBuf] = useState('');

  const LETTERS = MODES.find((m) => m.id === mode).data;
  const accent = MODE_COLORS[mode] || COLORS.teal;

  const inputRef = useRef(null);
  const startAtRef = useRef(0);
  const timerRef = useRef(null);
  const feedbackTimerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Web par: dropdown ke bahar click karne se band
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onDown = (e) => {
      const t = e.target;
      if (dropdownRef.current && dropdownRef.current.contains(t)) return;
      setShowDropdown(false);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, []);

  // Timer - sirf game start hone ke baad, milliseconds tak live update
  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      setElapsed(Date.now() - startAtRef.current);
    }, 33);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  // Native par autofocus
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  // Native focus guard - keyboard na chhute
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const guard = setInterval(() => {
      if (!finished && inputRef.current && !inputRef.current.isFocused()) {
        inputRef.current.focus();
      }
    }, 1200);
    return () => clearInterval(guard);
  }, [finished, idx]);

  const handleKey = (raw) => {
    if (finished) return;
    const upper = raw.length === 1 ? raw.toUpperCase() : '';
    const isNumMode = mode === 'num' || mode === 'numrev';
    const isValid = isNumMode ? /^[0-9]$/.test(upper) : /^[A-Z]$/.test(upper);
    if (!isValid) return;

    // Pehla letter type karte hi timer shuru
    if (!started) {
      startAtRef.current = Date.now();
      setStarted(true);
    }

    const expected = LETTERS[idx];
    const candidate = typedBuf + upper;

    if (candidate === expected) {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      setFeedback({ type: 'ok', text: candidate, id: Date.now() });
      setTypedBuf('');
      if (idx + 1 >= LETTERS.length) {
        setElapsed(Date.now() - startAtRef.current);
        setFinished(true);
        return;
      }
      setIdx(idx + 1);
    } else if (expected.startsWith(candidate)) {
      // Multi-char target (jaise "10") ka pehla digit sahi - aage badho
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      setFeedback({ type: 'ok', text: candidate, id: Date.now() });
      setTypedBuf(candidate);
    } else {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      setFeedback({ type: 'bad', text: upper, id: Date.now() });
      setMistakes((m) => m + 1);
      setTypedBuf('');
    }
  };

  const handleKeyRef = useRef(handleKey);
  handleKeyRef.current = handleKey;

  const handleChange = (text) => handleKey(text.slice(-1));

  // Web keydown
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (finished) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const isNumMode = mode === 'num' || mode === 'numrev';
      const pattern = isNumMode ? /^[0-9]$/ : /^[a-zA-Z]$/;
      if (pattern.test(e.key)) {
        e.preventDefault();
        handleKeyRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [finished, mode]);

  const restart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    startAtRef.current = 0;
    setIdx(0);
    setMistakes(0);
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setFeedback(null);
    setTypedBuf('');
  };

  const handleModeSelect = (newMode) => {
    setMode(newMode);
    setShowDropdown(false);
    restart();
  };

  const accuracy = idx + mistakes > 0
    ? Math.round((idx / (idx + mistakes)) * 100)
    : 100;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        {finished ? (
          <View style={styles.resultContainer}>
            <Ionicons name="checkmark-circle" size={60} color={accent} />
            <Text style={[styles.resultTitle, { color: accent }]}>Excellent!</Text>
            <Text style={styles.resultSub}>{mode === 'num' ? '1 se 10 complete ho gaya' : mode === 'numrev' ? '10 se 1 complete ho gaya' : mode === 'za' ? 'Z se A complete ho gaya' : 'A to Z complete ho gaya'}</Text>
            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Ionicons name="time-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Time</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{fmtTime(elapsed)}</Text>
              </View>
              <View style={styles.resultRow}>
                <Ionicons name="close-circle-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Mistakes</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{mistakes}</Text>
              </View>
              <View style={styles.resultRow}>
                <Ionicons name="speedometer-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Accuracy</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{accuracy}%</Text>
              </View>
            </View>
            <TouchableOpacity style={[styles.restartBtn, { borderColor: accent, backgroundColor: 'transparent' }]} onPress={restart} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={accent} />
              <Text style={[styles.restartBtnText, { color: accent }]}>Play Again</Text>
            </TouchableOpacity>
            {onBack && (
              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
                <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
                <Text style={styles.backBtnText}>Home</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
                </TouchableOpacity>
              )}
              <Text style={[styles.headerTitle, { color: accent }]} numberOfLines={1}>{MODES.find((m) => m.id === mode).label} Circle</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Mode Dropdown */}
            <View style={styles.dropdownWrap} ref={dropdownRef}>
              <TouchableOpacity
                style={[styles.dropdownBtn, { borderColor: accent + '66' }]}
                onPress={() => setShowDropdown(!showDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownBtnText, { color: accent }]}>{MODES.find((m) => m.id === mode).label}</Text>
                <Ionicons name={showDropdown ? 'chevron-up' : 'chevron-down'} size={14} color={accent} />
              </TouchableOpacity>
              {showDropdown && (
                <View style={styles.dropdownList}>
                  {MODES.map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      style={[styles.dropdownItem, m.id === mode && { backgroundColor: accent + '22' }]}
                      onPress={() => handleModeSelect(m.id)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownItemText, m.id === mode && { color: accent }]}>{m.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Live timer */}
            <View style={styles.timerCard}>
              <Text style={styles.timerLabel}>Time</Text>
              <Text style={[styles.timerValue, { color: accent }]}>{fmtTime(elapsed)}</Text>
              <Text style={styles.timerNote}>minutes : seconds : milliseconds</Text>
            </View>

            {/* Progress + mistakes */}
            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="git-commit-outline" size={14} color={accent} />
                <Text style={styles.infoChipText}>{idx} / {LETTERS.length}</Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="close-circle-outline" size={14} color={accent} />
                <Text style={styles.infoChipText}>{mistakes} mistakes</Text>
              </View>
            </View>

            {/* A-Z circle */}
            <View style={styles.circleWrap}>
              <View style={[styles.circle, { width: CIRCLE_SIZE, height: CIRCLE_SIZE }]}>
                {/* Circle outline */}
                <View
                  style={[
                    styles.circleRing,
                    { width: CIRCLE_SIZE - 24, height: CIRCLE_SIZE - 24, borderRadius: (CIRCLE_SIZE - 24) / 2, borderColor: accent + '55' },
                  ]}
                />
                {LETTERS.map((ch, i) => {
                  const pos = letterPos(i, LETTERS.length);
                  const done = i < idx;
                  const isCurrent = i === idx;
                  return (
                    <View
                      key={ch}
                      style={[
                        styles.letterChip,
                        { left: pos.left, top: pos.top },
                        done && [styles.letterChipDone, { backgroundColor: accent + 'E6', borderColor: accent }],
                        isCurrent && [styles.letterChipCurrent, { backgroundColor: accent, shadowColor: accent }],
                      ]}
                    >
                      <Text
                        style={[
                          styles.letterText,
                          done && styles.letterTextDone,
                          isCurrent && styles.letterTextCurrent,
                        ]}
                      >
                        {ch}
                      </Text>
                    </View>
                  );
                })}
                <View style={styles.centerHint}>
                  <Text style={[styles.centerHintLetter, { color: accent }]}>
                    {idx < LETTERS.length ? LETTERS[idx] : ''}
                  </Text>
                  <Text style={styles.centerHintText}>Type this</Text>
                </View>
              </View>
            </View>

            {/* Feedback */}
            <View style={styles.feedbackArea}>
              {feedback ? (
                <Text
                  key={feedback.id}
                  style={[
                    styles.feedbackText,
                    feedback.type === 'ok' ? [styles.feedbackOk, { color: accent }] : styles.feedbackBad,
                  ]}
                >
                  {feedback.type === 'ok' ? 'Correct!' : `Wrong! Expected ${LETTERS[idx]}`
                  }
                </Text>
              ) : (
                <Text style={styles.hintText}>{mode === 'num' || mode === 'numrev' ? 'Type the highlighted number' : mode === 'za' ? 'Type the highlighted letter (Z to A)' : 'Type the highlighted letter (A to Z)'}</Text>
              )}
            </View>

            {/* Native hidden input */}
            {Platform.OS !== 'web' && (
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                defaultValue=""
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                caretHidden
                spellCheck={false}
              />
            )}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  dropdownBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 5,
  },
  container: { flex: 1, padding: scaleSize(16), width: '100%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  backIconBtn: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: scaleSize(17),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(10),
  },
  headerTitle: { fontFamily: 'Calibri', color: COLORS.textWhite,
    fontSize: scaleFont(18),
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerSpacer: { flex: 1 },

  dropdownWrap: {
    position: 'relative',
    zIndex: 10,
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  dropdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(7),
  },
  dropdownBtnText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    marginTop: scaleSize(4),
    backgroundColor: '#1a1a1a',
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    minWidth: 120,
  },
  dropdownItem: {
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(9),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  dropdownItemActive: {
    backgroundColor: COLORS.teal + '20',
  },
  dropdownItemText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  dropdownItemTextActive: {
    color: COLORS.teal,
    fontFamily: 'Calibri', fontWeight: '700'
  },

  timerCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: scaleSize(10),
    alignItems: 'center',
    marginBottom: 8,
  },
  timerLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(11),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 1,
  },
  timerValue: {
    color: COLORS.textWhite,
    fontSize: scaleFont(34),
    fontFamily: 'Calibri', fontWeight: '700',
    fontVariant: ['tabular-nums'],
    marginVertical: scaleSize(2),
  },
  timerNote: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: scaleFont(10),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  infoRow: {
    flexDirection: 'row',
    gap: scaleSize(8),
    marginBottom: scaleSize(6),
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(6),
  },
  infoChipText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  circleWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleRing: {
    position: 'absolute',
    borderWidth: 2,
    borderColor: 'rgba(20,184,166,0.4)',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  letterChip: {
    position: 'absolute',
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  letterChipDone: {
    backgroundColor: 'rgba(20,184,166,0.9)',
    borderColor: COLORS.teal,
  },
  letterChipCurrent: {
    backgroundColor: COLORS.green,
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.8,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 8,
    transform: [{ scale: 1.15 }],
  },
  letterText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  letterTextDone: { fontFamily: 'Calibri', color: '#0b1210',
  },
  letterTextCurrent: {
    color: '#0b1210',
    fontSize: scaleFont(15),
  },

  centerHint: {
    alignItems: 'center',
  },
  centerHintLetter: {
    color: COLORS.teal,
    fontSize: scaleFont(40),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  centerHintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(11),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(2),
  },

  feedbackArea: {
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: scaleFont(16),
  },
  feedbackOk: { fontFamily: 'Calibri', color: COLORS.teal,
  },
  feedbackBad: { fontFamily: 'Calibri', color: COLORS.rose,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  resultContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: scaleSize(24),
  },
  resultTitle: {
    color: COLORS.textWhite,
    fontSize: scaleFont(26),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(12),
  },
  resultSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(4),
    marginBottom: scaleSize(20),
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginBottom: scaleSize(24),
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(8),
  },
  resultRowLabel: {
    color: COLORS.textWhite,
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700',
    flex: 1,
    marginLeft: scaleSize(10),
  },
  resultRowValue: {
    color: COLORS.teal,
    fontSize: scaleFont(20),
    fontFamily: 'Calibri', fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(36),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  restartBtnText: {
    color: COLORS.teal,
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(36),
    marginTop: scaleSize(12),
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },
});