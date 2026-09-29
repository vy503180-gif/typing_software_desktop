// src/screens/DeveloperScreen.js
// About the developer + contact & support.

import React, { useState } from 'react';
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
import { Linking } from 'react-native';
import { BG, COLORS, CONTENT_MAX_WIDTH } from '../theme';

// ================= CONFIG (yahan apni details daalo) =================
const DEV = {
  name: 'Vicky Yadav',
  role: 'App Developer',
  email: 'vy503180@gmail.com',
  appName: 'Antriksh Typing Master',
  version: 'v2.0',
};
// =====================================================================

const TECH_STACK = [
  { icon: 'logo-react', color: '#61dafb', title: 'React Native', sub: { en: 'Cross-platform app framework', hi: 'क्रॉस-प्लेटफॉर्म ऐप फ्रेमवर्क' } },
  { icon: 'code-slash', color: '#f59e0b', title: 'JavaScript', sub: { en: 'The whole app is written in one language', hi: 'पूरा ऐप एक ही लैंग्वेज में लिखा है' } },
  { icon: 'globe', color: '#22c55e', title: 'Expo + React Native Web', sub: { en: 'Also runs in the browser (Chrome / Edge)', hi: 'ब्राउज़र (Chrome / Edge) में भी चलता है' } },
  { icon: 'desktop', color: '#0e7490', title: 'Electron Desktop', sub: { en: 'Runs as a desktop app on Windows', hi: 'Windows पर डेस्कटॉप ऐप के रूप में चलता है' } },
  { icon: 'save', color: '#14b8a6', title: 'AsyncStorage', sub: { en: 'Progress & history saved locally in the system', hi: 'प्रोग्रेस और हिस्ट्री सिस्टम में लोकल सेव होती है' } },
];

const F_HI = {
  regular: 'NotoSansDevanagari_400Regular',
  medium: 'NotoSansDevanagari_500Medium',
  semi: 'NotoSansDevanagari_600SemiBold',
  bold: 'NotoSansDevanagari_700Bold',
};

const SUPPORT_OPTIONS = [
  { icon: 'chatbubble-ellipses', color: '#14b8a6', title: 'Feedback & Suggestion', subject: 'Feedback / Suggestion', sub: { en: 'Share your thoughts to improve the app', hi: 'ऐप को बेहतर बनाने के लिए अपने विचार साझा करें' }, hint: 'मेरा सुझाव' },
  { icon: 'bug', color: '#f43f5e', title: 'Report a Problem', subject: 'Bug Report', sub: { en: 'Something not working? Report it here', hi: 'कुछ ठीक नहीं चल रहा? यहाँ रिपोर्ट करें' }, hint: 'समस्या:' },
  { icon: 'bulb', color: '#f59e0b', title: 'Request a Feature', subject: 'Feature Request', sub: { en: 'Tell me what you want in the next update', hi: 'अगले अपडेट में क्या चाहिए, बताइए' }, hint: 'मैं यह फीचर चाहता हूँ' },
];

const copyText = (text) => {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {});
  } else if (typeof document !== 'undefined') {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch {}
    document.body.removeChild(ta);
  }
};

const handleEmail = () => {
  const url = `mailto:${DEV.email}`;
  if (typeof window !== 'undefined') {
    window.location.href = url;
  } else {
    Linking.openURL(url).catch(() => {});
  }
};

export default function DeveloperScreen({ onBack }) {
  const [copied, setCopied] = useState('');
  const [lang, setLang] = useState('en'); // 'en' => English pehle, 'hi' => Hindi pehle (dono hamesha dikhengi)

  const notify = (msg) => {
    setCopied(msg);
    setTimeout(() => setCopied(''), 1800);
  };

  const handleSupport = (category, hint = '') => {
    const subject = encodeURIComponent(`Antriksh Typing Master - ${category}`);
    const body = encodeURIComponent(hint ? `${hint}\n\nनमस्ते विजय जी,\n\nमेरा संदेश:\n` : `नमस्ते विजय जी,\n\nमेरा संदेश:\n`);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(DEV.email)}&su=${subject}&body=${body}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  // Dono languages hamesha dikhengi — bas jo pehle (main) dikhana hai wo select hota hai
  const DualText = ({ hi, en }) => {
    const main = lang === 'hi' ? hi : en;
    const other = lang === 'hi' ? en : hi;
    const mainFam = lang === 'hi' ? F_HI.regular : 'Poppins_400Regular';
    const otherFam = lang === 'hi' ? 'Poppins_400Regular' : F_HI.regular;
    return (
      <View style={{ marginBottom: 14 }}>
        <Text style={[styles.payDesc, { marginBottom: 2, fontFamily: mainFam }]}>{main}</Text>
        <Text style={[styles.langOther, { fontFamily: otherFam }]}>{other}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
            </TouchableOpacity>
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Developer</Text>
              <Text style={[styles.subtitle, { fontFamily: lang === 'hi' ? F_HI.semi : 'Poppins_600SemiBold' }]}>
                {lang === 'hi' ? 'एप के बारे में • सहयोग और डोनेट' : 'About the app • Support & Donate'}
              </Text>
              <Text style={[styles.subtitle2, { fontFamily: lang === 'hi' ? 'Poppins_400Regular' : F_HI.regular }]}>
                {lang === 'hi' ? 'About the app • Support & Donate' : 'एप के बारे में • सहयोग और डोनेट'}
              </Text>
            </View>
          </View>

          <View style={styles.contentRow}>
            <View style={styles.detailCol}>
              {/* App info */}
              <View style={styles.appCard}>
                <View style={styles.appLogo}>
                  <Ionicons name="keypad" size={26} color="#fff" />
                </View>
                <View style={styles.appInfo}>
                  <Text style={styles.appName}>{DEV.appName}</Text>
                </View>
              </View>

              {/* Developer info */}
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>DEVELOPER</Text>
                <View style={styles.devRow}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>VY</Text>
                  </View>
                  <View style={styles.devInfo}>
                    <Text style={styles.devName}>{DEV.name}</Text>
                    <Text style={styles.devRole}>{DEV.role}</Text>
                  </View>
                </View>
                <View style={styles.payMethodBox}>
                  <Text style={styles.payMethodLabel}>CONTACT</Text>
                  <TouchableOpacity
                    style={styles.mobileRow}
                    onPress={handleEmail}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: COLORS.green + '1f' }]}>
                      <Ionicons name="mail" size={16} color={COLORS.green} />
                    </View>
                    <Text style={styles.mobileText} numberOfLines={1}>{DEV.email}</Text>
                    <TouchableOpacity
                      style={styles.copyIconBtn}
                      onPress={() => {
                        copyText(DEV.email);
                        notify('Email copied');
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={copied === 'Email copied' ? 'checkmark' : 'copy-outline'} size={16} color={copied === 'Email copied' ? COLORS.green : COLORS.textLight} />
                    </TouchableOpacity>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Tech stack / languages */}
              <View style={styles.card}>
                <Text style={styles.techIntro}>This app is built with these languages &amp; tools:</Text>
                {TECH_STACK.map((t) => (
                  <View key={t.title} style={styles.techRow}>
                    <View style={[styles.techIcon, { backgroundColor: t.color + '1f' }]}>
                      <Ionicons name={t.icon} size={17} color={t.color} />
                    </View>
                    <View style={styles.techInfo}>
                      <Text style={styles.techTitle}>{t.title}</Text>
                      <Text style={[styles.techSub, { fontFamily: lang === 'hi' ? F_HI.regular : 'Poppins_400Regular' }]}>{lang === 'hi' ? t.sub.hi : t.sub.en}</Text>
                      <Text style={[styles.techSub, styles.langOther, { fontFamily: lang === 'hi' ? 'Poppins_400Regular' : F_HI.regular }]}>{lang === 'hi' ? t.sub.en : t.sub.hi}</Text>
                    </View>
                  </View>
                ))}
              </View>

              {/* Feedback & Support */}
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>FEEDBACK & SUPPORT</Text>
                <DualText
                  hi="कोई फीडबैक है या कोई मदद चाहिए? एक क्लिक में सीधे ईमेल भेजें — जल्द से जल्द जवाब मिलेगा।"
                  en="Have feedback or need help? Send an email in one click — I reply as soon as possible."
                />
                {SUPPORT_OPTIONS.map((opt) => (
                  <TouchableOpacity
                    key={opt.subject}
                    style={styles.supportCard}
                    onPress={() => handleSupport(opt.subject, opt.hint)}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.supportIcon, { backgroundColor: opt.color + '22' }]}>
                      <Ionicons name={opt.icon} size={18} color={opt.color} />
                    </View>
                    <View style={styles.supportInfo}>
                      <Text style={styles.supportTitle}>{opt.title}</Text>
                      <Text style={[styles.supportSub, { fontFamily: lang === 'hi' ? F_HI.regular : 'Poppins_400Regular' }]}>
                        {lang === 'hi' ? opt.sub.hi : opt.sub.en}
                      </Text>
                      <Text style={[styles.supportSub, styles.langOther, { fontFamily: lang === 'hi' ? 'Poppins_400Regular' : F_HI.regular }]}>
                        {lang === 'hi' ? opt.sub.en : opt.sub.hi}
                      </Text>
                    </View>
                    <Ionicons name="mail-outline" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1 },
  scroll: {
    width: '100%',
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    padding: 20,
    paddingBottom: 30,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  subtitle2: { fontFamily: 'Poppins_400Regular', fontWeight: '400', color: COLORS.textDim, fontSize: 10, marginTop: 1 },
  langOther: { color: COLORS.textDim, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 11, lineHeight: 16 },

  card: {
    backgroundColor: COLORS.cardBgSolid,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorderStrong,
    padding: 16,
    marginBottom: 14,
  },
  contentRow: {
    width: '100%',
  },
  detailCol: { flex: 1, minWidth: 300 },
  appCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBgSolid,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.cardBorderStrong,
    padding: 16,
    marginBottom: 14,
    alignItems: 'center',
  },
  appLogo: {
    width: 46, height: 46, borderRadius: 13,
    backgroundColor: '#0e9488', alignItems: 'center', justifyContent: 'center',
  },
  appInfo: { marginLeft: 12, flex: 1 },
  appName: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 15 },

  sectionLabel: {
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.textDim, fontSize: 10, letterSpacing: 1.6,
    marginBottom: 10,
  },
  techIntro: {
    fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    color: COLORS.textLight, fontSize: 13,
    marginBottom: 12,
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  supportIcon: {
    width: 34, height: 34, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  supportInfo: { flex: 1, gap: 2 },
  supportTitle: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13 },
  supportSub: { color: COLORS.textMuted, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 10.5, lineHeight: 14 },
  devRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#0e9488', alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 17 },
  devInfo: { marginLeft: 12 },
  devName: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 16 },
  devRole: { color: COLORS.textMuted, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11.5, marginTop: 1 },

  mobileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 11, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  iconBadge: {
    width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  mobileText: { color: COLORS.textLight, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 14, flex: 1 },
  payMethodBox: {
    backgroundColor: 'rgba(45,212,191,0.06)',
    borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: 'rgba(45,212,191,0.3)',
  },
  payMethodLabel: {
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.teal, fontSize: 10, letterSpacing: 1.4,
    marginBottom: 8, textAlign: 'center',
  },
  copyIconBtn: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },

  payDesc: {
    color: COLORS.textMuted, fontFamily: 'Poppins_400Regular', fontWeight: '400',
    fontSize: 12.5, lineHeight: 18, marginBottom: 14,
  },

  techRow: {
    flexDirection: 'row', alignItems: 'center', gap: 11,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 11, paddingHorizontal: 11, paddingVertical: 9,
    marginBottom: 8, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  techIcon: {
    width: 32, height: 32, borderRadius: 9, alignItems: 'center', justifyContent: 'center',
  },
  techInfo: { flex: 1 },
  techTitle: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13 },
  techSub: { color: COLORS.textMuted, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 11, marginTop: 1 },
});
