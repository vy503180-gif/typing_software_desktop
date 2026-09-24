// src/screens/StatisticsScreen.js
// Statistics dashboard driven entirely by stored typing history.

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, COLORS } from '../theme';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

function BarChart({ data = [], height = 140, color = COLORS.blue }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height }}>
      {data.map((d, i) => (
        <View key={i} style={{ flex: 1, alignItems: 'center' }}>
          <View
            style={{
              width: '60%',
              height: Math.max(4, (d.value / max) * (height - 28)),
              borderRadius: 5,
              backgroundColor: d.value > 0 ? color : 'rgba(255,255,255,0.08)',
            }}
          />
          <Text style={styles.chartLabel}>{d.label}</Text>
        </View>
      ))}
    </View>
  );
}

function KpiCard({ icon, label, value, color, sub }) {
  return (
    <View style={styles.kpi}>
      <View style={styles.kpiTop}>
        <View style={[styles.kpiIcon, { backgroundColor: color + '1c' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={[styles.kpiValue, { color }]} numberOfLines={1} ellipsizeMode="tail">{value}</Text>
      </View>
      <Text style={styles.kpiLabel} numberOfLines={1} ellipsizeMode="tail">{label}</Text>
      {sub ? <Text style={styles.kpiSub}>{sub}</Text> : null}
    </View>
  );
}

export default function StatisticsScreen({ studentName = '', onBack }) {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(getHistoryKey(studentName))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          setRecords(Array.isArray(all) ? all : []);
        } catch { setRecords([]); }
      })
      .catch(() => setRecords([]));
  }, [studentName]);

  const summary = useMemo(() => {
    const n = records.length;
    if (n === 0) {
      return {
        total: 0, bestWpm: 0, avgWpm: 0, bestAcc: 0, avgAcc: 0, totalSec: 0, totalChars: 0, totalErrs: 0,
      };
    }
    const wpm = records.map((r) => r.wpm || 0);
    const acc = records.map((r) => r.accuracy || 0);
    return {
      total: n,
      bestWpm: Math.max(...wpm),
      avgWpm: Math.round(wpm.reduce((a, b) => a + b, 0) / n),
      bestAcc: Math.max(...acc),
      avgAcc: Math.round(acc.reduce((a, b) => a + b, 0) / n),
      totalSec: records.reduce((s, r) => s + (r.timeTaken || 0), 0),
      totalChars: records.reduce((s, r) => s + (r.charactersTyped || 0), 0),
      totalErrs: records.reduce((s, r) => s + (r.mistakes || 0), 0),
    };
  }, [records]);

  // Last 12 test results for the WPM chart
  const wpmChart = useMemo(() => {
    const last = records.slice(0, 12).reverse();
    return last.map((r, i) => ({ label: `${i + 1}`, value: r.wpm || 0 }));
  }, [records]);

  // Accuracy chart (last 12)
  const accChart = useMemo(() => {
    const last = records.slice(0, 12).reverse();
    return last.map((r, i) => ({ label: `${i + 1}`, value: r.accuracy || 0 }));
  }, [records]);

  // Practice time by last 7 days
  const weekly = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString();
      const daySec = records.filter((r) => r.date === key).reduce((s, r) => s + (r.timeTaken || 0), 0);
      days.push({ label: d.toLocaleDateString([], { weekday: 'short' }), value: Math.round(daySec / 60) });
    }
    return days;
  }, [records]);

  const practiceStr = useMemo(() => {
    const h = Math.floor(summary.totalSec / 3600);
    const m = Math.round((summary.totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [summary.totalSec]);

  const exportReport = () => {
    if (Platform.OS !== 'web') return;
    const lines = [
      '========================================',
      '          TYPING MASTER REPORT',
      '========================================',
      `Student: ${studentName}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      '--------- OVERALL STATISTICS ---------',
      `Total Tests:        ${summary.total}`,
      `Best WPM:           ${summary.bestWpm}`,
      `Average WPM:        ${summary.avgWpm}`,
      `Best Accuracy:      ${summary.bestAcc}%`,
      `Average Accuracy:   ${summary.avgAcc}%`,
      `Total Practice:     ${practiceStr}`,
      `Characters Typed:   ${summary.totalChars}`,
      `Total Errors:       ${summary.totalErrs}`,
      '',
      '----------- RECENT TESTS -----------',
      ...records.slice(0, 15).map((r, i) =>
        `${i + 1}. ${r.date} ${r.time} | ${r.lesson || 'Practice'} | ${r.wpm} WPM | ${r.accuracy}%`
      ),
      '',
      '    Generated by Typing Master',
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `typing-report-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
          <View style={styles.headerText}>
            <Text style={styles.title}>Statistics</Text>
            <Text style={styles.subtitle}>Your complete typing history at a glance</Text>
          </View>
          {summary.total > 0 && (
            <TouchableOpacity style={styles.exportBtn} onPress={exportReport} activeOpacity={0.75}>
              <Ionicons name="download" size={15} color={COLORS.cyan} />
              <Text style={styles.exportText}>Export</Text>
            </TouchableOpacity>
          )}
        </View>

        {summary.total === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="bar-chart-outline" size={44} color={COLORS.textDim} />
            <Text style={styles.emptyTitle}>No data yet</Text>
            <Text style={styles.emptySub}>Complete a lesson or test to start building your statistics.</Text>
          </View>
        ) : (
          <>
            <View style={styles.kpiGrid}>
              <KpiCard icon="documents" label="Total Tests" value={summary.total} color={COLORS.blue} />
              <KpiCard icon="trophy" label="Best WPM" value={summary.bestWpm} color={COLORS.amber} />
              <KpiCard icon="speedometer" label="Average WPM" value={summary.avgWpm} color={COLORS.cyan} />
              <KpiCard icon="checkmark-circle" label="Best Accuracy" value={`${summary.bestAcc}%`} color={COLORS.green} />
              <KpiCard icon="locate" label="Average Accuracy" value={`${summary.avgAcc}%`} color={COLORS.teal} />
              <KpiCard icon="time" label="Practice Time" value={practiceStr} color={COLORS.purple} />
              <KpiCard icon="keypad" label="Characters Typed" value={summary.totalChars.toLocaleString()} color={COLORS.blueBright} />
              <KpiCard icon="warning" label="Total Errors" value={summary.totalErrs} color={COLORS.rose} />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>WPM Progress</Text>
              <Text style={styles.chartSub}>Last {records.length > 12 ? 12 : records.length} sessions</Text>
              <BarChart data={wpmChart} color="#14b8a6" />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Accuracy Progress</Text>
              <Text style={styles.chartSub}>Last {records.length > 12 ? 12 : records.length} sessions</Text>
              <BarChart data={accChart} color="#22c55e" />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Practice Time (last 7 days)</Text>
              <Text style={styles.chartSub}>Minutes per day</Text>
              <BarChart data={weekly} color="#0e7490" />
            </View>

            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Recent Tests</Text>
              <View style={styles.table}>
                <View style={[styles.tableRow, styles.tableHeader]}>
                  <Text style={[styles.tableCell, styles.tableHeadText, { flex: 2 }]}>Lesson</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>WPM</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Acc</Text>
                  <Text style={[styles.tableCell, styles.tableHeadText]}>Time</Text>
                </View>
                {records.slice(0, 10).map((r, i) => (
                  <View key={i} style={[styles.tableRow, i % 2 === 1 && styles.tableRowAlt]}>
                    <Text style={[styles.tableCell, styles.tableLesson, { flex: 2 }]} numberOfLines={1}>
                      {r.lesson || 'Practice'}
                    </Text>
                    <Text style={[styles.tableCell, { color: COLORS.blueBright }]}>{r.wpm || 0}</Text>
                    <Text style={[styles.tableCell, { color: COLORS.green }]}>{r.accuracy || 0}%</Text>
                    <Text style={[styles.tableCell, { color: COLORS.textMuted }]}>{r.timeTaken || r.lessonTime || 0}s</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 1180,
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
  headerText: { flex: 1 },
  title: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  exportBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.12)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  exportText: { color: COLORS.cyan, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 8 },
  kpi: {
    flex: 1, minWidth: 140, maxWidth: '100%',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 14, padding: 13, overflow: 'hidden',
  },
  kpiTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  kpiIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  kpiValue: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 22, flexShrink: 1, textAlign: 'center' },
  kpiLabel: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 11, marginTop: 8, flexShrink: 1, textAlign: 'center' },
  kpiSub: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textDim, fontSize: 10, marginTop: 1, flexShrink: 1, textAlign: 'center' },

  chartCard: {
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 16, padding: 16, marginTop: 12,
  },
  chartTitle: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 15 },
  chartSub: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 11.5, marginBottom: 14 },
  chartLabel: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 9, marginTop: 5 },

  table: {
    borderRadius: 10, overflow: 'hidden',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 9 },
  tableHeader: { backgroundColor: 'rgba(59,130,246,0.15)' },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.03)' },
  tableCell: { flex: 1, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12, color: COLORS.textLight },
  tableHeadText: { fontSize: 10.5, color: COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 0.6 },
  tableLesson: { color: COLORS.textLight },

  empty: { alignItems: 'center', paddingVertical: 70 },
  emptyTitle: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 18, marginTop: 14 },
  emptySub: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 13, marginTop: 5, textAlign: 'center' },
});