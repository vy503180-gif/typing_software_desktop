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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP } from '../theme';

const MAX_MISSES = 8;
// Sabse lambe word ki width bhi andar rahe is liye approx width
const MAX_WORD_W = 170;
// Play area ke upar se start (pure bahar, phir andar aa jata hai)
const FALL_TOP = -100;

// Speed steps - har kuch bina-miss waale words (streak) ke baad speed badhti hai.
// Fall times chhote rakhe gaye hain taaki 1s ke spawning gap me words
// ek dusre se upar-neeche clear duri par dikhe (ek hi line me chipke nahin).
const DURATION_AT_060 = 9000; // 0.6x - base speed
const DURATION_AT_080 = 7000;
const DURATION_AT_100 = 5500;

// Streak ke hisaab se fall duration (base 0.6x se shuru, miss na ho to halki halki badhti hai)
const crossTimeFor = (streak) => {
  if (streak >= 9) return DURATION_AT_100; // 1.0x
  if (streak >= 5) return DURATION_AT_080; // 0.8x
  return DURATION_AT_060; // 0.6x
};

const speedLevelFor = (streak) => {
  if (streak >= 9) return 1.0;
  if (streak >= 5) return 0.8;
  return 0.6;
};

// Do words ke beech minimum duri - naya word tabhi aayega jab pichhla word
// itna niche gir chuka ho. Isse words ek saath nahi chadhenge, ek ek karke
// sahi distance par uper se aate rahenge, aur player ko type karne ka time milega.
const MIN_WORD_GAP = 40;

// Type karne se free - naya word kam se kam itne ms baad hi aayega
// (taaki jaldi type karne par bhi words ek ke baad ek na aa jayein)
const SPAWN_MIN_GAP_MS = 2500;

// Chhote words (game ke liye quick typing)
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

let wordSerial = 0;

const randomWord = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
// Play area ki asli width ke andar random position (left), taaki word
// screen ke bahar na nikle aur side me na chhipe
const randomX = (playW) => {
  const w = playW || 320;
  const maxLeft = Math.max(8, w - MAX_WORD_W - 8);
  return 8 + Math.floor(Math.random() * Math.max(maxLeft - 8, 10));
};
// Current x ko bhi play area ke andar clamp karo (keyboard khulne par area chhota hota hai)
const clampX = (v, playW) => {
  if (!playW) return v;
  const maxLeft = Math.max(8, playW - MAX_WORD_W - 8);
  return Math.min(Math.max(8, v), maxLeft);
};

export default function WordTrisGameScreen({ onBack }) {
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  // Sabse zyada streak jo ab tak bani hai - isi se speed lock hoti hai
  // (speed sirf badhti hai, miss/typing slow hone par neeche nahi aati)
  const [bestStreak, setBestStreak] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());

  const gameRef = useRef({
    words: [],
    running: true,
  });
  // Play area ki asli (measured) size - keyboard/shuru hone ke baad bhi sahi rahe
  const playAreaRef = useRef({ w: 0, h: 0 });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const spawnTickerRef = useRef(null);
  const scoreRef = useRef(0);
  const streakRef = useRef(0);
  const bestStreakRef = useRef(0);
  const lastSpawnAtRef = useRef(0);

  // Ek saath girne wale words ki seema (zayada words ek saath na dikhe)
  const MAX_WORDS_ON_SCREEN = 7;
  // Har 1 second me ek naya word girta hai (type kare ya nahi)
  const SPAWN_GAP_MS = 1000;

  // Word abhi kitna niche hai (time ke hisaab se, native driver ke saath bhi accurate)
  const currentYOf = (w) => {
    const elapsed = Date.now() - w.startAt;
    const t = Math.min(1, Math.max(0, elapsed / w.duration));
    return FALL_TOP + (w.fallEnd - FALL_TOP) * t;
  };

  // Jo word sabse neeche hai (bottom ke sabse paas) wahi type karne ka target hai
  const targetWord = () => {
    const g = gameRef.current;
    const candidates = g.words.filter((w) => !w.submitted);
    if (!candidates.length) return null;
    return candidates.reduce((a, b) => (currentYOf(a) >= currentYOf(b) ? a : b));
  };

  const handleMiss = (id) => {
    const g = gameRef.current;
    const idx = g.words.findIndex((w) => w.id === id);
    if (idx >= 0) {
      const w = g.words[idx];
      if (w.anim) w.anim.stop();
      Animated.timing(w.overlay, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
      // Fade hone ke baad word pool se hat jata hai
      setTimeout(() => {
        const i2 = g.words.findIndex((x) => x.id === id);
        if (i2 >= 0) {
          g.words.splice(i2, 1);
          forceRender();
        }
      }, 160);
    }
    setMisses((m) => {
      const next = m + 1;
      if (next >= MAX_MISSES) {
        g.running = false;
        setGameOver(true);
      }
      return next;
    });
    // Miss hone par current streak reset (speed lock me nahi aata - speed waise hi rahegi)
    streakRef.current = 0;
    setStreak(0);
  };

  const spawnWord = () => {
    const g = gameRef.current;
    if (!g.running) return;
    if (g.words.length >= MAX_WORDS_ON_SCREEN) return;
    // Time rule: type karne se free - naya word kam se kam SPAWN_MIN_GAP_MS ke baad hi aaye
    if (Date.now() - lastSpawnAtRef.current < SPAWN_MIN_GAP_MS) return;
    // Distance rule: agla word tabhi aaye jab pichhla word kafi niche (MIN_WORD_GAP) gir chuka ho.
    // Nahi to wo sab ek saath upar chadh ke dikhte hain (type karna mushkil ho jata hai).
    if (g.words.length) {
      const topMost = g.words.reduce((a, b) => (currentYOf(a) <= currentYOf(b) ? a : b));
      if (currentYOf(topMost) < MIN_WORD_GAP) return;
    }
    lastSpawnAtRef.current = Date.now();
    const word = randomWord();
    const duration = crossTimeFor(bestStreakRef.current);
    const y = new Animated.Value(FALL_TOP);
    const overlay = new Animated.Value(1);
    const x = randomX(playAreaRef.current.w);
    // Asli play area ki height par hi word niche tak gaya (screen ke hisaab se)
    const fallEnd = Math.max(20, (playAreaRef.current.h || 300) - 60);
    const w = {
      id: ++wordSerial,
      text: word,
      prog: 0,
      wrong: [],
      x,
      y,
      overlay,
      duration,
      fallEnd,
      startAt: Date.now(),
    };
    g.words.push(w);
    const anim = Animated.timing(y, {
      toValue: fallEnd,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    w.anim = anim;
    anim.start(({ finished }) => {
      if (finished && g.running && !w.submitted) {
        // Word niche pahunch gaya = MISS → box bharta hai
        handleMiss(w.id);
      }
    });
    forceRender();
  };

  const spawnWordRef = useRef(spawnWord);
  spawnWordRef.current = spawnWord;

  // Game ke dauran har 2 second me ek naya word aata rehta hai
  useEffect(() => {
    const first = setTimeout(() => spawnWordRef.current(), 300);
    const iv = setInterval(() => spawnWordRef.current(), SPAWN_GAP_MS);
    spawnTickerRef.current = iv;
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, []);

  const popWord = (id) => {
    const g = gameRef.current;
    const w = g.words.find((x) => x.id === id);
    if (!w) return;
    w.submitted = true;
    if (w.anim) w.anim.stop();
    Animated.timing(w.overlay, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      const i = g.words.findIndex((x) => x.id === id);
      if (i >= 0) {
        g.words.splice(i, 1);
        forceRender();
      }
      setScore((s) => {
        const next = s + 1;
        scoreRef.current = next;
        return next;
      });
      // Word sahi type hua → streak badhao
      const ns = streakRef.current + 1;
      streakRef.current = ns;
      setStreak(ns);
      // Speed sirf badhti hai - best streak lock hota hai, fur kabhi neeche nahi aata
      if (ns > bestStreakRef.current) {
        bestStreakRef.current = ns;
        setBestStreak(ns);
      }
    }, 180);
  };

  const submitWord = () => {
    const w = targetWord();
    if (w && w.prog >= w.text.length) {
      popWord(w.id);
    } else {
      // Poora word type nahi hua - space dabaane par kuch nahi hoga
      setMistakes((m) => m + 1);
      forceRender();
    }
  };

  const handleKey = (raw) => {
    if (raw === ' ' || raw === '\n' || raw === 'Enter') {
      submitWord();
      return;
    }
    const t = raw.toLowerCase();
    if (t === '' || t.length !== 1) return;
    const g = gameRef.current;
    if (!g.running) return;
    const w = targetWord();
    if (!w) return;
    const expected = w.text[w.prog];

    if (t === expected) {
      const next = w.prog + 1;
      w.prog = next;
      forceRender();
      setCorrectChars((c) => c + 1);
    } else {
      if (!w.wrong.includes(w.prog)) {
        w.wrong = [...w.wrong, w.prog];
        forceRender();
      }
      setMistakes((m) => m + 1);
    }
  };

  const handleChange = (text) => handleKey(text.slice(-1));
  const handleKeyRef = useRef(handleKey);
  handleKeyRef.current = handleKey;

  // Web keydown
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (gameOver) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-Z]$/.test(e.key) || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleKeyRef.current(e.key === 'Enter' ? 'Enter' : e.key === ' ' ? ' ' : e.key);
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

  // Native focus guard - keyboard na chhute
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const focusGuard = setInterval(() => {
      if (!gameOver && inputRef.current && !inputRef.current.isFocused()) {
        inputRef.current.focus();
      }
    }, 1200);
    return () => clearInterval(focusGuard);
  }, [gameOver]);

  const restart = () => {
    const g = gameRef.current;
    // Saare gir rahe words ki animation band karo
    g.words.forEach((w) => {
      if (w.anim) w.anim.stop();
    });
    g.words = [];
    g.running = true;
    scoreRef.current = 0;
    streakRef.current = 0;
    bestStreakRef.current = 0;
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setMistakes(0);
    setMisses(0);
    setCorrectChars(0);
    setStartTime(Date.now());
    setGameOver(false);
    forceRender();
    // Pehla word jaldi se aaye
    setTimeout(() => spawnWordRef.current(), 300);
  };

  const speedLevel = speedLevelFor(bestStreak);

  // Game over par WPM / Accuracy
  const elapsedMin = Math.max((Date.now() - startTime) / 60000, 0.01);
  const wpm = Math.round(correctChars / 5 / elapsedMin);
  const accuracy = correctChars + mistakes > 0
    ? Math.round((correctChars / (correctChars + mistakes)) * 100)
    : 100;

  const boxFill = Math.min((misses / MAX_MISSES) * 100, 100);
  const boxColor = boxFill >= 80 ? COLORS.red : boxFill >= 40 ? COLORS.amber : COLORS.teal;

  const g = gameRef.current;

  // Play area measure hone par usme jo words chal rahe hain unhe andar clamp karo
  const onPlayLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === 0 && height === 0) return;
    playAreaRef.current = { w: width, h: height };
    const cur = gameRef.current;
    cur.words.forEach((w) => {
      w.x = clampX(w.x, width);
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        {gameOver ? (
          <View style={styles.resultContainer}>
            <Ionicons name="layers" size={56} color={COLORS.teal} />
            <Text style={styles.resultTitle}>Game Over!</Text>
            <Text style={styles.resultSub}>
              Box poori bhar gayi - game complete nahi ho paya.
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
                <Text style={styles.doneLabel}>Words</Text>
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
              <Text style={styles.headerTitle} numberOfLines={1}>Word Tris</Text>
              <View style={styles.headerSpacer} />
            </View>
            {/* Top stats */}
            <View style={styles.topRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Words</Text>
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

            {/* Play area */}
            <View style={styles.playArea} onLayout={onPlayLayout}>
              {g.words.map((w) => (
                <Animated.View
                  key={w.id}
                  style={[
                    styles.wall,
                    w.prog >= w.text.length && styles.wallReady,
                    { left: clampX(w.x, playAreaRef.current.w) },
                    { transform: [{ translateY: w.y }] },
                    { opacity: w.overlay },
                  ]}
                >
                  {w.prog >= w.text.length ? (
                    <Text style={styles.wordReady}>
                      Press <Text style={styles.wordReadyKey}>SPACE</Text>
                    </Text>
                  ) : (
                    <Text style={styles.wordText}>
                      <Text style={styles.wordTyped}>{w.text.slice(0, w.prog)}</Text>
                      {w.text.slice(w.prog)}
                    </Text>
                  )}
                </Animated.View>
              ))}
            </View>

            {/* Phone/App ke liye visible typing area - kya type kar rahe ho dikhe */}
            {(() => {
              const tw = targetWord();
              return Platform.OS !== 'web' && (
              <View style={styles.typedBox}>
                <Text style={styles.typedLabel}>Typing:</Text>
                {tw && tw.prog >= tw.text.length ? (
                  <Text style={styles.wordReady}>
                    Press <Text style={styles.wordReadyKey}>SPACE</Text>
                  </Text>
                ) : (
                  <View style={styles.typedLetters}>
                    {tw
                      ? tw.text.split('').map((ch, ci) => {
                          const done = ci < tw.prog;
                          const wrong = tw.wrong.includes(ci);
                          return (
                            <Text
                              key={ci}
                              style={[
                                styles.typedChar,
                                done && styles.typedCharDone,
                                wrong && styles.typedCharWrong,
                              ]}
                            >
                              {done ? ch : '_'}
                            </Text>
                          );
                        })
                      : null}
                  </View>
                )}
                <Text style={styles.typedHint}>
                  {tw && tw.prog >= tw.text.length ? 'Press Space to submit' : 'Type the word'}
                </Text>
              </View>
              );
            })()}

            {/* Box - jo bharta hai (miss=5 par full) */}
            <View style={styles.dangerBox}>
              <Text style={styles.dangerLabel}>
                {MAX_MISSES - misses} miss left
              </Text>
              <View style={styles.dangerTrack}>
                <View
                  style={[styles.dangerFill, { width: `${boxFill}%`, backgroundColor: boxColor }]}
                />
              </View>
            </View>

            {/* Input - native par visible (phone keyboard ke liye), web par hidden */}
            {Platform.OS !== 'web' ? (
              <TextInput
                ref={inputRef}
                style={styles.nativeInput}
                defaultValue=""
                onChangeText={handleChange}
                onSubmitEditing={() => handleKeyRef.current('Enter')}
                returnKeyType="done"
                blurOnSubmit={false}
                editable
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
                caretHidden={false}
                spellCheck={false}
                placeholder="Type the word here..."
                placeholderTextColor={COLORS.textDim}
                selectionColor={COLORS.teal}
              />
            ) : (
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                defaultValue=""
                onChangeText={handleChange}
                editable
                autoCapitalize="none"
                autoCorrect={false}
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
  headerTitle: { fontFamily: 'Poppins_400Regular', color: COLORS.textWhite,
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
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    letterSpacing: 0.5,
    flexShrink: 1,
    textAlign: 'center',
  },
  statValue: {
    color: COLORS.textWhite,
    fontSize: scaleFont(18),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: 2,
    flexShrink: 1,
    textAlign: 'center',
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
  },
  wall: {
    position: 'absolute',
    top: 0,
    maxWidth: MAX_WORD_W,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(30,30,50,0.95)',
    borderWidth: 2,
    borderColor: COLORS.teal,
    borderRadius: scaleSize(20),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(18),
    shadowColor: COLORS.teal,
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
  },
  wordText: {
    color: COLORS.teal,
    fontSize: scaleFont(22),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  wordTyped: { fontFamily: 'Poppins_400Regular', color: COLORS.teal,
  },
  wallReady: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
    shadowColor: COLORS.teal,
  },
  wordReady: {
    color: COLORS.teal,
    fontSize: scaleFont(20),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    letterSpacing: 1,
    textAlign: 'center',
  },
  wordReadyKey: {
    color: COLORS.teal,
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },

  typedBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(14),
    marginBottom: scaleSize(8),
    width: '100%',
  },
  typedLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(11),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginBottom: 4,
  },
  typedLetters: {
    flexDirection: 'row',
    gap: 2,
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  typedChar: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: scaleFont(26),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
  typedCharDone: { fontFamily: 'Poppins_400Regular', color: COLORS.teal,
  },
  typedCharWrong: { fontFamily: 'Poppins_400Regular', color: COLORS.rose,
  },
  typedHint: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(11),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(4),
  },

  nativeInput: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: scaleSize(16),
    color: COLORS.textWhite,
    fontSize: scaleFont(20),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(16),
    marginBottom: scaleSize(4),
  },

  dangerBox: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(14),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(14),
    marginBottom: scaleSize(4),
  },
  dangerLabel: {
    color: COLORS.textWhite,
    fontSize: scaleFont(12),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginBottom: scaleSize(6),
  },
  dangerTrack: {
    height: scaleSize(14),
    borderRadius: scaleSize(7),
    backgroundColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  dangerFill: {
    height: '100%',
    borderRadius: 7,
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
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(12),
  },
  resultSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scaleFont(14),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
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
    color: COLORS.teal,
    fontSize: scaleFont(26),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    flexShrink: 1,
    textAlign: 'center',
  },
  doneLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(12),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: 2,
    flexShrink: 1,
    textAlign: 'center',
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
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
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
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
});