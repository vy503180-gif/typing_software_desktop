// src/screens/HomeScreen.js
// Professional dashboard: progress, live stats, quick links.

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, COLORS, card, levelForWpm, IS_DESKTOP } from '../theme';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

function GradientPill({ icon, label, colors }) {
  return (
    <View style={[styles.quickPill, { backgroundColor: colors[0] + '1f', borderColor: colors[0] + '66' }]}>
      <View style={[styles.quickIcon, { backgroundColor: colors[0] }]}>
        <Ionicons name={icon} size={18} color="#fff" />
      </View>
      <Text style={[styles.quickLabel, { color: colors[0] }]}>{label}</Text>
    </View>
  );
}

export default function HomeScreen({
  studentName = 'Vicky Yadav',
  onStartTyping,
  onLessons,
  onTests,
  onGames,
  onCertificates,
  onStatistics,
  onProfile,
  onSettings,
  onSwitchUser,
  onCourse,
  onReview,
  onExplore,
  onInfo,
}) {
  const [stats, setStats] = useState({
    totalTests: 0,
    bestWpm: 0,
    avgWpm: 0,
    bestAccuracy: 0,
    avgAccuracy: 0,
    totalPracticeSec: 0,
    totalChars: 0,
  });

  useEffect(() => {
    AsyncStorage.getItem(getHistoryKey(studentName))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          if (!Array.isArray(all) || all.length === 0) {
            setStats({ totalTests: 0, bestWpm: 0, avgWpm: 0, bestAccuracy: 0, avgAccuracy: 0, totalPracticeSec: 0, totalChars: 0 });
            return;
          }
          const wpmArr = all.map((r) => r.wpm || 0);
          const accArr = all.map((r) => r.accuracy || 0);
          const totalSec = all.reduce((s, r) => s + (r.timeTaken || 0), 0);
          const totalChars = all.reduce((s, r) => s + (r.charactersTyped || 0), 0);
          setStats({
            totalTests: all.length,
            bestWpm: Math.max(...wpmArr),
            avgWpm: Math.round(wpmArr.reduce((a, b) => a + b, 0) / wpmArr.length),
            bestAccuracy: Math.max(...accArr),
            avgAccuracy: Math.round(accArr.reduce((a, b) => a + b, 0) / accArr.length),
            totalPracticeSec: totalSec,
            totalChars,
          });
        } catch { }
      })
      .catch(() => {});
  }, [studentName]);

  const { totalTests, bestWpm, avgWpm, avgAccuracy, totalPracticeSec, totalChars } = stats;

  const level = useMemo(() => levelForWpm(bestWpm), [bestWpm]);
  const nextWpm = level.next;
  const progressToNext = nextWpm ? Math.min(100, Math.round((bestWpm / nextWpm) * 100)) : 100;

  const practiceTimeStr = useMemo(() => {
    const h = Math.floor(totalPracticeSec / 3600);
    const m = Math.floor((totalPracticeSec % 3600) / 60);
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, [totalPracticeSec]);

  const statCards = [
    { label: 'Total Tests', value: totalTests, icon: 'documents', color: COLORS.blue },
    { label: 'Average WPM', value: avgWpm, icon: 'speedometer', color: COLORS.cyan },
    { label: 'Accuracy', value: `${avgAccuracy}%`, icon: 'checkmark-circle', color: COLORS.green },
    { label: 'Practice Time', value: practiceTimeStr, icon: 'time', color: COLORS.amber },
  ];

  const quickLinks = [
    { label: 'Typing Lessons', icon: 'book', colors: ['#14b8a6', '#0e7490'], onPress: onLessons },
    { label: 'Typing Practice', icon: 'keypad', colors: ['#0e9488', '#0e7490'], onPress: onStartTyping },
    { label: 'Typing Games', icon: 'game-controller', colors: ['#10b981', '#f59e0b'], onPress: onGames },
    { label: 'Certificates', icon: 'ribbon', colors: ['#f59e0b', '#f43f5e'], onPress: onCertificates },
  ];

  const focusCards = [
    { title: 'Improve Speed', sub: 'Boost your WPM with focused drills', icon: 'speedometer', color: COLORS.blue, onPress: onTests },
    { title: 'Increase Accuracy', sub: 'Precision exercises to cut errors', icon: 'locate', color: COLORS.green, onPress: onStartTyping },
    { title: 'Build Confidence', sub: 'Structured lessons from the basics', icon: 'trending-up', color: COLORS.purple, onPress: onLessons },
    { title: 'Track Progress', sub: 'Review charts and earn certificates', icon: 'stats-chart', color: COLORS.amber, onPress: onStatistics },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Progress + Stats row */}
        <View style={styles.topGrid}>
          <View style={[card, styles.progressCard]}>
            <Text style={styles.cardTitle}>Your Progress</Text>
            <View style={styles.levelRow}>
              <View style={[styles.levelIcon, { backgroundColor: level.color + '2b' }]}>
                <Ionicons name="ribbon" size={22} color={level.color} />
              </View>
              <View style={styles.levelInfo}>
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelNext}>
                  {nextWpm ? `Next level at ${nextWpm} WPM` : 'Maximum level reached'}
                </Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${progressToNext}%`, backgroundColor: level.color }]} />
            </View>
            <Text style={styles.progressLabel}>{progressToNext}% toward next level</Text>
          </View>

          <View style={styles.statsWrap}>
            {statCards.map((s) => (
              <View key={s.label} style={styles.statCardX}>
                <View style={[styles.statIcon, { backgroundColor: s.color + '1c' }]}>
                  <Ionicons name={s.icon} size={18} color={s.color} />
                </View>
                <View style={styles.statInfo}>
                  <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Quick links */}
        <Text style={styles.sectionTitle}>Quick Links</Text>
        <View style={styles.quickRow}>
          {quickLinks.map((q) => (
            <TouchableOpacity key={q.label} style={styles.quickCard} onPress={q.onPress} activeOpacity={0.8}>
              <View style={[styles.quickIconBig, { backgroundColor: q.colors[0] }]}>
                <Ionicons name={q.icon} size={22} color="#fff" />
              </View>
              <Text style={styles.quickCardLabel}>{q.label}</Text>
              <Ionicons name="arrow-forward" size={14} color={q.colors[0]} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Focus cards */}
        <Text style={styles.sectionTitle}>Focus Areas</Text>
        <View style={styles.focusGrid}>
          {focusCards.map((f) => (
            <TouchableOpacity key={f.title} style={styles.focusCard} onPress={f.onPress} activeOpacity={0.85}>
              <View style={[styles.focusIcon, { backgroundColor: f.color + '1c', borderColor: f.color + '4d' }]}>
                <Ionicons name={f.icon} size={22} color={f.color} />
              </View>
              <View style={styles.focusInfo}>
                <Text style={styles.focusTitle}>{f.title}</Text>
                <Text style={styles.focusSub}>{f.sub}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={COLORS.textDim} />
            </TouchableOpacity>
          ))}
        </View>

        {/* More */}
        <Text style={styles.sectionTitle}>More</Text>
        <View style={styles.moreRow}>
          {[
            { label: 'Professional Course', icon: 'school', color: COLORS.blue, onPress: onCourse },
            { label: 'Review & Drills', icon: 'repeat', color: COLORS.green, onPress: onReview },
            { label: 'Daily Challenge', icon: 'sparkles', color: COLORS.purple, onPress: onExplore },
            { label: 'About', icon: 'information-circle', color: COLORS.amber, onPress: onInfo },
          ]
            .filter((m) => m.onPress)
            .map((m) => (
              <TouchableOpacity key={m.label} style={styles.moreLink} onPress={m.onPress} activeOpacity={0.75}>
                <Ionicons name={m.icon} size={15} color={m.color} />
                <Text style={[styles.moreLinkText, { color: m.color }]}>{m.label}</Text>
              </TouchableOpacity>
            ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { padding: 20, paddingBottom: 40, maxWidth: 1180, width: '100%', alignSelf: 'center' },

  topGrid: { flexDirection: 'row', gap: 14, marginBottom: 8, flexWrap: 'wrap' },
  progressCard: { flex: 1, minWidth: 260, minHeight: 224, paddingVertical: 22, paddingHorizontal: 20, backgroundColor: COLORS.cardBgSolid },
  cardTitle: {
    fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted,
    fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 18,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  levelIcon: {
    width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center',
  },
  levelInfo: { flex: 1 },
  levelName: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 19 },
  levelNext: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 3 },
  progressTrack: {
    height: 9, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 20, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: 12, marginTop: 8 },

  statsWrap: { flex: 1.6, flexDirection: 'row', flexWrap: 'wrap', gap: 10, minWidth: 340 },
  statCardX: {
    flex: 1, minWidth: 150, minHeight: 106, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.cardBgSolid, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: 18, paddingHorizontal: 14,
  },
  statIcon: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  statInfo: { flex: 1 },
  statValue: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 24 },
  statLabel: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 3 },

  sectionTitle: {
    fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight,
    fontSize: 15, marginTop: 20, marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  quickCard: {
    flex: 1, minWidth: 220, minHeight: 112, flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.cardBgSolid, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: 20, paddingHorizontal: 16, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  quickIconBig: {
    width: 54, height: 54, borderRadius: 15, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 4,
  },
  quickCardLabel: {
    flex: 1, fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight, fontSize: 15,
  },

  focusGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  focusCard: {
    flex: 1, minWidth: 260, minHeight: 106, flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: COLORS.cardBgSolid, borderRadius: 16,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: 20, paddingHorizontal: 16,
  },
  focusIcon: {
    width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  focusInfo: { flex: 1 },
  focusTitle: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 16 },
  focusSub: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12.5, marginTop: 3 },
  bottomSpacer: { height: 30 },
  moreRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  moreLink: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: COLORS.cardBgSolid, borderRadius: 24,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    paddingVertical: 12, paddingHorizontal: 16,
  },
  moreLinkText: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 13 },
});