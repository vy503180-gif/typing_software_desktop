// src/screens/TypingScreen.js
// यह मुख्य typing test screen है।
// Features: character highlighting (correct green / wrong red), animated cursor,
// timer, live WPM, live accuracy, mistakes count, progress bar, pause/restart buttons।

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
} from 'react-native';
import { LESSON_TEXTS, LESSON_DIFFICULTY } from '../data/lessons';

// Default (एक random sample) - जब कोई specific lesson न चुना गया हो
const SAMPLE_TEXTS = [
  'The quick brown fox jumps over the lazy dog near the river bank.',
  'Practice makes a person perfect in every single way of life.',
  'A journey of thousand miles begins with a single small step.',
  'Mobile typing is a useful skill for the modern digital world.',
];

export default function TypingScreen({ lesson = null, onComplete = null }) {
  // अगर कोई lesson चुना है तो उसका text, वरना किसी random sample से शुरू करो
  const lessonText = lesson ? LESSON_TEXTS[lesson.lang]?.[lesson.id] || null : null;

  const [currentText, setCurrentText] = useState(
    lessonText || SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]
  );
  const [userInput, setUserInput] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [result, setResult] = useState({ wpm: 0, accuracy: 0 });

  const timerRef = useRef(null);
  const inputRef = useRef(null);

  // Cursor blink animation
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(cursorOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [cursorOpacity]);

  // Timer - चलता है सिर्फ शुरू होने के बाद और pause न होने पर
  useEffect(() => {
    if (isStarted && !isPaused && !isFinished) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isStarted, isPaused, isFinished]);

  // जब user output target text से match हो जाए तो test खत्म करो
  useEffect(() => {
    if (isStarted && !isPaused && userInput.length === currentText.length) {
      finishTest();
    }
  }, [userInput, isPaused]);

  // Restart एक नया test देता है।
  // अगर कोई lesson चुना है तो उसी lesson का text फिर से, वरना random sample।
  const startNewTest = () => {
    if (lessonText) {
      setCurrentText(lessonText);
    } else {
      const randomIndex = Math.floor(Math.random() * SAMPLE_TEXTS.length);
      setCurrentText(SAMPLE_TEXTS[randomIndex]);
    }
    setUserInput('');
    setSeconds(0);
    setIsStarted(true);
    setIsPaused(false);
    setIsFinished(false);
    setResult({ wpm: 0, accuracy: 0 });
  };

  const finishTest = () => {
    setIsFinished(true);
    clearInterval(timerRef.current);
    Keyboard.dismiss();

    const words = currentText.trim().split(/\s+/).length;
    const wpm = seconds > 0 ? Math.round((words / seconds) * 60) : 0;

    let correctChars = 0;
    for (let i = 0; i < currentText.length; i++) {
      if (userInput[i] === currentText[i]) correctChars++;
    }
    const accuracy = Math.round((correctChars / currentText.length) * 100);

    setResult({ wpm, accuracy });

    // Lesson complete -> अगला lesson unlock करने के लिए App को बताओ
    if (lesson && onComplete) {
      onComplete(lesson.lang, lesson.id);
    }
  };

  // लगातार (live) stats - हर बार जब user टाइप करे update होते हैं
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
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Target text को character-by-character render करो
  const renderTargetText = () => {
    return currentText.split('').map((char, i) => {
      const typed = userInput[i];
      let color = '#4b5563';
      if (typed !== undefined) {
        color = typed === char ? '#4ADE80' : '#F87171';
      }
      return (
        <Text key={i} style={[styles.char, { color }]}>
          {char}
        </Text>
      );
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Antriksh Typing Master</Text>

        {lesson && (
          <Text style={styles.lessonTag}>
            Lesson: {lesson.title} • {LESSON_DIFFICULTY[lesson.id]}
          </Text>
        )}

        {/* Result दिखाने वाला box */}
        {isFinished ? (
          <View style={styles.resultBox}>
            <Text style={styles.resultTitle}>Test Complete!</Text>
            <View style={styles.resultRow}>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.wpm}</Text>
                <Text style={styles.resultLabel}>WPM</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{result.accuracy}%</Text>
                <Text style={styles.resultLabel}>Accuracy</Text>
              </View>
              <View style={styles.resultItem}>
                <Text style={styles.resultValue}>{stats.mistakes}</Text>
                <Text style={styles.resultLabel}>Mistakes</Text>
              </View>
            </View>
          </View>
        ) : null}

        {/* Timer और live stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Time</Text>
            <Text style={styles.statValue}>{seconds}s</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>WPM</Text>
            <Text style={styles.statValue}>{stats.wpm}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Accuracy</Text>
            <Text style={styles.statValue}>{stats.accuracy}%</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Mistakes</Text>
            <Text style={[styles.statValue, stats.mistakes > 0 && styles.statValueError]}>
              {stats.mistakes}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={styles.progressText}>
          {userInput.length}/{currentText.length} characters
        </Text>

        {/* Target text with live highlighting + cursor */}
        <TouchableOpacity style={styles.textBox} onPress={handleCharPress} activeOpacity={1}>
          <View style={styles.charRow}>
            {currentText.split('').map((char, i) => {
              const typed = userInput[i];
              let color = '#4b5563';
              const isFixated = i < userInput.length;
              if (isFixated) {
                color = typed === char ? '#4ADE80' : '#F87171';
              }
              const isCursorHere = i === userInput.length && !isFinished;
              return (
                <View key={i} style={styles.charWrap}>
                  <Text style={[styles.char, { color }]}>{char}</Text>
                  {isCursorHere ? (
                    <Animated.View style={[styles.cursor, { opacity: cursorOpacity }]} />
                  ) : null}
                </View>
              );
            })}
          </View>
        </TouchableOpacity>

        {/* जहाँ user टाइप करता है */}
        <TextInput
          ref={inputRef}
          style={styles.hiddenInput}
          value={userInput}
          onChangeText={setUserInput}
          autoCapitalize="none"
          autoCorrect={false}
          autoFocus
          editable={!isFinished && !isPaused}
          onFocus={() => {
            if (!isStarted) setIsStarted(true);
          }}
        />

        {/* Pause और Restart बटन */}
        <View style={styles.buttonsRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.pauseButton]}
            onPress={handlePause}
            disabled={isFinished}
          >
            <Text style={styles.actionButtonText}>
              {isPaused ? '▶ Resume' : '⏸ Pause'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, styles.restartButton]} onPress={startNewTest}>
            <Text style={styles.actionButtonText}>↻ Restart</Text>
          </TouchableOpacity>
        </View>

        {/* Restart के बाद दोबारा focus करने के लिए message */}
        {!isStarted && (
          <Text style={styles.instruction}>Tap on the text and start typing...</Text>
        )}
        {isPaused && !isFinished && (
          <Text style={styles.pausedText}>Paused - tap Resume to continue</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  container: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 120,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e94560',
    textAlign: 'center',
    marginBottom: 8,
  },
  lessonTag: {
    color: '#67E8F9',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  instruction: {
    color: '#a8b0c5',
    textAlign: 'center',
    marginTop: 12,
  },
  pausedText: {
    color: '#FBBF24',
    textAlign: 'center',
    marginTop: 12,
    fontWeight: '700',
  },

  // Result box
  resultBox: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 20,
    color: '#e94560',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  resultItem: {
    alignItems: 'center',
  },
  resultValue: {
    fontSize: 24,
    color: '#ffffff',
    fontWeight: '800',
  },
  resultLabel: {
    fontSize: 12,
    color: '#a8b0c5',
    marginTop: 4,
  },

  // Live stats grid
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#16213e',
    borderRadius: 10,
    paddingVertical: 12,
    marginHorizontal: 3,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#a8b0c5',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: '800',
    marginTop: 2,
  },
  statValueError: {
    color: '#F87171',
  },

  // Progress bar
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#16213e',
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  progressText: {
    color: '#a8b0c5',
    fontSize: 12,
    marginBottom: 16,
    textAlign: 'right',
  },

  // Target text
  textBox: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  charRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  charWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  char: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600',
  },
  cursor: {
    width: 2,
    height: 24,
    backgroundColor: '#e94560',
    borderRadius: 1,
    marginHorizontal: 1,
  },

  // Hidden input (वास्तविक keyboard input)
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },

  // Buttons
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButton: {
    backgroundColor: '#3b82f6',
  },
  restartButton: {
    backgroundColor: '#e94560',
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
