// src/screens/SpeedChallengeScreen.js
// Speed Challenge game:
// 60 seconds of pure speed. Ek samay me ek word aata hai (baade font me),
// usko type karo. Complete word par aage badho. Combo badhta hai jab ek bhi
// letter galat nahi hota — combo multiplier score ko bada deta hai.
// Timeout (60s) par result dikhta hai: WPM, accuracy, best combo, score.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { rushWordList } from '../data/typingTexts';

const GAME_SECONDS = 60;

const fmt = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

export default function SpeedChallengeScreen({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  // Game state ek hi source-of-truth object me
  const gameRef = useRef({
    pool: null,
    word: null,
    typedCount: 0,
    wrong: [],
    combo: 0,
    bestCombo: 0,
    correctChars: 0,
    totalChars: 0,
    wordsDone: 0,
    mistakes: 0,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const startedAtRef = useRef(0);

  const startGame = () => {
    gameRef.current = {
      pool: rushWordList(),
      word: null,
      typedCount: 0,
      wrong: [],
      combo: 0,
      bestCombo: 0,
      correctChars: 0,
      totalChars: 0,
      wordsDone: 0,
      mistakes: 0,
    };
    nextWord();
    setTimeLeft(GAME_SECONDS);
    setStarted(true);
    setFinished(false);
    startedAtRef.current = Date.now();
    forceRender();
    focusInput();
  };

  const nextWord = () => {
    const g = gameRef.current;
    const arr = g.pool || rushWordList();
    const pool = arr.length >= 3 ? arr : rushWordList();
    g.word = pool[Math.floor(Math.random() * pool.length)] || 'type';
    g.typedCount = 0;
    g.wrong = [];
  };

  const focusInput = () => {
    if (Platform.OS === 'web') return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
  };

  // Timer
  useEffect(() => {
    if (!started || finished) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          setFinished(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [started, finished]);

  // Web par global keydown - kabhi focus na chhute to bhi capture
  const handleKeyRef = useRef(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (!started || finished) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleKeyRef.current && handleKeyRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [started, finished]);

  const handleKey = (raw) => {
    const g = gameRef.current;
    if (!g.word || finished) return;
    const t = raw.toLowerCase();
    if (t.length !== 1 || !/^[a-z]$/.test(t)) return;

    if (g.typedCount >= g.word.length) {
      g.typedCount = 0;
      g.wrong = [];
    }

    const expected = g.word[g.typedCount];
    g.totalChars++;
    g.combo++;
    g.bestCombo = Math.max(g.bestCombo, g.combo);

    if (t === expected) {
      g.correctChars++;
      g.typedCount++;
      if (g.typedCount === g.word.length) {
        g.wordsDone++;
        setTimeout(() => {
          nextWord();
          forceRender();
        }, 40);
      }
      forceRender();
    } else {
      g.mistakes++;
      g.combo = 0;
      if (!g.wrong.includes(g.typedCount)) g.wrong.push(g.typedCount);
      forceRender();
    }
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
  const elapsed = finished ? GAME_SECONDS : Math.min(GAME_SECONDS, GAME_SECONDS - timeLeft);
  const liveWpm = Math.round(g.correctChars / 5 / (Math.max(1, elapsed) / 60));
  const accuracy = g.totalChars > 0 ? Math.round((g.correctChars / g.totalChars) * 100) : 100;
  const multiplier = 1 + Math.min(5, Math.floor(g.bestCombo / 8));
  const score = Math.round(g.wordsDone * 100 * multiplier + g.correctChars);

  const renderKey = (ch, idx) => {
    if (idx < g.typedCount) {
      const wasWrong = g.wrong.includes(idx);
      return (
        <Text key={idx} style={[styles.bigLetter, wasWrong ? styles.bigLetterWrong : styles.bigLetterGood]}>
          {ch}
        </Text>
      );
    }
    if (idx === g.typedCount) {
      return (
        <View key={idx} style={styles.currentWrap}>
          <View style={styles.caret} />
          <Text style={styles.bigLetter}>{ch}</Text>
        </View>
      );
    }
    return (
      <Text key={idx} style={[styles.bigLetter, styles.bigLetterDim]}>
        {ch}
      </Text>
    );
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
          <Text style={styles.headerTitle}>Speed Challenge</Text>
          <View style={[styles.timerChip, timeLeft <= 10 && started && styles.timerDanger]}>
            <Ionicons name="time-outline" size={14} color={COLORS.textWhite} />
            <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
          </View>
        </View>

        {finished ? (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Ionicons name="flash" size={46} color={COLORS.amber} />
            </View>
            <Text style={styles.doneTitle}>Time&apos;s Up!</Text>
            <Text style={styles.doneSub}>Speed Challenge complete • Score {score}</Text>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.green }]}>{accuracy}%</Text>
                <Text style={styles.doneLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.blueBright }]}>{score}</Text>
                <Text style={styles.doneLabel}>Score</Text>
              </View>
            </View>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{g.wordsDone}</Text>
                <Text style={styles.doneLabel}>Words</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{g.bestCombo}</Text>
                <Text style={styles.doneLabel}>Best Combo</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.rose }]}>{g.mistakes}</Text>
                <Text style={styles.doneLabel}>Mistakes</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restartBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={COLORS.amber} />
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
              <Text style={styles.exitBtnText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.readyCard}>
            <View style={[styles.readyIcon, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
              <Ionicons name="flash" size={44} color={COLORS.amber} />
            </View>
            <Text style={styles.readyTitle}>Speed Challenge</Text>
            <Text style={styles.readyDesc}>
              Type words as fast as you can for {GAME_SECONDS} seconds.{'\n'}
              Never miss a letter to grow the combo multiplier.
            </Text>
            <TouchableOpacity style={styles.readyBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="play" size={17} color="#fff" />
              <Text style={styles.readyBtnText}>Start Game</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Live stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.statLabel}>WPM</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.green }]}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.cyan }]}>{g.wordsDone}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.purple }]}>{g.combo}</Text>
                <Text style={styles.statLabel}>Combo</Text>
              </View>
            </View>

            {/* Combo multiplier */}
            <View style={styles.multRow}>
              <Ionicons name="flash" size={14} color={COLORS.amber} />
              <Text style={styles.multText}>Multiplier x{multiplier}</Text>
              <View style={styles.multTrack}>
                <View style={[styles.multFill, { width: `${Math.min(100, (g.combo / 8) * 100)}%` }]} />
              </View>
            </View>

            {/* Current word - big */}
            <View style={styles.wordStage}>
              <Text style={styles.wordLabel}>Type this word</Text>
              <View style={[styles.bigWord, g.mistakes > 0 && { borderColor: 'rgba(244,63,94,0.5)' }]}>
                {g.word ? (
                  <View style={styles.bigWordInner}>
                    {g.word.split('').map((ch, i) => renderKey(ch, i))}
                  </View>
                ) : (
                  <Text style={styles.bigLetter}>…</Text>
                )}
              </View>
              <Text style={styles.nextHint}>Next word comes automatically • 60 seconds on the clock</Text>
            </View>

            {/* Score */}
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBox, { borderColor: 'rgba(245,158,11,0.5)' }]}>
                <Text style={styles.scoreVal}>{score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
              </View>
            </View>
          </>
        )}

        {/* Hidden input - sirf NATIVE (App) ke liye */}
        {Platform.OS !== 'web' && (
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            defaultValue=""
            onChangeText={handleChange}
            returnKeyType="go"
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
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  backBtn: {
    width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    marginRight: scaleSize(12),
  },
  headerTitle: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Poppins_700Bold', fontWeight: '700',
  },
  timerChip: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5), paddingHorizontal: scaleSize(12),
  },
  timerDanger: { backgroundColor: 'rgba(244,63,94,0.2)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.5)' },
  timerText: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  statsRow: {
    flexDirection: 'row', gap: scaleSize(8),
    marginBottom: scaleSize(10),
  },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: scaleSize(10),
  },
  statVal: { fontSize: scaleFont(19), fontFamily: 'Poppins_700Bold', fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  statLabel: { fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.8, flexShrink: 1, textAlign: 'center' },

  multRow: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(8),
    backgroundColor: 'rgba(245,158,11,0.08)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.3)',
    borderRadius: scaleSize(10), paddingHorizontal: scaleSize(12), paddingVertical: scaleSize(7),
    marginBottom: scaleSize(14),
  },
  multText: { color: COLORS.amber, fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  multTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  multFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.amber },

  wordStage: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: scaleSize(10) },
  wordLabel: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(10) },
  bigWord: {
    backgroundColor: 'rgba(30,46,84,0.55)', borderRadius: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.45)',
    paddingVertical: scaleSize(22), paddingHorizontal: scaleSize(24),
    shadowColor: '#f59e0b', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 6 }, shadowRadius: 18, elevation: 6,
  },
  bigWordInner: { flexDirection: 'row', alignItems: 'center' },
  bigLetter: {
    fontSize: scaleFont(34), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textWhite,
  },
  bigLetterDim: { color: 'rgba(219,228,243,0.35)' },
  bigLetterGood: { color: COLORS.green },
  bigLetterWrong: { color: COLORS.rose },
  currentWrap: { flexDirection: 'row', alignItems: 'center' },
  caret: {
    width: 3, height: scaleFont(32), borderRadius: 2,
    backgroundColor: COLORS.amber, marginHorizontal: 2,
  },
  nextHint: { color: COLORS.textDim, fontSize: scaleFont(10.5), fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: scaleSize(12), textAlign: 'center' },

  scoreRow: { alignItems: 'center', marginTop: scaleSize(4) },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.08)', borderRadius: scaleSize(14),
    borderWidth: 1, paddingVertical: scaleSize(8), paddingHorizontal: scaleSize(28),
  },
  scoreVal: { color: COLORS.amber, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  scoreLabel: { color: COLORS.textMuted, fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', letterSpacing: 1, flexShrink: 1, textAlign: 'center' },

  readyCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  readyIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
  },
  readyTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  readyDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    textAlign: 'center', lineHeight: scaleFont(19), marginTop: scaleSize(10), marginBottom: scaleSize(22),
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#d97706', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(13), paddingHorizontal: scaleSize(34),
    shadowColor: '#d97706', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 8,
  },
  readyBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  doneIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
  },
  doneTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  doneSub: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: scaleSize(6), marginBottom: scaleSize(18) },
  doneRow: { flexDirection: 'row', gap: scaleSize(10), marginBottom: scaleSize(10) },
  doneStat: {
    minWidth: scaleSize(96), alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(12),
  },
  doneVal: { fontSize: scaleFont(20), fontFamily: 'Poppins_700Bold', fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  doneLabel: { fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, flexShrink: 1, textAlign: 'center' },
  restartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#d97706', borderRadius: scaleSize(13),
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(28), marginTop: scaleSize(8),
    shadowColor: '#d97706', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 6,
  },
  restartBtnText: { color: '#fff', fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: scaleSize(11), paddingHorizontal: scaleSize(24), marginTop: scaleSize(10),
  },
  exitBtnText: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});