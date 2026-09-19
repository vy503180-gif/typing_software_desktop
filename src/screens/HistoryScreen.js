// src/screens/HistoryScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

export default function HistoryScreen({ studentName, onBack }) {
  const [records, setRecords] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const today = new Date().toLocaleDateString();

  useEffect(() => {
    const key = getHistoryKey(studentName);
    AsyncStorage.getItem(key)
      .then((raw) => {
        let list = [];
        try { list = raw ? JSON.parse(raw) : []; } catch { list = []; }
        const todays = list.filter((r) => r.date === today);
        if (todays.length !== list.length) {
          AsyncStorage.setItem(key, JSON.stringify(todays)).catch(() => {});
        }
        setRecords(todays);
      })
      .catch(() => setRecords([]))
      .finally(() => setIsLoaded(true));
  }, []);

  const clearHistory = () => {
    const key = getHistoryKey(studentName);
    AsyncStorage.removeItem(key).then(() => setRecords([])).catch(() => {});
  };

  const fmt = (sec) => `${Math.floor(sec / 60)}m ${sec % 60}s`;

  const getWpmColor = (wpm) => {
    if (wpm >= 40) return COLORS.green;
    if (wpm >= 25) return COLORS.amber;
    return COLORS.rose;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
            </TouchableOpacity>
          ) : null}
          <View style={styles.headerTextWrap}>
            <View style={styles.headerRow}>
              <Ionicons name="time" size={22} color={COLORS.amber} />
              <Text style={styles.title}>Typing History</Text>
            </View>
            <Text style={styles.subtitle}>Today's typing records</Text>
          </View>
          {records.length > 0 && (
            <TouchableOpacity onPress={clearHistory} style={styles.clearBtn} activeOpacity={0.7}>
              <Ionicons name="trash" size={18} color={COLORS.rose} />
            </TouchableOpacity>
          )}
        </View>

        {/* Summary cards */}
        {records.length > 0 && (
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.teal + '12', borderColor: COLORS.teal + '25' }]}>
              <Text style={[styles.summaryVal, { color: COLORS.teal }]}>{records.length}</Text>
              <Text style={styles.summaryLabel}>Tests</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.green + '12', borderColor: COLORS.green + '25' }]}>
              <Text style={[styles.summaryVal, { color: COLORS.green }]}>
                {Math.max(...records.map((r) => r.wpm))}
              </Text>
              <Text style={styles.summaryLabel}>Best WPM</Text>
            </View>
            <View style={[styles.summaryCard, { backgroundColor: COLORS.amber + '12', borderColor: COLORS.amber + '25' }]}>
              <Text style={[styles.summaryVal, { color: COLORS.amber }]}>
                {Math.max(...records.map((r) => r.accuracy))}%
              </Text>
              <Text style={styles.summaryLabel}>Accuracy</Text>
            </View>
          </View>
        )}

        {isLoaded && records.length === 0 ? (
          <View style={styles.dayMsg}>
            <Ionicons name="sunny" size={18} color={COLORS.amber} />
            <Text style={styles.dayMsgText}>New day! Start typing to create new records.</Text>
          </View>
        ) : null}

        {isLoaded && records.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text" size={42} color={COLORS.textDim} />
            <Text style={styles.emptyTitle}>No Records Yet</Text>
            <Text style={styles.emptyText}>Complete a typing test to see your history here.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {records.map((rec) => {
              const wpmColor = getWpmColor(rec.wpm);
              return (
                <View key={rec.id} style={styles.row}>
                  <View style={[styles.rowAccent, { backgroundColor: wpmColor }]} />
                  <View style={styles.rowContent}>
                    <View style={styles.rowLeft}>
                      <Text style={styles.rowLesson} numberOfLines={1}>{rec.lesson}</Text>
                      <Text style={styles.rowMeta}>
                        {rec.time}
                        {rec.lessonTime > 0 ? `  -  ${fmt(rec.lessonTime)} / ${fmt(rec.timeTaken)}` : ''}
                      </Text>
                    </View>
                    <View style={styles.rowStats}>
                      <View style={[styles.wpmBadge, { backgroundColor: wpmColor + '18' }]}>
                        <Text style={[styles.rowWpm, { color: wpmColor }]}>{rec.wpm}</Text>
                        <Text style={[styles.rowUnit, { color: wpmColor }]}>WPM</Text>
                      </View>
                      <View style={[styles.accBadge, { backgroundColor: COLORS.green + '12' }]}>
                        <Text style={[styles.rowAcc, { color: COLORS.green }]}>{rec.accuracy}%</Text>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(16) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  backBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(8),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  clearBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.rose + '12', marginLeft: 6,
  },
  headerTextWrap: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(22) },
  subtitle: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 2 },

  summaryRow: { flexDirection: 'row', gap: scaleSize(8), marginBottom: scaleSize(14) },
  summaryCard: { flex: 1, borderRadius: scaleSize(12), padding: scaleSize(10), alignItems: 'center', borderWidth: 1 },
  summaryVal: { fontSize: scaleFont(20), fontFamily: 'Calibri', fontWeight: '700'},
  summaryLabel: { fontSize: scaleFont(10), color: COLORS.textMuted, fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(2) },

  dayMsg: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.amber + '12', borderWidth: 1, borderColor: COLORS.amber + '30',
    borderRadius: scaleSize(12), padding: scaleSize(12), marginBottom: scaleSize(10),
  },
  dayMsgText: { flex: 1, color: COLORS.amber, fontSize: scaleFont(12), lineHeight: scaleSize(18), fontFamily: 'Calibri', fontWeight: '700'},

  emptyCard: {
    alignItems: 'center', backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(16), borderWidth: 1, borderColor: COLORS.cardBorder,
    padding: scaleSize(28), marginTop: scaleSize(10),
  },
  emptyTitle: { color: COLORS.textWhite, fontSize: scaleFont(16), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(10) },
  emptyText: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), textAlign: 'center', marginTop: scaleSize(4), lineHeight: scaleSize(18) },

  scrollContent: { paddingBottom: scaleSize(120) },

  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(12),
    borderWidth: 1, borderColor: COLORS.cardBorder,
    marginBottom: scaleSize(8), overflow: 'hidden',
  },
  rowAccent: { width: 3, alignSelf: 'stretch' },
  rowContent: { flex: 1, flexDirection: 'row', alignItems: 'center', paddingVertical: scaleSize(10), paddingHorizontal: scaleSize(10) },
  rowLeft: { flex: 1, marginRight: scaleSize(8) },
  rowLesson: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700'},
  rowMeta: { fontFamily: 'Calibri', color: COLORS.textDim, fontSize: scaleFont(10), marginTop: 2 },
  rowStats: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(6) },
  wpmBadge: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(2), borderRadius: scaleSize(6), paddingHorizontal: scaleSize(6), paddingVertical: scaleSize(3) },
  rowWpm: { fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  rowUnit: { fontSize: scaleFont(9), fontFamily: 'Calibri', fontWeight: '700'},
  accBadge: { borderRadius: scaleSize(6), paddingHorizontal: scaleSize(6), paddingVertical: scaleSize(3) },
  rowAcc: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700'},
});
