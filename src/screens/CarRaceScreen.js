import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar,
  TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { paragraphText } from '../data/typingTexts';

const RACE_TARGET = 100;
const CHAR_STEP = 100 / 140;
const WORD_BONUS = 2;
const MISTAKE_PENALTY = 1.5;
const TICK_MS = 100;
const ACCENT = '#fb923c';
const RIVAL_COLOR = COLORS.rose;
const ANCHOR_PX = 110;
const CHAR_WHITE = Platform.OS === 'web' ? 'inherit' : '#ffffff';

const SPEED_LEVELS = [
  { id: 'cruise', label: 'Cruise', hi: 'आराम से', icon: 'leaf', rivalPerTick: 0.12, needWpm: 11, color: COLORS.green },
  { id: 'rush', label: 'Rush', hi: 'रफ़्तार', icon: 'car-sport', rivalPerTick: 1.75 / 10, needWpm: 18, color: COLORS.amber },
  { id: 'nitro', label: 'Nitro', hi: 'तेज़', icon: 'flash', rivalPerTick: 0.26, needWpm: 26, color: COLORS.indigo },
  { id: 'blaze', label: 'Blaze', hi: 'ज़बरदस्त', icon: 'flame', rivalPerTick: 0.34, needWpm: 34, color: COLORS.rose },
];
const DEFAULT_SPEED = 'rush';

const buildText = () => {
  let t = paragraphText('easy').replace(/\s+/g, ' ').trim();
  while (t.length < 200) t = `${t} ${paragraphText('easy').replace(/\s+/g, ' ').trim()}`;
  return t;
};

const FINISH_CELLS = Array.from({ length: 16 }, (_, i) => ((Math.floor(i / 2) + (i % 2)) % 2 === 1));

export default function CarRaceScreen({ onBack }) {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [won, setWon] = useState(false);
  const [speedId, setSpeedId] = useState(DEFAULT_SPEED);
  const speed = SPEED_LEVELS.find((s) => s.id === speedId) || SPEED_LEVELS[1];
  const speedRef = useRef(speed);
  speedRef.current = speed;

  const gameRef = useRef({
    text: '',
    typed: 0,
    player: 0,
    rival: 0,
    correctChars: 0,
    totalChars: 0,
    mistakes: 0,
    wordsDone: 0,
    wrongFlash: 0,
  });
  const posRef = useRef({});
  const [, setTick] = useState(0);
  const forceRender = () => setTick((t) => t + 1);
  const inputRef = useRef(null);
  const finishedRef = useRef(false);
  const startTsRef = useRef(0);

  const focusInput = () => {
    if (Platform.OS === 'web') return;
    setTimeout(() => inputRef.current && inputRef.current.focus(), 15);
  };

  const endRace = (didWin) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setWon(didWin);
    setFinished(true);
  };

  const startRace = () => {
    gameRef.current = {
      text: buildText(),
      typed: 0,
      player: 0,
      rival: 0,
      correctChars: 0,
      totalChars: 0,
      mistakes: 0,
      wordsDone: 0,
      wrongFlash: 0,
    };
    posRef.current = {};
    startTsRef.current = Date.now();
    finishedRef.current = false;
    setWon(false);
    setFinished(false);
    setStarted(true);
    forceRender();
    focusInput();
  };

  useEffect(() => {
    if (!started || finished) return;
    const perTick = speedRef.current.rivalPerTick;
    const id = setInterval(() => {
      const g = gameRef.current;
      g.rival = Math.min(RACE_TARGET, g.rival + perTick);
      if (g.rival >= RACE_TARGET) {
        clearInterval(id);
        forceRender();
        endRace(false);
        return;
      }
      forceRender();
    }, TICK_MS);
    return () => clearInterval(id);
  }, [started, finished]);

  useEffect(() => {
    if (Platform.OS !== 'web' || !started || finished) return;
    if (typeof document === 'undefined') return;
    const box = document.getElementById('raceLine');
    if (box) box.style.setProperty('color', '#ffffff', 'important');
  }, [started, finished]);

  const handleKeyRef = useRef(null);
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onKeyDown = (e) => {
      if (!started || finished) return;
      if (e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === ' ') e.preventDefault();
      const isChar = /^[a-zA-Z .,'!?-]$/.test(e.key);
      if (isChar) {
        e.preventDefault();
        handleKeyRef.current && handleKeyRef.current(e.key);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [started, finished]);

  const handleKey = (raw) => {
    const g = gameRef.current;
    if (finished || !g.text) return;
    if (raw.length !== 1) return;
    if (g.typed >= g.text.length) return;
    const expected = g.text[g.typed];
    g.totalChars += 1;
    if (raw === expected) {
      g.correctChars += 1;
      g.player = Math.min(RACE_TARGET, g.player + CHAR_STEP);
      if (expected === ' ') {
        g.wordsDone += 1;
        g.player = Math.min(RACE_TARGET, g.player + WORD_BONUS);
      }
      g.typed += 1;
      if (g.player >= RACE_TARGET) {
        forceRender();
        endRace(true);
        return;
      }
    } else {
      g.mistakes += 1;
      g.wrongFlash = Date.now();
      g.player = Math.max(0, g.player - MISTAKE_PENALTY);
    }
    forceRender();
  };
  handleKeyRef.current = handleKey;

  const handleChange = (text) => {
    const last = text.slice(-1);
    if (last) handleKey(last);
    if (Platform.OS === 'web' && inputRef.current) {
      inputRef.current.setNativeProps({ text: '' });
    }
  };

  const g = gameRef.current;
  const elapsed = Math.max(1, (Date.now() - startTsRef.current) / 1000);
  const liveWpm = g.totalChars > 0 ? Math.round((g.correctChars / 5) / (elapsed / 60)) : 0;
  const accuracy = g.totalChars > 0 ? Math.round((g.correctChars / g.totalChars) * 100) : 100;
  const gap = g.player - g.rival;
  const wrongNow = g.wrongFlash && Date.now() - g.wrongFlash < 320;
  const currentPos = posRef.current[g.typed];
  const offset = currentPos ? Math.max(0, currentPos - ANCHOR_PX) : 0;

  const gapLabel = finished
    ? won ? 'You won' : 'Rival won'
    : gap >= 0 ? `You +${gap.toFixed(0)}%` : `Rival +${Math.abs(gap).toFixed(0)}%`;

  const renderLane = (label, pct, color) => (
    <View style={styles.laneBlock}>
      <View style={styles.laneHead}>
        <View style={[styles.laneDot, { backgroundColor: color }]} />
        <Text style={[styles.laneName, { color }]}>{label}</Text>
        <Text style={[styles.lanePct, { color }]}>{Math.round(pct)}%</Text>
      </View>
      <View style={styles.lane}>
        <View style={styles.dashes}>
          {Array.from({ length: 14 }).map((_, i) => (
            <View key={i} style={styles.dash} />
          ))}
        </View>
        <View style={styles.finish}>
          {FINISH_CELLS.map((light, i) => (
            <View key={i} style={[styles.finishCell, { backgroundColor: light ? '#ffffff' : '#0f172a' }]} />
          ))}
        </View>
        <View style={[styles.carWrap, { left: `${Math.min(89, pct * 0.9)}%` }]}>
          <Ionicons name="car-sport" size={30} color={color} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={18} color={COLORS.teal} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Car Race</Text>
          <View style={[styles.gapChip, finished && { backgroundColor: won ? 'rgba(34,197,94,0.25)' : 'rgba(244,63,94,0.25)' }]}>
            <Ionicons name={finished ? (won ? 'trophy' : 'flag') : 'speedometer'} size={14} color={COLORS.textWhite} />
            <Text style={styles.gapChipText}>{gapLabel}</Text>
          </View>
        </View>

        {finished ? (
          <View style={styles.doneCard}>
            <View style={[styles.doneIcon, { backgroundColor: won ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)' }]}>
              <Ionicons name={won ? 'trophy' : 'car-sport'} size={46} color={won ? COLORS.green : COLORS.rose} />
            </View>
            <Text style={styles.doneTitle}>{won ? 'You Won the Race!' : 'Rival Won the Race!'}</Text>
            <View style={[styles.doneLevel, { borderColor: speed.color + '66', backgroundColor: speed.color + '1f' }]}>
              <Ionicons name={speed.icon} size={13} color={speed.color} />
              <Text style={[styles.doneLevelText, { color: speed.color }]}>
                {speed.label} · {speed.hi}
              </Text>
            </View>
            <Text style={styles.doneSub}>
              {won
                ? `You crossed the finish line first — ${g.wordsDone} words typed.`
                : 'The rival reached the finish line first. Type faster next time!'}
            </Text>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: ACCENT }]}>{liveWpm}</Text>
                <Text style={styles.doneLabel}>WPM</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.green }]}>{accuracy}%</Text>
                <Text style={styles.doneLabel}>Accuracy</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.amber }]}>{g.wordsDone}</Text>
                <Text style={styles.doneLabel}>Words</Text>
              </View>
            </View>
            <View style={styles.doneRow}>
              <View style={styles.doneStat}>
                <Text style={styles.doneVal}>{Math.round(elapsed)}s</Text>
                <Text style={styles.doneLabel}>Time</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: COLORS.rose }]}>{g.mistakes}</Text>
                <Text style={styles.doneLabel}>Mistakes</Text>
              </View>
              <View style={styles.doneStat}>
                <Text style={[styles.doneVal, { color: won ? COLORS.green : COLORS.rose }]}>{Math.round(g.player)}%</Text>
                <Text style={styles.doneLabel}>Your Distance</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.restartBtn} onPress={startRace} activeOpacity={0.85}>
              <Ionicons name="refresh" size={16} color={ACCENT} />
              <Text style={styles.restartBtnText}>Race Again</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.exitBtn} onPress={onBack} activeOpacity={0.85}>
              <Ionicons name="arrow-back" size={16} color={COLORS.teal} />
              <Text style={styles.exitBtnText}>Back</Text>
            </TouchableOpacity>
          </View>
        ) : !started ? (
          <View style={styles.readyCard}>
            <View style={[styles.readyIcon, { backgroundColor: 'rgba(251,146,60,0.15)' }]}>
              <Ionicons name="car-sport" size={46} color={ACCENT} />
            </View>
            <Text style={styles.readyTitle}>Car Race</Text>
            <Text style={styles.readyDesc}>
              Ek line me paragraph scroll hota rahega.{'\n'}
              Sahi type karte raho — aapki car speed pakdegi. Galti = car peeche!
            </Text>

            <Text style={styles.speedLabel}>RIVAL SPEED</Text>
            <View style={styles.speedRow}>
              {SPEED_LEVELS.map((s) => {
                const on = s.id === speedId;
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.speedCard,
                      on && { backgroundColor: s.color + '26', borderColor: s.color },
                    ]}
                    onPress={() => setSpeedId(s.id)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.speedCheck, on && { backgroundColor: s.color, borderColor: s.color }]}>
                      {on && <Ionicons name="checkmark" size={12} color="#0a0e1a" />}
                    </View>
                    <Ionicons
                      name={s.icon}
                      size={20}
                      color={on ? s.color : COLORS.textDim}
                    />
                    <Text style={[styles.speedName, on && { color: s.color }]}>{s.label}</Text>
                    <Text style={styles.speedHi}>{s.hi}</Text>
                    <Text style={[styles.speedWpm, on && { color: s.color }]}>
                      ~{s.needWpm} WPM
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.readyBtn} onPress={startRace} activeOpacity={0.85}>
              <Ionicons name="flag" size={17} color="#fff" />
              <Text style={styles.readyBtnText}>Start {speed.label} Race</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {renderLane('YOU', g.player, ACCENT)}
            {renderLane(`RIVAL · ${speed.label.toUpperCase()}`, g.rival, RIVAL_COLOR)}

            <View style={styles.lineCard}>
              <Text style={styles.lineLabel}>TYPE THE SCROLLING LINE</Text>
              <View style={styles.lineBox} {...(Platform.OS === 'web' ? { id: 'raceLine' } : {})}>
                <View style={[styles.lineInner, { transform: [{ translateX: -offset }] }]}>
                  {g.text.split('').map((ch, i) => (
                    <Text
                      key={i}
                      onLayout={(e) => { posRef.current[i] = e.nativeEvent.layout.x; }}
                      style={[
                        i < g.typed ? styles.lineGood : i === g.typed ? styles.lineCurrent : styles.lineFuture,
                        i === g.typed && wrongNow && styles.lineMiss,
                      ]}
                    >
                      {ch === ' ' ? '\u00A0' : ch}
                    </Text>
                  ))}
                </View>
              </View>
              <Text style={styles.lineHint}>Correct typing = speed. Mistakes slow your car.</Text>
            </View>
          </>
        )}

        {Platform.OS !== 'web' && (
          <TextInput
            ref={inputRef}
            style={styles.hiddenInput}
            defaultValue=""
            onChangeText={handleChange}
            returnKeyType="done"
            blurOnSubmit={false}
            editable
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus={started && !finished}
            caretHidden
            spellCheck={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(20) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },
  hiddenInput: { position: 'absolute', width: 1, height: 1, opacity: 0 },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(14) },
  backBtn: {
    width: scaleSize(36), height: scaleSize(36), borderRadius: scaleSize(18),
    backgroundColor: COLORS.backButtonBg, alignItems: 'center', justifyContent: 'center',
    marginRight: scaleSize(12),
  },
  headerTitle: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Poppins_700Bold', fontWeight: '700',
  },
  gapChip: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(14),
    paddingVertical: scaleSize(5), paddingHorizontal: scaleSize(12),
  },
  gapChipText: { color: COLORS.textWhite, fontSize: scaleFont(12.5), fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  laneBlock: { marginBottom: scaleSize(12) },
  laneHead: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(7), marginBottom: scaleSize(5) },
  laneDot: { width: scaleSize(9), height: scaleSize(9), borderRadius: scaleSize(5) },
  laneName: { fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700', letterSpacing: 1.4, flex: 1 },
  lanePct: { fontSize: scaleFont(12), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  lane: {
    height: scaleSize(58), borderRadius: scaleSize(12),
    backgroundColor: '#141c30', borderWidth: 1.5, borderColor: COLORS.cardBorder,
    overflow: 'hidden', position: 'relative',
  },
  dashes: {
    position: 'absolute', left: scaleSize(8), right: scaleSize(8), top: '50%', marginTop: -1.5,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  dash: { width: scaleSize(14), height: scaleSize(3), borderRadius: 2, backgroundColor: 'rgba(219,228,243,0.25)' },
  finish: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: scaleSize(14),
    flexDirection: 'row', flexWrap: 'wrap',
  },
  finishCell: { width: scaleSize(7), height: scaleSize(7.25) },
  carWrap: { position: 'absolute', top: scaleSize(13) },

  statBox: {
    flex: 1, alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(10),
  },
  statVal: { fontSize: scaleFont(18), fontFamily: 'Poppins_700Bold', fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  statLabel: { fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, letterSpacing: 0.8, flexShrink: 1, textAlign: 'center' },

  lineCard: {
    flex: 1, justifyContent: 'center',
    backgroundColor: 'rgba(30,46,84,0.5)', borderRadius: scaleSize(16),
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.4)',
    padding: scaleSize(14),
    shadowColor: '#fb923c', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 5,
  },
  lineLabel: { color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(12), textAlign: 'center' },
  lineBox: {
    height: scaleSize(64), overflow: 'hidden', justifyContent: 'center',
    backgroundColor: 'rgba(13,20,36,0.7)', borderRadius: scaleSize(12),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  lineInner: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scaleSize(12) },
  lineGood: { color: COLORS.green, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700', lineHeight: scaleFont(30) },
  lineCurrent: {
    color: CHAR_WHITE, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700',
    lineHeight: scaleFont(30), textDecorationLine: 'underline', textDecorationColor: ACCENT,
  },
  lineFuture: { color: CHAR_WHITE, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700', lineHeight: scaleFont(30) },
  lineMiss: { color: COLORS.rose, textDecorationColor: COLORS.rose },
  lineHint: { color: COLORS.textDim, fontSize: scaleFont(10.5), fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: scaleSize(12), textAlign: 'center' },

  readyCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  readyIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(251,146,60,0.4)',
  },
  readyTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  readyDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Poppins_600SemiBold', fontWeight: '600',
    textAlign: 'center', lineHeight: scaleFont(20), marginTop: scaleSize(10), marginBottom: scaleSize(22),
    maxWidth: scaleSize(420),
  },
  readyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: ACCENT, borderRadius: scaleSize(14),
    paddingVertical: scaleSize(13), paddingHorizontal: scaleSize(34),
    shadowColor: ACCENT, shadowOpacity: 0.45, shadowOffset: { width: 0, height: 6 }, shadowRadius: 16, elevation: 8,
  },
  readyBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  speedLabel: {
    color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Poppins_700Bold',
    fontWeight: '700', letterSpacing: 1.2, marginBottom: scaleSize(10),
  },
  speedRow: {
    flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(8),
    marginBottom: scaleSize(24), maxWidth: scaleSize(520), width: '100%',
  },
  speedCard: {
    flexBasis: '22%', flexGrow: 1, minWidth: scaleSize(104),
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: scaleSize(14), paddingVertical: scaleSize(18), paddingHorizontal: scaleSize(6),
    position: 'relative',
  },
  speedCheck: {
    position: 'absolute', top: scaleSize(6), right: scaleSize(6),
    width: scaleSize(18), height: scaleSize(18), borderRadius: scaleSize(5),
    borderWidth: 1.5, borderColor: COLORS.cardBorderStrong,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignItems: 'center', justifyContent: 'center',
  },
  speedName: {
    color: COLORS.textLight, fontSize: scaleFont(12.5), fontFamily: 'Poppins_700Bold',
    fontWeight: '700', marginTop: scaleSize(6),
  },
  speedHi: { color: COLORS.textDim, fontSize: scaleFont(9.5), fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: 1 },
  speedWpm: {
    color: COLORS.textMuted, fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold',
    fontWeight: '700', marginTop: scaleSize(5),
  },

  doneLevel: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(5),
    borderWidth: 1, borderRadius: scaleSize(11),
    paddingVertical: scaleSize(3), paddingHorizontal: scaleSize(10),
    marginTop: scaleSize(8),
  },
  doneLevelText: { fontSize: scaleFont(10.5), fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  doneCard: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: scaleSize(40) },
  doneIcon: {
    width: scaleSize(92), height: scaleSize(92), borderRadius: scaleSize(46),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(18),
    borderWidth: 1, borderColor: 'rgba(148,163,184,0.4)',
  },
  doneTitle: { color: COLORS.textWhite, fontSize: scaleFont(22), fontFamily: 'Poppins_700Bold', fontWeight: '700', textAlign: 'center' },
  doneSub: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Poppins_600SemiBold', fontWeight: '600', marginTop: scaleSize(6), marginBottom: scaleSize(18), textAlign: 'center' },
  doneRow: { flexDirection: 'row', gap: scaleSize(10), marginBottom: scaleSize(10) },
  doneStat: {
    minWidth: scaleSize(96), alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, paddingVertical: scaleSize(12),
  },
  doneVal: { fontSize: scaleFont(20), fontFamily: 'Poppins_700Bold', fontWeight: '700', flexShrink: 1, textAlign: 'center' },
  doneLabel: { fontSize: scaleFont(9.5), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textMuted, marginTop: 2, flexShrink: 1, textAlign: 'center' },
  restartBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: 'rgba(251,146,60,0.15)', borderWidth: 1.5, borderColor: ACCENT,
    borderRadius: scaleSize(13),
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(28), marginTop: scaleSize(8),
  },
  restartBtnText: { color: ACCENT, fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  exitBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.backButtonBg, borderRadius: scaleSize(12),
    borderWidth: 1.5, borderColor: COLORS.backButtonBorder,
    paddingVertical: scaleSize(11), paddingHorizontal: scaleSize(24), marginTop: scaleSize(10),
  },
  exitBtnText: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Poppins_700Bold', fontWeight: '700' },
});
