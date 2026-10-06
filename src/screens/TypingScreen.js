// src/screens/TypingScreen.js
// Professional typing workspace:
// - Configurable practice options (language / difficulty / duration / mode)
// - Large live typing area with char highlighting + auto-scroll
// - Progress tracking
// - Typing sound
// - Timer with auto-stop + professional result dashboard

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { playKeySound } from '../audio/keySound';
import { LESSON_TEXTS, LESSON_DIFFICULTY } from '../data/lessons';
import { generateTypingText, wordsText, certText, fitTextToDuration } from '../data/typingTexts';
import { krutiToUnicode, krutiSequenceProgress } from '../utils/krutiToUnicode';
import { COLORS, levelForWpm, scaleFont } from '../theme';

const getHistoryKey = () => `antriksh_typing_history`;

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];
const PR_MODES = [
  { label: 'Letters', value: 'letters' },
  { label: 'Words', value: 'words' },
  { label: 'Sentences', value: 'sentences' },
  { label: 'Paragraph', value: 'paragraph' },
];

function OptionPills({ options, value, onChange, color = COLORS.blue, small }) {
  return (
    <View style={styles.pillGroup}>
      {options.map((o) => {
        const label = typeof o === 'string' ? o : o.label;
        const val = typeof o === 'string' ? o : o.value;
        const active = val === value;
        return (
          <TouchableOpacity
            key={val}
            style={[styles.pill, small && styles.pillSmall, active && { backgroundColor: color + '2b', borderColor: color }]}
            onPress={() => onChange(val)}
            activeOpacity={0.7}
          >
            <Text style={[styles.pillText, small && styles.pillTextSmall, active && { color, fontWeight: '700' }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// Ek character cell. React.memo se har keystroke par sirf 2-3 chars
// dobara render hote hain (cursor + pichla char), baaki 1000+ cells skip.
const MemoChar = React.memo(function MemoChar({
  ch, color, bg, upcoming, isCursorHere, isNext,
  typeSize, lineHeight, started, finished, cursorOpacity, isHindi,
}) {
  return (
    <View style={styles.charWrap}>
      {isCursorHere && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />}
      {isNext && <View style={styles.nextCaret} />}
      <Text
        style={[
          styles.char,
          { color, backgroundColor: bg, fontSize: typeSize, lineHeight },
          isHindi && styles.charHindi,
          upcoming && styles.charUpcoming,
        ]}
      >
        {ch === ' ' ? '\u00A0' : ch}
      </Text>
    </View>
  );
});

// Hindi text ke liye nested Text elements - continuous text run mein
// per-character coloring. Isse Devanagari shaping (matras, halants,
// conjuncts) sahi se render hoti hai.
export const HindiTextRun = React.memo(function HindiTextRun({
  chars, colors, bgs, upcomings, typeSize, lineHeight,
}) {
  return (
    <Text style={[styles.char, styles.charHindi, { fontSize: typeSize, lineHeight }]}>
      {chars.map((ch, i) => (
        <Text
          key={i}
          style={{
            color: colors[i],
            backgroundColor: bgs[i],
            textDecorationLine: upcomings[i] ? 'underline' : 'none',
            textDecorationStyle: 'solid',
            textDecorationColor: '#0e7490',
          }}
        >
          {ch === ' ' ? '\u00A0' : ch}
        </Text>
      ))}
    </Text>
  );
});

export default function TypingScreen({
  config = {},
  settings = {},
  onComplete = null,
  onNextLesson = null,
  studentName = null,
  bestWpm = 0,
  onBack = null,
  hindiLayout = 'krutidev',
}) {
  const { width: winW, height: winH } = useWindowDimensions();
  const isKrutiLayout = config.lang === 'hindi' && hindiLayout === 'krutidev';
  const isPractice = config.type === 'practice';
  const isGame = config.type === 'game';
  const isTest = config.type === 'test';
  const isCert = config.type === 'cert';
  const isNumberedLesson = config.type === 'lesson' && !config.courseSubId;
  const certTargetValid = (res) =>
    res && config.targetWpm ? res.wpm >= config.targetWpm : res && config.targetAcc ? res.accuracy >= config.targetAcc : null;

  const certTargetLabel = config.targetWpm
    ? `${config.targetWpm} WPM`
    : config.targetAcc
      ? `${config.targetAcc}% Accuracy`
      : null;

  // --- config state ---
  const [difficulty, setDifficulty] = useState(config.difficulty || 'Easy');
  const [duration, setDuration] = useState(config.timeSec || 60);
  const [mode, setMode] = useState(config.mode || 'paragraph');

  // --- engine state ---
  const [currentText, setCurrentText] = useState('');
  const [rawInput, setRawInput] = useState('');
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [countdown, setCountdown] = useState(config.timeSec || 60);
  const [useTimed, setUseTimed] = useState((config.timeSec || 0) > 0);
  const [result, setResult] = useState(null);
  const [textWidth, setTextWidth] = useState(0);
  const [charW, setCharW] = useState(null);

  const timerRef = useRef(null);
  const finishRef = useRef(false);
  const lessonCompleteTimerRef = useRef(null);
  const certCloseRef = useRef(null);
  const onBackRef = useRef(onBack);
  const inputRef = useRef(null);
  const rawRef = useRef('');
  const scrollRef = useRef(null);
  const lastScrollRow = useRef(0);
  const textRowsRef = useRef([]);
  const cursorOpacity = useRef(new Animated.Value(1)).current;
  const textBoxRef = useRef(null);

  onBackRef.current = onBack;

  // ---- sound + settings ----
  const soundEnabled = settings.keyboardSound !== false;
  const bestWpmRef = useRef(bestWpm);
  bestWpmRef.current = bestWpm;
  const fontSize = settings.fontSize || 22;
  const typeSize = Math.max(15, Math.round(fontSize * 0.8));
  const charLineH = Math.max(22, Math.round(typeSize * 1.32));
  const rowH = charLineH + 6;

  const buildInitialText = useCallback(() => {
    let text = config.text || config.lessonText || null;
    if (!text && config.type === 'lesson' && config.lang && config.id) {
      text = LESSON_TEXTS[config.lang]?.[config.id] || null;
    }
    if (!text && config.type === 'rare') return null;
    if (!text && config.type === 'cert') text = certText(config.targetWpm || 15);
    if (!text) {
      text = generateTypingText({ mode: config.mode || 'paragraph', difficulty: config.difficulty || 'Easy', timeSec: config.timeSec || 60, lang: config.lang || 'english', targetWpm: bestWpmRef.current });
    }
    return config.type === 'lesson'
      ? fitTextToDuration(text, config.timeSec || 60, bestWpmRef.current)
      : text;
  }, [config]);

  useEffect(() => {
    const t = buildInitialText();
    if (t) setCurrentText(t);
    setCountdown(config.timeSec || 60);
    setUseTimed((config.timeSec || 0) > 0);
  }, [buildInitialText, config.timeSec]);

  // Jab config change ho (jaise "Next Lesson" dabane par naya lesson load ho)
  // toh purani typing/finish state reset karo aur naye lesson se start karo.
  useEffect(() => {
    finishRef.current = false;
    setDuration(config.timeSec || 0);
    setMode(config.mode || 'paragraph');
    setDifficulty(config.difficulty || 'Easy');
    setRawInput('');
    setUserInput('');
    rawRef.current = '';
    setSeconds(0);
    setCountdown(config.timeSec || 0);
    setUseTimed((config.timeSec || 0) > 0);
    setIsStarted(false);
    setIsPaused(false);
    setIsFinished(false);
    setIsTimedOut(false);
    setResult(null);
    lastScrollRow.current = 0;
    if (scrollRef.current && typeof scrollRef.current.scrollTo === 'function') {
      scrollRef.current.scrollTo({ y: 0, animated: false });
    }
    if (inputRef.current && typeof inputRef.current.focus === 'function') {
      setTimeout(() => inputRef.current.focus(), 50);
    }
  }, [config.id, config.type]);

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

  useEffect(() => () => {
    if (certCloseRef.current) clearTimeout(certCloseRef.current);
    if (lessonCompleteTimerRef.current) clearTimeout(lessonCompleteTimerRef.current);
  }, []);

  // ESC = go back (web)
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape' && onBackRef.current) {
        onBackRef.current();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  // timer
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
        if (useTimed) setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isPaused, isFinished, useTimed]);

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished && useTimed && countdown <= 0) {
      finishTest(true);
    }
  }, [countdown, isStarted, isPaused, isFinished, useTimed]);

  useEffect(() => {
    if (isStarted && !isPaused && !isFinished && currentText && userInput.length === currentText.length) {
      finishTest(false);
    }
  }, [userInput, isPaused, isFinished, isStarted, currentText]);

  // autoscroll
  useEffect(() => {
    if (!isStarted || isPaused || isFinished || !scrollRef.current) return;
    const rows = textRowsRef.current;
    let r = 0;
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] <= userInput.length) r = i;
        else break;
      }
    }
    if (r > lastScrollRow.current && userInput.length > 0) {
      lastScrollRow.current = r;
      scrollRef.current.scrollTo({ y: Math.max(0, r * rowH), animated: true });
    }
  }, [userInput, isStarted, isPaused, isFinished, rowH]);

  const focusInput = useCallback(() => {
    requestAnimationFrame(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        try {
          if (typeof inputRef.current.setSelectionRange === 'function') {
            inputRef.current.setSelectionRange(rawInput.length, rawInput.length);
          }
        } catch (e) {}
      }
    });
  }, [rawInput.length]);

  const resetTest = (nextText) => {
    if (certCloseRef.current) { clearTimeout(certCloseRef.current); certCloseRef.current = null; }
    if (lessonCompleteTimerRef.current) { clearTimeout(lessonCompleteTimerRef.current); lessonCompleteTimerRef.current = null; }
    finishRef.current = false;
    if (nextText) setCurrentText(nextText);
    setRawInput('');
    setUserInput('');
    lastScrollRow.current = 0;
    if (scrollRef.current) scrollRef.current.scrollTo({ y: 0, animated: false });
    setSeconds(0);
    setCountdown(useTimed ? duration : 0);
    setIsStarted(true);
    setIsPaused(false);
    setIsFinished(false);
    setIsTimedOut(false);
    setResult(null);
    focusInput();
  };

  const startNewTest = () => {
    let next = config.text;
    if (!next) {
      if (config.type === 'lesson') next = LESSON_TEXTS[config.lang]?.[config.id];
      else if (config.type === 'cert') next = certText(config.targetWpm || 15);
      else if (config.type === 'game' && mode === 'words') next = wordsText(60, 'medium');
      else next = generateTypingText({ mode, difficulty, timeSec: duration, targetWpm: bestWpm });
    }
    if (config.type === 'lesson') {
      next = fitTextToDuration(next, config.timeSec || duration, bestWpm);
    }
    resetTest(next);
  };

  const handleRegenerate = () => {
    const next = config.type === 'cert'
      ? certText(config.targetWpm || 15)
      : generateTypingText({ mode, difficulty, timeSec: duration, lang: config.lang || 'english', targetWpm: bestWpm });
    resetTest(next);
  };

  const finishTest = (timedOut = false) => {
    if (finishRef.current) return;
    finishRef.current = true;
    const didTimeOut = timedOut || (useTimed && countdown <= 0);
    setIsFinished(true);
    setIsTimedOut(didTimeOut);
    clearInterval(timerRef.current);
    if (inputRef.current && typeof inputRef.current.blur === 'function') inputRef.current.blur();

    const wordsBase = currentText.trim().split(/\s+/).filter((w) => w).length;
    const elapsed = Math.max(1, seconds);
    const typedWords = userInput.trim() ? userInput.trim().split(/\s+/).filter(Boolean).length : 0;
    const words = isCert ? typedWords : wordsBase;
    const wpm = Math.round((words / elapsed) * 60);
    const cpm = Math.round((userInput.length / elapsed) * 60);
    let correctChars = 0;
    if (isKrutiLayout) {
      correctChars = krutiSequenceProgress(rawRef.current || rawInput, currentText).ok;
    } else {
      for (let i = 0; i < userInput.length; i++) {
        if (isCharCorrect(userInput[i], currentText[i])) correctChars++;
      }
    }
    const accuracy = userInput.length > 0 ? Math.round((correctChars / userInput.length) * 100) : 100;
    const mistakes = userInput.length - correctChars;
    const score = Math.round(Math.max(0, (wpm * accuracy) / 100) * 1.5 + accuracy * 0.2);
    const res = { wpm, cpm, accuracy, mistakes, seconds, score, timedOut: didTimeOut };
    setResult(res);
    const historyPromise = saveHistory(res);

    if (isCert && onBack) {
      if (certCloseRef.current) clearTimeout(certCloseRef.current);
      certCloseRef.current = setTimeout(() => {
        historyPromise
          .then(() => { if (onBack) onBack(); })
          .catch(() => { if (onBack) onBack(); });
      }, didTimeOut ? 400 : 1400);
    }

    if (!didTimeOut && config.type === 'lesson' && onComplete && userInput.length === currentText.length) {
      lessonCompleteTimerRef.current = setTimeout(() => {
        lessonCompleteTimerRef.current = null;
        onComplete(config.lang, config.id);
      }, 400);
    }
  };

  const saveHistory = (res) => {
    const key = getHistoryKey(studentName);
    return AsyncStorage.getItem(key)
      .then((raw) => {
        let list = [];
        try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
        const now = new Date();
        const record = {
          id: Date.now(),
          date: now.toLocaleDateString(),
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          lesson: config.title || (isTest ? 'Typing Test' : isGame ? config.modeLabel || 'Game' : 'Practice'),
          lessonType: config.type || 'practice',
          difficulty,
          mode,
          lessonTime: useTimed ? duration : 0,
          timeTaken: res.seconds,
          wpm: res.wpm,
          cpm: res.cpm,
          accuracy: res.accuracy,
          mistakes: res.mistakes,
          charactersTyped: userInput.length,
          totalCharacters: currentText.length,
          score: res.score,
        };
        list.unshift(record);
        list = list.slice(0, 120);
        return AsyncStorage.setItem(key, JSON.stringify(list)).catch(() => {});
      })
      .catch(() => {});
  };

  const getCharStatus = (typed, target) => {
    if (typed === undefined || typed === null) return null;
    if (!isKrutiLayout) return typed === target ? 'correct' : 'wrong';
    if (typed === target) return 'correct';
    if (typed.endsWith('\u094d') && typed.slice(0, -1) === target) return 'partial';
    return 'wrong';
  };
  const isCharCorrect = (typed, target) => getCharStatus(typed, target) === 'correct';

  const liveWpm = useMemo(() => (
    seconds > 0 ? Math.round((userInput.length / 5) / (seconds / 60)) : 0
  ), [seconds, userInput.length]);
  const progress = currentText.length > 0 ? Math.min(1, userInput.length / currentText.length) : 0;

  // next char guidance
  const kpLive = useMemo(
    () => (isKrutiLayout ? krutiSequenceProgress(rawInput || rawRef.current, currentText) : null),
    [isKrutiLayout, rawInput, currentText]
  );
  const progressCursor = isKrutiLayout ? (kpLive ? kpLive.ok : 0) : userInput.length;
  const handlePause = () => {
    if (isFinished) return;
    setIsPaused((prev) => {
      const next = !prev;
      if (next && inputRef.current && typeof inputRef.current.blur === 'function') inputRef.current.blur();
      else focusInput();
      return next;
    });
  };

  const handleInputChange = (text) => {
    setRawInput(text);
    rawRef.current = text;
    const converted = isKrutiLayout ? krutiToUnicode(text) : text;
    setUserInput(converted);
    if (!isStarted) setIsStarted(true);
  };

  const handleKeyPress = (e) => {
    if (!isStarted || isPaused || isFinished) return;
    const key = e.nativeEvent && e.nativeEvent.key;
    if (!key) return;
    const kId = keyIdForChar(key) || (key === 'Backspace' ? 'backspace' : null);
    if (key === 'Backspace') {
      if (soundEnabled) playKeySound('key');
      return;
    }
    // Physical keys: keydown AB input update hone se pehle fire hota hai,
    // isliye current keystroke ko raw me add karke hi check karna hoga,
    // warna pehla letter hamesha "wrong" dikhata hai.
    if (key.length !== 1) return;

    if (isKrutiLayout) {
      const rawNow = (rawRef.current || '') + key;
      const sp = krutiSequenceProgress(rawNow, currentText);
      if (sp.ok > 0 && !sp.pending) {
        if (soundEnabled) playKeySound('correct');
      } else if (sp.pending) {
        if (soundEnabled) playKeySound('key');
      } else if (kId) {
        if (soundEnabled) playKeySound('wrong');
      }
      return;
    }

    const expected = currentText[userInput.length];
    const isCorrectKey =
      expected !== undefined &&
      ((key.toLowerCase && key.toLowerCase() === String(expected).toLowerCase()) ||
        (key === ' ' && expected === ' '));
    if (isCorrectKey) {
      if (soundEnabled) playKeySound('correct');
    } else if (kId) {
      if (soundEnabled) playKeySound('wrong');
    }
  };

  const renderControls = () => {
    if (!isPractice) return null;
    return (
      <View style={styles.controlsBar}>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Difficulty</Text>
          <OptionPills options={DIFFICULTIES} value={difficulty} onChange={setDifficulty} />
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Duration</Text>
          <OptionPills options={DURATIONS} value={duration} onChange={setDuration} />
        </View>
        <View style={styles.controlRow}>
          <Text style={styles.controlLabel}>Mode</Text>
          <OptionPills options={PR_MODES} value={mode} onChange={setMode} />
        </View>
        <TouchableOpacity style={styles.newTextBtn} onPress={handleRegenerate} activeOpacity={0.75}>
          <Ionicons name="refresh" size={15} color="#fff" />
          <Text style={styles.newTextBtnText}>New Text</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderResult = () => {
    if (!result) return null;
    const level = levelForWpm(result.wpm);
    const passed = isCert ? certTargetValid(result) : null;
    return (
      <View style={styles.resultOverlay}>
        <View style={styles.resultCard}>
          <View style={styles.resultTop}>
            <View style={[styles.resultIcon, { backgroundColor: result.timedOut ? 'rgba(245,158,11,0.18)' : 'rgba(34,197,94,0.18)' }]}>
              <Ionicons name={result.timedOut ? 'time' : 'trophy'} size={34} color={result.timedOut ? COLORS.amber : COLORS.green} />
            </View>
            <Text style={styles.resultTitle}>{isCert ? (passed ? 'Certificate Earned!' : 'So Close — Try Again') : result.timedOut ? 'Time Up!' : 'Test Complete!'}</Text>
            <Text style={styles.resultSub}>{config.title || (isTest ? 'Typing Test' : 'Practice')} - {level.name}</Text>
            {isCert && certTargetLabel && (
              <View style={[styles.certVerdict, passed ? styles.certVerdictPass : styles.certVerdictFail]}>
                <Ionicons name={passed ? 'checkmark-circle' : 'flag'} size={14} color={passed ? COLORS.green : COLORS.amber} />
                <Text style={[styles.certVerdictText, { color: passed ? COLORS.green : COLORS.amber }]}>
                  {passed ? `Target reached (${certTargetLabel})` : `Target: ${certTargetLabel}`}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.resultBigRow}>
            <View style={styles.resultBig}>
              <Text style={[styles.resultBigValue, { color: COLORS.blueBright }]}>{result.wpm}</Text>
              <Text style={styles.resultBigLabel}>WPM</Text>
            </View>
            <View style={styles.resultBig}>
              <Text style={[styles.resultBigValue, { color: COLORS.green }]}>{result.accuracy}%</Text>
              <Text style={styles.resultBigLabel}>Accuracy</Text>
            </View>
            <View style={styles.resultBig}>
              <Text style={[styles.resultBigValue, { color: COLORS.amber }]}>{result.score}</Text>
              <Text style={styles.resultBigLabel}>Score</Text>
            </View>
          </View>

          <View style={styles.resultGrid}>
            <View style={styles.resultGridItem}>
              <Text style={styles.resultGridVal}>{result.cpm}</Text>
              <Text style={styles.resultGridLabel}>CPM</Text>
            </View>
            <View style={styles.resultGridItem}>
              <Text style={styles.resultGridVal}>{result.mistakes}</Text>
              <Text style={styles.resultGridLabel}>Errors</Text>
            </View>
            <View style={styles.resultGridItem}>
              <Text style={styles.resultGridVal}>{`${Math.floor(result.seconds / 60)}:${String(result.seconds % 60).padStart(2, '0')}`}</Text>
              <Text style={styles.resultGridLabel}>Time</Text>
            </View>
            <View style={styles.resultGridItem}>
              <Text style={styles.resultGridVal}>{userInput.length}{currentText.length ? `/${currentText.length}` : ''}</Text>
              <Text style={styles.resultGridLabel}>Characters</Text>
            </View>
          </View>

          <View style={styles.resultActions}>
            {config.type === 'lesson' && !config.autoAdvance && config.nextLesson && onNextLesson && (
              <TouchableOpacity
                style={[styles.resultBtn, styles.resultNextBtn]}
                onPress={() => onNextLesson(config.lang, config.id, config.nextLesson)}
                activeOpacity={0.8}
              >
                <View style={styles.resultNextTop}>
                  <Ionicons name="play-skip-forward" size={15} color="#fff" />
                  <Text style={styles.resultBtnText}>Next Lesson</Text>
                </View>
                <Text style={styles.resultNextName} numberOfLines={1} ellipsizeMode="tail">
                  {config.nextLesson.label} - {config.nextLesson.title}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#0e9488' }]} onPress={startNewTest} activeOpacity={0.8}>
              <Ionicons name="refresh" size={15} color="#fff" />
              <Text style={styles.resultBtnText}>Retry</Text>
            </TouchableOpacity>
            {onBack && (
              <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#0e9488' }]} onPress={onBack} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={15} color="#fff" />
                <Text style={styles.resultBtnText}>Exit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  // ---- Text layout: word ranges + soft-wrap rows (memoized) ----
  // Ye renderTextArea ke andar nahi, component body me hai — warna hooks
  // rule toot jaata (early return par hook count change hota).
  const areaW = textWidth || Math.min(1100, winW - 80);
  const effCharW = charW || typeSize * 0.6;
  const cols = Math.max(4, Math.floor(areaW / (effCharW * 1.05)));

  const wordRanges = useMemo(() => {
    const out = [];
    let start = -1;
    for (let i = 0; i <= currentText.length; i++) {
      const isBoundary =
        i >= currentText.length || currentText[i] === ' ' || currentText[i] === '\n' || currentText[i] === '\t';
      if (!isBoundary && start === -1) start = i;
      if (isBoundary && start !== -1) { out.push({ s: start, e: i }); start = -1; }
    }
    return out;
  }, [currentText]);

  // ---- Whole-word soft wrap: har row me words poore rakhen, beech se nahi katen ----
  const rowsOfIdx = useMemo(() => {
    const isBrk = (c) => c === ' ' || c === '\n' || c === '\t';
    const out = [];
    let row = [];
    let i = 0;
    const n = currentText.length;
    while (i < n) {
      let j = i;
      while (j < n && !isBrk(currentText[j])) j++;
      const wordLen = j - i;
      let k = j;
      while (k < n && isBrk(currentText[k])) k++;
      const spaceEnd = k;
      if (wordLen > 0) {
        if (row.length > 0 && row.length + wordLen > cols) {
          out.push(row);
          row = [];
        }
        if (wordLen > cols) {
          let off = 0;
          while (off < wordLen) {
            if (row.length >= cols) { out.push(row); row = []; }
            const take = Math.min(wordLen - off, cols - row.length);
            for (let t = 0; t < take; t++) row.push(i + off + t);
            off += take;
          }
        } else {
          for (let t = 0; t < wordLen; t++) row.push(i + t);
        }
      }
      for (let s = j; s < spaceEnd; s++) {
        if (row.length >= cols) { out.push(row); row = []; }
        row.push(s);
      }
      i = spaceEnd;
    }
    if (row.length > 0) out.push(row);
    return out;
  }, [currentText, cols]);

  textRowsRef.current = rowsOfIdx;

const renderTextArea = () => {
    if (isFinished && result) return null;
    const kp = kpLive;
    // Kruti me userInput ke converted extras (jaise '[' -> 'à¤–à¥') target slots se zyada
    // ho sakte hain, isliye display/cursor target slot (kp.ok) par rakhte hain.
    const typedCursor = isKrutiLayout
      ? Math.min(currentText.length, (kp ? kp.ok : 0) + (kp && kp.pending ? 1 : 0))
      : Math.min(userInput.length, currentText.length);
    let currentWord = null;
    for (const w of wordRanges) {
      if (typedCursor < w.e && typedCursor >= w.s) { currentWord = w; break; }
      if (typedCursor <= w.s) { currentWord = w; break; }
    }

    return (
      <ScrollView
        ref={scrollRef}
        style={[styles.textScroll, { maxHeight: Math.min(420, Math.max(180, winH * 0.52)) }]}
        onLayout={() => {}}
      >
        <TouchableOpacity
          ref={textBoxRef}
          onPress={() => { if (!isPaused && !isFinished) focusInput(); }}
          activeOpacity={1}
          style={[styles.textBox, winW < 600 && styles.textBoxSmall]}
          onLayout={(e) => setTextWidth(Math.max(0, e.nativeEvent.layout.width - (winW < 600 ? 34 : 46)))}
        >
          <View style={styles.measureRow} pointerEvents="none">
            <Text
              key={`m-${typeSize}-${currentText.slice(0, 24)}`}
              onLayout={(e) => {
                const w = e.nativeEvent.layout.width;
                const n = Math.min(40, currentText.length);
                if (w > 4 && n > 1) {
                  const avg = w / n;
                  setCharW((prev) => (prev == null || Math.abs(avg - prev) > 0.05 ? avg : prev));
                }
              }}
              style={[styles.char, { fontSize: typeSize, lineHeight: charLineH, color: 'transparent' }, config.lang === 'hindi' && styles.charHindi]}
            >
              {currentText.slice(0, 40)}
            </Text>
          </View>
          {rowsOfIdx.map((row, ri) => {
            const isHindi = config.lang === 'hindi';
            if (isHindi) {
              const chars = [];
              const colors = [];
              const bgs = [];
              const upcomings = [];
              row.forEach((i) => {
                const typed = userInput[i];
                let color = '#5a667a';
                let bg = 'transparent';
                let upcoming = false;
                if (i < typedCursor) {
                  if (kp) {
                    if (i < kp.ok) { color = COLORS.green; }
                    else if (kp.pending) { color = COLORS.green; }
                    else { color = COLORS.rose; bg = 'rgba(244,63,94,0.14)'; }
                  } else {
                    const status = getCharStatus(typed, currentText[i]);
                    if (status === 'correct') { color = COLORS.green; }
                    else if (status === 'partial') { color = COLORS.amber; }
                    else { color = COLORS.rose; bg = 'rgba(244,63,94,0.14)'; }
                  }
                } else if (kp && !kp.pending && i < userInput.length) {
                  color = COLORS.rose;
                  bg = 'rgba(244,63,94,0.14)';
                } else if (currentText[i] === ' ' && i === progressCursor && progressCursor < currentText.length) {
                  color = '#14222e';
                  upcoming = true;
                } else if (
                  currentWord &&
                  i >= currentWord.s && i < currentWord.e &&
                  currentText[progressCursor] !== ' '
                ) {
                  color = '#14222e';
                  upcoming = true;
                }
                chars.push(currentText[i]);
                colors.push(color);
                bgs.push(bg);
                upcomings.push(upcoming);
              });
              const cursorIdx = row.indexOf(typedCursor);
              return (
                <View key={ri} style={styles.charRow}>
                  <HindiTextRun
                    chars={chars}
                    colors={colors}
                    bgs={bgs}
                    upcomings={upcomings}
                    typeSize={typeSize}
                    lineHeight={charLineH}
                  />
                  {cursorIdx >= 0 && !isFinished && isStarted && (
                    <View style={[styles.cursorWrap, { left: cursorIdx * charW }]}>
                      <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
                    </View>
                  )}
                </View>
              );
            }
            return (
              <View key={ri} style={styles.charRow}>
                {row.map((i) => {
                const typed = userInput[i];
                let color = '#5a667a';
                let bg = 'transparent';
                let upcoming = false;
                if (i < typedCursor) {
                  if (kp) {
                    if (i < kp.ok) { color = COLORS.green; }
                    else if (kp.pending) { color = COLORS.green; }
                    else { color = COLORS.rose; bg = 'rgba(244,63,94,0.14)'; }
                  } else {
                    const status = getCharStatus(typed, currentText[i]);
                    if (status === 'correct') { color = COLORS.green; }
                    else if (status === 'partial') { color = COLORS.amber; }
                    else { color = COLORS.rose; bg = 'rgba(244,63,94,0.14)'; }
                  }
                } else if (kp && !kp.pending && i < userInput.length) {
                  color = COLORS.rose;
                  bg = 'rgba(244,63,94,0.14)';
                } else if (currentText[i] === ' ' && i === progressCursor && progressCursor < currentText.length) {
                  color = '#14222e';
                  upcoming = true;
                } else if (
                  currentWord &&
                  i >= currentWord.s && i < currentWord.e &&
                  currentText[progressCursor] !== ' '
                ) {
                  color = '#14222e';
                  upcoming = true;
                }
                const isCursorHere = i === typedCursor && !isFinished && isStarted;
                const isNext = i === typedCursor && !isStarted && i < 1;
                return (
                  <MemoChar
                    key={i}
                    ch={currentText[i]}
                    color={color}
                    bg={bg}
                    upcoming={upcoming}
                    isCursorHere={isCursorHere}
                    isNext={isNext}
                    typeSize={typeSize}
                    lineHeight={charLineH}
                    started={isStarted}
                    finished={isFinished}
                    cursorOpacity={cursorOpacity}
                    isHindi={config.lang === 'hindi'}
                  />
                );
                })}
              </View>
            );
          })}
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <View style={styles.root}>
      <View style={styles.workspaceRow}>
        <View style={styles.mainCol}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.cyan} />
                </TouchableOpacity>
              ) : null}
              <View>
                <Text style={styles.title}>{isNumberedLesson ? `Lesson ${config.id}` : config.title || (isTest ? 'Typing Test' : isGame ? 'Typing Game' : 'Typing Practice')}</Text>
                <Text style={styles.subtitle}>
                  {isNumberedLesson ? `${config.title} \u2022 ` : ''}
                  {difficulty ? `${difficulty} \u2022 ` : ''}
                  {duration ? `${Math.round(duration / 60)} min - ` : ''}
                  {mode ? mode : ''}
                </Text>
              </View>
            </View>
            <View style={styles.topBarRight}>
              <View style={styles.speedBadge} accessibilityLabel={`Typing speed ${liveWpm} words per minute`}>
                <Ionicons name="speedometer" size={14} color={COLORS.cyan} />
                <Text style={styles.speedBadgeText}>{liveWpm} WPM</Text>
              </View>
              {!isPractice && (
                <View style={[styles.difficultyBadge, { borderColor: (COLORS.green) + '55' }]}>
                  <Text style={[styles.difficultyBadgeText, { color: COLORS.green }]}>{difficulty}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.topBtn} onPress={handlePause} disabled={isFinished} activeOpacity={0.7}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={17} color={isFinished ? '#94a3b8' : '#334155'} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topBtn} onPress={startNewTest} activeOpacity={0.7}>
                <Ionicons name="refresh" size={17} color="#334155" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView
            style={styles.scrollMain}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingHorizontal: winW < 600 ? 14 : winW < 900 ? 20 : 28 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {renderControls()}

            {/* Progress */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>

            {renderTextArea()}
            {renderResult()}

            {/* Hidden input */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={rawInput}
              onChangeText={handleInputChange}
              onKeyPress={handleKeyPress}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="off"
              spellCheck={false}
              autoFocus
              editable={!isFinished && !isPaused}
            />

            {/* Actions */}
            {!isFinished && (
              <View style={styles.actionsRow}>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e9f4f8', borderColor: '#c9e0e9' }]} onPress={handlePause} activeOpacity={0.8}>
                  <Ionicons name={isPaused ? 'play' : 'pause'} size={15} color={COLORS.cyan} />
                  <Text style={styles.actionBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#eef7fa', borderColor: '#c9e0e9' }]} onPress={startNewTest} activeOpacity={0.8}>
                  <Ionicons name="refresh" size={15} color={COLORS.cyan} />
                  <Text style={styles.actionBtnText}>Restart</Text>
                </TouchableOpacity>
                {onBack && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#e2f4f4', borderColor: '#b9dedf' }]} onPress={onBack} activeOpacity={0.8}>
                    <Ionicons name="close" size={15} color={COLORS.cyan} />
                    <Text style={styles.actionBtnText}>Exit</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {!isStarted && (
              <Text style={styles.hint}>
                Click on the text and start typing to begin
              </Text>
            )}
            {isPaused && !isFinished && <Text style={styles.pausedHint}>Paused - click Resume or press any key to continue</Text>}
          </ScrollView>

        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#eaf5fa',
    overflow: 'hidden',
  },
  workspaceRow: {
    flex: 1,
    overflow: 'hidden',
  },
  mainCol: {
    flex: 1,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#d4e6ee',
    backgroundColor: '#f8fcfe',
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1, minWidth: 160 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backButtonBg,
    borderWidth: 1.5,
    borderColor: COLORS.backButtonBorder,
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#172b36',
    fontSize: 17,
  },
  subtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: '#647b87',
    fontSize: 11.5,
    marginTop: 1,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 7, marginLeft: 'auto' },
  speedBadge: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    borderRadius: 10,
    backgroundColor: '#e9f4f8',
    borderWidth: 1,
    borderColor: '#c9e0e9',
  },
  speedBadgeText: { color: '#0e7490', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 11.5 },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  difficultyBadgeText: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 12,
  },
  topBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#d5e3e9',
  },
  scrollMain: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingTop: 18,
    paddingBottom: 34,
    maxWidth: 1260,
    width: '100%',
    alignSelf: 'center',
  },
  controlsBar: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d5e7ee',
    padding: 14,
    marginBottom: 16,
    shadowColor: '#315c70',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    elevation: 2,
  },
  controlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  controlLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#526b77',
    fontSize: 12,
    width: 70,
  },
  pillGroup: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: '#f8fbfc',
    borderWidth: 1.5,
    borderColor: '#d5e3e9',
  },
  pillSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  pillText: {
    color: '#334b57',
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    fontSize: 12.5,
  },
  pillTextSmall: { fontSize: 11.5 },
  newTextBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0e9488',
    borderRadius: 9,
    paddingVertical: 9,
    marginTop: 4,
    shadowColor: '#0e9488',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 4,
  },
  newTextBtnText: {
    color: '#fff',
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 13,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#d5e6ec',
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0e9488',
    shadowColor: '#0e9488',
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  textScroll: { width: '100%', maxWidth: 1100, minHeight: 180, flexGrow: 0, flexShrink: 1, alignSelf: 'center', marginBottom: 14 },
  textBox: {
    width: '100%',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#c9e0e9',
    padding: 22,
    minHeight: 180,
    shadowColor: '#315c70',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 16,
    elevation: 2,
    cursor: 'text',
  },
  textBoxSmall: { minHeight: 160, padding: 16 },
  charRow: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  measureRow: {
    position: 'absolute',
    left: -9999,
    top: 0,
    opacity: 0,
  },
  charWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cursorWrap: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 2,
    justifyContent: 'center',
  },
  char: {
    fontFamily: 'Poppins_400Regular',
    fontWeight: '400',
    letterSpacing: 0.3,
    borderRadius: 3,
  },
  charHindi: {
    fontFamily: 'NotoSansDevanagari_400Regular',
    fontWeight: '400',
  },
  charUpcoming: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
    textDecorationColor: '#0e7490',
  },
  cursor: {
    width: 2,
    height: 18,
    backgroundColor: '#0e7490',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  nextCaret: {
    width: 2,
    height: 18,
    backgroundColor: 'rgba(14,116,144,0.4)',
    borderRadius: 2,
    marginHorizontal: 1,
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
    top: -2,
    left: -2,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 'auto',
    marginBottom: 16,
    width: '100%',
    maxWidth: 900,
    alignSelf: 'center',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 100,
    paddingVertical: 12,
    flex: 1,
    cursor: 'pointer',
  },
  actionBtnText: {
    color: '#334b57',
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 13,
  },
  hint: {
    fontFamily: 'Poppins_400Regular',
    color: '#647b87',
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 10,
  },
  pausedHint: {
    fontFamily: 'Poppins_700Bold',
    color: COLORS.amber,
    textAlign: 'center',
    fontSize: 12,
    marginVertical: 10,
    fontWeight: '700',
  },
  // Result
  resultOverlay: {
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c9e0e9',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#315c70',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 18,
    elevation: 6,
  },
  resultTop: { alignItems: 'center', marginBottom: 16 },
  resultIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  resultTitle: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#172b36',
    fontSize: 22,
  },
  resultSub: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: '#647b87',
    fontSize: 12.5,
    marginTop: 3,
  },
  certVerdict: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginTop: 12,
  },
  certVerdictPass: { backgroundColor: 'rgba(34,197,94,0.15)', borderWidth: 1.5, borderColor: 'rgba(34,197,94,0.5)' },
  certVerdictFail: { backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1.5, borderColor: 'rgba(245,158,11,0.45)' },
  certVerdictText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12.5 },
  resultBigRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 16,
    minWidth: 0,
  },
  resultBig: { alignItems: 'center', flexShrink: 1, minWidth: 0, overflow: 'hidden', paddingHorizontal: 6 },
  resultBigValue: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 38, flexShrink: 1, textAlign: 'center' },
  resultBigLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#647b87',
    fontSize: 11,
    textTransform: 'uppercase',
    marginTop: 2,
    flexShrink: 1,
    textAlign: 'center',
  },
  resultGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
    minWidth: 0,
  },
  resultGridItem: {
    flex: 1,
    minWidth: 90,
    maxWidth: '100%',
    backgroundColor: '#f2f7f9',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultGridVal: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#334b57', fontSize: 16, flexShrink: 1, textAlign: 'center' },
  resultGridLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#647b87',
    fontSize: 9.5,
    textTransform: 'uppercase',
    marginTop: 2,
    flexShrink: 1,
    textAlign: 'center',
  },
  resultActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resultBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 11,
  },
  resultBtnText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13 },
  resultNextBtn: {
    backgroundColor: '#0e9488',
    minWidth: 200,
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  resultNextTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  resultNextName: { color: 'rgba(255,255,255,0.9)', fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11, textAlign: 'center', marginTop: 3 },
});