// src/screens/ProfileScreen.js
// Student profile backed by the actual stored typing history.

import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, SafeAreaView, StatusBar,
  TouchableOpacity, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, COLORS, levelForWpm } from '../theme';
import { certsFromRecords } from '../data/certificates';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export default function ProfileScreen({ studentName = '', onBack, onSwitchUser, onSettings }) {
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

  const stats = useMemo(() => {
    const n = records.length;
    if (n === 0) {
      return { total: 0, bestWpm: 0, avgWpm: 0, bestAcc: 0, avgAcc: 0, totalSec: 0, totalChars: 0, totalErrs: 0 };
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

  const level = useMemo(() => levelForWpm(stats.bestWpm), [stats.bestWpm]);
  const certs = useMemo(() => certsFromRecords(records), [records]);
  const practiceStr = useMemo(() => {
    const h = Math.floor(stats.totalSec / 3600);
    const m = Math.round((stats.totalSec % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  }, [stats.totalSec]);

  const achievements = useMemo(() => certs.filter((c) => c.earned).length, [certs]);

  const weekDays = useMemo(() => {
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

  const recent = records.slice(0, 4);

  const initials = (studentName || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';

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
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Your progress at a glance</Text>
          </View>
          {onSwitchUser && (
            <TouchableOpacity
              style={styles.switchBtn}
              onPress={onSwitchUser}
              activeOpacity={0.75}
            >
              <Ionicons name="swap-horizontal" size={15} color={COLORS.cyan} />
              <Text style={styles.switchText}>Switch User</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Identity card */}
        <View style={styles.banner}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.identity}>
            <Text style={styles.name}>{studentName || 'Guest Student'}</Text>
            <View style={styles.levelRow}>
              <Ionicons name="sparkles" size={14} color={COLORS.amber} />
              <Text style={styles.levelText}>{level ? level.name : 'Beginner'}</Text>
            </View>
          </View>
          <View style={styles.achieveBadge}>
            <Ionicons name="ribbon" size={18} color={COLORS.amber} />
            <Text style={styles.achieveText}>{achievements}/6</Text>
          </View>
        </View>

        {/* Performance KPIs */}
        <Section title="Performance">
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.blueBright }]}>{stats.bestWpm || 0}</Text>
              <Text style={styles.kpiLabel}>Best WPM</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.cyan }]}>{stats.avgWpm || 0}</Text>
              <Text style={styles.kpiLabel}>Average WPM</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.green }]}>{stats.bestAcc || 0}%</Text>
              <Text style={styles.kpiLabel}>Best Accuracy</Text>
            </View>
          </View>
        </Section>

        {/* Effort stats */}
        <Section title="Effort">
          <View style={styles.kpiRow}>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.amber }]}>{stats.total}</Text>
              <Text style={styles.kpiLabel}>Tests Taken</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.purple }]}>{practiceStr}</Text>
              <Text style={styles.kpiLabel}>Practice Time</Text>
            </View>
            <View style={styles.kpi}>
              <Text style={[styles.kpiVal, { color: COLORS.teal }]}>{stats.totalChars.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>Characters</Text>
            </View>
          </View>
        </Section>

        {/* Certificates */}
        <Section title="Certificates">
          <View style={styles.certGrid}>
            {certs.map((c) => (
              <View key={c.id} style={[styles.certTile, c.earned ? { borderColor: c.color + '66', backgroundColor: c.color + '10' } : styles.certTileLocked]}>
                <View style={[styles.certTileIcon, { backgroundColor: c.earned ? c.color : 'rgba(255,255,255,0.06)' }]}>
                  <Ionicons name={c.earned ? c.icon : 'lock-closed'} size={18} color={c.earned ? '#fff' : COLORS.textDim} />
                </View>
                <Text style={[styles.certTileName, !c.earned && { color: COLORS.textDim }]} numberOfLines={1}>
                  {c.name}
                </Text>
                {c.earned && (
                  <Text style={[styles.certTileDate, { color: c.color }]} numberOfLines={1}>
                    {c.date ? c.date : 'Earned'}
                  </Text>
                )}
              </View>
            ))}
          </View>
        </Section>

        {/* Days practiced this week */}
        <Section title="This Week">
          <View style={styles.weekRow}>
            {weekDays.map((d, i) => (
              <View key={i} style={styles.weekCol}>
                <View style={[styles.weekBar, { height: Math.max(4, (d.value / Math.max(...weekDays.map((x) => x.value), 1)) * 46) }]} />
                <Text style={styles.weekLabel}>{d.label}</Text>
                <Text style={styles.weekVal}>{d.value}m</Text>
              </View>
            ))}
          </View>
        </Section>

        {/* Recent activity */}
        <Section title="Recent Activity">
          {recent.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="time-outline" size={26} color={COLORS.textDim} />
              <Text style={styles.emptyText}>No activity yet — take your first test!</Text>
            </View>
          ) : (
            <View style={styles.recentCard}>
              {recent.map((r, i) => (
                <View key={i} style={[styles.recentRow, i < recent.length - 1 && styles.recentRowBorder]}>
                  <View style={styles.recentIcon}>
                    <Ionicons name="document-text" size={16} color={COLORS.blueBright} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.recentTitle} numberOfLines={1}>{r.lesson || 'Practice Session'}</Text>
                    <Text style={styles.recentDate}>{r.date} • {r.time}</Text>
                  </View>
                  <Text style={styles.recentWpm}>{r.wpm || 0} WPM</Text>
                  <Text style={[styles.recentAcc, { color: COLORS.green }]}>{r.accuracy || 0}%</Text>
                </View>
              ))}
            </View>
          )}
        </Section>

        {/* Actions */}
        {onSettings ? (
          <TouchableOpacity style={styles.settingsRow} onPress={onSettings} activeOpacity={0.75}>
            <Ionicons name="settings" size={17} color={COLORS.cyan} />
            <Text style={styles.settingsText}>Open Settings</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: {
    padding: 20,
    paddingBottom: 40,
    maxWidth: 900,
    width: '100%',
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerText: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.12)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  switchText: { color: COLORS.cyan, fontFamily: 'Calibri', fontWeight: '700', fontSize: 12 },

  banner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.navy,
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.45)',
    borderRadius: 18, padding: 20, marginBottom: 14,
  },
  avatar: {
    width: 62, height: 62, borderRadius: 31,
    backgroundColor: '#0e9488', alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#0e9488', shadowOpacity: 0.55, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 6,
  },
  avatarText: { color: '#fff', fontFamily: 'Calibri', fontWeight: '700', fontSize: 24 },
  identity: { flex: 1, marginLeft: 16 },
  name: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 22 },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  levelText: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.amber, fontSize: 13 },
  achieveBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.35)',
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10,
  },
  achieveText: { color: COLORS.amber, fontFamily: 'Calibri', fontWeight: '700', fontSize: 14, marginTop: 2 },

  certGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  certTile: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 13, paddingVertical: 8, paddingHorizontal: 12,
    minWidth: 170, flexGrow: 1, maxWidth: 280,
  },
  certTileLocked: { opacity: 0.55 },
  certTileIcon: {
    width: 30, height: 30, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  certTileName: { flex: 1, fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 12 },
  certTileDate: { fontFamily: 'Calibri', fontWeight: '600', fontSize: 10 },

  section: { marginTop: 6 },
  sectionTitle: {
    fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted,
    fontSize: 11.5, letterSpacing: 1.6, textTransform: 'uppercase',
    marginBottom: 8, marginTop: 12,
  },
  kpiRow: { flexDirection: 'row', gap: 10 },
  kpi: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 14, padding: 16,
  },
  kpiVal: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 24 },
  kpiLabel: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 11, marginTop: 4 },

  weekRow: { flexDirection: 'row', gap: 10 },
  weekCol: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 14, paddingVertical: 14,
  },
  weekBar: { width: 10, borderRadius: 5, backgroundColor: '#0e7490' },
  weekLabel: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 10, marginTop: 8 },
  weekVal: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight, fontSize: 11, marginTop: 2 },

  recentCard: {
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 16, paddingHorizontal: 14,
  },
  recentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 },
  recentRowBorder: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  recentIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: 'rgba(59,130,246,0.15)', alignItems: 'center', justifyContent: 'center',
  },
  recentTitle: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight, fontSize: 12.5 },
  recentDate: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 10.5, marginTop: 1 },
  recentWpm: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.blueBright, fontSize: 13 },
  recentAcc: { fontFamily: 'Calibri', fontWeight: '700', fontSize: 12, width: 44, textAlign: 'right' },

  emptyCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 14, padding: 16,
  },
  emptyText: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: 12.5 },

  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(14,116,144,0.08)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.3)',
    borderRadius: 12, padding: 14, marginTop: 16,
  },
  settingsText: { flex: 1, fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight, fontSize: 13 },
});