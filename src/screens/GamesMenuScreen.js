// src/screens/GamesMenuScreen.js
// Games launcher: saare games ek saath grid me dikhte hain (row/column),
// har game ka apna theme. Card select karo → Start dabao → typing shuru.

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const GAMES = [
  {
    id: 'abc', label: 'ABC Speed Race', icon: 'rocket', color: COLORS.teal,
    desc: 'Type A to Z in a circle under full speed', badge: 'Arcade',
    modes: [
      { id: 'az', label: 'A-Z' },
      { id: 'za', label: 'Z-A' },
      { id: 'num', label: '0-9' },
      { id: 'numrev', label: '9-0' },
    ],
  },
  {
    id: 'bubbles', label: 'Bubbles', icon: 'water', color: COLORS.green,
    desc: 'Pop rising bubbles by typing the letter', badge: 'Arcade',
    modes: [
      { id: 'lower', label: 'a-z' },
      { id: 'mixed', label: 'a-z, A-Z' },
      { id: 'alnum', label: 'a-z, A-Z, 0-9' },
    ],
  },
  {
    id: 'speed', label: 'Speed Challenge', icon: 'flash', color: COLORS.amber,
    desc: 'Rapid-fire words - survive 60 seconds of full speed', badge: '60s',
    modes: null,
  },
  {
    id: 'wordrush', label: 'Word Rush', icon: 'trending-up', color: COLORS.rose,
    desc: 'Word chain with streak multiplier - keep it alive!', badge: 'Combo',
    modes: null,
  },
  {
    id: 'accuracy', label: 'Accuracy Challenge', icon: 'locate', color: COLORS.purple,
    desc: 'Slow and precise - keep accuracy above 98% to score big', badge: '98%',
    modes: null,
  },
  {
    id: 'timeattack', label: 'Time Attack', icon: 'timer', color: COLORS.cyan,
    desc: 'Beat the 40 second clock with a full paragraph', badge: '40s',
    modes: null,
  },
];

export default function GamesMenuScreen({
  onBack,
  onStartABC,
  onStartBubbles,
  onStartSpeed,
  onStartWordRush,
  onStartAccuracy,
  onStartTimeAttack,
}) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState({});

  const currentGame = selected ? GAMES.find((g) => g.id === selected) : null;
  const currentMode = currentGame && currentGame.modes
    ? currentGame.modes.find((m) => m.id === mode[currentGame.id]) || currentGame.modes[0]
    : null;

  const handleStart = () => {
    if (!currentGame) return;
    if (currentGame.id === 'abc' && onStartABC) onStartABC(currentMode.id);
    else if (currentGame.id === 'bubbles' && onStartBubbles) onStartBubbles(currentMode.id);
    else if (currentGame.id === 'speed' && onStartSpeed) onStartSpeed();
    else if (currentGame.id === 'wordrush' && onStartWordRush) onStartWordRush();
    else if (currentGame.id === 'accuracy' && onStartAccuracy) onStartAccuracy();
    else if (currentGame.id === 'timeattack' && onStartTimeAttack) onStartTimeAttack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        contentContainerStyle={[styles.scroll, IS_DESKTOP && styles.scrollDesktop]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.headerRow}>
          {onBack && (
            <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Games</Text>
            <Text style={styles.headerSub}>Tap a game to select it, then press Start</Text>
          </View>
        </View>

        {/* All games - grid (row/column) */}
        <View style={styles.grid}>
          {GAMES.map((game) => {
            const active = selected === game.id;
            return (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameCard,
                  { backgroundColor: game.color + '14', borderColor: game.color + '4d' },
                ]}
                onPress={() => {
                  setSelected(game.id);
                  if (game.modes && mode[game.id] == null) {
                    setMode((m) => ({ ...m, [game.id]: game.modes[0].id }));
                  }
                }}
                activeOpacity={0.85}
              >
                <View style={[styles.gameTop, { borderBottomColor: game.color + '33' }]}>
                  <View style={[styles.gameIcon, { backgroundColor: game.color, shadowColor: game.color }]}>
                    <Ionicons name={game.icon} size={24} color="#fff" />
                  </View>
                  <View style={[styles.gameBadge, { backgroundColor: game.color + '2b', borderColor: game.color + '70' }]}>
                    <Text style={[styles.gameBadgeText, { color: game.color }]}>{game.badge}</Text>
                  </View>
                </View>
                <Text style={styles.gameLabel}>{game.label}</Text>
                <Text style={styles.gameDesc} numberOfLines={2}>{game.desc}</Text>
                <View style={[styles.footerRow, active && { backgroundColor: game.color, borderColor: game.color }]}>
                  <View style={[styles.checkBox, active && styles.checkBoxChecked]}>
                    {active && <Ionicons name="checkmark" size={13} color={game.color} />}
                  </View>
                  <Text style={active ? styles.footerActiveText : styles.footerText}>
                    {active ? 'Selected' : 'Select'}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected game details + modes */}
        {currentGame && (
          <View style={[styles.detailCard, { borderColor: currentGame.color + '50' }]}>
            <View style={styles.detailHeader}>
              <View style={[styles.detailIcon, { backgroundColor: currentGame.color + '18' }]}>
                <Ionicons name={currentGame.icon} size={26} color={currentGame.color} />
              </View>
              <View style={styles.detailText}>
                <Text style={styles.detailTitle}>{currentGame.label}</Text>
                <Text style={styles.detailDesc}>{currentGame.desc}</Text>
              </View>
            </View>

            {currentGame.modes && currentMode ? (
              <View style={styles.modeRow}>
                <Text style={styles.modeLabel}>Mode</Text>
                <View style={styles.modePills}>
                  {currentGame.modes.map((m) => {
                    const activeMode = m.id === currentMode.id;
                    return (
                      <TouchableOpacity
                        key={m.id}
                        style={[styles.modePill, activeMode && { backgroundColor: currentGame.color + '2b', borderColor: currentGame.color }]}
                        onPress={() => setMode((prev) => ({ ...prev, [currentGame.id]: m.id }))}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.modePillText, activeMode && { color: currentGame.color, fontWeight: '700' }]}>
                          {m.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            ) : (
              <View style={styles.rulesRow}>
                <Ionicons name="information-circle" size={15} color={currentGame.color} />
                <Text style={styles.rulesText}>
                  {currentGame.id === 'speed'
                    ? 'Type as many words as you can in 60s. Combo grows when you never miss a letter!'
                    : currentGame.id === 'wordrush'
                      ? 'Words rush in one after another. Each word adds to your streak — and the multiplier.'
                      : currentGame.id === 'accuracy'
                        ? 'Every mistake hurts your accuracy. Stay above 98% to score big.'
                        : 'Finish the paragraph before the 40 second clock hits zero. Words give you time back.'}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Start button */}
        <TouchableOpacity
          style={[styles.startBtn, currentGame ? { backgroundColor: currentGame.color, shadowColor: currentGame.color } : styles.startBtnDisabled]}
          onPress={handleStart}
          activeOpacity={0.85}
          disabled={!currentGame}
        >
          <Ionicons name="play" size={17} color={currentGame ? COLORS.BG_NAVY || '#06121f' : COLORS.textDim} />
          <Text style={[styles.startBtnText, !currentGame && { color: COLORS.textDim }]}>
            {currentGame ? `Start ${currentGame.label}` : 'Select a game to start'}
          </Text>
        </TouchableOpacity>

        {!currentGame && (
          <Text style={styles.hint}>Tip: tap a game card above to begin</Text>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  scroll: { padding: scaleSize(16) },
  scrollDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginTop: scaleSize(8), marginBottom: scaleSize(16) },
  backIconBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder, marginRight: scaleSize(6),
  },
  headerText: { flex: 1 },
  headerTitle: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(22) },
  headerSub: { fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 1 },

  // Grid - row/column layout
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSize(10),
    marginBottom: scaleSize(12),
  },
  gameCard: {
    flexBasis: '31%',
    flexGrow: 1,
    minWidth: scaleSize(150),
    minHeight: scaleSize(150),
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: scaleSize(14),
    paddingHorizontal: scaleSize(14),
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
  },
  gameTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    paddingBottom: scaleSize(10),
    marginBottom: scaleSize(8),
  },
  gameIcon: {
    width: scaleSize(40), height: scaleSize(40), borderRadius: scaleSize(13),
    alignItems: 'center', justifyContent: 'center',
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  gameBadge: {
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 2,
  },
  gameBadgeText: { fontSize: scaleFont(9), fontFamily: 'Calibri', fontWeight: '700' },
  gameLabel: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(4) },
  gameDesc: {
    color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '600',
    marginTop: scaleSize(4), lineHeight: scaleFont(14), minHeight: scaleSize(28),
  },
  footerRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
    borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: 'rgba(255,255,255,0.04)',
    paddingVertical: scaleSize(6), marginTop: scaleSize(10),
  },
  checkBox: {
    width: scaleSize(18), height: scaleSize(18), borderRadius: 5,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  checkBoxChecked: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  footerText: { fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted },
  footerActiveText: { fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '700', color: '#fff' },

  // Details of selected game
  detailCard: {
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: 14,
    borderWidth: 1, padding: scaleSize(10), marginBottom: scaleSize(12),
  },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10) },
  detailIcon: {
    width: scaleSize(38), height: scaleSize(38), borderRadius: scaleSize(11),
    alignItems: 'center', justifyContent: 'center',
  },
  detailText: { flex: 1 },
  detailTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  detailDesc: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '600', marginTop: scaleSize(2) },

  modeRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(10), marginTop: scaleSize(12) },
  modeLabel: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 0.5 },
  modePills: { flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(6), flex: 1 },
  modePill: {
    borderRadius: 10, borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: scaleSize(10), paddingVertical: scaleSize(5),
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  modePillText: { color: COLORS.textLight, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '600' },

  rulesRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(7), marginTop: scaleSize(12) },
  rulesText: { flex: 1, color: COLORS.textMuted, fontSize: scaleFont(10.5), fontFamily: 'Calibri', fontWeight: '600', lineHeight: scaleFont(14) },

  startBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    borderRadius: 14,
    paddingVertical: scaleSize(13),
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 8,
  },
  startBtnDisabled: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1, borderColor: COLORS.cardBorder,
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: '#fff', fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700',
  },
  hint: {
    color: COLORS.textDim, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '600',
    textAlign: 'center', marginTop: scaleSize(10),
  },
});