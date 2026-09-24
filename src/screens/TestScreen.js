// src/screens/TestScreen.js
// Typing Test launcher: duration, difficulty, text type.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS } from '../theme';

const DURATIONS = [
  { label: '1 Minute', value: 60, icon: 'time' },
  { label: '2 Minutes', value: 120, icon: 'time' },
  { label: '5 Minutes', value: 300, icon: 'time' },
  { label: '10 Minutes', value: 600, icon: 'time' },
];

const DIFFICULTIES = [
  { id: 'Easy', desc: 'Short common words', color: COLORS.green },
  { id: 'Medium', desc: 'Mixed sentences', color: COLORS.blue },
  { id: 'Hard', desc: 'Complex paragraphs', color: COLORS.purple },
];

const TEXT_TYPES = [
  { id: 'words', label: 'Words', icon: 'text', desc: 'Random words list' },
  { id: 'sentences', label: 'Sentences', icon: 'chatbox', desc: 'Connected sentences' },
  { id: 'paragraph', label: 'Paragraph', icon: 'reader', desc: 'Full paragraphs' },
];

function Segmented({ options, value, onChange, color }) {
  return (
    <View style={styles.segment}>
      {options.map((o) => {
        const active = o.value === value || o.id === value;
        return (
          <TouchableOpacity
            key={o.value || o.id}
            style={[styles.segmentItem, active && { backgroundColor: color + '22', borderColor: color }]}
            onPress={() => onChange(o.value || o.id)}
            activeOpacity={0.75}
          >
            <Ionicons name={o.icon} size={14} color={active ? color : COLORS.textMuted} />
            <Text style={[styles.segmentText, active && { color }]}>{o.label || o.id}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TestScreen({ onBack, onStartTest, studentName = '' }) {
  const [duration, setDuration] = useState(60);
  const [difficulty, setDifficulty] = useState('Easy');
  const [textType, setTextType] = useState('paragraph');

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={18} color={COLORS.textLight} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.title}>Typing Test</Text>
            <Text style={styles.subtitle}>Test your speed and accuracy</Text>
          </View>
        </View>

        {/* Hero card */}
        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Ionicons name="timer" size={30} color="#fff" />
          </View>
          <Text style={styles.heroTitle}>Ready to be tested?</Text>
          <Text style={styles.heroSub}>
            Set your options below and press Start Test. Your WPM, CPM and accuracy will be measured live.
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Duration</Text>
        <View style={styles.card}>
          <Segmented options={DURATIONS} value={duration} onChange={setDuration} color={COLORS.blue} />
        </View>

        <Text style={styles.sectionTitle}>Difficulty</Text>
        <View style={styles.card}>
          <View style={styles.diffRow}>
            {DIFFICULTIES.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.diffCard, difficulty === d.id && { borderColor: d.color, backgroundColor: d.color + '1a' }]}
                onPress={() => setDifficulty(d.id)}
                activeOpacity={0.8}
              >
                <Ionicons name="speedometer" size={20} color={difficulty === d.id ? d.color : COLORS.textMuted} />
                <Text style={[styles.diffTitle, difficulty === d.id && { color: d.color }]}>{d.id}</Text>
                <Text style={styles.diffDesc}>{d.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Text Type</Text>
        <View style={styles.card}>
          <Segmented options={TEXT_TYPES} value={textType} onChange={setTextType} color={COLORS.cyan} />
          <Text style={styles.hint}>
            {textType === 'words' ? 'A random list of words — great for speed.'
            : textType === 'sentences' ? 'Connected sentences — tests rhythm and spacing.'
            : 'Full paragraphs — simulates real typing work.'}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startBtn}
          onPress={() => onStartTest && onStartTest({ timeSec: duration, difficulty, mode: textType })}
          activeOpacity={0.85}
        >
          <Ionicons name="play" size={20} color="#fff" />
          <Text style={styles.startBtnText}>Start Test</Text>
          <Ionicons name="arrow-forward" size={16} color="#fff" />
        </TouchableOpacity>

        <View style={styles.infoRow}>
          <Ionicons name="information-circle" size={15} color={COLORS.cyan} />
          <Text style={styles.infoText}>
            Your results are saved to your statistics automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 18 },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  hero: {
    alignItems: 'center',
    backgroundColor: 'rgba(37,99,235,0.18)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.45)',
    borderRadius: 18, padding: 24, marginBottom: 18,
  },
  heroIcon: {
    width: 62, height: 62, borderRadius: 20, backgroundColor: '#0e9488',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#0e9488', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 6,
  },
  heroTitle: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 20 },
  heroSub: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 13, textAlign: 'center', marginTop: 6, lineHeight: 19 },

  sectionTitle: {
    fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted,
    fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 8,
  },
  card: {
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, padding: 12, marginBottom: 8,
  },
  segment: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  segmentItem: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 9,
  },
  segmentText: { color: COLORS.textMuted, fontSize: 12.5, fontFamily: 'Calibri', fontWeight: '700' },

  diffRow: { flexDirection: 'row', gap: 8 },
  diffCard: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 12, padding: 14,
  },
  diffTitle: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 14, marginTop: 8 },
  diffDesc: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 10.5, textAlign: 'center', marginTop: 3 },

  hint: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 10 },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0e9488', borderRadius: 14,
    paddingVertical: 15, marginTop: 18,
    shadowColor: '#0e9488', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 6,
  },
  startBtnText: { color: '#fff', fontFamily: 'Calibri', fontWeight: '700', fontSize: 16 },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 14, justifyContent: 'center' },
  infoText: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 11.5 },
});