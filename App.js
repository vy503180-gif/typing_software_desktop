// App.js - app का main component
// यह bottom navigation (Home / Type / Stats) manage करता है
// और चुने गए tab के हिसाब से सही screen दिखाता है।

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from './src/screens/HomeScreen';
import LessonsScreen from './src/screens/LessonsScreen';
import TypingScreen from './src/screens/TypingScreen';
import NameEntryScreen from './src/screens/NameEntryScreen';
import BottomNav from './src/components/BottomNav';
import { LESSON_ORDER } from './src/data/lessons';

// Saved data के storage keys
const STORAGE_KEYS = {
  name: 'antriksh_student_name',
  unlocked: 'antriksh_unlocked_lessons',
};

// Default locked state - पहले 2 lessons हर language में unlocked हैं
const DEFAULT_UNLOCKED = { english: [1, 2], hindi: [1, 2] };

// Stats screen (अभी placeholder) -
// बाद में यहाँ real typing statistics दिखाई जाएँगी
function StatsScreen() {
  return (
    <LinearGradient
      colors={['#1D4ED8', '#6D28D9', '#7C3AED']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsScreen}
    >
      <Ionicons name="stats-chart" size={56} color="#A78BFA" />
      <Text style={styles.statsTitle}>Statistics</Text>
      <Text style={styles.statsText}>Your typing stats will appear here soon!</Text>
    </LinearGradient>
  );
}

export default function App() {
  // Abhi kaun sa tab open है
  const [activeTab, setActiveTab] = useState('Home');

  // Student का name - NameEntryScreen पर भरा जाता है
  const [studentName, setStudentName] = useState('');

  // हर language में unlocked lessons (जो खोल दिए गए हैं)।
  // Default में english/hindi के पहले 2 lessons unlocked हैं,
  // बाकी locked रहते हैं और lesson complete करने पर खुलते हैं।
  const [unlockedLessons, setUnlockedLessons] = useState(DEFAULT_UNLOCKED);

  // अब तक data load हुआ या नहीं (जब तक नहीं होता splash जैसा धीमा render होता है)
  const [isLoaded, setIsLoaded] = useState(false);

  // जो lesson अभी typing screen में open है (language + id + title)
  const [currentLesson, setCurrentLesson] = useState(null);

  // App start होने पर saved name और unlocked lessons लोड करो
  useEffect(() => {
    (async () => {
      try {
        const [savedName, savedUnlocked] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.name),
          AsyncStorage.getItem(STORAGE_KEYS.unlocked),
        ]);
        if (savedName) setStudentName(savedName);
        if (savedUnlocked) {
          try {
            setUnlockedLessons(JSON.parse(savedUnlocked));
          } catch {
            // corrupt data हो तो default रखो
          }
        }
      } catch (e) {
        // storage read fail हो तो default से चलाओ
      } finally {
        setIsLoaded(true);
      }
    })();
  }, []);

  // जब name भर जाए तो save करो, ताकि दोबारा न माँगे
  const handleSetName = (name) => {
    setStudentName(name);
    AsyncStorage.setItem(STORAGE_KEYS.name, name).catch(() => {});
  };

  // Lessons screen पर जाने के लिए helper
  const showLessons = () => setActiveTab('Lessons');

  // किसी lesson को open करो - उसका lang, id, title save करके typing पर जाओ
  const handleStartLesson = (lang, lessonId, title) => {
    setCurrentLesson({ lang, id: lessonId, title });
    setActiveTab('Type');
  };

  // Lesson complete होने पर अगला lesson उसी language में unlock करो
  const handleLessonComplete = (lang, lessonId) => {
    setUnlockedLessons((prev) => {
      const current = prev[lang] || [];
      const nextId = LESSON_ORDER[LESSON_ORDER.indexOf(lessonId) + 1];
      if (nextId === undefined || current.includes(nextId)) return prev;
      const next = { ...prev, [lang]: [...current, nextId] };
      // Unlock progress भी save करो
      AsyncStorage.setItem(STORAGE_KEYS.unlocked, JSON.stringify(next)).catch(() => {});
      return next;
    });
  };

  // जो screen चुना गया है उसे render करो
  const renderScreen = () => {
    switch (activeTab) {
      case 'Lessons':
        return (
          <LessonsScreen
            unlockedLessons={unlockedLessons}
            onStartLesson={handleStartLesson}
          />
        );
      case 'Type':
        return (
          <TypingScreen
            lesson={currentLesson}
            onComplete={handleLessonComplete}
          />
        );
      case 'Stats':
        return <StatsScreen />;
      case 'Home':
      default:
        return (
          <HomeScreen
            studentName={studentName}
            onStartTyping={showLessons}
            onContinueLesson={showLessons}
          />
        );
    }
  };

  // अगर storage का data अभी load नहीं हुआ तो कुछ time रुक जाओ
  if (!isLoaded) {
    return <View style={styles.app} />;
  }

  // अगर student ने अभी अपना name नहीं भरा है,
  // तो सबसे पहले name panel दिखाओ (app के अंदर नहीं जाने दो)
  if (!studentName) {
    return <NameEntryScreen onSubmit={handleSetName} />;
  }

  return (
    <View style={styles.app}>
      {renderScreen()}
      <BottomNav activeTab={activeTab} onTabPress={setActiveTab} />
    </View>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  statsScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  statsTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 16,
  },
  statsText: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});