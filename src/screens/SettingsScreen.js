// src/screens/SettingsScreen.js
// Settings: live toggles persisted to settings state (antriksh_settings), plus data management.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS } from '../theme';

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

const FONT_SIZES = [18, 20, 22, 24, 26];

function Toggle({ value, onChange }) {
  return (
    <TouchableOpacity
      style={[styles.toggleTrack, value && styles.toggleTrackOn]}
      onPress={() => onChange(!value)}
      activeOpacity={0.8}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbOn]} />
    </TouchableOpacity>
  );
}

export default function SettingsScreen({
  studentName,
  settings = {},
  onChangeSetting,
  practiceTimeSec = 300,
  onChangePracticeTime,
  hindiLayout = 'mangal',
  onChangeHindiLayout,
  onSwitchUser,
  onBack,
  onResetAll,
}) {
  const [confirm, setConfirm] = useState(null);
  const [note, setNote] = useState(null);

  const flash = (msg) => {
    setNote(msg);
    setTimeout(() => setNote(null), 2200);
  };

  const clearHistory = async () => {
    try { await AsyncStorage.removeItem(getHistoryKey(studentName)); } catch {}
    setConfirm(null);
    flash('Typing history cleared');
  };

  const resetProgress = async () => {
    try { await AsyncStorage.multiRemove([getUnlockedKey(studentName), getCourseKey(studentName)]); } catch {}
    setConfirm(null);
    flash('Lesson progress reset');
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
        <TouchableOpacity style={styles.dataRow} onPress={() => setConfirm(active ? null : id)} activeOpacity={0.75}>
          <View style={[styles.dataIcon, { backgroundColor: color + '22' }]}>
            <Ionicons name={icon} size={17} color={color} />
          </View>
          <View style={styles.dataInfo}>
            <Text style={styles.dataTitle}>{title}</Text>
            <Text style={styles.dataSub}>{sub}</Text>
          </View>
          <Ionicons name={active ? 'chevron-up' : 'chevron-down'} size={16} color={COLORS.textMuted} />
        </TouchableOpacity>
        {active && (
          <View style={styles.confirmRow}>
            <TouchableOpacity style={[styles.confirmBtn, { borderColor: color }]} onPress={onConfirm} activeOpacity={0.85}>
              <Ionicons name="checkmark" size={15} color={color} />
              <Text style={[styles.confirmBtnText, { color }]}>Confirm</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirm(null)} activeOpacity={0.85}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  const set = (key, value) => onChangeSetting && onChangeSetting(key, value);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={18} color={COLORS.textWhite} />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Settings</Text>
            <Text style={styles.headerSub}>Customise your typing experience</Text>
          </View>
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
              <Ionicons name="person" size={24} color="#fff" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{studentName || 'Guest'}</Text>
              <Text style={styles.profileSub}>Typing Student</Text>
            </View>
            {onSwitchUser && (
              <TouchableOpacity style={styles.switchBtn} onPress={onSwitchUser} activeOpacity={0.8}>
                <Ionicons name="people" size={14} color={COLORS.cyan} />
                <Text style={styles.switchBtnText}>Switch</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Typing Preferences */}
        <Text style={styles.sectionTitle}>Typing</Text>
        <View style={styles.card}>
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="musical-notes" size={17} color={COLORS.amber} /></View>
            <View style={styles.settingInfo}>
              <Text style={styles.dataTitle}>Keyboard sound</Text>
              <Text style={styles.dataSub}>Play a click sound on every key press</Text>
            </View>
            <Toggle value={settings.keyboardSound !== false} onChange={(v) => set('keyboardSound', v)} color={COLORS.amber} />
          </View>

          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="keypad" size={17} color={COLORS.teal} /></View>
            <View style={styles.settingInfo}>
              <Text style={styles.dataTitle}>Virtual keyboard</Text>
              <Text style={styles.dataSub}>Show the on-screen keyboard with finger guides</Text>
            </View>
            <Toggle value={settings.virtualKeyboard !== false} onChange={(v) => set('virtualKeyboard', v)} color={COLORS.teal} />
          </View>

          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="hand-left" size={17} color={COLORS.blue} /></View>
            <View style={styles.settingInfo}>
              <Text style={styles.dataTitle}>Finger guide</Text>
              <Text style={styles.dataSub}>Show which finger to use for the next key</Text>
            </View>
            <Toggle value={settings.fingerGuide === true} onChange={(v) => set('fingerGuide', v)} color={COLORS.blue} />
          </View>

          <View style={styles.divider} />
          <View style={styles.settingRow}>
            <View style={styles.settingIcon}><Ionicons name="flash" size={17} color={COLORS.purple} /></View>
            <View style={styles.settingInfo}>
              <Text style={styles.dataTitle}>Highlight next key</Text>
              <Text style={styles.dataSub}>Highlight the next key on the virtual keyboard</Text>
            </View>
            <Toggle value={settings.nextKeyHighlight !== false} onChange={(v) => set('nextKeyHighlight', v)} color={COLORS.purple} />
          </View>
        </View>

        {/* Text size */}
        <Text style={styles.sectionTitle}>Text Size</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dataTitle}>Practice text size</Text>
              <Text style={styles.dataSub}>Bigger text is easier to follow while typing</Text>
            </View>
            <Ionicons name="text" size={18} color={COLORS.cyan} />
          </View>
          <View style={styles.segment}>
            {FONT_SIZES.map((s) => {
              const sel = (settings.fontSize || 22) === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.segmentItem, sel && { backgroundColor: COLORS.cyan + '22', borderColor: COLORS.cyan }]}
                  onPress={() => set('fontSize', s)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.segmentText, sel && { color: COLORS.cyan }, { fontSize: s * 0.7 }]}>A</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Practice */}
        <Text style={styles.sectionTitle}>Practice</Text>
        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.dataTitle}>Test duration</Text>
              <Text style={styles.dataSub}>Default duration for daily practice sessions</Text>
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
                  <Text style={[styles.segmentText, sel && { color: COLORS.amber }]}>{d.label}</Text>
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
              <Text style={styles.dataSub}>Keyboard layout used for Hindi lessons</Text>
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
                  <Text style={[styles.segmentText, sel && { color: COLORS.teal }]}>{d.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.layoutHint}>
            {hindiLayout === 'krutidev'
              ? 'Type using the Kruti Dev (Remington) layout — the app converts it to Unicode Devanagari (Mangal) automatically.'
              : 'Type using a normal Unicode Devanagari keyboard (Mangal), like the standard Hindi keyboard.'}
          </Text>
        </View>

        {/* Data & Storage */}
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        <View style={styles.card}>
          {renderDataRow('history', 'time-outline', COLORS.teal, 'Clear typing history', 'Remove all saved test results', clearHistory)}
          {renderDataRow('progress', 'refresh-outline', COLORS.amber, 'Reset lesson progress', 'Re-unlock all lessons', resetProgress)}
          {renderDataRow('all', 'trash-outline', COLORS.red, 'Reset all data', 'Name, progress and history — everything', resetAll)}
        </View>

        {/* About */}
        <Text style={styles.sectionTitle}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <View style={styles.aboutLogo}>
              <Ionicons name="keypad" size={22} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileSub}>Version {APP_VERSION}</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            Learn typing with lessons, games and speed tests — English and Hindi.
          </Text>
        </View>

        <View style={{ height: 28 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  scroll: {
    padding: 16,
    width: '100%',
    maxWidth: 760,
    alignSelf: 'center',
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, marginTop: 4 },
  backIconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    marginRight: 12,
  },
  headerText: { flex: 1 },
  headerTitle: { color: COLORS.textWhite, fontSize: 22, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  headerSub: { color: COLORS.textMuted, fontSize: 11.5, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: 1 },

  noteBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.green + '1c', borderWidth: 1, borderColor: COLORS.green + '55',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 8,
  },
  noteText: { color: COLORS.green, fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  sectionTitle: {
    color: COLORS.textMuted, fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700',
    letterSpacing: 1.5, textTransform: 'uppercase',
    marginTop: 18, marginBottom: 8,
  },
  card: {
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderRadius: 16, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    padding: 14,
  },

  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 52, height: 52, borderRadius: 26,
    backgroundColor: '#0e9488', alignItems: 'center', justifyContent: 'center',
  },
  profileInfo: { flex: 1, marginLeft: 12 },
  profileName: { color: COLORS.textWhite, fontSize: 17, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  profileSub: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'Poppins_700Bold', fontWeight: '700', marginTop: 2 },
  switchBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.cyan + '50',
    backgroundColor: COLORS.cyan + '15', paddingHorizontal: 10, paddingVertical: 7,
  },
  switchBtnText: { color: COLORS.cyan, fontSize: 11, fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  settingIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.05)', alignItems: 'center', justifyContent: 'center',
  },
  settingInfo: { flex: 1 },
  divider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: 12 },

  toggleTrack: {
    width: 46, height: 26, borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    justifyContent: 'center',
  },
  toggleTrackOn: {
    backgroundColor: 'rgba(34,197,94,0.45)',
    borderColor: '#22c55e',
  },
  toggleThumb: {
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.textMuted, marginLeft: 2,
  },
  toggleThumbOn: {
    backgroundColor: '#22c55e',
    marginLeft: 24,
  },

  rowBetween: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  segment: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  segmentItem: {
    flex: 1, minWidth: 48,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: 10,
  },
  segmentText: { color: COLORS.textWhite, fontSize: 13, fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  dataRowWrap: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.07)', paddingTop: 10, marginTop: 10 },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  dataIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  dataInfo: { flex: 1 },
  dataTitle: { color: COLORS.textWhite, fontSize: 14, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  dataSub: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: 2 },
  layoutHint: { color: COLORS.textMuted, fontSize: 11, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: 10, lineHeight: 16 },

  confirmRow: { flexDirection: 'row', gap: 8, marginTop: 10, marginLeft: 46 },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 10, borderWidth: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  confirmBtnText: { fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  cancelBtn: {
    borderRadius: 10, borderWidth: 1.5, borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingHorizontal: 14, paddingVertical: 8,
  },
  cancelBtnText: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  aboutRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  aboutLogo: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: COLORS.cyan, alignItems: 'center', justifyContent: 'center',
  },
  aboutText: {
    color: COLORS.textMuted, fontSize: 12, fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    marginTop: 12, lineHeight: 18,
  },
});