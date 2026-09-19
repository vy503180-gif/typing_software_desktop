// src/screens/ExploreScreen.js
// Explore screen: Speed Test, Keyboard Guide, Daily Challenge, Best Scores

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;
const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

// ── Speed Test Data (duration wise) ──
const SPEED_SHORT = [
  'The quick brown fox jumps over the lazy dog.',
  'Pack my box with five dozen liquor jugs.',
  'A journey of thousand miles begins with a step.',
  'Practice makes a person perfect in every way.',
  'Mobile typing is a useful modern digital skill.',
  'The early morning dew sparkles on the green grass.',
  'She sells sea shells on the sea shore nearby.',
  'How quickly can you type in just one minute.',
];

const SPEED_MEDIUM = [
  'The quick brown fox jumps over the lazy dog near the river bank. Pack my box with five dozen liquor jugs how quickly can you type today.',
  'A journey of thousand miles begins with a single small step forward. Practice makes a person perfect in every single way of life.',
  'Mobile typing is a useful skill for the modern digital world today. The early morning dew sparkles on the green grass near the fence.',
  'She sells sea shells on the sea shore but the shells she sells are not hers. How razor back frog jumps can you type.',
  'Technology has changed the way we live our daily lives. Smartphones help us stay connected with friends and manage work schedules.',
  'Reading books is one of the most valuable habits. It improves vocabulary and expands understanding of different cultures and ideas.',
];

const SPEED_LONG = [
  'The quick brown fox jumps over the lazy dog near the river bank. Pack my box with five dozen liquor jugs how quickly can you type in just one single minute of testing. A journey of thousand miles begins with a single small step forward in life. Practice makes a person perfect in every single way of life if you keep trying every day without giving up.',
  'Mobile typing is a useful skill for the modern digital world today. The early morning dew sparkles on the green grass near the fence of the garden. She sells sea shells on the sea shore but the shells she sells are not hers to keep. Technology has changed the way we live our daily lives in so many ways that we cannot even imagine a world without it now.',
  'Reading books is one of the most valuable habits a person can develop over time. When you read regularly you improve your vocabulary and expand your understanding of different cultures and ideas around the world. Books can transport you to different worlds and teach you lessons you might never learn from experience alone in your daily life.',
  'Physical exercise is essential for a healthy lifestyle. Many people spend long hours sitting at desks which leads to back pain and weight gain over time. Regular activity keeps your body fit and mind sharp for the challenges ahead. Walking for thirty minutes a day can have a profound impact on your overall wellbeing and happiness.',
];

const getSPEED_POOL = (dur) => {
  if (dur <= 45) return SPEED_SHORT;
  if (dur <= 90) return SPEED_MEDIUM;
  return SPEED_LONG;
};

// ── Daily Challenge Data ──
const DAILY_PARAGRAPHS = [
  'Technology has changed the way we live our daily lives in so many ways. From the moment we wake up to the time we sleep, we are surrounded by devices that make our tasks easier. Smartphones help us stay connected with friends, manage work schedules, and track our health. The internet has opened a world of information at our fingertips.',
  'Reading books is one of the most valuable habits a person can develop. When you read regularly, you improve your vocabulary and expand your understanding of different cultures and ideas. Books can transport you to different worlds and teach you lessons you might never learn from experience.',
  'Physical exercise is essential for a healthy lifestyle. Many people spend long hours sitting at desks which leads to back pain and weight gain. Regular activity keeps your body fit and mind sharp. It reduces the risk of diabetes, heart disease, and high blood pressure.',
  'Learning to type fast is a skill that becomes more important every year. Whether you are a student or a professional, good typing skills save you time and effort. The ability to type without looking at the keyboard lets you focus on what you want to say.',
  'Climate change is one of the most pressing challenges humanity faces today. Human activities like burning fossil fuels are causing global temperatures to rise. This leads to more severe weather events and rising sea levels.',
  'Music has been an integral part of human culture for thousands of years. From ancient drums to modern electronic compositions, music serves as a powerful medium for expression and emotional connection.',
  'Artificial intelligence has made remarkable progress in recent years. From voice assistants to recommendation systems, AI is becoming part of our daily lives. Machine learning can analyze vast data to identify patterns.',
  'Traveling to new places is one of the most enriching activities a person can undertake. When you travel, you step outside your comfort zone and encounter different ways of life.',
];

const getDailyIndex = () => {
  const d = new Date();
  return (d.getFullYear() * 366 + d.getMonth() * 31 + d.getDate()) % DAILY_PARAGRAPHS.length;
};

// ── Keyboard Layout Data ──
const QWERTY_ROWS = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', '[', ']', '\\'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';', "'"],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/'],
];

const HOME_ROW = { left: ['A', 'S', 'D', 'F'], right: ['J', 'K', 'L', ';'] };
const FINGER_MAP = {
  '`': 'LP', '1': 'LP', '2': 'LR', '3': 'LM', '4': 'LI', '5': 'LI',
  '6': 'RI', '7': 'RI', '8': 'RM', '9': 'RR', '0': 'RP', '-': 'RP', '=': 'RP',
  'Q': 'LP', 'W': 'LR', 'E': 'LM', 'R': 'LI', 'T': 'LI',
  'Y': 'RI', 'U': 'RI', 'I': 'RM', 'O': 'RR', 'P': 'RP', '[': 'RP', ']': 'RP', '\\': 'RP',
  'A': 'LP', 'S': 'LR', 'D': 'LM', 'F': 'LI', 'G': 'LI',
  'H': 'RI', 'J': 'RI', 'K': 'RM', 'L': 'RR', ';': 'RR', "'": 'RP',
  'Z': 'LP', 'X': 'LR', 'C': 'LM', 'V': 'LI', 'B': 'LI',
  'N': 'RI', 'M': 'RI', ',': 'RM', '.': 'RR', '/': 'RP',
};

const FINGER_COLORS = {
  LP: '#fb7185', LR: '#fbbf24', LM: '#4ade80', LI: '#2dd4bf',
  RI: '#2dd4bf', RM: '#4ade80', RR: '#fbbf24', RP: '#fb7185',
};

const FINGER_LABELS = {
  LP: 'Little', LR: 'Ring', LM: 'Middle', LI: 'Index',
  RI: 'Index', RM: 'Middle', RR: 'Ring', RP: 'Little',
};

// ── Sub-components ──

function SectionHeader({ icon, color, title, subtitle }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

function SpeedTestCard({ onStart }) {
  const [duration, setDuration] = useState(60);
  const DURATIONS = [
    { label: '30s', value: 30 },
    { label: '1m', value: 60 },
    { label: '2m', value: 120 },
  ];

  return (
    <View style={styles.card}>
      <SectionHeader icon="flash" color={COLORS.amber} title="Speed Test" subtitle="Quick typing test — apna WPM check karo" />
      <View style={styles.durRow}>
        {DURATIONS.map((d) => {
          const sel = duration === d.value;
          return (
            <TouchableOpacity
              key={d.value}
              style={[styles.durItem, sel && { backgroundColor: COLORS.amber + '22', borderColor: COLORS.amber }]}
              onPress={() => setDuration(d.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.durText, sel && { color: COLORS.amber }]}>{d.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity style={[styles.startBtn, { backgroundColor: COLORS.amber }]} onPress={() => onStart(duration)} activeOpacity={0.8}>
        <Ionicons name="play" size={16} color="#fff" />
        <Text style={styles.startBtnText}>Start Speed Test</Text>
      </TouchableOpacity>
    </View>
  );
}

function DailyChallengeCard({ studentName, onStart }) {
  const [todayScore, setTodayScore] = useState(null);
  const dailyIdx = getDailyIndex();
  const dailyText = DAILY_PARAGRAPHS[dailyIdx];

  useEffect(() => {
    if (!studentName) return;
    const key = getHistoryKey(studentName);
    AsyncStorage.getItem(key).then((raw) => {
      try {
        const list = raw ? JSON.parse(raw) : [];
        const today = new Date().toLocaleDateString();
        const todayRecords = list.filter((r) => r.date === today && r.lesson === 'Daily Challenge');
        if (todayRecords.length > 0) {
          const best = todayRecords.reduce((a, b) => (b.wpm > a.wpm ? b : a));
          setTodayScore(best);
        }
      } catch {}
    }).catch(() => {});
  }, [studentName]);

  return (
    <View style={styles.card}>
      <SectionHeader icon="calendar" color={COLORS.green} title="Daily Challenge" subtitle="Aaj ka fixed paragraph — har din naya" />
      <View style={styles.dailyPreview}>
        <Text style={styles.dailyText} numberOfLines={3}>{dailyText}</Text>
        <Text style={styles.dailyLen}>{dailyText.length} characters</Text>
      </View>
      {todayScore ? (
        <View style={styles.dailyScoreRow}>
          <View style={styles.dailyScoreItem}>
            <Text style={[styles.dailyScoreVal, { color: COLORS.green }]}>{todayScore.wpm}</Text>
            <Text style={styles.dailyScoreLabel}>WPM</Text>
          </View>
          <View style={styles.dailyScoreItem}>
            <Text style={[styles.dailyScoreVal, { color: COLORS.amber }]}>{todayScore.accuracy}%</Text>
            <Text style={styles.dailyScoreLabel}>Accuracy</Text>
          </View>
          <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
          <Text style={styles.dailyDone}>Done</Text>
        </View>
      ) : null}
      <TouchableOpacity
        style={[styles.startBtn, { backgroundColor: COLORS.green }]}
        onPress={() => onStart(dailyText)}
        activeOpacity={0.8}
      >
        <Ionicons name="play" size={16} color="#fff" />
        <Text style={styles.startBtnText}>{todayScore ? 'Try Again' : 'Start Challenge'}</Text>
      </TouchableOpacity>
    </View>
  );
}

function KeyboardGuideCard() {
  return (
    <View style={styles.card}>
      <SectionHeader icon="finger-print" color={COLORS.teal} title="Keyboard Layout" subtitle="QWERTY home row finger positions" />
      <View style={styles.kbContainer}>
        {QWERTY_ROWS.map((row, ri) => (
          <View key={ri} style={styles.kbRow}>
            {row.map((key) => {
              const finger = FINGER_MAP[key] || 'LI';
              const isHome = HOME_ROW.left.includes(key) || HOME_ROW.right.includes(key);
              return (
                <View
                  key={key}
                  style={[
                    styles.kbKey,
                    { borderColor: FINGER_COLORS[finger] + '60' },
                    isHome && { backgroundColor: FINGER_COLORS[finger] + '20', borderColor: FINGER_COLORS[finger] },
                  ]}
                >
                  <Text style={[styles.kbKeyText, isHome && { color: FINGER_COLORS[finger] }]}>{key}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>
      <View style={styles.fingerLegend}>
        {[
          { label: 'Little', color: '#fb7185' },
          { label: 'Ring', color: '#fbbf24' },
          { label: 'Middle', color: '#4ade80' },
          { label: 'Index', color: '#2dd4bf' },
        ].map((f) => (
          <View key={f.label} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: f.color }]} />
            <Text style={styles.legendText}>{f.label}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.kbNote}>Green highlighted keys = home row (ASDF JKL;)</Text>
    </View>
  );
}

function BestScoresCard({ studentName }) {
  const [best, setBest] = useState({ wpm: 0, accuracy: 0, totalTests: 0, totalTime: 0 });

  useEffect(() => {
    if (!studentName) return;
    const key = getHistoryKey(studentName);
    AsyncStorage.getItem(key).then((raw) => {
      try {
        const list = raw ? JSON.parse(raw) : [];
        if (list.length === 0) return;
        const topWpm = list.reduce((a, b) => (b.wpm > a.wpm ? b : a));
        const topAcc = list.reduce((a, b) => (b.accuracy > a.accuracy ? b : a));
        const totalTime = list.reduce((s, r) => s + (r.timeTaken || 0), 0);
        setBest({
          wpm: topWpm.wpm,
          accuracy: topAcc.accuracy,
          totalTests: list.length,
          totalTime,
        });
      } catch {}
    }).catch(() => {});
  }, [studentName]);

  const formatTime = (sec) => {
    if (sec < 60) return `${sec}s`;
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  };

  return (
    <View style={styles.card}>
      <SectionHeader icon="trophy" color="#f59e0b" title="Best Scores" subtitle="Tumhara personal best record" />
      <View style={styles.scoreGrid}>
        <View style={[styles.scoreItem, { borderColor: COLORS.amber + '40' }]}>
          <Ionicons name="flash" size={20} color={COLORS.amber} />
          <Text style={[styles.scoreVal, { color: COLORS.amber }]}>{best.wpm}</Text>
          <Text style={styles.scoreLabel}>Best WPM</Text>
        </View>
        <View style={[styles.scoreItem, { borderColor: COLORS.green + '40' }]}>
          <Ionicons name="checkmark-circle" size={20} color={COLORS.green} />
          <Text style={[styles.scoreVal, { color: COLORS.green }]}>{best.accuracy}%</Text>
          <Text style={styles.scoreLabel}>Best Accuracy</Text>
        </View>
        <View style={[styles.scoreItem, { borderColor: COLORS.teal + '40' }]}>
          <Ionicons name="stats-chart" size={20} color={COLORS.teal} />
          <Text style={[styles.scoreVal, { color: COLORS.teal }]}>{best.totalTests}</Text>
          <Text style={styles.scoreLabel}>Total Tests</Text>
        </View>
        <View style={[styles.scoreItem, { borderColor: COLORS.rose + '40' }]}>
          <Ionicons name="time" size={20} color={COLORS.rose} />
          <Text style={[styles.scoreVal, { color: COLORS.rose }]}>{formatTime(best.totalTime)}</Text>
          <Text style={styles.scoreLabel}>Practice Time</Text>
        </View>
      </View>
      {best.totalTests === 0 && (
        <Text style={styles.noData}>Abhi tak koi test nahi hua — pehla speed test karo!</Text>
      )}
    </View>
  );
}

// ── Inline Speed Test (mini typing test) ──
function InlineSpeedTest({ duration, text, onDone, onBack }) {
  const [currentText] = useState(text || (() => {
    const pool = getSPEED_POOL(duration);
    return pool[Math.floor(Math.random() * pool.length)];
  })());
  const [userInput, setUserInput] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState({ wpm: 0, accuracy: 0 });
  const timerRef = useRef(null);
  const inputRef = useRef(null);
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
    if (isStarted && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            clearInterval(timerRef.current);
            return duration;
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isFinished, duration]);

  useEffect(() => {
    if (isStarted && !isFinished && seconds >= duration) {
      finishTest();
    }
  }, [seconds]);

  useEffect(() => {
    if (isStarted && !isFinished && userInput.length === currentText.length) {
      finishTest();
    }
  }, [userInput]);

  const finishTest = () => {
    setIsFinished(true);
    clearInterval(timerRef.current);
    Keyboard.dismiss();
    const elapsed = seconds > 0 ? seconds : 1;
    const words = currentText.trim().split(/\s+/).length;
    const wpm = Math.round((words / elapsed) * 60);
    let correct = 0;
    for (let i = 0; i < currentText.length; i++) {
      if (userInput[i] === currentText[i]) correct++;
    }
    const accuracy = Math.round((correct / currentText.length) * 100);
    setResult({ wpm, accuracy });
    if (onDone) onDone({ wpm, accuracy, time: elapsed });
  };

  const handleCharPress = () => {
    if (inputRef.current && !isFinished) inputRef.current.focus();
  };

  const remaining = duration - seconds;

  return (
    <View style={styles.testContainer}>
      <View style={styles.testHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.testTitle}>Speed Test</Text>
          <Text style={styles.testSub}>{duration}s test</Text>
        </View>
        <View style={[styles.timerBadge, remaining <= 10 && { backgroundColor: COLORS.rose + '30', borderColor: COLORS.rose }]}>
          <Ionicons name="time" size={14} color={remaining <= 10 ? COLORS.rose : COLORS.amber} />
          <Text style={[styles.timerText, remaining <= 10 && { color: COLORS.rose }]}>{remaining}s</Text>
        </View>
      </View>

      {/* Result */}
      {isFinished ? (
        <View style={styles.resultBox}>
          <View style={[styles.resultIconWrap, { backgroundColor: COLORS.green + '20' }]}>
            <Ionicons name="checkmark-circle" size={36} color={COLORS.green} />
          </View>
          <Text style={[styles.resultTitle, { color: COLORS.green }]}>Test Complete!</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultItem}>
              <Text style={[styles.resultVal, { color: COLORS.amber }]}>{result.wpm}</Text>
              <Text style={styles.resultLabel}>WPM</Text>
            </View>
            <View style={styles.resultItem}>
              <Text style={[styles.resultVal, { color: COLORS.green }]}>{result.accuracy}%</Text>
              <Text style={styles.resultLabel}>Accuracy</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: COLORS.green }]} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Text display */}
      {!isFinished && (
        <>
          <TouchableOpacity style={styles.testTextBox} onPress={handleCharPress} activeOpacity={1}>
            <View style={styles.charRow}>
              {currentText.split('').map((char, i) => {
                const typed = userInput[i];
                let color = COLORS.textMuted;
                const isFixated = i < userInput.length;
                if (isFixated) color = typed === char ? COLORS.green : COLORS.rose;
                const isCursorHere = i === userInput.length;
                return (
                  <View key={i} style={styles.charWrap}>
                    {isCursorHere && <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />}
                    <Text style={[styles.char, { color }]}>{char}</Text>
                  </View>
                );
              })}
            </View>
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            value={userInput}
            onChangeText={(t) => { if (!isStarted) setIsStarted(true); setUserInput(t); }}
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            editable={!isFinished}
          />

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${(userInput.length / currentText.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>{userInput.length}/{currentText.length}</Text>
        </>
      )}
    </View>
  );
}

// ── Main ExploreScreen ──
export default function ExploreScreen({ studentName, onBack }) {
  const [testMode, setTestMode] = useState(null); // { duration, text }
  const [dailyMode, setDailyMode] = useState(false);

  const startSpeedTest = useCallback((duration) => {
    setTestMode({ duration, text: null });
  }, []);

  const startDailyChallenge = useCallback((text) => {
    setDailyMode(true);
    setTestMode({ duration: 300, text });
  }, []);

  const handleTestDone = useCallback((stats) => {
    // Stats displayed inline, nothing extra needed
  }, []);

  if (testMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" />
        <InlineSpeedTest
          duration={testMode.duration}
          text={testMode.text}
          onDone={handleTestDone}
          onBack={() => { setTestMode(null); setDailyMode(false); }}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Explore</Text>
            <Text style={styles.subtitle}>Typing tools aur guides</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          <SpeedTestCard onStart={startSpeedTest} />
          <DailyChallengeCard studentName={studentName} onStart={startDailyChallenge} />
          <KeyboardGuideCard />
          <BestScoresCard studentName={studentName} />
          <View style={{ height: scaleSize(40) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ──
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(16) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  backBtn: {
    width: scaleSize(38), height: scaleSize(38), borderRadius: scaleSize(19),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(24) },
  subtitle: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 2 },
  scroll: { paddingBottom: scaleSize(120) },

  // Cards
  card: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: scaleSize(14), marginBottom: scaleSize(12),
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10), marginBottom: scaleSize(12) },
  sectionIcon: {
    width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(10),
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { color: COLORS.textWhite, fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },
  sectionSub: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 1 },

  // Duration selector
  durRow: { flexDirection: 'row', gap: scaleSize(8), marginBottom: scaleSize(12) },
  durItem: {
    flex: 1, paddingVertical: scaleSize(9), borderRadius: scaleSize(10), alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  durText: { color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },

  // Buttons
  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scaleSize(6),
    paddingVertical: scaleSize(12), borderRadius: scaleSize(12),
  },
  startBtnText: { color: '#fff', fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },

  // Daily Challenge
  dailyPreview: {
    backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: scaleSize(10),
    padding: scaleSize(12), marginBottom: scaleSize(12),
  },
  dailyText: { color: COLORS.textLight, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', lineHeight: scaleFont(18) },
  dailyLen: { color: COLORS.textDim, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(6) },
  dailyScoreRow: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(10),
    marginBottom: scaleSize(12), paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(10), borderRadius: scaleSize(8),
    backgroundColor: COLORS.green + '10',
  },
  dailyScoreItem: { alignItems: 'center', marginRight: scaleSize(8) },
  dailyScoreVal: { fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  dailyScoreLabel: { color: COLORS.textMuted, fontSize: scaleFont(9), fontFamily: 'Calibri', fontWeight: '700' },
  dailyDone: { color: COLORS.green, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },

  // Keyboard Guide
  kbContainer: { alignItems: 'center', marginBottom: scaleSize(12) },
  kbRow: { flexDirection: 'row', gap: scaleSize(3), marginBottom: scaleSize(3) },
  kbKey: {
    width: scaleSize(28), height: scaleSize(28), borderRadius: scaleSize(5),
    borderWidth: 1, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  kbKeyText: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700' },
  fingerLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(10), marginBottom: scaleSize(6) },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(4) },
  legendDot: { width: scaleSize(8), height: scaleSize(8), borderRadius: scaleSize(4) },
  legendText: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700' },
  kbNote: { color: COLORS.textDim, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(4) },

  // Best Scores
  scoreGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(8) },
  scoreItem: {
    width: '48%', flexGrow: 1, padding: scaleSize(12), borderRadius: scaleSize(10),
    borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.03)', alignItems: 'center', gap: scaleSize(4),
  },
  scoreVal: { fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  scoreLabel: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700' },
  noData: { color: COLORS.textDim, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', textAlign: 'center', marginTop: scaleSize(8) },

  // ── Inline Test ──
  testContainer: {
    flex: 1, padding: IS_DESKTOP ? 24 : scaleSize(16),
    maxWidth: IS_DESKTOP ? CONTENT_MAX_WIDTH : undefined,
    alignSelf: IS_DESKTOP ? 'center' : undefined,
    width: IS_DESKTOP ? '100%' : undefined,
  },
  testHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  testTitle: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(20) },
  testSub: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(11) },
  timerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(4),
    backgroundColor: COLORS.amber + '20', borderRadius: scaleSize(10),
    paddingHorizontal: scaleSize(10), paddingVertical: scaleSize(5),
    borderWidth: 1, borderColor: COLORS.amber + '40',
  },
  timerText: { color: COLORS.amber, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },

  testTextBox: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(12),
    borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: scaleSize(14), marginBottom: scaleSize(10),
  },
  charRow: { flexDirection: 'row', flexWrap: 'wrap' },
  charWrap: { position: 'relative' },
  char: { fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  cursor: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    width: 2, backgroundColor: COLORS.amber, borderRadius: 1,
  },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0, width: 0 },
  progressTrack: {
    height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden', marginBottom: scaleSize(4),
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.amber },
  progressText: { color: COLORS.textDim, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', textAlign: 'center' },

  resultBox: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: scaleSize(12),
    padding: scaleSize(20),
  },
  resultIconWrap: {
    width: scaleSize(64), height: scaleSize(64), borderRadius: scaleSize(32),
    alignItems: 'center', justifyContent: 'center',
  },
  resultTitle: { fontSize: scaleFont(20), fontFamily: 'Calibri', fontWeight: '700' },
  resultRow: { flexDirection: 'row', gap: scaleSize(30), marginTop: scaleSize(8) },
  resultItem: { alignItems: 'center' },
  resultVal: { fontSize: scaleFont(32), fontFamily: 'Calibri', fontWeight: '700' },
  resultLabel: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(4) },
  doneBtn: { paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(40), borderRadius: scaleSize(12), marginTop: scaleSize(16) },
  doneBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },
});
