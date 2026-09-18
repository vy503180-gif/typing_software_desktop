// src/screens/TypingScreen.js
// Typing test screen with vibrant colors

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard,
  Animated,
  Dimensions,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const SCREEN_W = SCREEN.width;
import { LESSON_TEXTS, LESSON_DIFFICULTY } from '../data/lessons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'Practice makes a person perfect in every single way of life.',
  'A journey of thousand miles begins with a single small step.',
  'Mobile typing is a useful skill for the modern digital world.',
];

const shuffleText = (text) => {
  const words = text.trim().split(/\s+/);
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words.join(' ');
};

export default function TypingScreen({ lesson = null, onComplete = null, studentName = null, onBack = null }) {
  const lessonText = lesson?.practiceText || (lesson ? LESSON_TEXTS[lesson.lang]?.[lesson.id] || null : null);

  const [currentText, setCurrentText] = useState(
    lessonText || SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
  );
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [countdown, setCountdown] = useState(lesson?.timeSec || 0);
  const [result, setResult] = useState({ wpm: 0, accuracy: 0 });

  const timeLimit = lesson?.timeSec || 0;

  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const scrollRef = useRef(null);
  const lastScrollRow = useRef(0);

  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cursorOpacity]);

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
        if (timeLimit > 0) setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isPaused, isFinished, timeLimit]);

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished && timeLimit > 0 && countdown <= 0) {
      finishTest(true);
      if (onBack) setTimeout(onBack, 1200);
    }
  }, [countdown, isStarted, isPaused, isFinished]);

  useEffect(() => {
    if (isStarted && !isPaused && userInput.length === currentText.length) {
      finishTest(false);
    }
  }, [userInput, isPaused]);

  useEffect(() => {
    if (!isStarted || isPaused || isFinished || !scrollRef.current) return;
    const charsPerRow = Math.max(1, Math.floor((SCREEN_W - 72) / scaleFont(18)));
    const row = Math.floor(userInput.length / charsPerRow);
    if (row > lastScrollRow.current && userInput.length > 0) {
      lastScrollRow.current = row;
      scrollRef.current.scrollTo({ y: row * scaleFont(32), animated: true });
    }
  }, [userInput, isStarted, isPaused, isFinished]);

  const startNewTest = () => {
    if (lessonText) setCurrentText(shuffleText(lessonText));
    else setCurrentText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
    setUserInput('');
    lastScrollRow.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
    setSeconds(0);
    setCountdown(timeLimit);
    setIsStarted(true);
    setIsPaused(false);
    setIsFinished(false);
    setIsTimedOut(false);
    setResult({ wpm: 0, accuracy: 0 });
  };

  const finishTest = (timedOut = false) => {
    setIsFinished(true);
    setIsTimedOut(timedOut);
    clearInterval(timerRef.current);
    Keyboard.dismiss();
    const words = currentText.trim().split(/\s+/).length;
    const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;
    let correctChars = 0;
    for (let i = 0; i < currentText.length; i++) {
      if (userInput[i] === currentText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / currentText.length) * 100);
    const mistakes = currentText.length - correctChars;
    setResult({ wpm, accuracy });
    saveHistory({ wpm, accuracy, mistakes });
    if (!timedOut && lesson && onComplete) onComplete(lesson.lang, lesson.id);
  };

  const saveHistory = ({ wpm, accuracy, mistakes }) => {
    const key = getHistoryKey(studentName);
    AsyncStorage.getItem(key)
      .then((raw) => {
        let list = [];
        try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
        const now = new Date();
        const record = {
          id: Date.now(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lesson: lesson ? lesson.title : 'Practice',
          lessonTime: timeLimit,
          timeTaken: seconds,
          wpm, accuracy, mistakes,
        };
        list.unshift(record);
        list = list.slice(0, 50);
        AsyncStorage.setItem(key, JSON.stringify(list)).catch(() => {});
      })
      .catch(() => {});
  };

  const stats = (() => {
    const elapsed = seconds > 0 ? seconds : 1;
    const wordsTyped = userInput.trim().split(/\s+/).filter((w) => w !== '').length;
    const wpm = isStarted ? Math.round((wordsTyped / elapsed) * 60) : 0;
    let correct = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] === currentText[i]) correct++;
    }
    const accuracy = userInput.length > 0 ? Math.round((correct / userInput.length) * 100) : 100;
    const mistakes = userInput.length - correct;
    return { wpm, accuracy, mistakes, correct };
  })();

  const progress = Math.min(1, userInput.length / currentText.length);

  const handlePause = () => {
    if (isFinished) return;
    setIsPaused((prev) => {
      const next = !prev;
      if (next) Keyboard.dismiss();
      else if (inputRef.current) inputRef.current.focus();
      return next;
    });
  };

  const handleCharPress = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            {onBack ? (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            ) : null}
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Typing Practice</Text>
              {lesson && (
                <Text style={styles.subtitle}>
                  {lesson.courseSubId || lesson.title}
                  {lesson.courseSubId ? <Text style={styles.subtitleStrong}> - {lesson.title}</Text> : null}
                </Text>
              )}
            </View>
          </View>

          {lesson && (
            <View style={[styles.lessonTag, { backgroundColor: COLORS.teal + '15', borderColor: COLORS.teal + '40' }]}>
              <Ionicons name="school" size={12} color={COLORS.teal} />
              <Text style={[styles.lessonTagText, { color: COLORS.teal }]}>
                {lesson.title} - {LESSON_DIFFICULTY[lesson.id]}
              </Text>
            </View>
          )}

          {/* Result box */}
          {isFinished ? (
            <View style={[styles.resultBox, isTimedOut ? { borderColor: COLORS.rose + '60' } : { borderColor: COLORS.green + '60' }]}>
              <View style={[styles.resultIconWrap, { backgroundColor: isTimedOut ? COLORS.rose + '20' : COLORS.green + '20' }]}>
                <Ionicons name={isTimedOut ? 'time' : 'checkmark-circle'} size={32} color={isTimedOut ? COLORS.rose : COLORS.green} />
              </View>
              <Text style={[styles.resultTitle, { color: isTimedOut ? COLORS.rose : COLORS.green }]}>
                {isTimedOut ? 'Time Up!' : 'Test Complete!'}
              </Text>
              <Text style={styles.resultMsg}>
                {isTimedOut ? `Your speed: ${result.wpm} WPM` : `Your speed: ${result.wpm} WPM - great job!`}
              </Text>
              <View style={styles.resultRow}>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultValue, { color: COLORS.teal }]}>{result.wpm}</Text>
                  <Text style={styles.resultLabel}>WPM</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultValue, { color: COLORS.green }]}>{result.accuracy}%</Text>
                  <Text style={styles.resultLabel}>Accuracy</Text>
                </View>
                <View style={styles.resultItem}>
                  <Text style={[styles.resultValue, { color: COLORS.rose }]}>{stats.mistakes}</Text>
                  <Text style={styles.resultLabel}>Errors</Text>
                </View>
              </View>
              <TouchableOpacity style={[styles.backHomeBtn, { backgroundColor: COLORS.green }]} onPress={onBack} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={16} color="#fff" />
                <Text style={styles.backHomeBtnText}>Back to Lessons</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* Stats grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="time" size={14} color={COLORS.teal} />
              <Text style={[styles.statValue, countdown <= 10 && !isFinished && timeLimit > 0 ? { color: COLORS.rose } : { color: COLORS.textWhite }]}>
                {timeLimit > 0
                  ? `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`
                  : `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`}
              </Text>
              <Text style={styles.statLabel}>Time</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.teal + '30' }]}>
              <Ionicons name="speedometer" size={14} color={COLORS.teal} />
              <Text style={[styles.statValue, { color: COLORS.teal }]}>{stats.wpm}</Text>
              <Text style={styles.statLabel}>WPM</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.green + '30' }]}>
              <Ionicons name="checkmark-circle" size={14} color={COLORS.green} />
              <Text style={[styles.statValue, { color: COLORS.green }]}>{stats.accuracy}%</Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={[styles.statCard, { borderColor: COLORS.rose + '30' }]}>
              <Ionicons name="warning" size={14} color={COLORS.rose} />
              <Text style={[styles.statValue, { color: stats.mistakes > 0 ? COLORS.rose : COLORS.textWhite }]}>{stats.mistakes}</Text>
              <Text style={styles.statLabel}>Errors</Text>
            </View>
          </View>

          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%`, backgroundColor: COLORS.teal }]}
            />
          </View>
          <Text style={styles.progressText}>{userInput.length}/{currentText.length} characters</Text>

          {/* Target text */}
          <TouchableOpacity style={styles.textBox} onPress={handleCharPress} activeOpacity={1}>
            <View style={styles.charRow}>
              {currentText.split('').map((char, i) => {
                const typed = userInput[i];
                let color = COLORS.textMuted;
                const isFixated = i < userInput.length;
                if (isFixated) {
                  color = typed === char ? COLORS.green : COLORS.rose;
                }
                const isCursorHere = i === userInput.length && !isFinished;
                return (
                  <View key={i} style={styles.charWrap}>
                    {isCursorHere ? (
                      <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
                    ) : null}
                    <Text style={[styles.char, { color }]}>{char}</Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>

          {/* Hidden input */}
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={userInput}
            onChangeText={setUserInput}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!isFinished && !isPaused}
            onFocus={() => { if (!isStarted) setIsStarted(true); }}
          />

          {/* Buttons */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: COLORS.teal }]}
              onPress={handlePause}
              disabled={isFinished}
            >
              <Ionicons name={isPaused ? 'play' : 'pause'} size={16} color="#fff" />
              <Text style={styles.actionButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.teal }]} onPress={startNewTest}>
              <Ionicons name="refresh" size={16} color="#fff" />
              <Text style={styles.actionButtonText}>Restart</Text>
            </TouchableOpacity>
          </View>

          {!isStarted && <Text style={styles.instruction}>Tap on the text and start typing...</Text>}
          {isPaused && !isFinished && <Text style={styles.pausedText}>Paused - tap Resume to continue</Text>}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: scaleSize(16), paddingBottom: scaleSize(40), justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(10) },
  backBtn: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: scaleSize(17),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.cardBg,
    marginRight: scaleSize(8),
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', fontSize: scaleFont(20), color: COLORS.textWhite },
  subtitle: { fontSize: scaleFont(12), color: COLORS.textMuted, fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },
  subtitleStrong: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight },

  lessonTag: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
    borderWidth: 1,
    borderRadius: scaleSize(20),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(5),
    marginBottom: scaleSize(12),
  },
  lessonTagText: { fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700'},

  instruction: { fontFamily: 'Calibri', color: COLORS.textMuted, textAlign: 'center', marginTop: scaleSize(10), fontSize: scaleFont(12) },
  pausedText: { color: COLORS.amber, textAlign: 'center', marginTop: scaleSize(10), fontFamily: 'Calibri', fontWeight: '700', fontSize: scaleFont(13) },

  resultBox: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginBottom: scaleSize(14),
    alignItems: 'center',
  },
  resultIconWrap: {
    width: scaleSize(52),
    height: scaleSize(52),
    borderRadius: scaleSize(26),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: scaleSize(8),
  },
  resultTitle: { fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700', marginBottom: scaleSize(4) },
  resultMsg: { fontSize: scaleFont(13), color: COLORS.textMuted, textAlign: 'center', marginBottom: scaleSize(12), fontFamily: 'Calibri', fontWeight: '700'},
  resultRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%' },
  resultItem: { alignItems: 'center' },
  resultValue: { fontSize: scaleFont(26), fontFamily: 'Calibri', fontWeight: '700'},
  resultLabel: { fontFamily: 'Calibri', fontSize: scaleFont(11), color: COLORS.textMuted, marginTop: 3 },

  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: scaleFont(10) },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: scaleSize(10),
    paddingVertical: scaleSize(8),
    marginHorizontal: 3,
    alignItems: 'center',
  },
  statValue: { fontSize: scaleFont(16), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(3) },
  statLabel: { fontSize: scaleFont(9), color: COLORS.textMuted, fontFamily: 'Calibri', fontWeight: '700', textTransform: 'uppercase', marginTop: scaleSize(2) },

  progressTrack: { height: scaleSize(5), borderRadius: scaleSize(3), backgroundColor: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: scaleSize(4) },
  progressFill: { height: '100%', borderRadius: scaleSize(3) },
  progressText: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(10), marginBottom: scaleFont(12), textAlign: 'right' },

  textBox: {
    backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(14),
    borderWidth: 1,
    borderColor: COLORS.teal + '40',
    padding: scaleSize(14),
    marginBottom: scaleSize(14),
    shadowColor: COLORS.teal,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: scaleSize(4) },
    shadowRadius: scaleSize(10),
    elevation: 4,
  },
  charRow: { flexDirection: 'row', flexWrap: 'wrap' },
  charWrap: { flexDirection: 'row', alignItems: 'center' },
  char: { fontSize: scaleFont(18), lineHeight: scaleFont(28), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 0.3 },
  cursor: { width: scaleSize(2), height: scaleFont(22), backgroundColor: COLORS.teal, borderRadius: scaleSize(2), marginHorizontal: scaleSize(1) },

  hiddenInput: { position: 'absolute', opacity: 0, height: 1, width: 1 },

  buttonsRow: { flexDirection: 'row', justifyContent: 'space-between', gap: scaleSize(10) },
  actionButton: {
    flex: 1,
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: scaleSize(6),
  },
  actionButtonText: { color: '#fff', fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  backHomeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(6),
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(12),
    marginTop: scaleSize(14),
    width: '100%',
  },
  backHomeBtnText: { color: '#fff', fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
});
