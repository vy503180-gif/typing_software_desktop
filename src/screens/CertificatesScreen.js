// src/screens/CertificatesScreen.js
// Achievement certificates based on real typing statistics.

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, COLORS } from '../theme';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

const CERT_DEFS = [
  { id: 'beginner', name: 'Beginner Typist', icon: 'leaf', color: COLORS.green, req: (s) => s.bestWpm >= 15, desc: 'Reach 15 WPM in any test' },
  { id: 'learning', name: 'Learning Typist', icon: 'school', color: COLORS.teal, req: (s) => s.bestWpm >= 25, desc: 'Reach 25 WPM in any test' },
  { id: 'intermediate', name: 'Intermediate Typist', icon: 'book', color: COLORS.blue, req: (s) => s.bestWpm >= 35, desc: 'Reach 35 WPM in any test' },
  { id: 'advanced', name: 'Advanced Typist', icon: 'rocket', color: COLORS.purple, req: (s) => s.bestWpm >= 50, desc: 'Reach 50 WPM in any test' },
  { id: 'speed', name: 'Speed Expert', icon: 'flash', color: COLORS.amber, req: (s) => s.bestWpm >= 70, desc: 'Reach 70 WPM in any test' },
  { id: 'accuracy', name: 'Accuracy Champion', icon: 'locate', color: COLORS.rose, req: (s) => s.bestAcc >= 97, desc: 'Score 97%+ accuracy in any test' },
];

export default function CertificatesScreen({ studentName = '', onBack }) {
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
    const wpmArr = records.map((r) => r.wpm || 0);
    const accArr = records.map((r) => r.accuracy || 0);
    return {
      total: records.length,
      bestWpm: wpmArr.length ? Math.max(...wpmArr) : 0,
      bestAcc: accArr.length ? Math.max(...accArr) : 0,
    };
  }, [records]);

  const certs = useMemo(() => {
    return CERT_DEFS.map((c) => {
      const earned = c.req(summary);
      let date = null;
      if (earned) {
        const rec = records.find((r) => (c.id === 'accuracy' ? (r.accuracy || 0) >= 97 : (r.wpm || 0) >= (c.id === 'beginner' ? 15 : c.id === 'learning' ? 25 : c.id === 'intermediate' ? 35 : c.id === 'advanced' ? 50 : 70)));
        date = rec ? rec.date : null;
      }
      return { ...c, earned, date };
    });
  }, [summary, records]);

  const earnedCount = certs.filter((c) => c.earned).length;

  const printCert = (c) => {
    if (Platform.OS !== 'web') return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><title>${c.name} — Typing Master</title>
      <style>
        body{font-family:Georgia,serif;background:#fff;color:#0f172a;display:flex;justify-content:center;align-items:center;min-height:100vh;margin:0}
        .cert{width:820px;border:14px double #14b8a6;padding:46px;text-align:center}
        .badge{font-size:60px}
        h1{color:#0e9488;font-size:30px;letter-spacing:6px;margin:12px 0 4px}
        h2{font-size:38px;margin:18px 0 4px}
        .name{font-size:30px;color:#0d9488;border-bottom:2px solid #14b8a6;display:inline-block;padding:0 30px 6px}
        .sub{margin:18px 0;font-size:17px;color:#475569}
        .detail{font-size:14px;color:#64748b;margin-top:22px}
      </style></head><body>
      <div class="cert">
        <div class="badge">🏆</div>
        <h1>TYPING MASTER</h1>
        <h2>${c.name}</h2>
        <div class="sub"></div>
        <div>This certificate is proudly presented to</div>
        <div class="name">${studentName}</div>
        <div class="sub">for achieving ${c.desc} at the ${summary.bestWpm} WPM level with ${summary.bestAcc}% best accuracy.</div>
        <div class="detail">Awarded on ${new Date().toLocaleDateString()} • Typing Master App</div>
      </div>
      <script>window.print()</script></body></html>`);
    w.document.close();
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
            <Text style={styles.title}>Certificates</Text>
            <Text style={styles.subtitle}>Earned achievements based on your results</Text>
          </View>
          <View style={styles.countBadge}>
            <Ionicons name="ribbon" size={14} color={COLORS.amber} />
            <Text style={styles.countText}>{earnedCount}/{certs.length}</Text>
          </View>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: COLORS.blueBright }]}>{summary.bestWpm}</Text>
            <Text style={styles.summaryLabel}>Best WPM</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: COLORS.green }]}>{summary.bestAcc}%</Text>
            <Text style={styles.summaryLabel}>Best Accuracy</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: COLORS.amber }]}>{summary.total}</Text>
            <Text style={styles.summaryLabel}>Tests Taken</Text>
          </View>
        </View>

        <View style={styles.grid}>
          {certs.map((c) => (
            <View
              key={c.id}
              style={[
                styles.certCard,
                c.earned ? { borderColor: c.color + '66', backgroundColor: c.color + '12' } : styles.certCardLocked,
              ]}
            >
              <View style={[styles.certIcon, { backgroundColor: c.earned ? c.color : 'rgba(255,255,255,0.06)' }]}>
                <Ionicons name={c.earned ? c.icon : 'lock-closed'} size={26} color={c.earned ? '#fff' : COLORS.textDim} />
              </View>
              <Text style={[styles.certName, !c.earned && { color: COLORS.textDim }]}>{c.name}</Text>
              <Text style={styles.certDesc}>{c.desc}</Text>
              {c.earned ? (
                <>
                  <View style={[styles.earnedTag, { backgroundColor: c.color + '22', borderColor: c.color + '66' }]}>
                    <Ionicons name="checkmark-circle" size={13} color={c.color} />
                    <Text style={[styles.earnedTagText, { color: c.color }]}>
                      {c.date ? `Earned ${c.date}` : 'Earned'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.printBtn} onPress={() => printCert(c)} activeOpacity={0.8}>
                    <Ionicons name="print" size={15} color={COLORS.cyan} />
                    <Text style={styles.printText}>View Certificate</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={styles.lockHint}>Keep practising to unlock</Text>
              )}
            </View>
          ))}
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
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerText: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  countText: { color: COLORS.amber, fontFamily: 'Calibri', fontWeight: '700', fontSize: 12.5 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryItem: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 14, padding: 14,
  },
  summaryVal: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 26 },
  summaryLabel: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 11, marginTop: 2 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  certCard: {
    flex: 1, minWidth: 250,
    alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    borderRadius: 16, padding: 20,
  },
  certCardLocked: { opacity: 0.6 },
  certIcon: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  certName: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 17, textAlign: 'center' },
  certDesc: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 11.5, textAlign: 'center', marginTop: 5 },
  earnedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginTop: 12,
  },
  earnedTagText: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 11 },
  printBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.12)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
  },
  printText: { color: COLORS.cyan, fontFamily: 'Calibri', fontWeight: '700', fontSize: 12 },
  lockHint: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textDim, fontSize: 11.5, marginTop: 12 },
});