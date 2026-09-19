import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  SafeAreaView,
  StatusBar,
  TextInput,
  Platform,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP } from '../theme';

const SCREEN_W = SCREEN.width - 32; // padding minus
const MAX_MISSES = 5;

// Speed steps - har 5 word par speed badhti hai
// 0 word=0.4x, 5 word=0.6x, 10 word=0.8x, 20 word=1.0x
const DURATION_AT_040 = 25000; // 0.4x ke liye cross time (ms)
const DURATION_AT_060 = 16667; // 0.6x ke liye cross time (ms)
const DURATION_AT_080 = 12500; // 0.8x ke liye cross time (ms)
const DURATION_AT_100 = 10000; // 1.0x ke liye cross time (ms)

// Spawn pace - aaram se type karne layak
const SPAWN_GAP = 3000; // har 3s par naya word
const MAX_CONCURRENT = 3; // ek saath zyada word na honge

// Score ke hisaab se word cross-time nikalo
const crossTimeFor = (score) => {
  if (score >= 20) return DURATION_AT_100; // 1.0x
  if (score >= 10) return DURATION_AT_080; // 0.8x
  if (score >= 5) return DURATION_AT_060; // 0.6x
  return DURATION_AT_040; // 0.4x
};

const speedLevelFor = (score) => {
  if (score >= 20) return 1.0;
  if (score >= 10) return 0.8;
  if (score >= 5) return 0.6;
  return 0.4;
};

// Chhote-4-6 letter words (game ke liye quick typing)
const WORD_BANK = [
  'apple', 'water', 'school', 'friend', 'little', 'orange', 'yellow', 'purple',
  'garden', 'mother', 'father', 'brother', 'sister', 'family', 'animal', 'nature',
  'flower', 'forest', 'planet', 'summer', 'winter', 'morning', 'window', 'bottle',
  'pencil', 'banana', 'silver', 'golden', 'bright', 'strong', 'clever', 'gentle',
  'happy', 'dreams', 'travel', 'listen', 'writer', 'reader', 'number', 'letter',
  'silent', 'simple', 'middle', 'guitar', 'camera', 'village', 'street', 'bridge',
  'castle', 'kitchen', 'dinner', 'coffee', 'sugar', 'butter', 'cheese', 'chicken',
  'sports', 'cricket', 'hockey', 'soccer', 'tennis', 'runner', 'player', 'coach',
  'student', 'teacher', 'science', 'jungle', 'rabbit', 'grapes', 'screen',
];

// Words spawn karne ke lanes - 200px kaa gap, screen height ke hisaab se
const SCREEN_H = SCREEN.height;
// Play area height ≈ total minus stats row, hint bar, paddings
const LAYOUT_GUESS = SCREEN_H - 230;
const LANE_GAP = 200;
const laneCount = Math.max(2, Math.floor(LAYOUT_GUESS / LANE_GAP));
const LANES = Array.from({ length: laneCount }, (_, i) => 24 + i * LANE_GAP);

let cloudSerial = 0;

const randomWord = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
const randomLane = () => LANES[Math.floor(Math.random() * LANES.length)];

export default function CloudsGameScreen({ onBack }) {
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const scoreRef = useRef(0); // spawner effect ke liye - populaion delay reset na ho

  const gameRef = useRef({
    clouds: [],
    prog: 0,
    wrong: [],
    running: true,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);

  const activeWord = gameRef.current.clouds.length
    ? gameRef.current.clouds[0].word
    : '';

  // ---- Spawner: word aate jate rahein, miss/pop hone par agla turant ----
  const spawnTickerRef = useRef(null);
  const lastLaneRef = useRef(null);

  const spawnOne = () => {
    if (!gameRef.current.running) return;
    if (gameRef.current.clouds.length >= MAX_CONCURRENT) return false;
    const curScore = scoreRef.current;
    const id = cloudSerial++;
    const word = randomWord();
    const duration = crossTimeFor(curScore);
    // Same lane par agla word turant mat rakho (stacking se bachne ke liye)
    const pool = LANES.filter((l) => l !== lastLaneRef.current);
    const lane = pool.length ? pool[Math.floor(Math.random() * pool.length)] : randomLane();
    lastLaneRef.current = lane;
    const x = new Animated.Value(0);
    const overlay = new Animated.Value(1);
    const cloud = {
      id,
      word,
      lane,
      x,
      overlay,
      duration,
      popped: false,
      item: null,
    };
    // Movement animation - left se right udega
    const anim = Animated.timing(x, {
      toValue: SCREEN_W + 20,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    cloud.item = anim;
    anim.start(({ finished }) => {
      if (finished && !cloud.popped && gameRef.current.running) {
        // Word right edge paar kar gaya = MISS
        handleMiss(cloud.id);
      }
    });
    gameRef.current.clouds.push(cloud);
    forceRender();
    return true;
  };

  const queueSpawn = (delay) => {
    if (spawnTickerRef.current) clearTimeout(spawnTickerRef.current);
    if (!gameRef.current.running) return;
    spawnTickerRef.current = setTimeout(() => spawnOne(), delay);
  };

  // Background spawner - hamesha thoda-thoda word aate rahein
  useEffect(() => {
    if (gameOver) return;
    const bgTick = () => {
      if (!gameRef.current.running) return;
      spawnOne();
      spawnTickerRef.current = setTimeout(bgTick, SPAWN_GAP);
    };
    const t = setTimeout(bgTick, 600);
    spawnTickerRef.current = t;
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameOver]);

  const handleMiss = (id) => {
    const clouds = gameRef.current.clouds;
    const idx = clouds.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const cloud = clouds[idx];
    cloud.popped = true;
    clouds.splice(idx, 1);
    // Sirf ACTIVE word (sabse aage, idx 0) miss count karega.
    // Peechhe ke words quietly hata do - kyunki ek waqt mein sirf 1 type kar sakte ho.
    if (idx !== 0) {
      forceRender();
      return;
    }
    gameRef.current.prog = 0;
    gameRef.current.wrong = [];
    forceRender();
    setMisses((m) => {
      const next = m + 1;
      if (next >= MAX_MISSES) {
        gameRef.current.running = false;
        setGameOver(true);
      } else {
        // Word screen paar ho gaya - agla turant bhejo
        queueSpawn(450);
      }
      return next;
    });
  };

  const popCloud = (id) => {
    const clouds = gameRef.current.clouds;
    const idx = clouds.findIndex((c) => c.id === id);
    if (idx === -1) return;
    const cloud = clouds[idx];
    cloud.popped = true;
    if (cloud.item) cloud.item.stop();
    Animated.parallel([
      Animated.timing(cloud.overlay, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(cloud.x, {
        toValue: cloud.x._value,
        duration: 0,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      const arr = gameRef.current.clouds;
      const i2 = arr.findIndex((c) => c.id === id);
      if (i2 !== -1) {
        arr.splice(i2, 1);
        if (i2 === 0) {
          gameRef.current.prog = 0;
          gameRef.current.wrong = [];
        }
        forceRender();
        // Word type ho gaya - agla turant aaye
        queueSpawn(250);
      }
    }, 190);
    setScore((s) => {
      const next = s + 1;
      scoreRef.current = next;
      return next;
    });
  };

  const handleKey = (raw) => {
    const t = raw.toLowerCase();
    if (t === '' || t.length !== 1) return;
    if (!gameRef.current.running || gameRef.current.clouds.length === 0) return;

    const cloud = gameRef.current.clouds[0];
    if (cloud.popped) return;
    const g = gameRef.current;
    const expected = cloud.word[g.prog];

    if (t === expected) {
      const next = g.prog + 1;
      g.prog = next;
      forceRender();
      setCorrectChars((c) => c + 1);
      if (next === cloud.word.length) {
        popCloud(cloud.id);
      }
    } else {
      if (!g.wrong.includes(g.prog)) {
        g.wrong = [...g.wrong, g.prog];
        forceRender();
      }
      setMistakes((m) => m + 1);
    }
  };

  const handleChange = (text) => handleKey(text.slice(-1));
  const handleChangeRef = useRef(handleKey);
  handleChangeRef.current = handleKey;
  const startKeyRef = useRef(null);

  // Web keydown
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (gameOver) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleChangeRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [gameOver]);

  // Native focus
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const t = setTimeout(() => inputRef.current && inputRef.current.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const restart = () => {
    if (spawnTickerRef.current) clearTimeout(spawnTickerRef.current);
    // Saare clouds ke animations stop karo
    gameRef.current.clouds.forEach((c) => c.item && c.item.stop());
    gameRef.current.clouds = [];
    gameRef.current.prog = 0;
    gameRef.current.wrong = [];
    gameRef.current.running = true;
    scoreRef.current = 0;
    setScore(0);
    setMistakes(0);
    setMisses(0);
    setCorrectChars(0);
    setStartTime(Date.now());
    setGameOver(false);
    forceRender();
  };

  // Current speed (score ke hisaab se) - display ke liye
  const speedLevel = speedLevelFor(score);

  // Game over par WPM / Accuracy
  const elapsedMin = Math.max((Date.now() - startTime) / 60000, 0.01);
  const wpm = Math.round(correctChars / 5 / elapsedMin);
  const accuracy = correctChars + mistakes > 0
    ? Math.round((correctChars / (correctChars + mistakes)) * 100)
    : 100;

  const activeCloud = gameRef.current.clouds[0];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        {gameOver ? (
          <View style={styles.resultContainer}>
            <Ionicons name="cloud-offline-outline" size={56} color={COLORS.teal} />
            <Text style={styles.resultTitle}>Game Over!</Text>
            <Text style={styles.resultSub}>
              {MAX_MISSES} clouds miss ho gaye - game complete nahi ho paya.
            </Text>
            <View style={styles.resultStats}>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{wpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{accuracy}%</Text>
                <Text style={styles.doneLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{score}</Text>
                <Text style={styles.doneLabel}>Clouds</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restartBtn} onPress={restart} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={COLORS.teal} />
              <Text style={styles.restartBtnText}>Play Again</Text>
            </TouchableOpacity>
            {onBack && (
              <TouchableOpacity style={styles.backToReviewBtn} onPress={onBack} activeOpacity={0.85}>
                <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
                <Text style={styles.backToReviewText}>Back to Review</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.container}>
            {/* Header - back arrow + title */}
            <View style={styles.headerRow}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
                </TouchableOpacity>
              )}
              <Text style={styles.headerTitle} numberOfLines={1}>Clouds Pop</Text>
              <View style={styles.headerSpacer} />
            </View>
            {/* Top stats */}
            <View style={styles.topRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Clouds</Text>
                <Text style={styles.statValue}>{score}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Speed</Text>
                <Text style={styles.statValue}>{speedLevel}x</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Miss</Text>
                <View style={styles.missDots}>
                  {Array.from({ length: MAX_MISSES }, (_, i) => (
                    <View
                      key={i}
                      style={[styles.missDot, i < misses && styles.missDotFilled]}
                    />
                  ))}
                </View>
              </View>
            </View>

            {/* Game area */}
            <View style={styles.playArea}>
              {gameRef.current.clouds.map((cloud) => {
                const isActive = cloud.id === activeCloud.id;
                const g = gameRef.current;
                const prefix = isActive ? cloud.word.slice(0, g.prog) : '';
                const rest = isActive ? cloud.word.slice(g.prog) : cloud.word;
                return (
                  <Animated.View
                    key={cloud.id}
                    style={[
                      styles.cloud,
                      isActive ? styles.cloudActive : styles.cloudInactive,
                      { top: cloud.lane },
                      { transform: [{ translateX: cloud.x }] },
                      { opacity: cloud.overlay },
                    ]}
                  >
                    <Text style={styles.cloudWord}>
                      <Text style={styles.cloudWordTyped}>{prefix}</Text>
                      {rest}
                    </Text>
                  </Animated.View>
                );
              })}

              <View style={styles.hintBar}>
                <Text style={styles.hintText}>
                  Type the yellow word • {MAX_MISSES - misses} misses left
                </Text>
              </View>
            </View>

            {/* Hidden input - native only */}
            {Platform.OS !== 'web' && (
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                defaultValue=""
                onChangeText={handleChange}
                editable
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
  container: { flex: 1, padding: scaleSize(20), paddingBottom: scaleSize(8), width: '100%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  backBtn: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: scaleSize(17),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(8),
  },
  headerTitle: { fontFamily: 'Calibri', color: COLORS.textWhite,
    fontSize: scaleFont(18),
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerSpacer: { flex: 1 },

  topRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(14),
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(6),
    minWidth: 0,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(11),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 0.5,
  },
  statValue: {
    color: COLORS.textWhite,
    fontSize: scaleFont(18),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: 2,
  },
  missDots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  missDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  missDotFilled: {
    backgroundColor: COLORS.teal,
  },

  playArea: {
    flex: 1,
    overflow: 'hidden',
    marginHorizontal: -16,
    // Clouds yahan absolute honge
  },
  cloud: {
    position: 'absolute',
    left: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(18),
  },
  cloudActive: {
    backgroundColor: 'rgba(30,30,50,0.95)',
    borderWidth: 2,
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
  },
  cloudInactive: {
    backgroundColor: 'rgba(30,30,50,0.6)',
  },
  cloudWord: {
    color: COLORS.teal,
    fontSize: scaleFont(18),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  cloudWordTyped: { fontFamily: 'Calibri', color: COLORS.teal,
  },

  hintBar: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    backgroundColor: 'rgba(20,184,166,0.85)',
    borderRadius: 16,
    paddingVertical: scaleSize(8),
    paddingHorizontal: scaleSize(20),
  },
  hintText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(12),
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
    fontSize: scaleFont(24),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(12),
  },
  resultSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700',
    textAlign: 'center',
    marginTop: scaleSize(6),
    marginBottom: scaleSize(20),
  },
  resultStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(16),
    paddingVertical: scaleSize(16),
    marginBottom: scaleSize(24),
  },
  doneStat: {
    alignItems: 'center',
  },
  doneVal: {
    color: COLORS.green,
    fontSize: scaleFont(28),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  doneLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: 2,
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
  backToReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(36),
    marginTop: scaleSize(12),
  },
  backToReviewText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },
});