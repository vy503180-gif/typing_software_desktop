// src/screens/InfoScreen.js
// Information screen: App info, usage guide, typing tips

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const APP_VERSION = '1.0.0';

const TIPS = [
  { icon: 'finger-print', color: COLORS.teal, title: 'Home Row rakho', desc: 'ASDF aur JKL; fingers hamesha home row par rakho — aankhein keyboard par nahi, screen par honi chahiye.' },
  { icon: 'eye', color: COLORS.amber, title: 'Dekh ke mat type karo', desc: 'Keyboard mat dekho. Shuru me galat hoga, lekin practice se muscle memory ban jayegi.' },
  { icon: 'speedometer', color: COLORS.green, title: 'Pehle accuracy, phir speed', desc: 'Ghabrao mat speed ke peeche — pehle sahi type karo, speed apne aap badhegi.' },
  { icon: 'time', color: COLORS.rose, title: 'Roz 15-20 min practice', desc: 'Regular practice sabse important hai. Roz thoda karo, ek din me bahut mat karo.' },
  { icon: 'hand-left', color: COLORS.teal, title: 'Posture sahi rakho', desc: 'Seedhe baitho, back support ho, screen aankhon se 50cm door ho. Wrist straight rakho.' },
  { icon: 'keypad', color: COLORS.amber, title: 'Shift key sahi use karo', desc: 'Uppercase letter ke liye opposite hand ka Shift dabao — left hand se right Shift, right se left Shift.' },
];

const HOW_TO_USE = [
  { step: 1, icon: 'person', color: COLORS.teal, text: 'Pehle apna naam daalo — ya existing user select karo.' },
  { step: 2, icon: 'book', color: COLORS.green, text: 'Home se Course ya Lessons kholo — English ya Hindi choose karo.' },
  { step: 3, icon: 'play', color: COLORS.amber, text: 'Lesson select karo — locked lessons unlock hote jayenge.' },
  { step: 4, icon: 'create', color: COLORS.rose, text: 'Text par tap karke type karo — sahi green, galat red dikhega.' },
  { step: 5, icon: 'trophy', color: COLORS.amber, text: 'Test complete karo — WPM aur Accuracy dikhega. History me save hoga.' },
];

const FEATURES = [
  { icon: 'book', color: COLORS.teal, title: '30 English + 5 Hindi Lessons', sub: 'Easy se Hard tak, step by step' },
  { icon: 'trophy', color: COLORS.amber, title: 'Course Mode', sub: 'Structured path se seekho, unlock system' },
  { icon: 'flash', color: COLORS.green, title: 'Speed Test', sub: 'Quick test se apna WPM check karo' },
  { icon: 'game-controller', color: COLORS.rose, title: '5 Games', sub: 'Alphabet, Bubbles, Clouds, WordTris, Words' },
  { icon: 'star', color: COLORS.amber, title: 'Review Mode', sub: 'Galat words ko practice karo' },
  { icon: 'compass', color: COLORS.teal, title: 'Explore', sub: 'Keyboard guide, Daily challenge, Best scores' },
  { icon: 'stats-chart', color: COLORS.green, title: 'Statistics', sub: 'Detailed progress reports download karo' },
  { icon: 'settings', color: COLORS.textMuted, title: 'Settings', sub: 'Practice duration, Hindi layout, data manage' },
];

function InfoSection({ icon, color, title, children }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIcon, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

export default function InfoScreen({ onBack }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Information</Text>
            <Text style={styles.subtitle}>App ke baare me jaano</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>
          {/* App Info Card */}
          <View style={styles.appInfoCard}>
            <View style={styles.logo}>
              <Text style={styles.logoLetter}>T</Text>
            </View>
            <Text style={styles.appVersion}>Version {APP_VERSION}</Text>
            <Text style={styles.appDesc}>
              Typing seekho English aur Hindi me — lessons, games, speed tests aur detailed statistics ke saath.
            </Text>
          </View>

          {/* Features */}
          <InfoSection icon="star" color={COLORS.amber} title="Features">
            {FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + '18' }]}>
                  <Ionicons name={f.icon} size={16} color={f.color} />
                </View>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{f.title}</Text>
                  <Text style={styles.featureSub}>{f.sub}</Text>
                </View>
              </View>
            ))}
          </InfoSection>

          {/* How to Use */}
          <InfoSection icon="rocket" color={COLORS.green} title="Kaise Use Karein">
            {HOW_TO_USE.map((h) => (
              <View key={h.step} style={styles.stepRow}>
                <View style={[styles.stepNum, { backgroundColor: h.color + '22' }]}>
                  <Text style={[styles.stepNumText, { color: h.color }]}>{h.step}</Text>
                </View>
                <View style={[styles.stepIcon, { backgroundColor: h.color + '18' }]}>
                  <Ionicons name={h.icon} size={14} color={h.color} />
                </View>
                <Text style={styles.stepText}>{h.text}</Text>
              </View>
            ))}
          </InfoSection>

          {/* Typing Tips */}
          <InfoSection icon="bulb" color={COLORS.amber} title="Typing Tips">
            {TIPS.map((t, i) => (
              <View key={i} style={styles.tipRow}>
                <View style={[styles.tipIcon, { backgroundColor: t.color + '18' }]}>
                  <Ionicons name={t.icon} size={16} color={t.color} />
                </View>
                <View style={styles.tipInfo}>
                  <Text style={styles.tipTitle}>{t.title}</Text>
                  <Text style={styles.tipDesc}>{t.desc}</Text>
                </View>
              </View>
            ))}
          </InfoSection>

          {/* Hindi Typing Info */}
          <InfoSection icon="language" color={COLORS.teal} title="Hindi Typing">
            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Hindi typing ke liye 2 layout available hain:
              </Text>
              <View style={styles.layoutInfo}>
                <Text style={styles.layoutName}>Mangal (Unicode)</Text>
                <Text style={styles.layoutDesc}>Normal Hindi keyboard — jaise phone/computer ka Hindi input.</Text>
              </View>
              <View style={styles.layoutInfo}>
                <Text style={[styles.layoutName, { color: COLORS.amber }]}>Kruti Dev 010</Text>
                <Text style={styles.layoutDesc}>Legacy Remington keyboard — app ASCII keys ko Unicode me convert karta hai automatically.</Text>
              </View>
              <Text style={styles.infoText}>
                Layout choose karne ke liye: Lessons → Hindi tab → Typing Layout selector, ya Settings → Hindi Typing.
              </Text>
            </View>
          </InfoSection>

          {/* Shortcuts */}
          <InfoSection icon="keypad" color={COLORS.rose} title="Handy Shortcuts">
            <View style={styles.shortcutGrid}>
              {[
                { key: 'Space', use: 'Naya word' },
                { key: 'Backspace', use: 'Pichla char delete' },
                { key: 'Shift + A-Z', use: 'Uppercase letter' },
                { key: 'Enter', use: 'Naya line / submit' },
                { key: 'Tab', use: 'Naya paragraph (practice)' },
              ].map((s, i) => (
                <View key={i} style={styles.shortcutRow}>
                  <View style={styles.shortcutKey}>
                    <Text style={styles.shortcutKeyText}>{s.key}</Text>
                  </View>
                  <Text style={styles.shortcutUse}>{s.use}</Text>
                </View>
              ))}
            </View>
          </InfoSection>

          <View style={{ height: scaleSize(40) }} />
        </ScrollView>
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
    width: scaleSize(38), height: scaleSize(38), borderRadius: scaleSize(19),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(10),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(24) },
  subtitle: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 2 },
  scroll: { paddingBottom: scaleSize(120) },

  // App Info Card
  appInfoCard: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    padding: scaleSize(20), alignItems: 'center', marginBottom: scaleSize(14),
  },
  logo: {
    width: scaleSize(60), height: scaleSize(60), borderRadius: scaleSize(30),
    backgroundColor: COLORS.teal, alignItems: 'center', justifyContent: 'center',
    marginBottom: scaleSize(10),
  },
  logoLetter: { color: '#fff', fontSize: scaleFont(28), fontFamily: 'Calibri', fontWeight: '700' },
  appName: { color: COLORS.textWhite, fontSize: scaleFont(20), fontFamily: 'Calibri', fontWeight: '700' },
  appVersion: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },
  appDesc: { color: COLORS.textLight, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', textAlign: 'center', marginTop: scaleSize(8), lineHeight: scaleFont(18) },

  // Sections
  section: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    padding: scaleSize(14), marginBottom: scaleSize(12),
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10), marginBottom: scaleSize(12) },
  sectionIcon: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(10),
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { color: COLORS.textWhite, fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700' },

  // Features
  featureRow: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(10),
    paddingVertical: scaleSize(8), borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  featureIcon: {
    width: scaleSize(32), height: scaleSize(32), borderRadius: scaleSize(8),
    alignItems: 'center', justifyContent: 'center',
  },
  featureInfo: { flex: 1 },
  featureTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  featureSub: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 1 },

  // How to Use
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginBottom: scaleSize(10) },
  stepNum: {
    width: scaleSize(24), height: scaleSize(24), borderRadius: scaleSize(12),
    alignItems: 'center', justifyContent: 'center',
  },
  stepNumText: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },
  stepIcon: {
    width: scaleSize(28), height: scaleSize(28), borderRadius: scaleSize(8),
    alignItems: 'center', justifyContent: 'center',
  },
  stepText: { flex: 1, color: COLORS.textLight, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', lineHeight: scaleFont(17) },

  // Tips
  tipRow: {
    flexDirection: 'row', gap: scaleSize(10), marginBottom: scaleSize(12),
    paddingBottom: scaleSize(12), borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  tipIcon: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(10),
    alignItems: 'center', justifyContent: 'center', marginTop: 2,
  },
  tipInfo: { flex: 1 },
  tipTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  tipDesc: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2, lineHeight: scaleFont(16) },

  // Hindi Typing
  infoBox: { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: scaleSize(10), padding: scaleSize(12) },
  infoText: { color: COLORS.textLight, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', lineHeight: scaleFont(17) },
  layoutInfo: { marginVertical: scaleSize(8), paddingVertical: scaleSize(8), borderTopWidth: 1, borderTopColor: COLORS.cardBorder, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  layoutName: { color: COLORS.teal, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  layoutDesc: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },

  // Shortcuts
  shortcutGrid: { gap: scaleSize(8) },
  shortcutRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10) },
  shortcutKey: {
    backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: scaleSize(6),
    paddingHorizontal: scaleSize(8), paddingVertical: scaleSize(4),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, minWidth: scaleSize(80), alignItems: 'center',
  },
  shortcutKeyText: { color: COLORS.textWhite, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700' },
  shortcutUse: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },
});
