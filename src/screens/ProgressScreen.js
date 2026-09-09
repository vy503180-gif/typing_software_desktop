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
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const STATS = [
  { label: 'Avg WPM', value: '42', icon: 'speedometer-outline', color: '#60A5FA' },
  { label: 'Best WPM', value: '68', icon: 'trophy-outline', color: '#FBBF24' },
  { label: 'Accuracy', value: '94%', icon: 'checkmark-circle-outline', color: '#4ADE80' },
  { label: 'Tests Done', value: '47', icon: 'document-text-outline', color: '#A78BFA' },
  { label: 'Total Time', value: '5.2h', icon: 'time-outline', color: '#F472B6' },
  { label: 'Streak', value: '7 days', icon: 'flame-outline', color: '#FB923C' },
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
      <LinearGradient
        colors={['#1D4ED8', '#6D28D9', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Progress</Text>
          <Text style={styles.subtitle}>WPM और Accuracy Tracking</Text>

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
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#1D4ED8' },
  gradient: { flex: 1 },
  container: { padding: 20, paddingBottom: 120 },
  title: { color: '#fff', fontSize: 28, fontWeight: '800', textAlign: 'center' },
  subtitle: { color: 'rgba(255,255,255,0.7)', textAlign: 'center', marginTop: 4, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  statCard: { width: '48%', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)', alignItems: 'center' },
  statValue: { color: '#fff', fontSize: 24, fontWeight: '800', marginTop: 8 },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 4 },
  chartCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  chartTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 16 },
  chartBars: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', height: 100 },
  barContainer: { alignItems: 'center', flex: 1 },
  bar: { width: 24, backgroundColor: '#A78BFA', borderRadius: 6 },
  barLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, marginTop: 6 },
  recentCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 16, marginTop: 12, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  recentTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 12 },
  testRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  testLang: { backgroundColor: 'rgba(167,139,250,0.3)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  testLangText: { color: '#A78BFA', fontSize: 12, fontWeight: '600' },
  testStats: { flex: 1, marginLeft: 12 },
  testWpm: { color: '#fff', fontSize: 14, fontWeight: '600' },
  testAccuracy: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  testTime: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
});
