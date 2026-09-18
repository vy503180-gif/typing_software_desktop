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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const SCREEN_W = SCREEN.width;

// Home row / keyboard के बीच वाले letters
const HOME_ROW_LETTERS = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';'];
// Niche वाली row (bottom row)
const BOTTOM_ROW_LETTERS = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/'];

// Duplicate letters हटाओ (user ने repeat लिखा हो तो)
const clearDuplicates = (arr) => arr.filter((v, i) => arr.indexOf(v) === i);

// Seed-based pseudo random (har restart पर नया order आए)
const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Letters के random groups बनाओ - har group में size अलग letters, count जितने groups
const buildGroups = (letters, size, count) => {
  const groups = [];
  let guard = 0;
  while (groups.length < count && guard < count * 30) {
    const shuffled = shuffle([...letters]);
    const group = shuffled.slice(0, size).join('');
    if (!groups.includes(group)) {
      groups.push(group);
    }
    guard++;
  }
  return groups;
};

// Total progress (0-100) - single + 10×(2,3,4 letter groups)
const computeProgress = (phase, index, singlesLen, groups2Len, groups3Len, groups4Len) => {
  const total = singlesLen + groups2Len + groups3Len + groups4Len;
  let done = 0;
  if (phase === 'single') {
    done = index;
  } else if (phase === '2') {
    done = singlesLen + index;
  } else if (phase === '3') {
    done = singlesLen + groups2Len + index;
  } else if (phase === '4') {
    done = singlesLen + groups2Len + groups3Len + index;
  }
  return Math.round((done / total) * 100);
};

export default function ReviewDrillScreen({ onBack, keyOption = 'Difficult Keys' }) {
  const isStudied = keyOption === 'Studied Keys';
  // Studied Keys → सीधे 30 bar के 4-letter groups, अन्य → single→2→3→4 (10-10)
  const directMode = isStudied;
  // Studied Keys → पूरा alphabet (a-z) + full stop (.) + comma (,)
  const FULL_ALPHABET = [...'abcdefghijklmnopqrstuvwxyz'.split(''), '.', ','];
  const sequence = isStudied
    ? clearDuplicates(FULL_ALPHABET)
    : HOME_ROW_LETTERS;

  // directMode → सीधे 4-letter groups, कम से कम 30 bar (user के letters हो तो उन्हीं से)
  // अन्य → single के बाद 2, फिर 3, फिर 4 letter groups (10-10)
  const [groups2, setGroups2] = useState(() => buildGroups(sequence, 2, 10));
  const [groups3, setGroups3] = useState(() => buildGroups(sequence, 3, 10));
  const [groups4, setGroups4] = useState(
    () => (directMode ? buildGroups(sequence, 4, 30) : buildGroups(sequence, 4, 10))
  );

  const [phase, setPhase] = useState(directMode ? '4' : 'single'); // 'single' | '2' | '3' | '4'
  const [index, setIndex] = useState(0);
  const [input, setInput] = useState('');
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'
  const [wrongMarks, setWrongMarks] = useState([]); // उन positions के indexes जहाँ गलत press हुआ
  const [isFinished, setIsFinished] = useState(false);
  const inputRef = useRef(null);

  const currentPhaseList =
    phase === 'single' ? sequence : phase === '2' ? groups2 : phase === '3' ? groups3 : groups4;
  const current = currentPhaseList[index];
  const phaseLabel = phase === 'single' ? 'Single' : `${phase}-letter`;

  useEffect(() => {
    const t = setTimeout(() => {
      if (inputRef.current) inputRef.current.focus();
    }, 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {});
    return () => Keyboard.removeAllListeners('keyboardDidShow');
  }, []);

  const handleChange = (text) => {
    if (phase === 'single') {
      // Single letter - आखिरी typed char ही मायने रखता है
      const next = text.slice(-1).toLowerCase();
      setInput(next);
      if (next === '') return;

      if (next === current) {
        setScore((s) => s + 1);
        setFeedback('correct');
        setTimeout(() => {
          setFeedback(null);
          advance();
        }, 220);
      } else {
        setMistakes((m) => m + 1);
        setFeedback('wrong');
        setTimeout(() => {
          setFeedback(null);
          setInput('');
        }, 260);
      }
    } else {
      // Group - letters एक-एक करके type करने हैं (जितने chars पहले सही, उतने आगे)
      const t = text.slice(-1).toLowerCase();
      if (t === '') return;

      const expected = current[input.length];
      if (t === expected) {
        if (input.length === current.length - 1) {
          // सभी letters सही - group complete
          setInput(text);
          setScore((s) => s + 1);
          setFeedback('correct');
          setTimeout(() => {
            setFeedback(null);
            advance();
          }, 240);
        } else {
          // अगला letter चाहिए
          setInput(text);
          setFeedback(null);
        }
      } else {
        // गलत letter - red दिखाओ (mistake count नहीं), position को mark कर दो
                const pos = input.length;
        if (!wrongMarks.includes(pos)) {
          setWrongMarks([...wrongMarks, pos]);
        }
        setFeedback('wrong');
        setTimeout(() => {
          setFeedback(null);
        }, 300);
      }
    }
  };

  const advance = () => {
    setFeedback(null);
        setWrongMarks([]);
    if (phase === 'single') {
      if (index + 1 < sequence.length) {
        setIndex(index + 1);
        setInput('');
      } else {
        // Singles done → 2-letter groups
        setPhase('2');
        setIndex(0);
        setInput('');
      }
    } else if (phase === '2') {
      if (index + 1 < groups2.length) {
        setIndex(index + 1);
        setInput('');
      } else {
        // 2-letter done → 3-letter groups
        setPhase('3');
        setIndex(0);
        setInput('');
      }
    } else if (phase === '3') {
      if (index + 1 < groups3.length) {
        setIndex(index + 1);
        setInput('');
      } else {
        // 3-letter done → 4-letter groups
        setPhase('4');
        setIndex(0);
        setInput('');
      }
    } else {
      if (index + 1 < groups4.length) {
        setIndex(index + 1);
        setInput('');
      } else {
        setIsFinished(true);
      }
    }
  };

  const restart = () => {
    setPhase(directMode ? '4' : 'single');
    setIndex(0);
    setInput('');
    setScore(0);
    setMistakes(0);
    setFeedback(null);
    setWrongMarks([]);
    setIsFinished(false);
    setGroups2(buildGroups(sequence, 2, 10));
    setGroups3(buildGroups(sequence, 3, 10));
    setGroups4(directMode ? buildGroups(sequence, 4, 30) : buildGroups(sequence, 4, 10));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Keyboard Drill</Text>
          </View>

          {isFinished ? (
            <View style={styles.doneCard}>
              <Ionicons name="trophy" size={52} color={COLORS.teal} />
              <Text style={styles.doneTitle}>🎉 Congratulations!</Text>
              <Text style={styles.doneSub}>You have completed the entire drill.</Text>
              <View style={styles.doneRow}>
                <View style={styles.doneStat}>
                  <Text style={styles.doneVal}>{score}</Text>
                  <Text style={styles.doneLabel}>Correct</Text>
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
              {/* Progress */}
              <View style={styles.progressRow}>
                <Text style={styles.progressText}>
                  {phase === 'single'
                    ? `Single • ${index + 1}/${sequence.length}`
                    : `${phaseLabel} • ${index + 1}/${currentPhaseList.length}`}
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${computeProgress(
                          phase,
                          index,
                          directMode ? 0 : sequence.length,
                          directMode ? 0 : groups2.length,
                          directMode ? 0 : groups3.length,
                          groups4.length,
                        )}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Big letter / group */}
              <View style={styles.letterCard}>
                {phase === 'single' ? (
                  <Text
                    style={[
                      styles.bigLetter,
                      feedback === 'correct' && styles.bigLetterCorrect,
                      feedback === 'wrong' && styles.bigLetterWrong,
                    ]}
                  >
                    {current}
                  </Text>
                ) : (
                  <View style={styles.groupCells}>
                    {current.split('').map((ch, ci) => {
                      const isTyped = ci < input.length;
                      const isCurrent = ci === input.length;
                      const isWrongMarked = wrongMarks.includes(ci);
                      let cellStyle = styles.groupCell;
                      let cellTextStyle = styles.groupCellText;
                      if (isWrongMarked) {
                        cellStyle = [styles.groupCell, styles.groupCellWrong];
                        cellTextStyle = [styles.groupCellText, styles.groupCellTextWrong];
                      } else if (isTyped) {
                        cellStyle = [styles.groupCell, styles.groupCellTyped];
                        cellTextStyle = [styles.groupCellText, styles.groupCellTextTyped];
                      }
                      return (
                        <View key={ci} style={styles.groupCol}>
                          <View style={cellStyle}>
                            <Text style={cellTextStyle}>{ch}</Text>
                          </View>
                          <View
                            style={[
                              styles.groupUnderline,
                              isCurrent && styles.groupUnderlineActive,
                              isTyped && styles.groupUnderlineDone,
                            ]}
                          />
                        </View>
                      );
                    })}
                  </View>
                )}
                <Text style={styles.letterHint}>
                  {phase === 'single' ? 'Type this key' : `Type the ${phaseLabel} - one letter at a time`}
                </Text>
              </View>

              {/* Hidden input to capture keyboard */}
              <TextInput
                ref={inputRef}
                style={styles.hiddenInput}
                value={input}
                onChangeText={handleChange}
                autoCapitalize="none"
                autoCorrect={false}
                autoFocus
              />

              {/* Small keyboard hint */}
              <View style={styles.keyboardHint}>
                <Text style={styles.keyboardHintText}>
                  {phase === 'single'
                    ? 'Use your keyboard and type the letter shown above.'
                    : `Type all ${phase} letters of the ${phaseLabel} group, one by one.`}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scaleSize(20),
  },
  backBtn: {
    width: scaleSize(30),
    height: scaleSize(30),
    borderRadius: scaleSize(15),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginRight: 8,
  },
  headerTitle: { fontFamily: 'Calibri', fontSize: scaleFont(18),
    color: COLORS.textWhite,
    flex: 1,
  },

  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  progressText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700',
    width: 56,
  },
  progressTrack: {
    flex: 1,
    height: 8,
    borderRadius: scaleSize(4),
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
  progressFill: {
    height: scaleSize(8),
    borderRadius: scaleSize(4),
    backgroundColor: COLORS.teal,
  },

  letterCard: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    paddingVertical: scaleSize(40),
    marginBottom: scaleSize(16),
  },
  bigLetter: {
    fontSize: scaleFont(120),
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    textTransform: 'lowercase',
    lineHeight: scaleSize(150),
  },
  bigLetterCorrect: { fontFamily: 'Calibri', color: COLORS.teal,
  },
  bigLetterWrong: { fontFamily: 'Calibri', color: COLORS.teal,
  },

  groupCells: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: scaleSize(10),
    marginBottom: scaleSize(14),
    flexWrap: 'wrap',
  },
  groupCol: {
    alignItems: 'center',
    flexShrink: 1,
  },
  groupUnderline: {
    height: 4,
    width: scaleSize(64),
    borderRadius: scaleSize(2),
    marginTop: scaleSize(8),
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  groupUnderlineActive: {
    backgroundColor: '#E2E8F0',
    height: 5,
  },
  groupUnderlineDone: {
    backgroundColor: 'rgba(255,255,255,0.35)',
  },
  groupCell: {
    width: scaleSize(64),
    height: scaleSize(88),
    borderRadius: scaleSize(14),
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCellTyped: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(20,184,166,0.25)',
  },
  groupCellWrong: {
    borderColor: COLORS.teal,
    backgroundColor: 'rgba(244,63,94,0.25)',
  },
  groupCellText: {
    fontSize: scaleFont(42),
    fontFamily: 'Calibri', fontWeight: '700',
    color: 'rgba(255,255,255,0.55)',
    textTransform: 'lowercase',
  },
  groupCellTextTyped: { fontFamily: 'Calibri', color: COLORS.teal,
  },
  groupCellTextWrong: { fontFamily: 'Calibri', color: COLORS.teal,
  },
  letterHint: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  keyboardHint: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  keyboardHintText: { fontFamily: 'Calibri', color: 'rgba(255,255,255,0.6)',
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
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(10),
  },
  doneSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700',
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
    fontFamily: 'Calibri', fontWeight: '700'
  },
  doneLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: scaleFont(11),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: 2,
  },
  restartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(20),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(24),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  restartBtnText: {
    color: COLORS.teal,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  backToReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(8),
    backgroundColor: COLORS.green,
    borderRadius: scaleSize(20),
    paddingVertical: scaleSize(10),
    paddingHorizontal: scaleSize(24),
    marginTop: scaleSize(8),
  },
  backToReviewText: {
    color: COLORS.textWhite,
    fontSize: scaleFont(14),
    fontFamily: 'Calibri', fontWeight: '700'
  },
});