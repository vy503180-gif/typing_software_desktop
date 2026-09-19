import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;

export default function ResultScreen({ course, onBack }) {
  const lessonCount = course ? course.lessons.length : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView contentContainerStyle={[styles.container, IS_DESKTOP && styles.containerDesktop]} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Ionicons name="trophy" size={22} color={COLORS.amber} />
            <Text style={styles.headerTitle}>Result</Text>
          </View>

          {/* Success card */}
          <View style={styles.successCard}>
            <View style={[styles.trophyBg, { backgroundColor: COLORS.amber }]}>
              <Ionicons name="trophy" size={48} color="#fff" />
            </View>
            <Text style={styles.successTitle}>Course Complete!</Text>
            <Text style={styles.successMsg}>
              Congratulations! You have completed all {lessonCount} lessons.
            </Text>
          </View>

          {/* Graph card */}
          <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Lesson-wise Progress</Text>
            <View style={styles.barRow}>
              {course && course.lessons.map((lesson, i) => {
                const height = 30 + (i + 1) * 12;
                return (
                  <View key={lesson.id} style={styles.barWrap}>
                    <View style={styles.barTrack}>
                    <View style={[styles.bar, { height, backgroundColor: lesson.color }]} />
                    </View>
                    <Text style={styles.barLabel}>L{lesson.id}</Text>
                  </View>
                );
              })}
            </View>
            <Text style={styles.graphCaption}>All lessons completed successfully</Text>
          </View>

          {/* Summary stats */}
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.green + '15', borderColor: COLORS.green + '30' }]}>
              <Ionicons name="checkmark-done" size={22} color={COLORS.green} />
              <Text style={[styles.summaryValue, { color: COLORS.green }]}>{lessonCount}</Text>
              <Text style={styles.summaryLabel}>Lessons Done</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.teal + '15', borderColor: COLORS.teal + '30' }]}>
              <Ionicons name="flash" size={22} color={COLORS.teal} />
              <Text style={[styles.summaryValue, { color: COLORS.teal }]}>100%</Text>
              <Text style={styles.summaryLabel}>Progress</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.homeBtn} onPress={onBack} activeOpacity={0.7}>
            <View style={[styles.homeBtnGradient, { backgroundColor: COLORS.green }]}>
              <Ionicons name="arrow-back" size={16} color="#fff" />
              <Text style={styles.homeBtnText}>Back to Course</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: scaleSize(16) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginBottom: scaleSize(16) },
  backBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontFamily: 'Calibri', fontWeight: '700', fontSize: scaleFont(20), color: COLORS.textWhite, flex: 1 },

  successCard: {
    alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(18), borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: scaleSize(24), marginBottom: scaleSize(16),
  },
  trophyBg: {
    width: scaleSize(72), height: scaleSize(72), borderRadius: scaleSize(36),
    alignItems: 'center', justifyContent: 'center',
    shadowColor: COLORS.amber, shadowOpacity: 0.5, shadowOffset: { width: 0, height: 4 }, shadowRadius: 12,
  },
  successTitle: { fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, marginTop: scaleSize(12) },
  successMsg: { fontFamily: 'Calibri', fontSize: scaleFont(13), color: COLORS.textMuted, textAlign: 'center', marginTop: scaleSize(6) },

  graphCard: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(16),
    borderWidth: 1, borderColor: COLORS.cardBorder, padding: scaleSize(16), marginBottom: scaleSize(16),
  },
  graphTitle: { fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, marginBottom: scaleSize(14) },
  barRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 150 },
  barWrap: { alignItems: 'center' },
  barTrack: { height: 120, justifyContent: 'flex-end' },
  bar: { width: scaleSize(24), borderRadius: scaleSize(6), minHeight: scaleSize(18) },
  barLabel: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(6) },
  graphCaption: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(11), textAlign: 'center', marginTop: scaleSize(10) },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: scaleSize(12), marginBottom: scaleSize(16) },
  summaryCard: {
    flex: 1, alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(14), borderWidth: 1, paddingVertical: scaleSize(14),
  },
  summaryValue: { fontSize: scaleFont(20), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(4) },
  summaryLabel: { fontSize: scaleFont(11), color: COLORS.textMuted, fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(2) },

  homeBtn: { borderRadius: scaleSize(14), overflow: 'hidden' },
  homeBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: scaleSize(6), paddingVertical: scaleSize(14),
  },
  homeBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700'},
});
