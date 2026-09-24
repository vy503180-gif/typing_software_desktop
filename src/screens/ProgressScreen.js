// src/screens/ProgressScreen.js
// Progress tracking with WPM and Accuracy

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const STATS = [
  { label: 'Avg WPM', value: '42', icon: 'speedometer-outline', color: COLORS.teal },
  { label: 'Best WPM', value: '68', icon: 'trophy-outline', color: COLORS.amber },
  { label: 'Accuracy', value: '94%', icon: 'checkmark-circle-outline', color: COLORS.green },
  { label: 'Tests Done', value: '47', icon: 'document-text-outline', color: COLORS.rose },
  { label: 'Total Time', value: '5.2h', icon: 'time-outline', color: COLORS.teal },
  { label: 'Streak', value: '7 days', icon: 'flame-outline', color: COLORS.amber },
];

const RECENT_TESTS = [
  { lang: 'English', wpm: 45, accuracy: 96, time: '2 min ago' },
  { lang: 'Hindi', wpm: 32, accuracy: 91, time: '1 hour ago' },
  { lang: 'English', wpm: 52, accuracy: 98, time: 'Yesterday' },
  { lang: 'Hindi', wpm: 28, accuracy: 87, time: 'Yesterday' },
];

export default function ProgressScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>WPM aur Accuracy Tracking</Text>

          {/* Main Stats Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Ionicons name={stat.icon} size={28} color={stat.color} />
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Weekly Progress Chart */}
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Weekly Progress</Text>
            <View style={styles.chartBars}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <View key={day} style={styles.barContainer}>
                  <View style={[styles.bar, { height: [40, 65, 55, 80, 70, 45, 60][i] }]} />
                  <Text style={styles.barLabel}>{day}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Recent Tests */}
          <View style={styles.recentCard}>
            <Text style={styles.recentTitle}>Recent Tests</Text>
            {RECENT_TESTS.map((test, i) => (
              <View key={i} style={styles.testRow}>
                <View style={styles.testLang}>
                  <Text style={styles.testLangText}>{test.lang}</Text>
                </View>
                <View style={styles.testStats}>
                  <Text style={styles.testWpm}>{test.wpm} WPM</Text>
                  <Text style={styles.testAccuracy}>{test.accuracy}%</Text>
                </View>
                <Text style={styles.testTime}>{test.time}</Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#0a0a0a' },
  gradient: { flex: 1 },
  container: { padding: scaleSize(20), paddingBottom: scaleSize(120) },
  title: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(28), textAlign: 'center' },
  subtitle: { fontFamily: 'Poppins_400Regular', color: COLORS.textMuted, textAlign: 'center', marginTop: scaleSize(4), marginBottom: scaleSize(24) },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: COLORS.cardBg, borderRadius: scaleSize(16), padding: scaleSize(16), marginBottom: scaleSize(12), borderWidth: 1.5, borderColor: COLORS.cardBorder, alignItems: 'center' },
  statValue: { color: COLORS.textWhite, fontSize: scaleFont(24), fontFamily: 'Poppins_700Bold', fontWeight: '700', marginTop: scaleSize(8) },
  statLabel: { fontFamily: 'Poppins_400Regular', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: scaleSize(4) },
  chartCard: { backgroundColor: COLORS.cardBg, borderRadius: scaleSize(16), padding: scaleSize(16), marginTop: scaleSize(8), borderWidth: 1.5, borderColor: COLORS.cardBorder },
  chartTitle: { color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Poppins_700Bold', fontWeight: '700', marginBottom: scaleSize(16) },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: scaleSize(24), backgroundColor: COLORS.teal, borderRadius: scaleSize(6) },
  barLabel: { fontFamily: 'Poppins_400Regular', color: COLORS.textMuted, fontSize: scaleFont(10), marginTop: scaleSize(6) },
  recentCard: { backgroundColor: COLORS.cardBg, borderRadius: scaleSize(16), padding: scaleSize(16), marginTop: scaleSize(12), borderWidth: 1.5, borderColor: COLORS.cardBorder },
  recentTitle: { color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Poppins_700Bold', fontWeight: '700', marginBottom: scaleSize(12) },
  testRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: scaleSize(12), borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  testLang: { backgroundColor: COLORS.teal + '30', paddingHorizontal: scaleSize(10), paddingVertical: scaleSize(4), borderRadius: scaleSize(8) },
  testLangText: { color: COLORS.teal, fontSize: scaleFont(12), fontFamily: 'Poppins_700Bold', fontWeight: '700'},
  testStats: { flex: 1, marginLeft: scaleSize(12) },
  testWpm: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700'},
  testAccuracy: { fontFamily: 'Poppins_400Regular', color: COLORS.textMuted, fontSize: scaleFont(12) },
  testTime: { fontFamily: 'Poppins_400Regular', color: COLORS.textDim, fontSize: scaleFont(12) },
});
