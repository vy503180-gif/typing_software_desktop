// src/screens/BubblesGameScreen.js
// Bubbles typing game:
// Neeche se bubbles upar ki taraf aate hain, har bubble par ek character hota hai.
// Us character ko type karo to bubble pop ho jaati hai. Jo bubble upar nikal jaye
// wo MISS hai. 10 miss hone par game khatam.
// Speed dhire dhire badhti hai - jitne zyada bubble pop karoge, bubbles utni
// tezi se aane lagengi.

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

const MAX_MISSES = 10; // 10 miss = game over
const CHIP = 58; // bubble ka size
const RISE_TOP = -80; // is y par pahunch kar bubble screen se bahar
const MAX_ON_SCREEN = 6;

// Character sets - Games menu ke dropdown ke hisaab se
const CHARS_LOWER = 'abcdefghijklmnopqrstuvwxyz'.split('');
const CHARS_UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const CHARS_DIGITS = '0123456789'.split('');

const MODE_INFO = {
  lower: { label: 'a-z', color: COLORS.teal },
  mixed: { label: 'a-z, A-Z', color: COLORS.green },
  alnum: { label: 'a-z, A-Z, 0-9', color: COLORS.amber },
};

const poolFor = (mode) => {
  if (mode === 'mixed') return [...CHARS_LOWER, ...CHARS_UPPER];
  if (mode === 'alnum') return [...CHARS_LOWER, ...CHARS_UPPER, ...CHARS_DIGITS];
  return [...CHARS_LOWER];
};

// Speed tiers - score badhne par bubble tez hoti jayegi
const RISE_MS = [13000, 11000, 9000, 7200, 5800, 4600];
const SPAWN_MS = [1900, 1650, 1400, 1200, 1050, 900];

const tierFor = (popped) => {
  if (popped >= 40) return 5;
  if (popped >= 30) return 4;
  if (popped >= 20) return 3;
  if (popped >= 12) return 2;
  if (popped >= 6) return 1;
  return 0;
};

const speedLabelFor = (tier) =>
  ['0.6x', '0.8x', '1.0x', '1.2x', '1.5x', '1.8x'][tier] || '0.6x';

let bubbleSerial = 0;

const randomChar = (pool, avoid) => {
  for (let i = 0; i < 30; i++) {
    const c = pool[Math.floor(Math.random() * pool.length)];
    if (avoid && avoid.includes(c)) continue;
    return c;
  }
  return pool[Math.floor(Math.random() * pool.length)];
};

const randomX = (playW) => {
  const w = playW || 320;
  const maxLeft = Math.max(8, w - CHIP - 8);
  return 8 + Math.floor(Math.random() * Math.max(maxLeft - 8, 10));
};

export default function BubblesGameScreen({ onBack, mode: initialMode }) {
  const mode = initialMode || 'lower';
  const accent = (MODE_INFO[mode] || MODE_INFO.lower).color;
  const pool = poolFor(mode);

  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());

  const gameRef = useRef({ bubbles: [], running: true });
  const playAreaRef = useRef({ w: 0, h: 0 });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);

  const inputRef = useRef(null);
  const scoreRef = useRef(0);
  const spawnAtRef = useRef(0);

  // Bubble abhi kitni upar aayi (time ke hisaab se)
  const currentYOf = (b) => {
    const elapsed = Date.now() - b.startAt;
    const t = Math.min(1, Math.max(0, elapsed / b.duration));
    return b.fallStart + (b.fallEnd - b.fallStart) * t;
  };

  const handleMiss = (id) => {
    const g = gameRef.current;
    if (!g.running) return;
    const b = g.bubbles.find((x) => x.id === id);
    if (!b || b.popped) return;
    b.popped = true;
    if (b.anim) b.anim.stop();
    Animated.timing(b.pop, {
      toValue: 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      const j = g.bubbles.findIndex((x) => x.id === id);
      if (j >= 0) {
        g.bubbles.splice(j, 1);
        forceRender();
      }
    }, 170);
    setMisses((m) => {
      const next = m + 1;
      if (next >= MAX_MISSES) {
        g.running = false;
        setGameOver(true);
      }
      return next;
    });
  };

  const spawnBubble = () => {
    const g = gameRef.current;
    if (!g.running) return;
    const playH = playAreaRef.current.h;
    if (!playH) return;
    if (g.bubbles.length >= MAX_ON_SCREEN) return;

    const tier = tierFor(scoreRef.current);
    const now = Date.now();
    // Naya bubble tabhi jab pichhli bubble thoda upar aa chuki ho
    if (now - spawnAtRef.current < SPAWN_MS[tier]) return;
    if (g.bubbles.length) {
      const bottomMost = g.bubbles.reduce((a, b) =>
        currentYOf(a) >= currentYOf(b) ? a : b
      );
      if (currentYOf(bottomMost) > playH - CHIP) return;
    }

    spawnAtRef.current = now;
    const duration = RISE_MS[tier];
    const y = new Animated.Value(0);
    const pop = new Animated.Value(1);
    const b = {
      id: ++bubbleSerial,
      ch: randomChar(pool, g.bubbles.map((x) => x.ch)),
      x: randomX(playAreaRef.current.w),
      y,
      pop,
      duration,
      fallStart: playH + 12,
      fallEnd: RISE_TOP,
      startAt: now,
      popped: false,
    };
    g.bubbles.push(b);

    const anim = Animated.timing(y, {
      toValue: b.fallEnd - b.fallStart,
      duration,
      easing: Easing.linear,
      useNativeDriver: true,
    });
    b.anim = anim;
    anim.start(({ finished }) => {
      if (finished && g.running && !b.popped) {
        handleMiss(b.id); // upar nikal gayi = miss
      }
    });
    forceRender();
  };

  const spawnBubbleRef = useRef(spawnBubble);
  spawnBubbleRef.current = spawnBubble;

  // Spawn loop
  useEffect(() => {
    const first = setTimeout(() => spawnBubbleRef.current(), 400);
    const iv = setInterval(() => spawnBubbleRef.current(), 500);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, []);

  const popBubble = (id) => {
    const g = gameRef.current;
    const b = g.bubbles.find((x) => x.id === id);
    if (!b || b.popped) return;
    b.popped = true;
    if (b.anim) b.anim.stop();
    Animated.timing(b.pop, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start();
    setTimeout(() => {
      const j = g.bubbles.findIndex((x) => x.id === id);
      if (j >= 0) {
        g.bubbles.splice(j, 1);
        forceRender();
      }
      setScore((s) => {
        const n = s + 1;
        scoreRef.current = n;
        return n;
      });
    }, 190);
  };

  const handleKey = (raw) => {
    const g = gameRef.current;
    if (!g.running) return;
    if (!raw || raw.length !== 1) return;

    // 'a-z' mode me case ka farq nahi; baaki me case-sensitive
    const k = mode === 'lower' ? raw.toLowerCase() : raw;
    if (!pool.includes(k)) return;

    const candidates = g.bubbles.filter((b) => !b.popped && b.ch === k);
    if (!candidates.length) {
      setMistakes((m) => m + 1);
      return;
    }
    // Sabse upar wali (khatre me wali) bubble pop karo
    const target = candidates.reduce((a, b) =>
      currentYOf(a) <= currentYOf(b) ? a : b
    );
    popBubble(target.id);
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
      if (/^[a-zA-Z0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyRef.current(e.key);
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

  // Native focus guard
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const guard = setInterval(() => {
      if (!gameOver && inputRef.current && !inputRef.current.isFocused()) {
        inputRef.current.focus();
      }
    }, 1200);
    return () => clearInterval(guard);
  }, [gameOver]);

  const restart = () => {
    const g = gameRef.current;
    g.bubbles.forEach((b) => {
      if (b.anim) b.anim.stop();
    });
    g.bubbles = [];
    g.running = true;
    scoreRef.current = 0;
    spawnAtRef.current = 0;
    setScore(0);
    setMistakes(0);
    setMisses(0);
    setStartTime(Date.now());
    setGameOver(false);
    forceRender();
    setTimeout(() => spawnBubbleRef.current(), 400);
  };

  const tier = tierFor(score);
  const accuracy =
    score + mistakes > 0 ? Math.round((score / (score + mistakes)) * 100) : 100;
  const elapsedMin = Math.max((Date.now() - startTime) / 60000, 0.01);
  const ppm = Math.round(score / elapsedMin);
  const livesLeft = Math.max(MAX_MISSES - misses, 0);
  const lifePct = Math.min((misses / MAX_MISSES) * 100, 100);
  const lifeColor =
    lifePct >= 80 ? COLORS.red : lifePct >= 40 ? COLORS.amber : accent;

  const onPlayLayout = (e) => {
    const { width, height } = e.nativeEvent.layout;
    if (width === 0 && height === 0) return;
    playAreaRef.current = { w: width, h: height };
    forceRender();
  };

  const g = gameRef.current;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        {gameOver ? (
          <View style={styles.resultContainer}>
            <Ionicons name="water" size={58} color={accent} />
            <Text style={[styles.resultTitle, { color: accent }]}>Game Over!</Text>
            <Text style={styles.resultSub}>10 bubbles nikal gayi - dobara try karo</Text>

            <View style={styles.resultCard}>
              <View style={styles.resultRow}>
                <Ionicons name="happy-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Popped</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{score}</Text>
              </View>
              <View style={styles.resultRow}>
                <Ionicons name="speedometer-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Accuracy</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{accuracy}%</Text>
              </View>
              <View style={styles.resultRow}>
                <Ionicons name="flash-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Speed</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{ppm} / min</Text>
              </View>
              <View style={styles.resultRow}>
                <Ionicons name="close-circle-outline" size={20} color={accent} />
                <Text style={styles.resultRowLabel}>Missed</Text>
                <Text style={[styles.resultRowValue, { color: accent }]}>{misses}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.restartBtn, { borderColor: accent }]}
              onPress={restart}
              activeOpacity={0.85}
            >
              <Ionicons name="refresh" size={16} color={accent} />
              <Text style={[styles.restartBtnText, { color: accent }]}>Play Again</Text>
            </TouchableOpacity>
            {onBack && (
              <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.85}>
                <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
                <Text style={styles.backBtnText}>Home</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
              {onBack && (
                <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
                  <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
                </TouchableOpacity>
              )}
              <Text style={[styles.headerTitle, { color: accent }]} numberOfLines={1}>
                Bubbles
              </Text>
              <View style={styles.headerSpacer} />
              <View style={[styles.modePill, { borderColor: accent + '66' }]}>
                <Text style={[styles.modePillText, { color: accent }]} numberOfLines={1}>
                  {(MODE_INFO[mode] || MODE_INFO.lower).label}
                </Text>
              </View>
            </View>

            {/* Stats */}
            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <Ionicons name="happy-outline" size={14} color={accent} />
                <Text style={styles.infoChipText}>{score} popped</Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="flash-outline" size={14} color={accent} />
                <Text style={styles.infoChipText}>{speedLabelFor(tier)}</Text>
              </View>
              <View style={styles.infoChip}>
                <Ionicons name="heart-outline" size={14} color={lifeColor} />
                <Text style={styles.infoChipText}>{livesLeft} left</Text>
              </View>
            </View>

            {/* Lives bar */}
            <View style={styles.lifeBarTrack}>
              <View
                style={[
                  styles.lifeBarFill,
                  { width: `${lifePct}%`, backgroundColor: lifeColor },
                ]}
              />
            </View>

            {/* Play area */}
            <View style={styles.playArea} onLayout={onPlayLayout}>
              {g.bubbles.map((b) => (
                <Animated.View
                  key={b.id}
                  style={[
                    styles.bubble,
                    {
                      left: b.x,
                      top: b.fallStart,
                      borderColor: accent,
                      backgroundColor: accent + '18',
                      opacity: b.pop,
                      transform: [
                        { translateY: b.y },
                        { scale: b.pop },
                      ],
                    },
                  ]}
                >
                  <Text style={[styles.bubbleText, { color: accent }]}>{b.ch}</Text>
                </Animated.View>
              ))}

              {g.bubbles.length === 0 && (
                <View style={styles.playHintWrap} pointerEvents="none">
                  <Ionicons name="water-outline" size={30} color={COLORS.textDim} />
                  <Text style={styles.playHintText}>Type the letters on the bubbles</Text>
                </View>
              )}
            </View>

            {/* Feedback */}
            <View style={styles.feedbackArea}>
              <Text style={styles.hintText}>
                {mode === 'lower'
                  ? 'Lowercase letters (a-z)'
                  : mode === 'mixed'
                  ? 'Lowercase + Uppercase (case matters)'
                  : 'Letters + Numbers (case matters)'}
              </Text>
            </View>

            {/* Native hidden input */}
            {Platform.OS !== 'web' && (
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                defaultValue=""
                onChangeText={handleChange}
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
  container: { flex: 1, padding: scaleSize(16), width: '100%' },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(10),
  },
  backIconBtn: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: scaleSize(17),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(10),
  },
  headerTitle: {
    fontFamily: 'Calibri', fontWeight: '700',
    fontSize: scaleFont(18),
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerSpacer: { flex: 1 },
  modePill: {
    borderWidth: 1,
    borderRadius: scaleSize(10),
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(5),
    backgroundColor: 'rgba(255,255,255,0.06)',
    maxWidth: scaleSize(150),
  },
  modePillText: {
    fontFamily: 'Calibri', fontWeight: '700',
    fontSize: scaleFont(12),
    letterSpacing: 0.5,
  },

  infoRow: {
    flexDirection: 'row',
    gap: scaleSize(8),
    marginBottom: scaleSize(8),
  },
  infoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(12),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(6),
  },
  infoChipText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
  },

  lifeBarTrack: {
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: 'rgba(255,255,255,0.08)',
    overflow: 'hidden',
    marginBottom: scaleSize(10),
  },
  lifeBarFill: {
    height: '100%',
    borderRadius: scaleSize(4),
  },

  playArea: {
    flex: 1,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  bubble: {
    position: 'absolute',
    width: CHIP,
    height: CHIP,
    borderRadius: CHIP / 2,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleText: {
    fontFamily: 'Calibri', fontWeight: '700',
    fontSize: scaleFont(22),
  },
  playHintWrap: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
  },
  playHintText: {
    color: COLORS.textDim,
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
  },

  feedbackArea: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
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
    fontSize: scaleFont(26),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(12),
  },
  resultSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(4),
    marginBottom: scaleSize(20),
    textAlign: 'center',
  },
  resultCard: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(16),
    padding: scaleSize(16),
    marginBottom: scaleSize(24),
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(8),
  },
  resultRowLabel: {
    color: COLORS.textWhite,
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700',
    flex: 1,
    marginLeft: scaleSize(10),
  },
  resultRowValue: {
    fontSize: scaleFont(20),
    fontFamily: 'Calibri', fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    backgroundColor: 'transparent',
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(36),
    borderWidth: 1,
  },
  restartBtnText: {
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(8),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(24),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(36),
    marginTop: scaleSize(12),
  },
  backBtnText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700',
  },
});
