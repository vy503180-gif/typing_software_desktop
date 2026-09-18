// src/screens/GamesMenuScreen.js
// Games launcher with vibrant colors

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const GAMES = [
  { id: 'abc', label: 'ABC Speed Race', icon: 'rocket', color: COLORS.teal, desc: 'A se Z tak type karo, time se race' },
  { id: 'bubbles', label: 'Bubbles', icon: 'water', color: COLORS.green, desc: 'Bubble par wala letter type karke pop karo' },
];

const ALPHABET_MODES = [
  { id: 'az', label: 'A-Z' },
  { id: 'za', label: 'Z-A' },
  { id: 'num', label: '1-10' },
  { id: 'numrev', label: '10-1' },
];

const BUBBLE_MODES = [
  { id: 'lower', label: 'a-z' },
  { id: 'mixed', label: 'a-z, A-Z' },
  { id: 'alnum', label: 'a-z, A-Z, 0-9' },
];

export default function GamesMenuScreen({ onBack, onStartABC, onStartBubbles }) {
  const [selected, setSelected] = useState('abc');
  const [inputBubbles, setInputBubbles] = useState('');
  const [abcMode, setAbcMode] = useState('az');
  const [showAbcDropdown, setShowAbcDropdown] = useState(false);
  const [bubbleMode, setBubbleMode] = useState('lower');
  const [showBubbleDropdown, setShowBubbleDropdown] = useState(false);

  const abcDropdownRef = useRef(null);
  const bubbleDropdownRef = useRef(null);

  // Web par: dropdown ke bahar click karne se band
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const onDown = (e) => {
      const t = e.target;
      const insideAbc = abcDropdownRef.current && abcDropdownRef.current.contains(t);
      const insideBubble = bubbleDropdownRef.current && bubbleDropdownRef.current.contains(t);
      if (!insideAbc && !insideBubble) {
        setShowAbcDropdown(false);
        setShowBubbleDropdown(false);
      }
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, []);

  const handleDone = () => {
    if (selected === 'abc' && onStartABC) onStartABC(abcMode);
    else if (selected === 'bubbles' && onStartBubbles) onStartBubbles(bubbleMode);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
          {/* Header */}
          <View style={styles.headerRow}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backIconBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Ionicons name="game-controller" size={22} color={COLORS.rose} />
            <Text style={styles.headerTitle}>Games</Text>
            <View style={styles.headerSpacer} />
          </View>

          <Text style={styles.subtitle}>Koi ek game chuno aur Done dabao</Text>

          {/* Games row */}
          <View style={styles.gamesRow}>
            {GAMES.map((game) => {
              const isSel = selected === game.id;
              return (
                <View key={game.id} style={styles.gameCol}>
                  <TouchableOpacity
                    style={[styles.gameCard, isSel && { borderColor: game.color + '60', backgroundColor: game.color + '15' }]}
                    onPress={() => setSelected(game.id)}
                    activeOpacity={0.85}
                  >
                    {isSel && (
                      <View style={[styles.selBadge, { backgroundColor: game.color }]}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                    <View style={[styles.gameIcon, { backgroundColor: game.color + '20' }]}>
                      <Ionicons name={game.icon} size={22} color={game.color} />
                    </View>
                    <Text style={styles.gameLabel}>{game.label}</Text>
                    <Text style={styles.gameDesc} numberOfLines={2}>{game.desc}</Text>
                  </TouchableOpacity>

                  {game.id === 'abc' ? (
                    <View style={styles.dropdownWrap} ref={abcDropdownRef}>
                      <TouchableOpacity
                        style={[styles.dropdownBtn, isSel && { borderColor: COLORS.teal + '70', backgroundColor: COLORS.teal + '12' }]}
                        onPress={() => {
                          setSelected('abc');
                          setShowBubbleDropdown(false);
                          setShowAbcDropdown(!showAbcDropdown);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.dropdownLeadIcon, { backgroundColor: COLORS.teal + '22' }]}>
                          <Ionicons name="keypad" size={13} color={COLORS.teal} />
                        </View>
                        <Text style={styles.dropdownBtnText}>{ALPHABET_MODES.find((m) => m.id === abcMode).label}</Text>
                        <Ionicons name={showAbcDropdown ? 'chevron-up' : 'chevron-down'} size={15} color={isSel ? COLORS.teal : COLORS.textMuted} />
                      </TouchableOpacity>
                      {showAbcDropdown && (
                        <View style={styles.dropdownList}>
                          {ALPHABET_MODES.map((m) => (
                            <TouchableOpacity
                              key={m.id}
                              style={[styles.dropdownItem, m.id === abcMode && styles.dropdownItemActive]}
                              onPress={() => {
                                setAbcMode(m.id);
                                setShowAbcDropdown(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.dropdownItemText, m.id === abcMode && styles.dropdownItemTextActive]}>{m.label}</Text>
                              {m.id === abcMode && <Ionicons name="checkmark" size={15} color={COLORS.teal} />}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  ) : (
                    <View style={styles.dropdownWrap} ref={bubbleDropdownRef}>
                      <TouchableOpacity
                        style={[styles.dropdownBtn, isSel && { borderColor: game.color + '70', backgroundColor: game.color + '12' }]}
                        onPress={() => {
                          setSelected('bubbles');
                          setShowAbcDropdown(false);
                          setShowBubbleDropdown(!showBubbleDropdown);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={[styles.dropdownLeadIcon, { backgroundColor: game.color + '22' }]}>
                          <Ionicons name="keypad" size={13} color={game.color} />
                        </View>
                        <Text style={styles.dropdownBtnText} numberOfLines={1}>{BUBBLE_MODES.find((m) => m.id === bubbleMode).label}</Text>
                        <Ionicons name={showBubbleDropdown ? 'chevron-up' : 'chevron-down'} size={15} color={isSel ? game.color : COLORS.textMuted} />
                      </TouchableOpacity>
                      {showBubbleDropdown && (
                        <View style={styles.dropdownList}>
                          {BUBBLE_MODES.map((m) => (
                            <TouchableOpacity
                              key={m.id}
                              style={[styles.dropdownItem, m.id === bubbleMode && { backgroundColor: game.color + '20' }]}
                              onPress={() => {
                                setBubbleMode(m.id);
                                setShowBubbleDropdown(false);
                              }}
                              activeOpacity={0.7}
                            >
                              <Text style={[styles.dropdownItemText, m.id === bubbleMode && { color: game.color }]} numberOfLines={1}>{m.label}</Text>
                              {m.id === bubbleMode && <Ionicons name="checkmark" size={15} color={game.color} />}
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Done button */}
          <TouchableOpacity style={styles.doneBtn} onPress={handleDone} activeOpacity={0.85}>
            <View style={[styles.doneBtnGradient, { backgroundColor: COLORS.green }]}>
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.doneBtnText}>Done</Text>
            </View>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  dropdownBackdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 15,
  },
  flex: { flex: 1, padding: scaleSize(16) },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginTop: scaleSize(8) },
  backIconBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(20), flexShrink: 1 },
  headerSpacer: { flex: 1 },

  subtitle: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(6), marginBottom: scaleSize(18) },

  gamesRow: { flexDirection: 'row', gap: scaleSize(10) },
  gameCol: { flex: 1, gap: scaleSize(8) },
  gameCard: {
    backgroundColor: COLORS.cardBg, borderRadius: 16,
    borderWidth: 2, borderColor: COLORS.cardBorder,
    paddingVertical: scaleSize(12), paddingHorizontal: scaleSize(10), alignItems: 'center',
  },
  selBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  gameIcon: {
    width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(22),
    alignItems: 'center', justifyContent: 'center', marginBottom: scaleSize(8),
  },
  gameLabel: { color: COLORS.textWhite, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', textAlign: 'center' },
  gameDesc: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', textAlign: 'center', marginTop: scaleSize(4) },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(12), borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: scaleSize(10), gap: scaleSize(6),
  },
  input: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(12),
    fontFamily: 'Calibri', fontWeight: '700', paddingVertical: scaleSize(10),
    outlineWidth: 0, outlineColor: 'transparent', outlineStyle: 'none',
  },

  dropdownWrap: {
    position: 'relative',
    zIndex: 20,
  },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center',
    gap: scaleSize(7),
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(12), borderWidth: 1, borderColor: COLORS.cardBorder,
    paddingHorizontal: scaleSize(9), paddingVertical: scaleSize(8),
  },
  dropdownLeadIcon: {
    width: scaleSize(24), height: scaleSize(24), borderRadius: scaleSize(8),
    alignItems: 'center', justifyContent: 'center',
  },
  dropdownBtnText: {
    flex: 1, color: COLORS.textWhite, fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 1,
  },
  dropdownList: {
    position: 'absolute',
    top: '100%', left: 0, right: 0,
    marginTop: scaleSize(5),
    backgroundColor: '#1c1c1c',
    borderRadius: scaleSize(12),
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)',
    overflow: 'hidden',
    zIndex: 30,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: scaleSize(12), paddingVertical: scaleSize(10),
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  dropdownItemActive: {
    backgroundColor: COLORS.teal + '1c',
  },
  dropdownItemText: {
    color: COLORS.textWhite, fontSize: scaleFont(13),
    fontFamily: 'Calibri', fontWeight: '700',
    letterSpacing: 1,
  },
  dropdownItemTextActive: {
    color: COLORS.teal,
  },
  doneBtn: {
    alignSelf: 'center',
    width: scaleSize(180),
    marginTop: scaleSize(200),
    borderRadius: scaleSize(14),
    overflow: 'hidden',
  },
  doneBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: scaleSize(6), paddingVertical: scaleSize(10),
  },
  doneBtnText: { color: '#fff', fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700'},
});
