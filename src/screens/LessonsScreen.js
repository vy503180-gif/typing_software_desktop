// src/screens/LessonsScreen.js

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
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LESSON_DIFFICULTY } from '../data/lessons';

const LESSONS = {
  english: [
    { id: 1, title: 'Home Row - Letters', desc: 'ASDF JKL;', time: '2 min', characters: 54 },
    { id: 2, title: 'Home Row - Easy Words 1', desc: 'sad, lad, fall', time: '2 min', characters: 42 },
    { id: 3, title: 'Home Row - Easy Words 2', desc: 'ask, all, jazz', time: '2 min', characters: 44 },
    { id: 4, title: 'Middle Row (G H)', desc: 'gh asdfghjkl', time: '2 min', characters: 48 },
    { id: 5, title: 'Middle Row - Words', desc: 'has, gas, dash', time: '2 min', characters: 37 },
    { id: 6, title: 'Top Row - Letters', desc: 'QWERTYUIOP', time: '3 min', characters: 48 },
    { id: 7, title: 'Top Row - Words 1', desc: 'write, quiet', time: '3 min', characters: 42 },
    { id: 8, title: 'Top Row - Words 2', desc: 'great, water', time: '3 min', characters: 44 },
    { id: 9, title: 'Bottom Row - Letters', desc: 'ZXCVBNM', time: '3 min', characters: 42 },
    { id: 10, title: 'Bottom Row - Words', desc: 'buzz, zinc, box', time: '3 min', characters: 44 },
    { id: 11, title: 'All Letters - Mixed Words', desc: 'quick brown fox', time: '4 min', characters: 44 },
    { id: 12, title: 'Common Words 1', desc: 'the, and, for', time: '4 min', characters: 44 },
    { id: 13, title: 'Common Words 2', desc: 'was, not, but', time: '4 min', characters: 42 },
    { id: 14, title: 'Common Words 3', desc: 'from, have, this', time: '4 min', characters: 46 },
    { id: 15, title: 'Sight Words', desc: 'jump, rain, tree', time: '4 min', characters: 46 },
    { id: 16, title: 'Action Verbs', desc: 'run, walk, speak', time: '5 min', characters: 46 },
    { id: 17, title: 'Short Sentences', desc: 'i am fine...', time: '5 min', characters: 44 },
    { id: 18, title: 'Question Words', desc: 'who, what, when', time: '5 min', characters: 48 },
    { id: 19, title: 'Colours', desc: 'red, blue, green', time: '5 min', characters: 47 },
    { id: 20, title: 'Days of Week', desc: 'monday...sunday', time: '5 min', characters: 49 },
    { id: 21, title: 'Months of Year', desc: 'january...august', time: '6 min', characters: 45 },
    { id: 22, title: 'Numbers', desc: 'one...ten', time: '6 min', characters: 43 },
    { id: 23, title: 'School Words', desc: 'teacher, student', time: '6 min', characters: 48 },
    { id: 24, title: 'Family Words', desc: 'father, mother', time: '6 min', characters: 56 },
    { id: 25, title: 'Nature - Sentence', desc: 'the sun rises...', time: '7 min', characters: 49 },
    { id: 26, title: 'About Me', desc: 'my name is...', time: '7 min', characters: 49 },
    { id: 27, title: 'Proverb Practice', desc: 'practice makes...', time: '8 min', characters: 57 },
    { id: 28, title: 'Tongue Twister', desc: 'she sells...', time: '8 min', characters: 62 },
    { id: 29, title: 'Long Paragraph', desc: 'the early morning...', time: '9 min', characters: 75 },
    { id: 30, title: 'Final Exam', desc: 'typing fast and...', time: '10 min', characters: 118 },
  ],
  hindi: [
    { id: 1, title: 'क, ख, ग', desc: 'वर्णमाला अभ्यास', time: '2 min', characters: 12 },
    { id: 2, title: 'स्वर', desc: 'अ आ इ ई', time: '3 min', characters: 13 },
    { id: 3, title: 'शब्द अभ्यास', desc: 'नमस्ते, धन्यवाद', time: '5 min', characters: 16 },
    { id: 4, title: 'पैराग्राफ', desc: 'लंबा पाठ अभ्यास', time: '10 min', characters: 48 },
    { id: 5, title: 'परीक्षा', desc: 'समय परीक्षा', time: '15 min', characters: 68 },
  ],
};

const LESSON_COLORS = [COLORS.green, COLORS.amber, COLORS.teal, COLORS.rose];

const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'Easy': return COLORS.green;
    case 'Medium': return COLORS.amber;
    case 'Hard': return COLORS.rose;
    default: return COLORS.teal;
  }
};

export default function LessonsScreen({
  onStartLesson,
  onBack,
  unlockedLessons = { english: [1, 2], hindi: [1, 2] },
}) {
  const [selectedLang, setSelectedLang] = useState('english');
  const lessons = LESSONS[selectedLang];
  const unlocked = unlockedLessons[selectedLang] || [];
  const countUnlocked = lessons.filter((l) => unlocked.includes(l.id)).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Lessons</Text>
            <Text style={styles.subtitle}>Choose a category and start learning</Text>
          </View>
        </View>

        {/* Language Toggle */}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === 'english' && styles.langBtnActive]}
            onPress={() => setSelectedLang('english')}
          >
            <Ionicons name="globe" size={16} color={selectedLang === 'english' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.langBtnText, selectedLang === 'english' && styles.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === 'hindi' && styles.langBtnActive]}
            onPress={() => setSelectedLang('hindi')}
          >
            <Ionicons name="language" size={16} color={selectedLang === 'hindi' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.langBtnText, selectedLang === 'hindi' && styles.langBtnTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="trophy" size={18} color={COLORS.amber} />
            <Text style={styles.progressTitle}>{countUnlocked} of {lessons.length} Unlocked</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(countUnlocked / lessons.length) * 100}%`, backgroundColor: COLORS.green }]}
            />
          </View>
        </View>

        {/* Lessons List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {lessons.map((lesson, idx) => {
            const locked = !unlocked.includes(lesson.id);
            const diffColor = getDifficultyColor(LESSON_DIFFICULTY[lesson.id]);
            const accentColor = LESSON_COLORS[idx % LESSON_COLORS.length];
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, locked && styles.lessonCardLocked]}
                onPress={() => !locked && onStartLesson(selectedLang, lesson.id, lesson.title, parseInt(lesson.time) * 60)}
                activeOpacity={locked ? 1 : 0.8}
                disabled={locked}
              >
                <View style={[styles.lessonIcon, { backgroundColor: locked ? 'rgba(255,255,255,0.06)' : accentColor + '20' }]}>
                  <Ionicons
                    name={locked ? 'lock-closed' : 'keypad'}
                    size={20}
                    color={locked ? COLORS.textDim : accentColor}
                  />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonNumber, { color: accentColor }]}>LESSON {lesson.id}</Text>
                  <Text style={[styles.lessonTitle, locked && { color: COLORS.textDim }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonDesc, locked && { color: COLORS.textDim }]}>{lesson.desc}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Ionicons name="time" size={10} color={COLORS.textMuted} />
                      <Text style={styles.badgeText}>{lesson.time}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: diffColor + '18' }]}>
                      <Ionicons name="speedometer" size={10} color={diffColor} />
                      <Text style={[styles.badgeText, { color: diffColor }]}>{LESSON_DIFFICULTY[lesson.id]}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="text" size={10} color={COLORS.textMuted} />
                      <Text style={styles.badgeText}>{lesson.characters} chars</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.lessonRight}>
                  {locked ? (
                    <Ionicons name="lock-closed" size={16} color={COLORS.textDim} />
                  ) : (
                    <View style={[styles.playBtn, { backgroundColor: accentColor + '20' }]}>
                      <Ionicons name="chevron-forward" size={18} color={accentColor} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(16) },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(16) },
  backBtn: {
    width: scaleSize(38), height: scaleSize(38), borderRadius: scaleSize(19),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(24) },
  subtitle: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 2 },

  langToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(14), padding: scaleSize(4), marginBottom: scaleSize(14),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  langBtn: { flex: 1, paddingVertical: scaleSize(10), borderRadius: scaleSize(10), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: scaleSize(6) },
  langBtnActive: { backgroundColor: COLORS.green },
  langBtnText: { color: COLORS.textMuted, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  langBtnTextActive: { color: '#fff', fontFamily: 'Calibri', fontWeight: '700'},

  progressCard: {
    borderRadius: scaleSize(14), borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg, padding: scaleSize(14), marginBottom: scaleSize(14),
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700'},
  progressTrack: {
    height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: scaleSize(10), overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },

  scrollContent: { paddingBottom: scaleSize(120) },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    padding: scaleSize(12), marginBottom: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  lessonCardLocked: { opacity: 0.45 },
  lessonIcon: {
    width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(12),
    alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo: { marginLeft: scaleSize(10), flex: 1 },
  lessonNumber: { fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1, marginBottom: 1 },
  lessonTitle: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  lessonDesc: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(11), marginTop: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(5), marginTop: scaleSize(6) },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(6), paddingHorizontal: scaleSize(5), paddingVertical: scaleSize(2),
  },
  badgeText: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700'},
  lessonRight: { marginLeft: scaleSize(6) },
  playBtn: {
    width: scaleSize(32), height: scaleSize(32), borderRadius: scaleSize(16),
    alignItems: 'center', justifyContent: 'center',
  },
});
