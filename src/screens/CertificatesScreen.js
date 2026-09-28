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
import { certsFromRecords, targetText } from '../data/certificates';

const getHistoryKey = () => `antriksh_typing_history`;

export default function CertificatesScreen({ studentName = '', onBack, onStartCert = null }) {
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

  const certs = useMemo(() => certsFromRecords(records), [records]);

  const earnedCount = certs.filter((c) => c.earned).length;

const printCert = (c) => {
    if (Platform.OS !== 'web') return;
    const w = window.open('', '_blank');
    if (!w) return;
    const accent = c.color || '#0e9488';
    const today = new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });
    const safeName = (studentName || 'Student').replace(/[<>&"]/g, '');
    const target = targetText(c);
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${c.name} Certificate — Antriksh Typing Master</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Georgia,'Times New Roman',serif;background:#eef2f7;display:flex;justify-content:center;align-items:center;min-height:100vh;padding:30px 16px}
.paper{position:relative;width:920px;max-width:100%;background:#fffdf7;padding:16px;border:2px solid ${accent};box-shadow:0 22px 60px rgba(2,6,23,.28)}
.inner{position:relative;border:1.5px solid rgba(14,148,136,.45);padding:44px 54px 30px;text-align:center;overflow:hidden}
.wm{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(-16deg);font-size:110px;font-weight:700;letter-spacing:14px;color:rgba(14,148,136,.055);white-space:nowrap;pointer-events:none}
.corner{position:absolute;width:54px;height:54px;border:3px solid #d4af37}
.tl{top:14px;left:14px;border-right:0;border-bottom:0}
.tr{top:14px;right:14px;border-left:0;border-bottom:0}
.bl{bottom:14px;left:14px;border-right:0;border-top:0}
.br{bottom:14px;right:14px;border-left:0;border-top:0}
.logo{width:56px;height:56px;border-radius:50%;background:${accent};color:#fff;font-size:30px;font-weight:700;display:flex;align-items:center;justify-content:center;margin:0 auto 10px;box-shadow:0 6px 16px rgba(14,148,136,.4)}
.app{font-size:13px;letter-spacing:7px;color:#64748b;text-transform:uppercase}
.title{font-size:46px;letter-spacing:12px;color:#0e9488;margin-top:14px;font-weight:700}
.subtitle{font-size:16px;letter-spacing:8px;color:#b8860b;margin-top:6px;font-weight:700}
.rule{display:flex;align-items:center;gap:12px;justify-content:center;margin:16px 0 6px}
.rule span{height:1.5px;width:90px;background:linear-gradient(90deg,transparent,#d4af37)}
.rule span:last-child{background:linear-gradient(90deg,#d4af37,transparent)}
.rule i{font-style:normal;color:#d4af37;font-size:14px}
.presented{font-style:italic;color:#475569;font-size:16px;margin-top:10px}
.name{display:inline-block;font-size:38px;color:#0d9488;padding:0 34px 8px;margin-top:8px;border-bottom:2px solid ${accent};letter-spacing:2px}
.award{max-width:640px;margin:16px auto 0;font-size:15.5px;line-height:1.7;color:#334155}
.award b{color:#0e9488}
.chips{display:flex;gap:12px;justify-content:center;margin-top:18px;flex-wrap:wrap}
.chip{background:#f1f7f7;border:1px solid rgba(14,148,136,.3);border-radius:999px;padding:7px 18px;font-size:12.5px;color:#0f766e;font-weight:700;letter-spacing:.5px}
.chip em{font-style:normal;color:#64748b;font-weight:400;margin-right:6px}
.footer{display:flex;align-items:flex-end;justify-content:space-between;gap:18px;margin-top:34px}
.sig{flex:1;text-align:center}
.sig .line{height:1.5px;background:#94a3b8;margin-bottom:7px}
.sig .who{font-size:16px;color:#0f172a;font-weight:700}
.sig .role{font-size:12px;color:#64748b;letter-spacing:1px;margin-top:3px;text-transform:uppercase}
.seal{width:96px;height:96px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fde68a,#d4af37);border:3px solid #b8860b;box-shadow:inset 0 0 0 3px #fff7d6,0 6px 14px rgba(212,175,55,.45);display:flex;flex-direction:column;align-items:center;justify-content:center;color:#7c5e10;text-align:center;flex-shrink:0}
.seal .star{font-size:26px;line-height:1}
.seal .txt{font-size:9px;font-weight:700;letter-spacing:1px;line-height:1.25;margin-top:3px}
.note{margin-top:22px;border:1px dashed #cbd5e1;background:#f8fafc;border-radius:10px;padding:10px 14px}
.note .en{font-size:11.5px;color:#64748b;line-height:1.5}
.note .hi{font-size:12.5px;color:#64748b;line-height:1.6;margin-top:4px;font-family:'Nirmala UI','Noto Sans Devanagari',sans-serif}
.printBtn{position:fixed;right:24px;bottom:24px;background:#0e9488;color:#fff;border:0;border-radius:10px;padding:12px 22px;font-size:14px;font-weight:700;cursor:pointer;box-shadow:0 8px 20px rgba(14,148,136,.4);font-family:inherit}
.printBtn:hover{background:#0b7e76}
@media print{body{background:#fff;padding:0}.paper{box-shadow:none;width:100%}.printBtn{display:none}}
</style>
</head>
<body>
<div class="paper">
<div class="inner">
<div class="wm">ANTRIKSH</div>
<div class="corner tl"></div><div class="corner tr"></div><div class="corner bl"></div><div class="corner br"></div>
<div class="logo">T</div>
<div class="app">Antriksh Typing Master</div>
<div class="title">CERTIFICATE</div>
<div class="subtitle">OF ACHIEVEMENT</div>
<div class="rule"><span></span><i>&#9670;</i><span></span></div>
<div class="presented">This certificate is proudly presented to</div>
<div class="name">${safeName}</div>
<div class="award">in recognition of achieving the <b>${c.name}</b> level — reaching <b>${target}</b> in a 1-minute typing attempt, with a best accuracy of <b>${summary.bestAcc}%</b> in this app.</div>
<div class="chips">
<div class="chip"><em>Level</em>${c.name}</div>
<div class="chip"><em>Target</em>${target}</div>
<div class="chip"><em>Best Accuracy</em>${summary.bestAcc}%</div>
</div>
<div class="footer">
<div class="sig"><div class="line"></div><div class="who">Date of Award</div><div class="role">${today}</div></div>
<div class="seal"><div class="star">&#9733;</div><div class="txt">PRACTICE<br>SEAL</div></div>
<div class="sig"><div class="line"></div><div class="who">Antriksh Typing Master</div><div class="role">Issued by this app</div></div>
</div>
<div class="note">
<div class="en">Note: This is an <b>unofficial, self-issued practice certificate</b> generated automatically by the Antriksh Typing Master app based on your own typing results. It is <b>not</b> an official, government or authorised certificate.</div>
<div class="hi">नोट: यह <b>अनौपचारिक, ऐप द्वारा स्वतः जारी अभ्यास प्रमाणपत्र</b> है जो आपके अपने टाइपिंग परिणामों के आधार पर बना है। यह कोई आधिकारिक या सरकारी प्रमाणपत्र नहीं है।</div>
</div>
</div>
</div>
<button class="printBtn" onclick="window.print()">Print Certificate</button>
</body>
</html>`;
    w.document.write(html);
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
              style={[styles.certCard, { borderColor: c.color + '5e', backgroundColor: c.color + '10' }]}
            >
              <View style={[styles.certIcon, { backgroundColor: c.color }]}>
                <Ionicons name={c.icon} size={26} color="#fff" />
              </View>
              <Text style={styles.certName}>{c.name}</Text>
              <Text style={styles.certDesc}>Complete a 1-minute typing attempt</Text>
              <View style={[styles.targetTag, { borderColor: c.color + '55', backgroundColor: c.color + '14' }]}>
                <Ionicons name="flag" size={12} color={c.color} />
                <Text style={[styles.targetTagText, { color: c.color }]}>Target: {targetText(c)}</Text>
              </View>
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
                  {onStartCert && (
                    <TouchableOpacity style={styles.retryBtn} onPress={() => onStartCert(c)} activeOpacity={0.8}>
                      <Ionicons name="refresh" size={14} color={c.color} />
                      <Text style={[styles.retryText, { color: c.color }]}>Practice Again (1 min)</Text>
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                onStartCert && (
                  <TouchableOpacity style={[styles.challengeBtn, { backgroundColor: c.color, borderColor: c.color }]} onPress={() => onStartCert(c)} activeOpacity={0.85}>
                    <Ionicons name="timer" size={15} color="#fff" />
                    <Text style={styles.challengeText}>Take Challenge Â· 1 min</Text>
                  </TouchableOpacity>
                )
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
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerText: { flex: 1 },
  title: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },
  countBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(245,158,11,0.12)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)',
    borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7,
  },
  countText: { color: COLORS.amber, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12.5 },

  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryItem: {
    flex: 1, minWidth: 0, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 14, padding: 14, overflow: 'hidden',
  },
  summaryVal: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 26, flexShrink: 1, textAlign: 'center' },
  summaryLabel: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 11, marginTop: 2, flexShrink: 1, textAlign: 'center' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  certCard: {
    flex: 1, minWidth: 250,
    alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 16, padding: 20,
  },
  certIcon: {
    width: 58, height: 58, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  certName: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 17, textAlign: 'center' },
  certDesc: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 11.5, textAlign: 'center', marginTop: 5 },
  targetTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10,
  },
  targetTagText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 11.5 },
  earnedTag: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5, marginTop: 12,
  },
  earnedTagText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 11 },
  printBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.12)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, marginTop: 12,
  },
  printText: { color: COLORS.cyan, fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12 },
  challengeBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 11, paddingHorizontal: 14, paddingVertical: 9, marginTop: 12,
    shadowColor: '#000', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  challengeText: { color: '#fff', fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12.5 },
  retryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 11, paddingHorizontal: 12, paddingVertical: 7, marginTop: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  retryText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 11.5 },
});