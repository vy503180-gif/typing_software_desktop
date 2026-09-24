// src/screens/WordRushScreen.js
// Word Rush game:
// 60 seconds. Ek word aata hai, type karke complete karo. Har correct word
// streak badhata hai. Streak jitna bada, combo multiplier utna bada.
// Ek bhi galat keystroke streak tod deta hai. Niche live chain dikhti hai.

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { wordsText } from '../data/typingTexts';

const GAME_SECONDS = 60;

const fmt = (secs) => `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`;

export default function WordRushScreen({ onBack }) {
  const [timeLeft, setTimeLeft] = useState(GAME_SECONDS);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const gameRef = useRef({
    stream: [],
    wordIndex: 0,
    typedCount: 0,
    wrong: [],
    streak: 0,
    bestStreak: 0,
    correctChars: 0,
    totalChars: 0,
    wordsDone: 0,
    mistakes: 0,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);

  const startGame = () => {
    const stream = wordsText(90, 'medium').split(/\s+/).filter((w) => w.length >= 3);
    gameRef.current = {
      stream,
      wordIndex: 0,
      typedCount: 0,
      wrong: [],
      streak: 0,
      bestStreak: 0,
      correctChars: 0,
      totalChars: 0,
      wordsDone: 0,
      mistakes: 0,
    };
    setTimeLeft(GAME_SECONDS);
    setStarted(true);
    setFinished(false);
    forceRender();
    focusInput();
  };

  const focusInput = () => {
    if (Platform.OS === 'web') return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
  };

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
    if (finished) return;
    const t = raw.toLowerCase();
    if (t.length !== 1 || !/^[a-z]$/.test(t)) return;

    const word = g.stream[g.wordIndex];
    if (!word) return;
    if (g.typedCount >= word.length) {
      g.typedCount = 0;
      g.wrong = [];
    }

    const expected = word[g.typedCount];
    g.totalChars++;
    g.streak++;
    g.bestStreak = Math.max(g.bestStreak, g.streak);

    if (t === expected) {
      g.correctChars++;
      g.typedCount++;
      if (g.typedCount === word.length) {
        g.wordsDone++;
        setTimeout(() => {
          g.wordIndex++;
          if (g.wordIndex >= g.stream.length - 1) {
            g.stream = g.stream.concat(wordsText(60, 'medium').split(/\s+/).filter((w) => w.length >= 3));
          }
          g.typedCount = 0;
          g.wrong = [];
          forceRender();
        }, 30);
      }
      forceRender();
    } else {
      g.mistakes++;
      g.streak = 0;
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
  const multiplier = 1 + Math.min(5, Math.floor(g.bestStreak / 6));
  const score = Math.round(g.wordsDone * 120 * multiplier + g.correctChars);

  const currentWord = g.stream[g.wordIndex] || '';
  const upcoming = g.stream.slice(g.wordIndex + 1, g.wordIndex + 4).filter(Boolean);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Word Rush</Text>
          <View style={[styles.timerChip, timeLeft <= 10 && started && styles.timerDanger]}>
            <Ionicons name="time-outline" size={14} color={COLORS.textWhite} />
            <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
          </View>
        </View>

        {finished ? (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: 'rgba(244,63,94,0.15)' }]}>
              <Ionicons name="trending-up" size={46} color={COLORS.rose} />
            </View>
            <Text style={styles.doneTitle}>Rush Over!</Text>
            <Text style={styles.doneSub}>Word Rush complete • Score {score}</Text>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.rose }]}>{g.wordsDone}</Text>
                <Text style={styles.doneLabel}>Words</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.blueBright }]}>{score}</Text>
                <Text style={styles.doneLabel}>Score</Text>
              </View>
            </View>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{g.bestStreak}</Text>
                <Text style={styles.doneLabel}>Best Streak</Text>
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
            <TouchableOpacity style={styles.restartBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={COLORS.rose} />
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
              <Text style={styles.exitBtnText}>Back to Games</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.readyCard}>
            <View style={[styles.readyIcon, { backgroundColor: 'rgba(244,63,94,0.15)' }]}>
              <Ionicons name="trending-up" size={44} color={COLORS.rose} />
            </View>
            <Text style={styles.readyTitle}>Word Rush</Text>
            <Text style={styles.readyDesc}>
              Words keep rushing in for {GAME_SECONDS} seconds.{'\n'}
              Every correct word grows your streak — and the multiplier.
            </Text>
            <TouchableOpacity style={styles.readyBtn} onPress={startGame} activeOpacity={0.85}>
              <Ionicons name="play" size={17} color="#fff" />
              <Text style={styles.readyBtnText}>Start Rush</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Live stats */}
            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.rose }]}>{g.wordsDone}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.amber }]}>{liveWpm}</Text>
                <Text style={styles.statLabel}>WPM</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.cyan }]}>{g.streak}</Text>
                <Text style={styles.statLabel}>Streak</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={[styles.statVal, { color: COLORS.purple }]}>{accuracy}%</Text>
                <Text style={styles.statLabel}>Accuracy</Text>
              </View>
            </View>

            {/* Streak multiplier bar */}
            <View style={styles.multRow}>
              <Ionicons name="flame" size={14} color={COLORS.rose} />
              <Text style={styles.multText}>Streak x{multiplier}</Text>
              <View style={styles.multTrack}>
                <View style={[styles.multFill, { width: `${Math.min(100, (g.streak / 6) * 100)}%` }]} />
              </View>
            </View>

            {/* Current word */}
            <View style={styles.wordStage}>
              <Text style={styles.wordLabel}>Rush this word</Text>
              <View style={[styles.bigWord, g.mistakes > 0 && { borderColor: 'rgba(244,63,94,0.5)' }]}>
                <View style={styles.bigWordInner}>
                  {currentWord.split('').map((ch, i) => {
                    if (i < g.typedCount) return <Text key={i} style={[styles.bigLetter, g.wrong.includes(i) ? styles.bigLetterWrong : styles.bigLetterGood]}>{ch}</Text>;
                    if (i === g.typedCount) {
                      return (
                        <View key={i} style={styles.currentWrap}>
                          <View style={styles.caret} />
                          <Text style={styles.bigLetter}>{ch}</Text>
                        </View>
                      );
                    }
                    return <Text key={i} style={[styles.bigLetter, styles.bigLetterDim]}>{ch}</Text>;
                  })}
                </View>
              </View>

              {/* Upcoming chain */}
              <View style={styles.chainRow}>
                {upcoming.map((w, i) => (
                  <View key={i} style={[styles.chainPill, i === 0 && { borderColor: 'rgba(244,63,94,0.6)' }]}>
                    <Text style={[styles.chainText, i === 0 && { color: COLORS.rose }]}>{w}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Score */}
            <View style={styles.scoreRow}>
              <View style={[styles.scoreBox, { borderColor: 'rgba(244,63,94,0.5)' }]}>
                <Text style={styles.scoreVal}>{score}</Text>
                <Text style={styles.scoreLabel}>Score</Text>
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
  timerChip: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5), paddingHorizontal: scaleSize(12),
  },
  timerDanger: { backgroundColor: 'rgba(244,63,94,0.2)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.5)' },
  timerText: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },

  statsRow: { flexDirection: 'row', gap: scaleSize(8), marginBottom: scaleSize(10) },
  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(10),
  },
  statVal: { fontSize: scaleFont(19), fontFamily: 'Calibri', fontWeight: '700' },
  statLabel: { fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.8 },

  multRow: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(8),
    backgroundColor: 'rgba(244,63,94,0.08)', borderWidth: 1, borderColor: 'rgba(244,63,94,0.3)',
    borderRadius: scaleSize(10), paddingHorizontal: scaleSize(12), paddingVertical: scaleSize(7),
    marginBottom: scaleSize(14),
  },
  multText: { color: COLORS.rose, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700' },
  multTrack: {
    flex: 1, height: 6, borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden',
  },
  multFill: { height: 6, borderRadius: 3, backgroundColor: COLORS.rose },

  wordStage: { alignItems: 'center', flex: 1, justifyContent: 'center', paddingVertical: scaleSize(10) },
  wordLabel: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(10) },
  bigWord: {
    backgroundColor: 'rgba(30,46,84,0.55)', borderRadius: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.45)',
    paddingVertical: scaleSize(22), paddingHorizontal: scaleSize(24),
    shadowColor: '#f43f5e', shadowOpacity: 0.15, shadowOffset: { width: 0, height: 6 }, shadowRadius: 18, elevation: 6,
  },
  bigWordInner: { flexDirection: 'row', alignItems: 'center' },
  bigLetter: {
    fontSize: scaleFont(34), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite,
  },
  bigLetterDim: { color: 'rgba(219,228,243,0.35)' },
  bigLetterGood: { color: COLORS.green },
  bigLetterWrong: { color: COLORS.rose },
  currentWrap: { flexDirection: 'row', alignItems: 'center' },
  caret: { width: 3, height: scaleFont(32), borderRadius: 2, backgroundColor: COLORS.rose, marginHorizontal: 2 },

  chainRow: { flexDirection: 'row', gap: scaleSize(6), marginTop: scaleSize(14), flexWrap: 'wrap', justifyContent: 'center' },
  chainPill: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: scaleSize(8),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingHorizontal: scaleSize(9), paddingVertical: scaleSize(5),
  },
  chainText: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '600' },

  scoreRow: { alignItems: 'center', marginTop: scaleSize(4) },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(244,63,94,0.08)', borderRadius: scaleSize(14),
    borderWidth: 1, paddingVertical: scaleSize(8), paddingHorizontal: scaleSize(28),
  },
  scoreVal: { color: COLORS.rose, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  scoreLabel: { color: COLORS.textMuted, fontSize: scaleFont(9.5), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1 },

  readyCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  readyIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.4)',
  },
  readyTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  readyDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '600',
    textAlign: 'center', lineHeight: scaleFont(19), marginTop: scaleSize(10), marginBottom: scaleSize(22),
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#e11d48', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(13), paddingHorizontal: scaleSize(34),
    shadowColor: '#e11d48', shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 8,
  },
  readyBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },

  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  doneIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(244,63,94,0.4)',
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
    backgroundColor: '#e11d48', borderRadius: scaleSize(13),
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(28), marginTop: scaleSize(8),
    shadowColor: '#e11d48', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 6 }, shadowRadius: 14, elevation: 6,
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