import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';

const MAX_W = Math.min(SCREEN.width - 48, 440);

const BRAND_COLORS = [COLORS.green, COLORS.amber, COLORS.rose, COLORS.teal];

const AVATAR_COLORS = ['#16a34a', '#d97706', '#e11d48', '#0d9488'];

export default function NameEntryScreen({ onSubmit, onCancel, users = [] }) {
  const [name, setName] = useState('');
  const [focused, setFocused] = useState(false);
  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (canSubmit) {
      Keyboard.dismiss();
      onSubmit(name.trim());
    }
  };

  const handleCancel = () => {
    Keyboard.dismiss();
    if (onCancel) onCancel();
    else BackHandler.exitApp();
  };

  const initial = (user) => (user && user.trim() ? user.trim()[0].toUpperCase() : '?');

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="on-drag"
        >
          <View style={s.container}>
            {/* Decorative glow blobs */}
            <View pointerEvents="none" style={[s.glow, s.glowGreen]} />
            <View pointerEvents="none" style={[s.glow, s.glowRose]} />

            {/* Logo */}
            <View style={s.logoWrap}>
              <View style={[s.logoRing, { borderColor: COLORS.teal + 'aa' }]}>
                <View style={s.logo}>
                  <Text style={s.logoLetter}>T</Text>
                </View>
              </View>
            </View>

            {/* Title */}
            <Text style={s.title}>Typing Master</Text>
            <Text style={s.tagline}>Fast fingers, sharp mind</Text>

            {/* 4-color brand bar */}
            <View style={s.brandBar}>
              {BRAND_COLORS.map((c, i) => (
                <View key={i} style={[s.brandSeg, { backgroundColor: c }]} />
              ))}
            </View>

            {/* Card */}
            <View style={s.card}>
              <View style={s.strip}>
                {BRAND_COLORS.map((c, i) => (
                  <View key={i} style={[s.stripSeg, { backgroundColor: c }]} />
                ))}
              </View>

              <Text style={s.heading}>What's your name?</Text>

              {/* Input */}
              <View style={[s.inputRow, (focused || canSubmit) && s.inputRowActive]}>
                <View style={s.inputIcon}>
                  <Ionicons name="person" size={18} color={focused || canSubmit ? '#16a34a' : '#8a8a8a'} />
                </View>
                <TextInput
                  style={s.input}
                  placeholder="Type your name"
                  placeholderTextColor="#666"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  maxLength={40}
                />
                {name.length > 0 && (
                  <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={20} color="#777" />
                  </TouchableOpacity>
                )}
              </View>

              {/* Button */}
              <TouchableOpacity
                style={[s.btn, canSubmit && s.btnActive]}
                onPress={handleSubmit}
                disabled={!canSubmit}
                activeOpacity={0.85}
              >
                {canSubmit ? (
                  <Ionicons name="play" size={18} color="#fff" />
                ) : (
                  <Ionicons name="lock-closed" size={16} color="#888" />
                )}
                <Text style={[s.btnText, canSubmit && s.btnTextActive]}>Start Typing</Text>
                {canSubmit ? (
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                ) : (
                  <View style={s.btnIconPlaceholder} />
                )}
              </TouchableOpacity>

              {/* Previous users */}
              {users.length > 0 && (
                <View style={s.usersSection}>
                  <Text style={s.usersTitle}>Continue as</Text>
                  <View style={s.chipWrap}>
                    {users.map((user, idx) => {
                      const match = name.trim().length > 0 && user.toLowerCase().includes(name.trim().toLowerCase());
                      if (name.trim().length > 0 && !match) return null;
                      const avColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                      return (
                        <TouchableOpacity
                          key={user}
                          style={[s.userChip, match && s.userChipActive]}
                          onPress={() => setName(user)}
                          activeOpacity={0.7}
                        >
                          <View style={[s.miniAvatar, { backgroundColor: avColor }]}>
                            <Text style={s.miniAvatarText}>{initial(user)}</Text>
                          </View>
                          <Text style={[s.userChipName, match && { color: COLORS.green }]} numberOfLines={1}>{user}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>

            {/* Skip */}
            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={s.skipBtn}>
              <Text style={s.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center' },
  container: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
    width: '100%',
    maxWidth: MAX_W,
    alignSelf: 'center',
  },

  // Decorative glows
  glow: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    opacity: 0.16,
  },
  glowGreen: {
    backgroundColor: COLORS.green,
    top: -80,
    right: -60,
  },
  glowRose: {
    backgroundColor: COLORS.rose,
    bottom: 40,
    left: -90,
  },

  // Logo
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoRing: {
    width: 108,
    height: 108,
    borderRadius: 54,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 82,
    height: 82,
    borderRadius: 26,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.teal,
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 16,
    elevation: 10,
  },
  logoLetter: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: '#ffffff',
    fontSize: scaleFont(44),
  },

  // Title
  title: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(34),
    letterSpacing: 1,
    textAlign: 'center',
    marginTop: scaleSize(26),
  },
  tagline: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.amber,
    fontSize: scaleFont(13),
    marginTop: scaleSize(8),
  },

  // Brand bar
  brandBar: {
    flexDirection: 'row',
    gap: scaleSize(8),
    alignItems: 'center',
    marginTop: scaleSize(16),
  },
  brandSeg: {
    width: scaleSize(22),
    height: scaleSize(4),
    borderRadius: 2,
  },

  // Card
  card: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    padding: scaleSize(22),
    marginTop: scaleSize(30),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 18,
    elevation: 8,
  },
  strip: {
    flexDirection: 'row',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  stripSeg: {
    flex: 1,
    height: 4,
  },
  heading: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(17),
    textAlign: 'center',
    marginBottom: scaleSize(20),
  },

  // Input
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2a2a2a',
    paddingHorizontal: scaleSize(12),
  },
  inputRowActive: {
    borderColor: COLORS.teal,
  },
  inputIcon: {
    width: scaleSize(34),
    height: scaleSize(34),
    borderRadius: 10,
    backgroundColor: '#222',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(16),
    paddingVertical: scaleSize(14),
    marginLeft: scaleSize(10),
    outlineWidth: 0,
    outlineStyle: 'none',
  },

  // Button
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#222',
    borderRadius: 14,
    paddingVertical: scaleSize(15),
    marginTop: scaleSize(16),
  },
  btnActive: {
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 8,
  },
  btnText: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: '#8a8a8a',
    fontSize: scaleFont(16),
  },
  btnTextActive: {
    color: '#ffffff',
  },
  btnIconPlaceholder: {
    width: 16,
    height: 16,
  },

  // Users
  usersSection: { marginTop: scaleSize(20) },
  usersTitle: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: scaleFont(12),
    marginBottom: scaleSize(10),
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSize(8),
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(7),
    paddingVertical: scaleSize(5),
    paddingHorizontal: scaleSize(10),
    borderRadius: scaleSize(18),
    backgroundColor: '#111111',
    borderWidth: 1,
    borderColor: '#242424',
    maxWidth: '100%',
  },
  userChipActive: {
    borderColor: '#16a34a66',
    backgroundColor: 'rgba(22,163,74,0.08)',
  },
  miniAvatar: {
    width: scaleSize(24),
    height: scaleSize(24),
    borderRadius: scaleSize(12),
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: '#fff',
    fontSize: scaleFont(12),
  },
  userChipName: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(13),
    flexShrink: 1,
  },

  // Skip
  skipBtn: { marginTop: scaleSize(22) },
  skipText: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textDim,
    fontSize: scaleFont(14),
  },
});