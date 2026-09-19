// src/screens/SettingsScreen.js
// Settings screen:
// Profile, practice duration, data/storage management aur app info.

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const APP_VERSION = '1.0.0';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;
const getUnlockedKey = (name) => `antriksh_unlocked_lessons_${name || 'default'}`;
const getCourseKey = (name) => `antriksh_course_progress_${name || 'default'}`;

const DURATIONS = [
  { label: '1 min', value: 60 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
];

const HINDI_LAYOUTS = [
  { label: 'Mangal', value: 'mangal' },
  { label: 'Kruti Dev', value: 'krutidev' },
];

export default function SettingsScreen({
  studentName,
  practiceTimeSec = 300,
  onChangePracticeTime,
  hindiLayout = 'mangal',
  onChangeHindiLayout,
  onSwitchUser,
  onBack,
  onResetAll,
}) {
  const [confirm, setConfirm] = useState(null); // 'history' | 'progress' | 'all'
  const [note, setNote] = useState(null);

  const flash = (msg) => {
    setNote(msg);
    setTimeout(() => setNote(null), 2200);
  };

  const clearHistory = async () => {
    try {
      await AsyncStorage.removeItem(getHistoryKey(studentName));
    } catch {}
    setConfirm(null);
    flash('Typing history clear ho gayi');
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.multiRemove([
        getUnlockedKey(studentName),
        getCourseKey(studentName),
      ]);
    } catch {}
    setConfirm(null);
    flash('Lesson progress reset ho gayi');
  };

  const resetAll = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const appKeys = (keys || []).filter((k) => k.startsWith('antriksh_'));
      await AsyncStorage.multiRemove(appKeys);
    } catch {}
    setConfirm(null);
    if (onResetAll) onResetAll();
  };

  const renderDataRow = (id, icon, color, title, sub, onConfirm) => {
    const active = confirm === id;
    return (
      <View key={id} style={styles.dataRowWrap}>
        <TouchableOpacity
          style={styles.dataRow}
          onPress={() => setConfirm(active ? null : id)}
          activeOpacity={0.75}
        >
          <View style={[styles.dataIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={17} color={color} />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataTitle}>{title}</Text>
            <Text style={styles.dataSub}>{sub}</Text>
          </View>
          <Ionicons
            name={active ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={COLORS.textMuted}
          />
        </TouchableOpacity>

        {active && (
          <View style={styles.confirmRow}>
            <TouchableOpacity
              style={[styles.confirmBtn, { borderColor: color }]}
              onPress={onConfirm}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={15} color={color} />
              <Text style={[styles.confirmBtnText, { color }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setConfirm(null)}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Ionicons name="settings" size={20} color={COLORS.teal} />
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={styles.headerSpacer} />
          </View>

          {note && (
            <View style={styles.noteBar}>
              <Ionicons name="checkmark-circle" size={15} color={COLORS.green} />
              <Text style={styles.noteText}>{note}</Text>
            </View>
          )}

          {/* Profile */}
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.card}>
            <View style={styles.profileRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={26} color="#fff" />
              </View>
              <View style={styles.profileInfo}>
                <Text style={styles.profileName}>{studentName || 'Guest'}</Text>
                <Text style={styles.profileSub}>Typing Master student</Text>
              </View>
              {onSwitchUser && (
                <TouchableOpacity style={styles.switchBtn} onPress={onSwitchUser} activeOpacity={0.8}>
                  <Ionicons name="people" size={14} color={COLORS.teal} />
                  <Text style={styles.switchBtnText}>Switch</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Practice */}
          <Text style={styles.sectionTitle}>Practice</Text>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dataTitle}>Test duration</Text>
                <Text style={styles.dataSub}>Start Typing par kitne der ka test ho</Text>
              </View>
              <Ionicons name="timer-outline" size={18} color={COLORS.amber} />
            </View>
            <View style={styles.segment}>
              {DURATIONS.map((d) => {
                const sel = practiceTimeSec === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.segmentItem, sel && { backgroundColor: COLORS.amber + '22', borderColor: COLORS.amber }]}
                    onPress={() => onChangePracticeTime && onChangePracticeTime(d.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentText, sel && { color: COLORS.amber }]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Hindi Typing */}
          <Text style={styles.sectionTitle}>Hindi Typing</Text>
          <View style={styles.card}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.dataTitle}>Typing layout</Text>
                <Text style={styles.dataSub}>Hindi lessons kaunse keyboard layout se type karein</Text>
              </View>
              <Ionicons name="keypad-outline" size={18} color={COLORS.teal} />
            </View>
            <View style={styles.segment}>
              {HINDI_LAYOUTS.map((d) => {
                const sel = hindiLayout === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.segmentItem, sel && { backgroundColor: COLORS.teal + '22', borderColor: COLORS.teal }]}
                    onPress={() => onChangeHindiLayout && onChangeHindiLayout(d.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentText, sel && { color: COLORS.teal }]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.layoutHint}>
              {hindiLayout === 'krutidev'
                ? 'Kruti Dev keyboard se type karo, app use Unicode Devanagari me badal dega (display Mangal me).'
                : 'Normal Unicode (Mangal) keyboard se type karo - jaise phone/computer ka Hindi keyboard.'}
            </Text>
          </View>

          {/* Data & Storage */}
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={styles.card}>
            {renderDataRow(
              'history',
              'time-outline',
              COLORS.teal,
              'Clear typing history',
              'Pichhle saare test results hata do',
              clearHistory
            )}
            {renderDataRow(
              'progress',
              'refresh-outline',
              COLORS.amber,
              'Reset lesson progress',
              'Lessons dobara pehle se unlock karne ke liye',
              resetProgress
            )}
            {renderDataRow(
              'all',
              'trash-outline',
              COLORS.red,
              'Reset all data',
              'Naam, progress aur history sab delete',
              resetAll
            )}
          </View>

          {/* About */}
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.card}>
            <View style={styles.aboutRow}>
              <View style={styles.aboutLogo}>
                <Text style={styles.aboutLogoLetter}>T</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.profileName}>Typing Master</Text>
                <Text style={styles.profileSub}>Version {APP_VERSION}</Text>
              </View>
            </View>
            <Text style={styles.aboutText}>
              Practice lessons, games aur speed tests ke saath typing seekho.
            </Text>
          </View>

          <View style={{ height: scaleSize(30) }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  scroll: {
    padding: scaleSize(16),
    width: '100%',
    maxWidth: IS_DESKTOP ? CONTENT_MAX_WIDTH : scaleSize(640),
    alignSelf: 'center'
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(9),
    marginTop: scaleSize(6),
    marginBottom: scaleSize(6),
  },
  backIconBtn: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: scaleSize(17),
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  headerTitle: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(20),
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  headerSpacer: { flex: 1 },

  noteBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(6),
    backgroundColor: COLORS.green + '1c',
    borderWidth: 1,
    borderColor: COLORS.green + '55',
    borderRadius: scaleSize(10),
    paddingHorizontal: scaleSize(12),
    paddingVertical: scaleSize(8),
    marginTop: scaleSize(8),
  },
  noteText: { color: COLORS.green, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },

  sectionTitle: {
    color: COLORS.textMuted,
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginTop: scaleSize(18),
    marginBottom: scaleSize(8),
  },
  card: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: scaleSize(14),
  },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: scaleSize(52),
    height: scaleSize(52),
    borderRadius: scaleSize(26),
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1, marginLeft: scaleSize(12) },
  profileName: { color: COLORS.textWhite, fontSize: scaleFont(17), fontFamily: 'Calibri', fontWeight: '700' },
  profileSub: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(5),
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: COLORS.teal + '50',
    backgroundColor: COLORS.teal + '15',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(7),
  },
  switchBtnText: { color: COLORS.teal, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700' },

  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10) },
  segment: {
    flexDirection: 'row',
    gap: scaleSize(8),
    marginTop: scaleSize(12),
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: scaleSize(10),
  },
  segmentText: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },

  dataRowWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.07)',
    paddingTop: scaleSize(10),
    marginTop: scaleSize(10),
  },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10) },
  dataIcon: {
    width: scaleSize(36),
    height: scaleSize(36),
    borderRadius: scaleSize(10),
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataInfo: { flex: 1 },
  dataTitle: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700' },
  dataSub: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },
  layoutHint: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(10), lineHeight: scaleFont(16) },

  confirmRow: {
    flexDirection: 'row',
    gap: scaleSize(8),
    marginTop: scaleSize(10),
    marginLeft: scaleSize(46),
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(5),
    borderRadius: scaleSize(10),
    borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
  },
  confirmBtnText: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },
  cancelBtn: {
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
  },
  cancelBtnText: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },

  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(12) },
  aboutLogo: {
    width: scaleSize(46),
    height: scaleSize(46),
    borderRadius: scaleSize(23),
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aboutLogoLetter: { color: '#fff', fontSize: scaleFont(22), fontFamily: 'Calibri', fontWeight: '700' },
  aboutText: {
    color: COLORS.textMuted,
    fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(12),
    lineHeight: scaleFont(18),
  },
});
