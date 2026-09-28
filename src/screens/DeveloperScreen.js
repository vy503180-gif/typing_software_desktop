// src/screens/DeveloperScreen.js
// About the developer + payment / donate support.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
} from 'react-native';
import { toQR } from 'toqr';
import { Ionicons } from '@expo/vector-icons';
import { Linking } from 'react-native';
import { BG, COLORS, CONTENT_MAX_WIDTH } from '../theme';

// ================= CONFIG (yahan apni details daalo) =================
const DEV = {
  name: 'Vicky Yadav',
  role: 'App Developer',
  mobile: '6387693103',
  email: 'vy503180@gmail.com',
  // UPI ID — jab bhejo, yahan daal do:
  upiId: 'vy503180@okaxis',
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

const upiLink = () =>
  `upi://pay?pa=${encodeURIComponent(DEV.upiId)}&pn=${encodeURIComponent(DEV.name)}&cu=INR`;

// UPI ID se QR auto-generate hota hai (koi image file nahi chahiye)
function QrCode({ value, cell = 3 }) {
  const rows = useMemo(() => {
    try {
      // UPI link ASCII hai — TextEncoder ki zaroorat ke bina khud bytes bana dete hain
      const bytes = new Uint8Array(value.length);
      for (let i = 0; i < value.length; i++) bytes[i] = value.charCodeAt(i) & 0xff;
      const bits = toQR(bytes);
      const n = Math.round(Math.sqrt(bits.length));
      const out = [];
      for (let y = 0; y < n; y++) {
        const row = [];
        for (let x = 0; x < n; x++) row.push(!!bits[y * n + x]);
        out.push(row);
      }
      return out;
    } catch {
      return null;
    }
  }, [value]);

  if (!rows) {
    return (
      <View style={styles.qrPlaceholder}>
        <Ionicons name="qr-code" size={54} color="#94a3b8" />
        <Text style={styles.qrPhText}>QR Scan Code</Text>
      </View>
    );
  }

  const dim = rows.length * cell;
  return (
    <View style={{ padding: 10, backgroundColor: '#fff', borderRadius: 12 }}>
      <View
        style={{
          width: dim,
          height: dim,
          flexDirection: 'row',
          flexWrap: 'wrap',
          backgroundColor: '#fff',
        }}
      >
        {rows.map((row, y) =>
          row.map((on, x) => (
            <View
              key={`${y}-${x}`}
              style={{ width: cell, height: cell, backgroundColor: on ? '#000' : '#fff' }}
            />
          ))
        )}
      </View>
    </View>
  );
}

export default function DeveloperScreen({ onBack }) {
  const [showPay, setShowPay] = useState(false);
  const [copied, setCopied] = useState('');
  const [payDismissed, setPayDismissed] = useState(false);
  const [lang, setLang] = useState('en'); // 'en' => English pehle, 'hi' => Hindi pehle (dono hamesha dikhengi)

  const notify = (msg) => {
    setCopied(msg);
    setTimeout(() => setCopied(''), 1800);
  };

  const handlePayUp = () => {
    const link = upiLink();
    if (typeof window !== 'undefined') {
      window.location.href = link;
    } else {
      Linking.openURL(link).catch(() => {});
    }
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

  const DualRich = ({ hi, en }) => {
    const isHiMain = lang === 'hi';
    const main = isHiMain ? hi : en;
    const other = isHiMain ? en : hi;
    const mainFam = isHiMain ? F_HI.regular : 'Poppins_400Regular';
    const otherFam = isHiMain ? 'Poppins_400Regular' : F_HI.regular;
    const mainStrongFam = isHiMain ? F_HI.bold : 'Poppins_700Bold';
    const otherStrongFam = isHiMain ? 'Poppins_700Bold' : F_HI.bold;
    const renderLine = (line, fam, strongFam) => {
      const parts = line.split('__');
      return (
        <Text style={[styles.valueText, { fontFamily: fam }]}>
          {parts[0]}
          <Text style={[styles.valueStrong, { fontFamily: strongFam }]}>{parts[1]}</Text>
          {parts[2]}
        </Text>
      );
    };
    return (
      <View style={{ flex: 1 }}>
        {renderLine(main, mainFam, mainStrongFam)}
        <View style={{ marginTop: 3 }}>{renderLine(other, otherFam, otherStrongFam)}</View>
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
                  <Text style={styles.payMethodLabel}>ONLINE PAYMENT</Text>
                  <View style={styles.mobileRow}>
                    <View style={[styles.iconBadge, { backgroundColor: COLORS.green + '1f' }]}>
                      <Ionicons name="wallet" size={16} color={COLORS.green} />
                    </View>
                    <Text style={styles.mobileText}>{DEV.mobile}</Text>
                    <TouchableOpacity
                      style={styles.copyIconBtn}
                      onPress={() => {
                        copyText(DEV.mobile);
                        notify('Number copied');
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={copied === 'Number copied' ? 'checkmark' : 'copy-outline'} size={16} color={copied === 'Number copied' ? COLORS.green : COLORS.textLight} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.optionalRow}>
                    <Ionicons name="gift" size={12} color={COLORS.amber} />
                    <Text style={[styles.optionalText, { fontFamily: lang === 'hi' ? F_HI.semi : 'Poppins_600SemiBold' }]}>
                      {lang === 'hi' ? 'ऑप्शनल रिवार्ड — जो आप खुशी से दे सकते हैं' : 'Optional Reward — a token of appreciation, only if you wish'}
                    </Text>
                  </View>
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

            {/* Support / Pay */}
            <View style={styles.payCol}>
              {/* PAY / DONATE card */}
              <View style={styles.card}>
                <Text style={styles.sectionLabel}>PAY / DONATE</Text>
                <DualText
                  hi="यह ऐप 100% फ्री है। Pay करें या डोनेशन दें — जैसा आपको ठीक लगे, कोई अमाउंट नहीं, कोई दबाव नहीं।"
                  en="This app is 100% free. Pay or donate — whatever you prefer. No fixed amount, no pressure."
                />

                <View style={styles.payDonateRow}>
                  <TouchableOpacity style={[styles.payOption, styles.payOptionActive]} onPress={() => setShowPay(true)} activeOpacity={0.85}>
                    <Ionicons name="card" size={18} color="#0a241f" />
                    <Text style={styles.payOptionText}>Pay</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.payOption} onPress={() => setShowPay(true)} activeOpacity={0.85}>
                    <Ionicons name="heart" size={18} color={COLORS.rose} />
                    <Text style={[styles.payOptionText, { color: COLORS.rose }]}>Donate</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.detailLabel}>PAYMENT DETAILS</Text>
                <View style={styles.detailRow}>
                  <Ionicons name="wallet" size={15} color={COLORS.teal} />
                  <Text style={styles.detailKey}>UPI ID</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{DEV.upiId}</Text>
                  <TouchableOpacity style={styles.copyIconBtn} onPress={() => { copyText(DEV.upiId); notify('UPI ID copied'); }} activeOpacity={0.7}>
                    <Ionicons name={copied === 'UPI ID copied' ? 'checkmark' : 'copy-outline'} size={15} color={copied === 'UPI ID copied' ? COLORS.green : COLORS.textLight} />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="phone-portrait" size={15} color={COLORS.green} />
                  <Text style={styles.detailKey}>Mobile</Text>
                  <Text style={styles.detailValue}>{DEV.mobile}</Text>
                  <TouchableOpacity style={styles.copyIconBtn} onPress={() => { copyText(DEV.mobile); notify('Number copied'); }} activeOpacity={0.7}>
                    <Ionicons name={copied === 'Number copied' ? 'checkmark' : 'copy-outline'} size={15} color={copied === 'Number copied' ? COLORS.green : COLORS.textLight} />
                  </TouchableOpacity>
                </View>
                <View style={styles.detailRow}>
                  <Ionicons name="qr-code" size={15} color={COLORS.amber} />
                  <Text style={styles.detailKey}>QR Code</Text>
                  <Text style={[styles.detailValue, { fontFamily: lang === 'hi' ? F_HI.bold : 'Poppins_700Bold' }]} numberOfLines={1}>
                    {lang === 'hi' ? 'Pay/Donate पर क्लिक करें' : 'Click Pay / Donate to open'}
                  </Text>
                </View>

                <View style={styles.optionalRow}>
                  <Ionicons name="gift" size={12} color={COLORS.amber} />
                  <Text style={[styles.optionalText, { fontFamily: lang === 'hi' ? F_HI.semi : 'Poppins_600SemiBold' }]}>
                    {lang === 'hi' ? 'ऑप्शनल रिवार्ड — जो आप खुशी से दे सकते हैं' : 'Optional Reward — a token of appreciation, only if you wish'}
                  </Text>
                </View>

                <TouchableOpacity style={styles.freeBtn} onPress={() => setPayDismissed(true)} activeOpacity={0.7}>
                  <Text style={[styles.freeBtnText, { fontFamily: lang === 'hi' ? F_HI.semi : 'Poppins_600SemiBold' }]}>
                    {lang === 'hi' ? 'ऐप फ्री है — बस फ्री इस्तेमाल करना है' : 'This app is free — just use it freely'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      </View>

      {/* Pay Modal — scanner (QR) + number + UPI */}
      <Modal visible={showPay} transparent animationType="fade" onRequestClose={() => setShowPay(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderIcon}>
                <Ionicons name="heart" size={18} color="#fff" />
              </View>
              <Text style={styles.modalTitle}>Support {DEV.name}</Text>
              <TouchableOpacity onPress={() => setShowPay(false)} style={styles.modalClose} activeOpacity={0.7}>
                <Ionicons name="close" size={20} color="#475569" />
              </TouchableOpacity>
            </View>

            {/* Scanner area */}
            <View style={styles.qrArea}>
              <Text style={styles.qrLabel}>SCAN & PAY</Text>
              <View style={styles.qrBox}>
                <QrCode value={upiLink()} />
              </View>
              <Text style={[styles.qrNote, { fontFamily: lang === 'hi' ? F_HI.regular : 'Poppins_400Regular' }]}>
                  {lang === 'hi' ? 'किसी भी UPI ऐप को स्कैन करके pay कर सकते हैं।' : 'Scan with any UPI app and pay.'}
                </Text>
                <Text style={[styles.qrNote, styles.langOther, { fontFamily: lang === 'hi' ? 'Poppins_400Regular' : F_HI.regular }]}>
                  {lang === 'hi' ? 'Scan with any UPI app and pay.' : 'किसी भी UPI ऐप को स्कैन करके pay कर सकते हैं।'}
                </Text>
            </View>

            {/* Number + UPI */}
            <View style={styles.payRows}>
              <View style={styles.payRow}>
                <Ionicons name="phone-portrait" size={16} color={COLORS.green} />
                <Text style={styles.payRowLabel}>Mobile</Text>
                <Text style={styles.payRowValue}>{DEV.mobile}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => { copyText(DEV.mobile); notify('Mobile copied'); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={15} color="#64748b" />
                </TouchableOpacity>
              </View>
              <View style={styles.payRow}>
                <Ionicons name="qr-code-outline" size={16} color={COLORS.cyan} />
                <Text style={styles.payRowLabel}>UPI ID</Text>
                <Text style={styles.payRowValue} numberOfLines={1}>{DEV.upiId}</Text>
                <TouchableOpacity
                  style={styles.copyBtn}
                  onPress={() => { copyText(DEV.upiId); notify('UPI ID copied'); }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="copy-outline" size={15} color="#64748b" />
                </TouchableOpacity>
              </View>
            </View>

            {copied !== '' && <Text style={styles.copiedNote}>{copied}</Text>}

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.payNowBtn} onPress={handlePayUp} activeOpacity={0.85}>
                <Ionicons name="wallet" size={17} color="#0a241f" />
                <Text style={styles.payNowText}>Pay via UPI</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.doneBtn}
                onPress={() => setShowPay(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.doneBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 14,
    width: '100%',
  },
  detailCol: { flex: 1, minWidth: 300 },
  payCol: { width: 320, minWidth: 280, flexShrink: 0 },
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
  copyHint: { color: COLORS.textDim, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 10.5 },
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
  optionalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: 8 },
  optionalText: { color: COLORS.textMuted, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 10.5, textAlign: 'center' },

  payDesc: {
    color: COLORS.textMuted, fontFamily: 'Poppins_400Regular', fontWeight: '400',
    fontSize: 12.5, lineHeight: 18, marginBottom: 14,
  },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2dd4bf',
    borderRadius: 12, paddingVertical: 13,
    shadowColor: '#14b8a6', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 6,
  },
  payBtnText: { color: '#0a241f', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 14.5 },
  payHint: { color: COLORS.textDim, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 10.5, textAlign: 'center', marginTop: 8 },

  payDonateRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  payOption: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 11, paddingVertical: 11,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  payOptionActive: { backgroundColor: '#2dd4bf', borderColor: '#2dd4bf' },
  payOptionText: { color: '#0a241f', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13.5 },

  detailLabel: {
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.textDim, fontSize: 9.5, letterSpacing: 1.5,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 9, paddingHorizontal: 10, paddingVertical: 8,
    marginBottom: 7, borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  detailKey: { color: COLORS.textMuted, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11 },
  detailValue: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12, flex: 1 },

  valueText: { color: COLORS.textMuted, fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 11.5, lineHeight: 16, flex: 1 },
  valueStrong: { color: COLORS.textLight, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  freeBtn: {
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 9, marginTop: 6,
  },
  freeBtnText: { color: COLORS.textDim, fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11.5, textDecorationLine: 'underline' },
  thanksBox: { alignItems: 'center', paddingVertical: 8, gap: 6 },
  thanksTitle: { color: COLORS.green, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 16, marginTop: 2 },

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

  overlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.25)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  modalCard: {
    width: '100%', maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1, borderColor: '#e2e8f0',
    padding: 20,
    shadowColor: '#0f172a',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 12,
  },
  modalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  modalHeaderIcon: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#fb7185', alignItems: 'center', justifyContent: 'center', marginRight: 10,
  },
  modalTitle: { color: '#0f172a', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 15, flex: 1 },
  modalClose: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#e2e8f0',
  },

  qrArea: { alignItems: 'center', marginBottom: 14 },
  qrLabel: {
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: '#64748b', fontSize: 9.5, letterSpacing: 1.8, marginBottom: 8,
  },
  qrBox: {
    width: 150, height: 150, borderRadius: 14,
    backgroundColor: '#f8fafc',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: '#e2e8f0',
    padding: 8,
  },
  qrPlaceholder: { alignItems: 'center' },
  qrPhText: { color: '#64748b', fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11, marginTop: 6 },
  qrNote: { color: '#475569', fontFamily: 'Poppins_400Regular', fontWeight: '400', fontSize: 11, marginTop: 8, textAlign: 'center' },

  payRows: { gap: 8 },
  payRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 10, paddingHorizontal: 11, paddingVertical: 9,
    borderWidth: 1, borderColor: '#e2e8f0',
  },
  payRowLabel: { color: '#64748b', fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 12 },
  payRowValue: { color: '#0f172a', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13, flex: 1 },
  copyBtn: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: '#eef2f7', alignItems: 'center', justifyContent: 'center',
  },
  copiedNote: { color: '#0d9488', fontFamily: 'Poppins_600SemiBold', fontWeight: '600', fontSize: 11.5, textAlign: 'center', marginTop: 10 },

  modalActions: { flexDirection: 'row', gap: 8, marginTop: 16 },
  payNowBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    backgroundColor: '#14b8a6', borderRadius: 11, paddingVertical: 12,
    shadowColor: '#14b8a6', shadowOpacity: 0.4, shadowOffset: { width: 0, height: 5 }, shadowRadius: 12, elevation: 5,
  },
  payNowText: { color: '#ffffff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13.5 },
  doneBtn: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f1f5f9', borderRadius: 11, paddingVertical: 12,
    borderWidth: 1.5, borderColor: '#e2e8f0',
  },
  doneBtnText: { color: '#0f172a', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 13 },
});