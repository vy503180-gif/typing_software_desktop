// src/screens/AccuracyChallengeScreen.js
// Accuracy Challenge game:
// Slow aur precise. Chhota passage (4-5 sentences) type karo. Ek bhi galat
// letter accuracy girata hai. 98%+ accuracy par milestone bonus. Har galat
// keystroke par accuracy instantly dikhta hai, taki pressure lifta rahe.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { sentencesText } from '../data/typingTexts';

const TARGET = 98;

export default function AccuracyChallengeScreen({ onBack }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const gameRef = useRef({
    text: '',
    typedCount: 0,
    wrong: [],
    correctChars: 0,
    totalChars: 0,
    mistakes: 0,
    milestones: 0,
    elapsedMs: 0,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const startAtRef = useRef(0);
  const timerRef = useRef(null);

  const startGame = () => {
    gameRef.current = {
      text: sentencesText(4, 'medium').replace(/\s+/g, ' ').trim(),
      typedCount: 0,
      wrong: [],
      correctChars: 0,
      totalChars: 0,
      mistakes: 0,
      milestones: 0,
      elapsedMs: 0,
    };
    setStarted(true);
    setFinished(false);
    startAtRef.current = Date.now();
    forceRender();
    focusInput();
  };

  const focusInput = () => {
    if (Platform.OS === 'web') return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
  };

  useEffect(() => {
    if (!started || finished) return;
    timerRef.current = setInterval(() => {
      gameRef.current.elapsedMs = Date.now() - startAtRef.current;
      forceRender();
    }, 200);
    return () => clearInterval(timerRef.current);
  }, [started, finished]);

  useEffect(() => {
    if (!started || finished) return;
    const g = gameRef.current;
    if (g.typedCount >= g.text.length) {
      setFinished(true);
    }
  }, [started, finished, gameRef.current.typedCount]);

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

    // Milestone bonus har 98% bar ke pal par
    const acc = (g.correctChars / g.totalChars) * 100;
    if (acc >= TARGET && g.totalChars % 6 === 0 && !g.wrong.includes(g.typedCount - 1)) {
      g.milestones++;
    }

    if (g.typedCount >= g.text.length) {
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
  const accuracy = g.totalChars > 0 ? Math.round((g.correctChars / g.totalChars) * 1000) / 10 : 100;
  const elapsedSec = Math.max(1, g.elapsedMs / 1000);
  const liveWpm = g.totalChars > 0 ? Math.round((g.totalChars / 5) / (elapsedSec / 60) * (accuracy / 100)) : 0;
  const score = Math.round((g.correctChars / 5) * (accuracy / TARGET) + g.milestones * 50);
  const aboveTarget = accuracy >= TARGET;

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
          <Text style={styles.headerTitle}>Accuracy Challenge</Text>
          <View style={[styles.targetChip, aboveTarget && started && styles.targetHit]}>
            <Ionicons name="locate" size={14} color={COLORS.textWhite} />
            <Text style={styles.targetText}>Target 98%</Text>
          </View>
        </View>

        {finished ? (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: aboveTarget ? 'rgba(139,92,246,0.15)' : 'rgba(244,63,94,0.15)' }]}>
              <Ionicons name={aboveTarget ? 'ribbon' : 'warning'} size={46} color={aboveTarget ? COLORS.purple : COLORS.rose} />
            </View>
            <Text style={styles.doneTitle}>{aboveTarget ? 'Precision Master!' : 'Keep Practicing'}</Text>
            <Text style={styles.doneSub}>Accuracy Challenge complete • {accuracy}% accuracy</Text>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: aboveTarget ? COLORS.green : COLORS.rose }]}>{accuracy}%</Text>
                <Text style={styles.doneLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.purple }]}>{score}</Text>
                <Text style={styles.doneLabel}>Score</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.cyan }]}>{g.milestones}</Text>
                <Text style={styles.doneLabel}>Bonuses</Text>
              </View>
            </View>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.rose }]}>{g.mistakes}</Text>
                <Text style={styles.doneLabel}>Mistakes</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{Math.round(elapsedSec)}s</Text>
                <Text style={styles.doneLabel}>Time</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restartBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={COLORS.purple} />
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
              <Text style={styles.exitBtnText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.readyCard}>
            <View style={[styles.readyIcon, { backgroundColor: 'rgba(139,92,246,0.15)' }]}>
              <Ionicons name="locate" size={44} color={COLORS.purple} />
            </View>
            <Text style={styles.readyTitle}>Accuracy Challenge</Text>
            <Text style={styles.readyDesc}>
              Type the passage with zero rushing.{'\n'}
              Score bigs only when accuracy stays above {TARGET}%.
            </Text>
            <TouchableOpacity style={styles.readyBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="play" size={17} color="#fff" />
              <Text style={styles.readyBtnText}>Start Challenge</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Live stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, aboveTarget ? styles.statBoxGood : styles.statBoxWarn]}>
                <Text style={[styles.statVal, { color: aboveTarget ? COLORS.green : COLORS.amber }]}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.cyan }]}>{g.mistakes}</Text>
                <Text style={styles.statLabel}>Mistakes</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.statLabel}>WPM</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.purple }]}>{g.totalChars}/{g.text.length}</Text>
                <Text style={styles.statLabel}>Chars</Text>
              </View>
            </View>

            {/* Accuracy gauge */}
            <View style={styles.gaugeWrap}>
              <View style={styles.gaugeHeader}>
                <Text style={styles.gaugeLabel}>Precision Gauge</Text>
                <Text style={[styles.gaugeTarget, aboveTarget && { color: COLORS.green }]}>
                  {aboveTarget ? 'Above 98% ✓' : 'Target: 98%'}
                </Text>
              </View>
              <View style={styles.gaugeTrack}>
                <View
                  style={[
                    styles.gaugeFill,
                    {
                      width: `${Math.min(100, accuracy)}%`,
                      backgroundColor: accuracy >= TARGET ? COLORS.green : accuracy >= 90 ? COLORS.amber : COLORS.rose,
                    },
                  ]}
                />
                <View style={[styles.gaugeTargetMark, { left: `${TARGET}%` }]} />
              </View>
              <View style={styles.gaugeScale}>
                <Text style={styles.gaugeScaleText}>0%</Text>
                <Text style={styles.gaugeScaleText}>50%</Text>
                <Text style={styles.gaugeScaleText}>98%</Text>
                <Text style={styles.gaugeScaleText}>100%</Text>
              </View>
            </View>

            {/* Passage - char-by-char */}
            <View style={styles.passageCard}>
              <Text style={styles.passageLabel}>Type this passage</Text>
              <View style={styles.passageLine}>
                {g.text ? g.text.split('').map((ch, i) => renderChar(ch, i)) : null}
              </View>
            </View>

            {/* Score */}
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBox, { borderColor: 'rgba(139,92,246,0.5)' }]}>
                <Text style={styles.scoreVal}>{score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
              <View style={[styles.bonusBox, { borderColor: 'rgba(14,116,144,0.4)' }]}>
                <Ionicons name="sparkles" size={13} color={COLORS.cyan} />
                <Text style={styles.bonusText}>Bonus {g.milestones}x</Text>
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

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  backBtn: {
    width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    marginRight: scaleSize(12),
  },
  headerTitle: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700',
  },
  targetChip: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5), paddingHorizontal: scaleSize(12),
  },
  targetHit: { backgroundColor: 'rgba(34,197,94,0.2)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.5)' },
  targetText: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: scaleSize(8), marginBottom: scaleSize(10) },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(10),
  },
  statBoxGood: { borderColor: 'rgba(34,197,94,0.5)' },
  statBoxWarn: { borderColor: 'rgba(245,158,11,0.5)' },
  statVal: { fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  statLabel: { fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.8 },

  gaugeWrap: {
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(14),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    padding: scaleSize(14), marginBottom: scaleSize(12),
  },
  gaugeHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: scaleSize(8) },
  gaugeLabel: { color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1 },
  gaugeTarget: { color: COLORS.textWhite, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },
  gaugeTrack: {
    height: 12, borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.08)', position: 'relative', overflow: 'hidden',
  },
  gaugeFill: { height: 12, borderRadius: 6 },
  gaugeTargetMark: {
    position: 'absolute', top: -2, bottom: -2, width: 2,
    backgroundColor: '#fff', opacity: 0.9,
  },
  gaugeScale: { flexDirection: 'row', justifyContent: 'space-between', marginTop: scaleSize(6) },
  gaugeScaleText: { color: COLORS.textDim, fontSize: scaleFont(9), fontFamily: 'Calibri', fontWeight: '600' },

  passageCard: {
    backgroundColor: 'rgba(30,46,84,0.55)', borderRadius: scaleSize(16),
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)',
    padding: scaleSize(16), flex: 1,
    shadowColor: '#fb923c', shadowOpacity: 0.12, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 5,
  },
  passageLabel: { color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(10) },
  passageLine: { flexDirection: 'row', flexWrap: 'wrap', lineHeight: scaleFont(24) },
  plainLetter: {
    fontSize: scaleFont(19), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite,
    lineHeight: scaleFont(24),
  },
  plainLetterFuture: { color: 'rgba(219,228,243,0.4)' },
  plainGood: { color: COLORS.green },
  plainWrong: { color: COLORS.rose, textDecorationLine: 'line-through' },
  currentWrap: { flexDirection: 'row', alignItems: 'center' },
  caret: { width: 2, height: scaleFont(20), borderRadius: 1, backgroundColor: COLORS.purple, marginHorizontal: 1 },

  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10), marginTop: scaleSize(10) },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(139,92,246,0.08)', borderRadius: scaleSize(14),
    borderWidth: 1, paddingVertical: scaleSize(8), paddingHorizontal: scaleSize(28),
  },
  scoreVal: { color: COLORS.purple, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  scoreLabel: { color: COLORS.textMuted, fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1 },
  bonusBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.08)', borderRadius: scaleSize(12),
    borderWidth: 1, paddingVertical: scaleSize(8), paddingHorizontal: scaleSize(16),
  },
  bonusText: { color: COLORS.cyan, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },

  readyCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  readyIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)',
  },
  readyTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  readyDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '600',
    textAlign: 'center', lineHeight: scaleFont(19), marginTop: scaleSize(10), marginBottom: scaleSize(22),
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#0e9488', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(13), paddingHorizontal: scaleSize(34),
    shadowColor: '#0e9488', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 8,
  },
  readyBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },

  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  doneIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(139,92,246,0.4)',
  },
  doneTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  doneSub: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '600', marginTop: scaleSize(6), marginBottom: scaleSize(18) },
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
    backgroundColor: '#0e9488', borderRadius: scaleSize(13),
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(28), marginTop: scaleSize(8),
    shadowColor: '#0e9488', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 6,
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