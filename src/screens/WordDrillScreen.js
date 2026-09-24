import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Keyboard,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;
const WORD_LEN = 6;
const WORDS_PER_SET = 4;
const TOTAL_SECONDS = 240;
const TOTAL_ROUNDS = 30;

// Meaningful 6-letter English words (lessons के words जैसे)
const WORD_BANK = [
  'apple', 'water', 'school', 'friend', 'little', 'orange', 'yellow', 'purple',
  'garden', 'mother', 'father', 'brother', 'sister', 'family', 'animal', 'nature',
  'flower', 'forest', 'planet', 'summer', 'winter', 'spring', 'autumn', 'morning',
  'evening', 'window', 'bottle', 'pencil', 'banana', 'potato', 'tomato', 'silver',
  'golden', 'bright', 'strong', 'clever', 'gentle', 'kindly', 'happy', 'sadness',
  'wonder', 'dreams', 'travel', 'listen', 'speech', 'writer', 'reader', 'number',
  'letter', 'silent', 'simple', 'double', 'middle', 'guitar', 'camera', 'picture',
  'village', 'mountain', 'desert', 'street', 'bridge', 'castle', 'palace', 'kitchen',
  'dinner', 'coffee', 'sugar', 'butter', 'cheese', 'chicken', 'fruits', 'vegetable',
  'sports', 'cricket', 'hockey', 'soccer', 'tennis', 'runner', 'player', 'coach',
  'school', 'student', 'teacher', 'science', 'maths', 'physics', 'jungle', 'rabbit',
];

const randomWordFromBank = () => WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];

const buildSet = () => {
  const set = [];
  let guard = 0;
  while (set.length < WORDS_PER_SET && guard < 200) {
    const w = randomWordFromBank();
    if (!set.includes(w)) {
      set.push(w);
      continue;
    }
    guard++;
  }
  return set;
};

const fmt = (secs) => {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export default function WordDrillScreen({ onBack }) {
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const [isFinished, setIsFinished] = useState(false);
  const [correctChars, setCorrectChars] = useState(0);

  // Ek hi source-of-truth object - isse state/ref desync kabhi nahi hoga
  const gameRef = useRef({
    words: buildSet(),
    wordProg: Array.from({ length: WORDS_PER_SET }, () => ({ n: 0, wrong: [] })),
    wordIndex: 0,
    round: 1,
    roundComplete: false,
  });
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const feedbackTimerRef = useRef(null);

  const elSecs = TOTAL_SECONDS - timeLeft || 1;
  const liveWpm = Math.round(correctChars / 5 / (elSecs / 60));
  const words = gameRef.current.words;
  const wordIndex = gameRef.current.wordIndex;
  const wordProg = gameRef.current.wordProg;
  const round = gameRef.current.round;
  const roundComplete = gameRef.current.roundComplete;

  useEffect(() => {
    if (Platform.OS === 'web') return;
    const t = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  // 4 minute countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setIsFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Focus safety net - sirf native par (web par document keydown hi kaafi hai)
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const focusGuard = setInterval(() => {
      if (!isFinished && inputRef.current) {
        const doc = typeof document !== 'undefined' ? document : null;
        if (doc && doc.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
      }
    }, 1500);
    return () => clearInterval(focusGuard);
  }, [isFinished]);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {});
    return () => {
      Keyboard.removeAllListeners('keyboardDidShow');
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
    };
  }, []);

  const finishFocus = () => {
    if (Platform.OS !== 'web') {
      setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
    }
  };

  const advanceWord = () => {
    const idx = gameRef.current.wordIndex;
    if (idx + 1 < WORDS_PER_SET) {
      gameRef.current.wordIndex = idx + 1;
      forceRender();
      finishFocus();
    } else {
      // 4 words done → round complete. Ab user Next Round dabayega/Enter.
      if (gameRef.current.round >= TOTAL_ROUNDS) {
        // 30th round complete → drill finish
        setIsFinished(true);
        return;
      }
      gameRef.current.roundComplete = true;
      forceRender();
    }
  };

  const startNextRound = () => {
    if (!gameRef.current.roundComplete) return;
    gameRef.current.words = buildSet();
    gameRef.current.wordIndex = 0;
    gameRef.current.wordProg = Array.from(
      { length: WORDS_PER_SET },
      () => ({ n: 0, wrong: [] })
    );
    gameRef.current.round += 1;
    gameRef.current.roundComplete = false;
    forceRender();
    finishFocus();
  };

  const handleKey = (raw) => {
    const t = raw.toLowerCase();
    if (t === '' || t.length !== 1) return;

    // Round complete par letters ignore - sirf Next button/Enter kaam kare
    if (gameRef.current.roundComplete) return;

    let g = gameRef.current;
    let idx = g.wordIndex;
    let prog = g.wordProg[idx];

    // अगर पिछला word complete हो चुका है तो इसी keystroke को अगले word पर लगाओ
    if (prog.n >= WORD_LEN) {
      advanceWord();
      g = gameRef.current;
      idx = g.wordIndex;
      prog = g.wordProg[idx];
      if (prog.n >= WORD_LEN) return;
    }

    const expected = g.words[idx][prog.n];

    if (t === expected) {
      const newLen = prog.n + 1;
      prog.n = newLen;
      forceRender();

      if (newLen === WORD_LEN) {
        // Word complete - turant aage badho (no delay)
        setScore((s) => s + 1);
        setCorrectChars((c) => c + WORD_LEN);
        setFeedback('correct');
        advanceWord();
        if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = setTimeout(() => setFeedback(null), 280);
      }
    } else {
      const pos = prog.n;
      if (!prog.wrong.includes(pos)) {
        prog.wrong = [...prog.wrong, pos];
        forceRender();
      }
      setFeedback('wrong');
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = setTimeout(() => setFeedback(null), 300);
    }
  };

  const handleChange = (text) => {
    // Native input par Enter → Next Round
    if (text === '\n' && gameRef.current.roundComplete) {
      startNextRound();
      return;
    }
    handleKey(text.slice(-1));
  };
  const handleChangeRef = useRef(handleKey);
  handleChangeRef.current = handleKey;
  const startNextRoundRef = useRef(startNextRound);
  startNextRoundRef.current = startNextRound;

  // Web par global keydown - kabhi focus na chhute to bhi typing capture ho
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (isFinished) return;
      // Round complete par Enter → Next Round chalu
      if (e.key === 'Enter' && gameRef.current.roundComplete) {
        e.preventDefault();
        startNextRoundRef.current();
        return;
      }
      // Key ko hold/auto-repeat karke is word ko aage jump mat hone do
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      // Sirf ek letter press karein (a-z, A-Z) - space/enter/arrow nahi
      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleChangeRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isFinished]);

  const restart = () => {
    gameRef.current = {
      words: buildSet(),
      wordProg: Array.from({ length: WORDS_PER_SET }, () => ({ n: 0, wrong: [] })),
      wordIndex: 0,
      round: 1,
    };
    setScore(0);
    setMistakes(0);
    setFeedback(null);
    setTimeLeft(TOTAL_SECONDS);
    setCorrectChars(0);
    setIsFinished(false);
    forceRender();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Word Drill</Text>
            <View style={styles.timerChip}>
              <Ionicons name="time-outline" size={14} color={COLORS.textWhite} />
              <Text style={styles.timerText}>{fmt(timeLeft)}</Text>
            </View>
          </View>

          {isFinished ? (
            <View style={styles.doneCard}>
              <Ionicons name="trophy" size={52} color={COLORS.teal} />
              <Text style={styles.doneTitle}>🎉 Time&apos;s Up!</Text>
              <Text style={styles.doneSub}>You have completed the Word Drill.</Text>
              <View style={styles.doneRow}>
                <View style={styles.doneStat}>
                  <Text style={styles.doneVal}>{score}</Text>
                  <Text style={styles.doneLabel}>Words</Text>
                </View>
                <View style={styles.doneStat}>
                  <Text style={styles.doneVal}>{liveWpm}</Text>
                  <Text style={styles.doneLabel}>Speed (WPM)</Text>
                </View>
                <View style={styles.doneStat}>
                  <Text style={[styles.doneVal, { color: COLORS.teal }]}>{mistakes}</Text>
                  <Text style={styles.doneLabel}>Mistakes</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.restartBtn} onPress={restart} activeOpacity={0.85}>
                <Ionicons name="refresh" size={16} color={COLORS.teal} />
                <Text style={styles.restartBtnText}>Drill Again</Text>
              </TouchableOpacity>
              {onBack && (
                <TouchableOpacity style={styles.backToReviewBtn} onPress={onBack} activeOpacity={0.85}>
                  <Ionicons name="arrow-back" size={16} color={COLORS.textWhite} />
                  <Text style={styles.backToReviewText}>Back to Review</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              {/* Stats row */}
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                  Round {round}/{TOTAL_ROUNDS} • Word {wordIndex + 1}/{WORDS_PER_SET}
                </Text>
                <Text style={styles.statsText}>Speed: {liveWpm} WPM</Text>
              </View>

              {/* Word list - plain words, no boxes (jaise lesson mein) */}
              <View style={styles.wordList}>
                {words.map((w, wi) => {
                  const isActive = wi === wordIndex;
                  const isDone = wi < wordIndex;
                  const prog = wordProg[wi];
                  const typedCount = isDone ? WORD_LEN : prog.n;
                  const wrongList = prog.wrong;
                  return (
                    <View
                      key={`r${round}-w${wi}-${w}`}
                      style={[
                        styles.wordRowWrap,
                        isActive && styles.wordRowActive,
                        isDone && styles.wordRowDone,
                      ]}
                    >
                      {w.split('').map((ch, ci) => {
                        const typed = ci < typedCount;
                        const wrong = wrongList.includes(ci);
                        // Line current letter पर ही दिखे - wrong होने पर भी वहीं रहे
                        const isCurrent = isActive && !typed && ci === typedCount;
                        return (
                          <View key={ci} style={styles.letterCol}>
                            <Text
                              style={[
                                styles.plainLetter,
                                // wrong letter पहले दिखाना है, फिर typed
                                wrong && styles.plainLetterWrong,
                                typed && !wrong && styles.plainLetterTyped,
                              ]}
                            >
                              {ch}
                            </Text>
                            {isCurrent && <View style={styles.currentLine} />}
                          </View>
                        );
                      })}
                    </View>
                  );
                })}
              </View>

              {/* Round complete hone par Next Round card */}
              {roundComplete && (
                <View style={styles.nextRoundCard}>
                  <Ionicons name="checkmark-circle" size={40} color={COLORS.teal} />
                  <Text style={styles.nextRoundTitle}>Round {round} Complete!</Text>
                  <Text style={styles.nextRoundSub}>
                    {round}/{TOTAL_ROUNDS} rounds done • {score} words typed
                  </Text>
                  <TouchableOpacity
                    style={styles.nextRoundBtn}
                    onPress={startNextRound}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="play" size={16} color={COLORS.teal} />
                    <Text style={styles.nextRoundBtnText}>
                      {round >= TOTAL_ROUNDS ? 'Finish Drill' : 'Next Round'}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.nextRoundHint}>or press Enter</Text>
                </View>
              )}

              {/* Hidden input - sirf NATIVE (App) ke liye. Web par sirf document keydown chalega */}
              {Platform.OS !== 'web' && (
                <TextInput
                  ref={inputRef}
                  style={styles.hiddenInput}
                  defaultValue=""
                  onChangeText={handleChange}
                  onSubmitEditing={() => {
                    if (gameRef.current.roundComplete) startNextRound();
                  }}
                  returnKeyType="go"
                  blurOnSubmit={false}
                  editable
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoFocus
                  caretHidden
                  spellCheck={false}
                />
              )}

              {/* Bottom hint */}
              <View style={styles.keyboardHint}>
                <Text style={styles.keyboardHintText}>
                  {roundComplete
                    ? 'Press Enter or click Next Round to continue.'
                    : 'Type the highlighted word - one letter at a time.'}
                </Text>
              </View>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flex: 1, padding: scaleSize(20) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(8),
  },
  backBtn: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(18),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: scaleSize(12),
  },
  headerTitle: {
    flex: 1,
    color: COLORS.textWhite,
    fontSize: scaleFont(18),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
  timerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5),
    paddingHorizontal: scaleSize(12),
  },
  timerText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleSize(14),
    paddingHorizontal: scaleSize(4),
  },
  statsText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: scaleFont(13),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },

  wordList: {
    gap: scaleSize(8),
  },
  wordRowWrap: {
    flexDirection: 'row',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: scaleSize(12),
    paddingVertical: scaleSize(12),
    paddingHorizontal: scaleSize(10),
  },
  wordRowActive: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(20,184,166,0.12)',
  },
  wordRowDone: {
    borderColor: 'rgba(20,184,166,0.4)',
    backgroundColor: 'rgba(20,184,166,0.06)',
  },

  plainLetter: {
    fontSize: scaleFont(30),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'lowercase',
  },
  plainLetterTyped: { fontFamily: 'Poppins_400Regular', color: COLORS.teal,
  },
  plainLetterWrong: { fontFamily: 'Poppins_400Regular', color: COLORS.rose,
  },

  letterCol: {
    alignItems: 'center',
  },
  currentLine: {
    height: scaleSize(4),
    width: '115%',
    borderRadius: scaleSize(2),
    marginTop: scaleSize(2),
    backgroundColor: '#E2E8F0',
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  nextRoundCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: scaleSize(24),
    marginTop: scaleSize(16),
  },
  nextRoundTitle: {
    color: COLORS.textWhite,
    fontSize: scaleFont(20),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(8),
  },
  nextRoundSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(13),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(4),
  },
  nextRoundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(28),
    marginTop: 16,
  },
  nextRoundBtnText: {
    color: COLORS.teal,
    fontSize: scaleFont(15),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
  nextRoundHint: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: scaleFont(11),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(8),
  },

  keyboardHint: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  keyboardHintText: { fontFamily: 'Poppins_400Regular', color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(12),
    textAlign: 'center',
  },

  doneCard: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: scaleSize(28),
    marginTop: scaleSize(40),
  },
  doneTitle: {
    color: COLORS.textWhite,
    fontSize: scaleFont(22),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(10),
  },
  doneSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(13),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: scaleSize(4),
    textAlign: 'center',
  },
  doneRow: {
    flexDirection: 'row',
    gap: scaleSize(8),
    marginTop: scaleSize(16),
    marginBottom: scaleSize(20),
  },
  doneStat: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(10),
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(10),
  },
  doneVal: {
    color: COLORS.textWhite,
    fontSize: scaleFont(22),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
  doneLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(11),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginTop: 2,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(20),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(24),
  },
  restartBtnText: {
    color: COLORS.teal,
    fontSize: scaleFont(14),
    fontFamily: 'Poppins_700Bold', fontWeight: '700'
  },
  backToReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(20),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(24),
    marginTop: scaleSize(8),
  },
  backToReviewText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
  },
});