// src/screens/TypingScreen.js
// Professional typing workspace:
// - Configurable practice options (language / difficulty / duration / mode)
// - Large live typing area with char highlighting + auto-scroll
// - Real-time WPM/CPM/Accuracy/Errors/Time/Progress
// - Virtual keyboard with next-key, finger guide, press feedback
// - Typing sound
// - Timer with auto-stop + professional result dashboard

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Platform, useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import VirtualKeyboard, { keyIdForChar, FINGERS, KRUTI_KEYCAPS } from '../components/VirtualKeyboard';
import { playKeySound } from '../audio/keySound';
import { LESSON_TEXTS, LESSON_DIFFICULTY } from '../data/lessons';
import { generateTypingText, sentencesText, paragraphText, wordsText, rushWordList, certText } from '../data/typingTexts';
import { krutiToUnicode, krutiKeyProgress, krutiSequenceProgress } from '../utils/krutiToUnicode';
import { COLORS, BG, levelForWpm, scaleFont } from '../theme';

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

function StatChip({ icon, value, label, color }) {
  return (
    <View style={styles.statChip}>
      <Ionicons name={icon} size={14} color={color} />
      <Text style={[styles.statChipValue, { color }]} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
      <Text style={styles.statChipLabel} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
    </View>
  );
}

function LivePanelStat({ icon, value, label, color, big }) {
  return (
    <View style={[styles.liveStat, big && styles.liveStatBig]}>
      <Text style={[styles.liveStatValue, { color }, big && styles.liveStatValueBig]}>{value}</Text>
      <View style={styles.liveStatLabelRow}>
        <Ionicons name={icon} size={12} color={color} />
        <Text style={styles.liveStatLabel}>{label}</Text>
      </View>
    </View>
  );
}

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
  onBack = null,
  hindiLayout = 'krutidev',
}) {
  const { width: winW } = useWindowDimensions();
  const isDesktop = winW >= 1000 && Platform.OS === 'web';
  const rightPanelWidth = 250;

  const isKrutiLayout = config.lang === 'hindi' && hindiLayout === 'krutidev';
  const isPractice = config.type === 'practice';
  const isGame = config.type === 'game';
  const isTest = config.type === 'test';
  const isCert = config.type === 'cert';
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

  // --- keyboard feedback state ---
  const [pressedId, setPressedId] = useState(null);
  const [wrongId, setWrongId] = useState(null);
  const [correctId, setCorrectId] = useState(null);

  const timerRef = useRef(null);
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
  const showVKeyboard = settings.virtualKeyboard !== false;
  const showFingerGuide = settings.fingerGuide === true;
  const showNextKey = settings.nextKeyHighlight !== false;
  const fontSize = settings.fontSize || 22;
  const typeSize = Math.max(15, Math.round(fontSize * 0.8));
  const charLineH = Math.max(22, Math.round(typeSize * 1.32));
  const rowH = charLineH + 6;

  const buildInitialText = useCallback(() => {
    if (config.text) return config.text;
    if (config.lessonText) return config.lessonText;
    if (config.type === 'lesson' && config.lang && config.id) {
      return LESSON_TEXTS[config.lang]?.[config.id] || null;
    }
    if (config.type === 'rare') return null;
    if (config.type === 'cert') return certText(config.targetWpm || 15);
    return generateTypingText({ mode: config.mode || 'paragraph', difficulty: config.difficulty || 'Easy', timeSec: config.timeSec || 60, lang: config.lang || 'english' });
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
    setWrongId(null);
    setCorrectId(null);
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
    setWrongId(null);
    setCorrectId(null);
    focusInput();
  };

  const startNewTest = () => {
    let next = config.text;
    if (!next) {
      if (config.type === 'lesson') next = LESSON_TEXTS[config.lang]?.[config.id];
      else if (config.type === 'cert') next = certText(config.targetWpm || 15);
      else if (config.type === 'game' && mode === 'words') next = wordsText(60, 'medium');
      else next = generateTypingText({ mode, difficulty, timeSec: duration });
    }
    resetTest(next);
  };

  const handleRegenerate = () => {
    const next = config.type === 'cert'
      ? certText(config.targetWpm || 15)
      : generateTypingText({ mode, difficulty, timeSec: duration, lang: config.lang || 'english' });
    resetTest(next);
  };

  const finishTest = (timedOut = false) => {
    setIsFinished(true);
    setIsTimedOut(timedOut);
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
    const res = { wpm, cpm, accuracy, mistakes, seconds, score, timedOut: timedOut };
    setResult(res);
    const historyPromise = saveHistory(res);

    if (isCert && onBack) {
      if (certCloseRef.current) clearTimeout(certCloseRef.current);
      certCloseRef.current = setTimeout(() => {
        historyPromise
          .then(() => { if (onBack) onBack(); })
          .catch(() => { if (onBack) onBack(); });
      }, timedOut ? 400 : 1400);
    }

    if (!timedOut && config.type === 'lesson' && onComplete) {
      setTimeout(() => onComplete(config.lang, config.id), 400);
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

  // Incremental counters: har keystroke par poora text scan karne ke bajaye
  // sirf naye chars count hote hain. Text badalne par cache reset ho jata hai.
  const scanRef = useRef({ text: null, len: 0, correct: 0, words: 0 });
  const scan = (input, target) => {
    const c = scanRef.current;
    const stale = c.text !== target || input.length < c.len;
    let correct = stale ? 0 : c.correct;
    const from = stale ? 0 : c.len;
    let words = stale ? 0 : c.words;
    let prevWasSpace = from > 0 ? /\s/.test(input[from - 1]) : true;
    for (let i = from; i < input.length; i++) {
      const ch = input[i];
      if (isCharCorrect(ch, target[i])) correct++;
      if (!/\s/.test(ch) && prevWasSpace) words++;
      prevWasSpace = /\s/.test(ch);
    }
    c.text = target;
    c.len = input.length;
    c.correct = correct;
    c.words = words;
    return { correct, words: input.trim() ? words : 0 };
  };

  // live stats
  const stats = useMemo(() => {
    const elapsed = seconds > 0 ? seconds : 1;
    let correct = 0;
    let effLen = userInput.length;
    let wordsTyped = 0;
    if (isKrutiLayout) {
      const sp = krutiSequenceProgress(rawInput || rawRef.current, currentText);
      correct = sp.ok;
      if (sp.pending) effLen = sp.ok;
    } else {
      const s = scan(userInput, currentText);
      correct = s.correct;
      wordsTyped = s.words;
    }
    const wpm = isStarted ? Math.round((wordsTyped / elapsed) * 60) : 0;
    const cpm = isStarted ? Math.round((userInput.length / elapsed) * 60) : 0;
    const accuracy = effLen > 0 ? Math.round((correct / effLen) * 100) : 100;
    const mistakes = effLen - correct;
    const progress = currentText.length > 0 ? Math.min(1, userInput.length / currentText.length) : 0;
    return { wpm, cpm, accuracy, mistakes, correct, progress };
  }, [seconds, isStarted, userInput, currentText, isKrutiLayout, rawInput]);

  // next char guidance
  const kpLive = useMemo(
    () => (isKrutiLayout ? krutiSequenceProgress(rawInput || rawRef.current, currentText) : null),
    [isKrutiLayout, rawInput, currentText]
  );
  const progressCursor = isKrutiLayout ? (kpLive ? kpLive.ok : 0) : userInput.length;
  const nextChar = !isFinished && isStarted && progressCursor < currentText.length ? currentText[progressCursor] : null;
  const nextKeyId = nextChar ? keyIdForChar(nextChar) : null;
  const nextFinger = nextChar ? FINGERS[nextKeyId || (nextChar.toLowerCase().match(/[a-z]/) ? nextChar.toLowerCase() : null)] : null;

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

  // Keyboard flash: pehle ka timer clear karke naya set karo. Isse har
  // keystroke par 3 pending timers ki jagah sirf 3 re-render hote hain,
  // aur same value par setState skip ho jaata hai.
  const flashTimers = useRef({});
  const flash = useCallback((setter, value, ms) => {
    setter(value);
    const t = flashTimers.current[value];
    if (t) clearTimeout(t);
    flashTimers.current[value] = setTimeout(() => setter(null), ms);
  }, []);

  useEffect(() => () => {
    Object.values(flashTimers.current).forEach(clearTimeout);
  }, []);

  const handleKeyPress = (e) => {
    if (!isStarted || isPaused || isFinished) return;
    const key = e.nativeEvent && e.nativeEvent.key;
    if (!key) return;
    const kId = keyIdForChar(key) || (key === 'Backspace' ? 'backspace' : null);
    if (kId) flash(setPressedId, kId, 140);
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
        flash(setCorrectId, kId, 180);
        if (soundEnabled) playKeySound('correct');
      } else if (sp.pending) {
        if (soundEnabled) playKeySound('key');
      } else if (kId) {
        flash(setWrongId, kId, 200);
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
      flash(setCorrectId, kId, 180);
      if (soundEnabled) playKeySound('correct');
    } else if (kId) {
      flash(setWrongId, kId, 200);
      if (soundEnabled) playKeySound('wrong');
    }
  };

  // Stable callback: VirtualKeyboard memoized hai, isliye har render par naya
  // function dene se uska memo toot jata tha aur keyboard bhi rerender hota tha.
  const simulateKey = useCallback((id) => {
    if (isFinished || isPaused) return;
    if (id === 'backspace') {
      rawRef.current = rawRef.current.slice(0, -1);
      setRawInput(rawRef.current);
      if (!isStarted) setIsStarted(true);
      focusInput();
      return;
    }
    if (id === 'enter' || id === 'tab' || id === 'caps' || id === 'shift_l' || id === 'shift_r') return;
    let ch = id === 'space' ? ' ' : id;
    if (!ch) return;
    if (!isStarted) setIsStarted(true);
    rawRef.current = rawRef.current + ch;
    setRawInput(rawRef.current);
    if (isKrutiLayout) {
      const kp = krutiKeyProgress(rawRef.current, currentText);
      if (kp.ok > 0) {
        if (soundEnabled) playKeySound('correct');
      } else if (kp.pending) {
        if (soundEnabled) playKeySound('key');
      } else {
        if (soundEnabled) playKeySound('wrong');
      }
    } else {
      const expected = currentText[userInput.length];
      if (soundEnabled) playKeySound(expected !== undefined && expected === ch ? 'correct' : 'wrong');
    }
    focusInput();
  }, [isFinished, isPaused, isStarted, isKrutiLayout, currentText, soundEnabled, userInput.length, focusInput]);

  const timerStr = useMemo(() => {
    const v = useTimed ? countdown : seconds;
    return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`;
  }, [countdown, seconds, useTimed]);

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

  const renderLiveStats = () => (
    <>
      <LivePanelStat big icon="speedometer" value={`${stats.wpm}`} label="WPM" color={COLORS.blueBright} />
      <LivePanelStat icon="pulse" value={`${stats.cpm}`} label="CPM" color={COLORS.cyan} />
      <LivePanelStat icon="checkmark-circle" value={`${stats.accuracy}%`} label="Accuracy" color={COLORS.green} />
      <LivePanelStat icon="warning" value={`${stats.mistakes}`} label="Errors" color={COLORS.rose} />
      <LivePanelStat icon="time" value={timerStr} label={useTimed ? 'Time Left' : 'Elapsed'} color={useTimed && countdown <= 15 && !isFinished ? COLORS.rose : COLORS.amber} />
    </>
  );

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
            <Text style={styles.resultSub}>{config.title || (isTest ? 'Typing Test' : 'Practice')} â€” {level.name}</Text>
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
            {config.type === 'lesson' && config.nextLesson && onNextLesson && (
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
                  {config.nextLesson.label} Â· {config.nextLesson.title}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#0e9488' }]} onPress={startNewTest} activeOpacity={0.8}>
              <Ionicons name="refresh" size={15} color="#fff" />
              <Text style={styles.resultBtnText}>Retry</Text>
            </TouchableOpacity>
            {onBack && (
              <TouchableOpacity style={[styles.resultBtn, { backgroundColor: '#0f1830', borderWidth: 1.5, borderColor: COLORS.cardBorder }]} onPress={onBack} activeOpacity={0.8}>
                <Ionicons name="arrow-back" size={15} color={COLORS.textLight} />
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
  const areaW = textWidth || (isDesktop ? winW - rightPanelWidth - 80 : winW - 40);
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
        style={styles.textScroll}
        onLayout={() => {}}
      >
        <TouchableOpacity
          ref={textBoxRef}
          onPress={() => { if (!isPaused && !isFinished) focusInput(); }}
          activeOpacity={1}
          style={styles.textBox}
          onLayout={(e) => setTextWidth(Math.max(0, e.nativeEvent.layout.width - 24))}
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

  const leftPanel = isDesktop && isPractice ? (
    <View style={[styles.leftPanel, { width: 250 }]}>
      <Text style={styles.leftTitle}>Practice Options</Text>
      {renderControls()}
    </View>
  ) : null;

  const rightPanel = isDesktop ? (
    <View style={[styles.rightPanel, { width: rightPanelWidth }]}>
      <Text style={styles.rightTitle}>Live Statistics</Text>
      <View style={styles.liveStats}>{renderLiveStats()}</View>

      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>Next Key</Text>
        {showNextKey && nextKeyId ? (
          <>
            <View style={styles.nextKeyDisplay}>
              <Text style={styles.nextKeyBig}>{nextChar === ' ' ? 'â£' : nextChar}</Text>
            </View>
            <Text style={styles.guideKeyName}>{nextKeyId === 'space' ? 'Space Bar' : nextKeyId.toUpperCase()}</Text>
          </>
        ) : (
          <Text style={styles.guideEmpty}>
            {!isStarted ? 'Start typing to begin' : isFinished ? 'Test finished' : 'â€”'}
          </Text>
        )}
        {showFingerGuide && nextFinger && (
          <View style={styles.fingerChip}>
            <Ionicons name="hand-left" size={14} color={COLORS.cyan} />
            <Text style={styles.fingerChipText}>{nextFinger}</Text>
          </View>
        )}
      </View>

      <View style={styles.guideCard}>
        <Text style={styles.guideTitle}>Progress</Text>
        <View style={styles.rightProgressTrack}>
          <View
            style={[styles.rightProgressFill, { width: `${stats.progress * 100}%` }]}
          />
        </View>
        <Text style={styles.rightProgressText}>
          {userInput.length} / {currentText.length} characters
        </Text>
        <Text style={styles.rightProgressPct}>{Math.round(stats.progress * 100)}%</Text>
      </View>
    </View>
  ) : null;

  return (
    <View style={styles.root}>
      <View style={styles.workspaceRow}>
        {leftPanel}
        <View style={styles.mainCol}>
          {/* Top bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {onBack ? (
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.textLight} />
                </TouchableOpacity>
              ) : null}
              {onBack && Platform.OS === 'web' ? (
                <Text style={styles.escHint}>Esc</Text>
              ) : null}
              <View>
                <Text style={styles.title}>{config.title || (isTest ? 'Typing Test' : isGame ? 'Typing Game' : 'Typing Practice')}</Text>
                <Text style={styles.subtitle}>
                  {config.difficulty ? `${config.difficulty} â€¢ ` : ''}
                  {duration ? `${Math.round(duration / 60)} min â€¢ ` : ''}
                  {mode ? mode : ''}
                </Text>
              </View>
            </View>
            <View style={styles.topBarRight}>
              {!isPractice && (
                <View style={[styles.difficultyBadge, { borderColor: (COLORS.green) + '55' }]}>
                  <Text style={[styles.difficultyBadgeText, { color: COLORS.green }]}>{difficulty}</Text>
                </View>
              )}
              <TouchableOpacity style={styles.topBtn} onPress={handlePause} disabled={isFinished} activeOpacity={0.7}>
                <Ionicons name={isPaused ? 'play' : 'pause'} size={17} color={isFinished ? COLORS.textDim : COLORS.textLight} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.topBtn} onPress={startNewTest} activeOpacity={0.7}>
                <Ionicons name="refresh" size={17} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.scrollMain} contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            {!isDesktop && renderControls()}

            {/* Status chips */}
            <View style={styles.chipRow}>
              {isCert && certTargetLabel && (
                <StatChip icon="flag" value={certTargetLabel} label="Target" color={COLORS.amber} />
              )}
              <StatChip icon="speedometer" value={`${stats.wpm}`} label="WPM" color={COLORS.blueBright} />
              <StatChip icon="pulse" value={`${stats.cpm}`} label="CPM" color={COLORS.cyan} />
              <StatChip icon="checkmark-circle" value={`${stats.accuracy}%`} label="Accuracy" color={COLORS.green} />
              <StatChip icon="warning" value={`${stats.mistakes}`} label="Errors" color={COLORS.rose} />
              <StatChip icon="time" value={timerStr} label={useTimed ? 'Time Left' : 'Elapsed'} color={useTimed && countdown <= 15 && !isFinished ? COLORS.rose : COLORS.amber} />
            </View>

            {/* Progress */}
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${stats.progress * 100}%` }]} />
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
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(37,99,235,0.25)', borderColor: 'rgba(59,130,246,0.5)' }]} onPress={handlePause} activeOpacity={0.8}>
                  <Ionicons name={isPaused ? 'play' : 'pause'} size={15} color={COLORS.blueBright} />
                  <Text style={styles.actionBtnText}>{isPaused ? 'Resume' : 'Pause'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(14,116,144,0.15)', borderColor: 'rgba(14,116,144,0.5)' }]} onPress={startNewTest} activeOpacity={0.8}>
                  <Ionicons name="refresh" size={15} color={COLORS.cyan} />
                  <Text style={styles.actionBtnText}>Restart</Text>
                </TouchableOpacity>
                {onBack && (
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(244,63,94,0.12)', borderColor: 'rgba(244,63,94,0.45)' }]} onPress={onBack} activeOpacity={0.8}>
                    <Ionicons name="close" size={15} color={COLORS.rose} />
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
            {isPaused && !isFinished && <Text style={styles.pausedHint}>Paused â€” click Resume or press any key to continue</Text>}
          </ScrollView>

          {showVKeyboard && (
            <View style={styles.keyboardDock}>
              <View style={styles.nextKeyBar}>
                <Ionicons name="locate" size={14} color={COLORS.cyan} />
                <Text style={styles.nextKeyBarLabel}>Next Key</Text>
                {showNextKey && nextKeyId ? (
                  <View style={styles.nextKeyBarKey}>
                    <Text style={styles.nextKeyBarKeyText}>{nextChar === ' ' ? 'â£' : nextChar}</Text>
                  </View>
                ) : (
                  <Text style={styles.nextKeyBarEmpty}>
                    {isStarted ? 'Keep typingâ€¦' : 'Click the text and start typing'}
                  </Text>
                )}
                {showFingerGuide && nextFinger ? (
                  <View style={styles.nextFingerChip}>
                    <Ionicons name="hand-left" size={12} color={COLORS.cyan} />
                    <Text style={styles.nextFingerText}>{nextFinger}</Text>
                  </View>
                ) : null}
              </View>
              <VirtualKeyboard
                pressedId={pressedId}
                nextId={showNextKey ? nextKeyId : null}
                wrongId={wrongId}
                correctId={correctId}
                showKeyboard={showVKeyboard}
                showFingerGuide={showFingerGuide}
                showNextKey={showNextKey}
                size="sm"
                onKeyPress={simulateKey}
                keyLabels={isKrutiLayout ? KRUTI_KEYCAPS : null}
              />
            </View>
          )}
        </View>

        {rightPanel}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    overflow: 'hidden',
  },
  workspaceRow: {
    flex: 1,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  mainCol: {
    flex: 1,
    overflow: 'hidden',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    backgroundColor: COLORS.headerBg,
  },
  topBarLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  escHint: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 10.5,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  title: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#fff',
    fontSize: 17,
  },
  subtitle: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: COLORS.textMuted,
    fontSize: 11.5,
    marginTop: 1,
  },
  topBarRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  scrollMain: { flex: 1 },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
    maxWidth: 1060,
    width: '100%',
    alignSelf: 'center',
  },
  controlsBar: {
    backgroundColor: COLORS.cardBgSolid,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    padding: 12,
    marginBottom: 12,
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
    color: COLORS.textMuted,
    fontSize: 12,
    width: 70,
  },
  pillGroup: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', flex: 1 },
  pill: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  pillSmall: { paddingHorizontal: 10, paddingVertical: 5 },
  pillText: {
    color: COLORS.textLight,
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
  chipRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  statChip: {
    flex: 1,
    minWidth: 86,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.cardBg,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    paddingVertical: 8,
    paddingHorizontal: 6,
    overflow: 'hidden',
  },
  statChipValue: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 15,
    flexShrink: 1,
  },
  statChipLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 9.5,
    textTransform: 'uppercase',
    flexShrink: 1,
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0e9488',
    shadowColor: '#0e9488',
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
  textScroll: {
    maxHeight: 210,
    marginBottom: 4,
  },
  textBox: {
    backgroundColor: COLORS.cardBgSolid,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.35)',
    padding: 12,
    minHeight: 84,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 14,
    elevation: 3,
    cursor: 'text',
  },
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
    gap: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    flex: 1,
  },
  actionBtnText: {
    color: COLORS.textLight,
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 13,
  },
  hint: {
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textMuted,
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
  keyboardDock: {
    borderTopWidth: 1,
    borderTopColor: COLORS.headerBorder,
    backgroundColor: 'rgba(8,12,24,0.96)',
    paddingTop: 4,
    paddingHorizontal: 10,
    paddingBottom: 6,
  },
  nextKeyBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: 'rgba(14,116,144,0.08)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(14,116,144,0.25)',
    alignSelf: 'center',
  },
  nextKeyBarLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.8,
    color: COLORS.cyan,
  },
  nextKeyBarKey: {
    minWidth: 26,
    height: 26,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#0e7490',
    backgroundColor: 'rgba(14,116,144,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  nextKeyBarKeyText: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 15,
    color: '#e8f7ff',
  },
  nextKeyBarEmpty: {
    fontFamily: 'Poppins_400Regular',
    fontSize: 11,
    color: COLORS.textMuted,
  },
  nextFingerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(14,116,144,0.14)',
    borderRadius: 16,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  nextFingerText: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 11,
    color: COLORS.cyan,
  },

  // Right panel
  rightPanel: {
    borderLeftWidth: 1,
    borderLeftColor: COLORS.headerBorder,
    backgroundColor: COLORS.headerBg,
    padding: 16,
    overflowY: 'auto' ,
  },

  // Left panel (practice options)
  leftPanel: {
    borderRightWidth: 1,
    borderRightColor: COLORS.headerBorder,
    backgroundColor: COLORS.headerBg,
    padding: 16,
    overflowY: 'auto' ,
  },
  leftTitle: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  rightTitle: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  liveStats: { gap: 8, marginBottom: 14 },
  liveStat: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    overflow: 'hidden',
  },
  liveStatBig: {
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderColor: 'rgba(59,130,246,0.5)',
  },
  liveStatValue: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 22,
    flexShrink: 1,
    textAlign: 'center',
  },
  liveStatValueBig: {
    fontSize: 42,
  },
  liveStatLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  liveStatLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 10.5,
    textTransform: 'uppercase',
    flexShrink: 1,
    textAlign: 'center',
  },
  guideCard: {
    backgroundColor: COLORS.cardBg,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 14,
    alignItems: 'center',
  },
  guideTitle: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: 10.5,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  nextKeyDisplay: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: 'rgba(14,116,144,0.14)',
    borderWidth: 1,
    borderColor: '#0e7490',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0e7490',
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  nextKeyBig: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    fontSize: 28,
    color: '#0e7490',
  },
  guideKeyName: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textLight,
    fontSize: 13,
    marginTop: 8,
  },
  guideEmpty: {
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textDim,
    fontSize: 12,
    textAlign: 'center',
  },
  fingerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(14,116,144,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 10,
  },
  fingerChipText: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.cyan,
    fontSize: 11.5,
  },
  rightProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    width: '100%',
  },
  rightProgressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#0e7490',
  },
  rightProgressText: {
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textMuted,
    fontSize: 10.5,
    marginTop: 8,
  },
  rightProgressPct: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.cyan,
    fontSize: 20,
    marginTop: 8,
  },

  // Result
  resultOverlay: {
    marginBottom: 12,
  },
  resultCard: {
    backgroundColor: COLORS.cardBgSolid,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.4)',
    borderRadius: 16,
    padding: 22,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.2,
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
    color: '#fff',
    fontSize: 22,
  },
  resultSub: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: COLORS.textMuted,
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
    color: COLORS.textMuted,
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
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  resultGridVal: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textLight, fontSize: 16, flexShrink: 1, textAlign: 'center' },
  resultGridLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textMuted,
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