// src/screens/TimeAttackScreen.js
// Time Attack game:
// 40 second clock, ek pura paragraph. Har word type karne par thoda sa time
// bonus milta hai (clock retreats). Clock 0 hone tak jitna ho sake type karo.
// Aakhri 10 second me clock red ho jata hai — pressure!

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { paragraphText } from '../data/typingTexts';

const START_SECONDS = 40;
const WORD_TIME_BONUS = 0.6;

const fmt = (secs) => `${Math.floor(secs / 60)}:${String(Math.floor(secs % 60)).padStart(2, '0')}`;

export default function TimeAttackScreen({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(START_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const gameRef = useRef({
    text: '',
    typedCount: 0,
    wrong: [],
    correctChars: 0,
    totalChars: 0,
    mistakes: 0,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const timeLeftRef = useRef(START_SECONDS);
  const finishedRef = useRef(false);

  const startGame = () => {
    gameRef.current = {
      text: paragraphText('easy').replace(/\s+/g, ' ').trim(),
      typedCount: 0,
      wrong: [],
      correctChars: 0,
      totalChars: 0,
      mistakes: 0,
    };
    timeLeftRef.current = START_SECONDS;
    setTimeLeft(START_SECONDS);
    setStarted(true);
    setFinished(false);
    finishedRef.current = false;
    forceRender();
    focusInput();
  };

  const focusInput = () => {
    if (Platform.OS === 'web') return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
  };

  // Timer: har second reduce; word completion par bonus add
  useEffect(() => {
    if (!started || finished) return;
    const interval = setInterval(() => {
      timeLeftRef.current = timeLeftRef.current - 1;
      setTimeLeft(timeLeftRef.current);
      if (timeLeftRef.current <= 0) {
        clearInterval(interval);
        finishedRef.current = true;
        setFinished(true);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [started, finished]);

  const handleKeyRef = useRef(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (!started || finished) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === ' ') e.preventDefault();
      const isChar = /^[a-zA-Z .,'!?-]$/.test(e.key);
      if (isChar) {
        e.preventDefault();
        handleKeyRef.current && handleKeyRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [started, finished]);

  const addTimeBonus = (arr) => {
    timeLeftRef.current = Math.min(START_SECONDS + 30, timeLeftRef.current + WORD_TIME_BONUS);
    setTimeLeft(timeLeftRef.current);
  };

  const handleKey = (raw) => {
    const g = gameRef.current;
    if (finished || g.typedCount >= g.text.length) return;
    const t = raw;
    if (t.length !== 1) return;

    const expected = g.text[g.typedCount];
    const ok = t === expected;
    g.totalChars++;
    if (ok) {
      g.correctChars++;
    } else {
      g.mistakes++;
      g.wrong = [...g.wrong.filter((x) => x !== g.typedCount), g.typedCount];
    }
    g.typedCount++;

    // Word boundary pr time bonus
    if (expected === ' ' || g.typedCount >= g.text.length) {
      addTimeBonus();
    }

    if (g.typedCount >= g.text.length) {
      finishedRef.current = true;
      setFinished(true);
    }
    forceRender();
  };
  handleKeyRef.current = handleKey;

  const handleChange = (text) => {
    const last = text.slice(-1);
    if (last) handleKey(last);
    if (Platform.OS === 'web' && inputRef.current) {
      inputRef.current.setNativeProps({ text: '' });
    }
  };

  const g = gameRef.current;
  const elapsed = (START_SECONDS - timeLeft) + (finished ? 0 : 0);
  const runSec = Math.max(1, START_SECONDS - timeLeft);
  const liveWpm = g.totalChars > 0 ? Math.round((g.correctChars / 5) / (runSec / 60)) : 0;
  const accuracy = g.totalChars > 0 ? Math.round((g.correctChars / g.totalChars) * 100) : 100;
  const progress = g.text ? Math.min(100, Math.round((g.typedCount / g.text.length) * 100)) : 0;
  const danger = timeLeft <= 10;

  const renderChar = (ch, i) => {
    if (i < g.typedCount) {
      const wasWrong = g.wrong.includes(i);
      return (
        <Text key={i} style={[styles.plainLetter, wasWrong ? styles.plainWrong : styles.plainGood]}>
          {ch}
        </Text>
      );
    }
    if (i === g.typedCount) {
      return (
        <View key={i} style={styles.currentWrap}>
          <View style={styles.caret} />
          <Text style={styles.plainLetter}>{ch}</Text>
        </View>
      );
    }
    return <Text key={i} style={styles.plainLetterFuture}>{ch}</Text>;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Time Attack</Text>
          <View style={[styles.clockChip, danger && started && styles.clockDanger]}>
            <Ionicons name="timer" size={15} color={COLORS.textWhite} />
            <Text style={[styles.clockText, danger && started && { color: '#fff' }]}>{fmt(timeLeft)}</Text>
          </View>
        </View>

        {finished ? (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: progress >= 100 ? 'rgba(14,116,144,0.15)' : 'rgba(244,63,94,0.15)' }]}>
              <Ionicons name={progress >= 100 ? 'trophy' : 'timer'} size={46} color={progress >= 100 ? COLORS.cyan : COLORS.rose} />
            </View>
            <Text style={styles.doneTitle}>{progress >= 100 ? 'You Beat the Clock!' : "Time's Up!"}</Text>
            <Text style={styles.doneSub}>
              {progress >= 100 ? 'You typed the whole paragraph against the clock!' : `Finished ${progress}% of the paragraph`}
            </Text>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.cyan }]}>{liveWpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.green }]}>{accuracy}%</Text>
                <Text style={styles.doneLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.rose }]}>{g.mistakes}</Text>
                <Text style={styles.doneLabel}>Mistakes</Text>
              </View>
            </View>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{Math.round(elapsed)}s</Text>
                <Text style={styles.doneLabel}>Time Used</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{g.correctChars}/{g.text.length}</Text>
                <Text style={styles.doneLabel}>Characters</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.amber }]}>{Math.max(0, timeLeft)}s</Text>
                <Text style={styles.doneLabel}>Time Left</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restartBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={COLORS.cyan} />
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
              <Text style={styles.exitBtnText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.readyCard}>
            <View style={[styles.readyIcon, { backgroundColor: 'rgba(14,116,144,0.15)' }]}>
              <Ionicons name="timer" size={44} color={COLORS.cyan} />
            </View>
            <Text style={styles.readyTitle}>Time Attack</Text>
            <Text style={styles.readyDesc}>
              {START_SECONDS} seconds. One paragraph.{'\n'}
              Every word gives you time back. Beat the clock!
            </Text>
            <TouchableOpacity style={styles.readyBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="play" size={17} color="#fff" />
              <Text style={styles.readyBtnText}>Start Attack</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Big clock */}
            <View style={styles.clockStage}>
              <Text style={[styles.clockBig, danger && styles.clockBigDanger]}>{timeLeft}</Text>
              <Text style={[styles.clockLabel, danger && { color: COLORS.rose }]}>
                {danger ? 'Seconds left — GO GO GO!' : 'Seconds left'}
              </Text>
              <View style={styles.clockTrack}>
                <View
                  style={[
                    styles.clockFill,
                    {
                      width: `${Math.max(0, (timeLeft / START_SECONDS) * 100)}%`,
                      backgroundColor: danger ? COLORS.rose : COLORS.cyan,
                    },
                  ]}
                />
              </View>
            </View>

            {/* Live stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.cyan }]}>{liveWpm}</Text>
                <Text style={styles.statLabel}>WPM</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.green }]}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.amber }]}>{progress}%</Text>
                <Text style={styles.statLabel}>Paragraph</Text>
              </View>
            </View>

            {/* Paragraph */}
            <View style={styles.passageCard}>
              <Text style={styles.passageLabel}>Type the paragraph</Text>
              <View style={styles.passageLine}>
                {g.text ? g.text.split('').map((ch, i) => renderChar(ch, i)) : null}
              </View>
            </View>
          </>
        )}

        {Platform.OS !== 'web' && (
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            defaultValue=""
            onChangeText={handleChange}
            returnKeyType="done"
            blurOnSubmit={false}
            editable
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={started}
            caretHidden
            spellCheck={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(20) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(10) },
  backBtn: {
    width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    marginRight: scaleSize(12),
  },
  headerTitle: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700',
  },
  clockChip: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5), paddingHorizontal: scaleSize(12),
  },
  clockDanger: { backgroundColor: 'rgba(244,63,94,0.25)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.6)' },
  clockText: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },

  clockStage: { alignItems: 'center', marginBottom: scaleSize(12) },
  clockBig: {
    color: COLORS.cyan, fontSize: scaleFont(46), fontFamily: 'Calibri', fontWeight: '700',
    textShadowColor: 'rgba(14,116,144,0.5)', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 18,
  },
  clockBigDanger: {
    color: COLORS.rose,
    textShadowColor: 'rgba(244,63,94,0.6)',
  },
  clockLabel: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1, marginBottom: scaleSize(8) },
  clockTrack: {
    height: 8, width: '80%', borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  clockFill: { height: 8, borderRadius: 4 },

  statsRow: { flexDirection: 'row', gap: scaleSize(8), marginBottom: scaleSize(12) },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(10),
  },
  statVal: { fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  statLabel: { fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.8 },

  passageCard: {
    backgroundColor: 'rgba(30,46,84,0.55)', borderRadius: scaleSize(16),
    borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    padding: scaleSize(16), flex: 1,
    shadowColor: '#0e7490', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 5,
  },
  passageLabel: { color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(10) },
  passageLine: { flexDirection: 'row', flexWrap: 'wrap', lineHeight: scaleFont(24) },
  plainLetter: {
    fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite,
    lineHeight: scaleFont(24),
  },
  plainLetterFuture: { color: 'rgba(219,228,243,0.4)' },
  plainGood: { color: COLORS.green },
  plainWrong: { color: COLORS.rose, textDecorationLine: 'line-through' },
  currentWrap: { flexDirection: 'row', alignItems: 'center' },
  caret: { width: 2, height: scaleFont(19), borderRadius: 1, backgroundColor: COLORS.cyan, marginHorizontal: 1 },

  readyCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  readyIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
  },
  readyTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  readyDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '600',
    textAlign: 'center', lineHeight: scaleFont(19), marginTop: scaleSize(10), marginBottom: scaleSize(22),
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0e7490', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(13), paddingHorizontal: scaleSize(34),
    shadowColor: '#0e7490', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 8,
  },
  readyBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },

  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  doneIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
  },
  doneTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  doneSub: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '600', marginTop: scaleSize(6), marginBottom: scaleSize(18), textAlign: 'center' },
  doneRow: { flexDirection: 'row', gap: scaleSize(10), marginBottom: scaleSize(10) },
  doneStat: {
    minWidth: scaleSize(96), alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(12),
  },
  doneVal: { fontSize: scaleFont(20), fontFamily: 'Calibri', fontWeight: '700' },
  doneLabel: { fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted, marginTop: 2 },
  restartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0e7490', borderRadius: scaleSize(13),
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(28), marginTop: scaleSize(8),
    shadowColor: '#0e7490', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 6,
  },
  restartBtnText: { color: '#fff', fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: scaleSize(11), paddingHorizontal: scaleSize(24), marginTop: scaleSize(10),
  },
  exitBtnText: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
});