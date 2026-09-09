// src/screens/LessonsScreen.js
// Phase 3: Lesson Selection
// दो languages (English / हिंदी) और हर language में 5 categories:
// English -> Home Row, Top Row, Bottom Row, Numbers, Paragraph
// हिंदी   -> क ख ग, स्वर, शब्द अभ्यास, पैराग्राफ, परीक्षा
// हर lesson card पर दिखता है: Time, Difficulty, Characters, Locked/Unlocked

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LESSON_TEXTS, LESSON_DIFFICULTY } from '../data/lessons';

const LESSONS = {
  english: [
    {
      id: 1,
      title: 'Home Row',
      desc: 'ASDF JKL;',
      time: '2 min',
      characters: 12,
    },
    {
      id: 2,
      title: 'Top Row',
      desc: 'QWERTYUIOP',
      time: '3 min',
      characters: 10,
    },
    {
      id: 3,
      title: 'Bottom Row',
      desc: 'ZXCVBNM,./',
      time: '3 min',
      characters: 10,
    },
    {
      id: 4,
      title: 'Numbers',
      desc: '1234567890',
      time: '5 min',
      characters: 10,
    },
    {
      id: 5,
      title: 'Paragraph',
      desc: 'Long text practice',
      time: '10 min',
      characters: 65,
    },
  ],
  hindi: [
    {
      id: 1,
      title: 'क, ख, ग',
      desc: 'वर्णमाला अभ्यास',
      time: '2 min',
      characters: 12,
    },
    {
      id: 2,
      title: 'स्वर',
      desc: 'अ आ इ ई',
      time: '3 min',
      characters: 13,
    },
    {
      id: 3,
      title: 'शब्द अभ्यास',
      desc: 'नमस्ते, धन्यवाद',
      time: '5 min',
      characters: 16,
    },
    {
      id: 4,
      title: 'पैराग्राफ',
      desc: 'लंबा पाठ अभ्यास',
      time: '10 min',
      characters: 48,
    },
    {
      id: 5,
      title: 'परीक्षा',
      desc: 'समय परीक्षा',
      time: '15 min',
      characters: 68,
    },
  ],
};

const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'Easy':
      return '#4ADE80';
    case 'Medium':
      return '#FBBF24';
    case 'Hard':
      return '#F87171';
    default:
      return '#93C5FD';
  }
};

export default function LessonsScreen({
  onStartLesson,
  unlockedLessons = { english: [1, 2], hindi: [1, 2] },
}) {
  const [selectedLang, setSelectedLang] = useState('english');

  const lessons = LESSONS[selectedLang];
  const unlocked = unlockedLessons[selectedLang] || [];

  // Unlocked lessons की संख्या
  const countUnlocked = lessons.filter((l) => unlocked.includes(l.id)).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1D4ED8', '#6D28D9', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Lessons</Text>
          <Text style={styles.subtitle}>Choose a category and start learning</Text>

          {/* Language Toggle */}
          <View style={styles.langToggle}>
            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'english' && styles.langBtnActive]}
              onPress={() => setSelectedLang('english')}
            >
              <Text style={[styles.langBtnText, selectedLang === 'english' && styles.langBtnTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.langBtn, selectedLang === 'hindi' && styles.langBtnActive]}
              onPress={() => setSelectedLang('hindi')}
            >
              <Text style={[styles.langBtnText, selectedLang === 'hindi' && styles.langBtnTextActive]}>
                हिंदी
              </Text>
            </TouchableOpacity>
          </View>

          {/* Progress - कितने lessons unlocked हैं */}
          <View style={styles.progressCard}>
            <BlurView intensity={25} tint="dark" style={styles.progressInner}>
              <Text style={styles.progressTitle}>
                {countUnlocked} of {lessons.length} Lessons Unlocked
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(countUnlocked / lessons.length) * 100}%` },
                  ]}
                />
              </View>
            </BlurView>
          </View>

          {/* Lessons List */}
          {lessons.map((lesson) => {
            const locked = !unlocked.includes(lesson.id);
            const difficultyColor = getDifficultyColor(LESSON_DIFFICULTY[lesson.id]);
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, locked && styles.lessonCardLocked]}
                onPress={() => !locked && onStartLesson(selectedLang, lesson.id, lesson.title)}
                activeOpacity={locked ? 1 : 0.8}
                disabled={locked}
              >
                {/* Left - status icon */}
                <View style={styles.lessonLeft}>
                  <View
                    style={[
                      styles.lessonIcon,
                      locked ? styles.lessonIconLocked : styles.lessonIconOpen,
                    ]}
                  >
                    <Ionicons
                      name={locked ? 'lock-closed' : 'keypad-outline'}
                      size={20}
                      color={locked ? 'rgba(255,255,255,0.5)' : '#ffffff'}
                    />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonTitle, locked && styles.textDimmed]}>
                      {lesson.title}
                    </Text>
                    <Text style={[styles.lessonDesc, locked && styles.textDimmed]}>
                      {lesson.desc}
                    </Text>

                    {/* Time | Difficulty | Characters */}
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Ionicons name="time-outline" size={12} color={locked ? 'rgba(255,255,255,0.45)' : '#67E8F9'} />
                        <Text style={[styles.badgeText, locked && styles.textDimmed]}>{lesson.time}</Text>
                      </View>

                      <View style={[styles.badge, { backgroundColor: difficultyColor + '2B' }]}>
                        <Ionicons name="speedometer-outline" size={12} color={difficultyColor} />
                        <Text style={[styles.badgeText, { color: difficultyColor }]}>
                          {LESSON_DIFFICULTY[lesson.id]}
                        </Text>
                      </View>

                      <View style={styles.badge}>
                        <Ionicons name="text-outline" size={12} color={locked ? 'rgba(255,255,255,0.45)' : '#A78BFA'} />
                        <Text style={[styles.badgeText, locked && styles.textDimmed]}>
                          {lesson.characters} chars
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Right - chevron / lock state */}
                <View style={styles.lessonRight}>
                  {locked ? (
                    <Ionicons name="lock-closed" size={18} color="rgba(255,255,255,0.4)" />
                  ) : (
                    <Ionicons name="chevron-forward" size={18} color="rgba(255,255,255,0.7)" />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1D4ED8' },
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 120 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, marginBottom: 20 },

  // Language toggle
  langToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  langBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  langBtnActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  langBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 16, fontWeight: '600' },
  langBtnTextActive: { color: '#fff' },

  // Progress bar
  progressCard: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
  },
  progressInner: { padding: 16 },
  progressTitle: { color: '#fff', fontSize: 14, fontWeight: '700' },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#4ADE80' },

  // Lesson cards
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  lessonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonIconOpen: { backgroundColor: 'rgba(167,139,250,0.35)' },
  lessonIconLocked: { backgroundColor: 'rgba(255,255,255,0.12)' },
  lessonInfo: { marginLeft: 12, flex: 1 },
  lessonTitle: { color: '#fff', fontSize: 16, fontWeight: '700' },
  lessonDesc: { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2 },
  textDimmed: { opacity: 0.6 },

  // Time / Difficulty / Characters badges
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  badgeText: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600' },

  lessonRight: { marginLeft: 8 },
});