import React, { useState } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { BackHandler } from 'react-native';

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

  // Mobile layout (original feel)
  if (!IS_DESKTOP) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="light-content" />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.mobileRoot}>
            <View style={s.mobileLeft}>
              <View style={s.mobileLogoCircle}>
                <Text style={s.mobileLogoLetter}>T</Text>
              </View>
              <Text style={s.mobileAppName}>Antriksh{'\n'}Typing Master</Text>
              <Text style={s.mobileTagline}>Hindi Typing Sikhein</Text>
              <View style={s.mobileFeatures}>
                <View style={s.mobileFeatureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                  <Text style={s.mobileFeatureText}>Krutidev / Unicode support</Text>
                </View>
                <View style={s.mobileFeatureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                  <Text style={s.mobileFeatureText}>Real-time feedback</Text>
                </View>
                <View style={s.mobileFeatureRow}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.teal} />
                  <Text style={s.mobileFeatureText}>Progress tracking</Text>
                </View>
              </View>
            </View>

            <View style={s.mobileFormCard}>
              <Text style={s.mobileFormTitle}>Get Started</Text>
              <Text style={s.mobileFormSubtitle}>Enter your name to begin</Text>

              <TextInput
                style={s.mobileInput}
                placeholder="Your name"
                placeholderTextColor="#555"
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

              <TouchableOpacity
                style={[s.mobileBtn, canSubmit && s.mobileBtnActive]}
                onPress={handleSubmit}
                disabled={!canSubmit}
                activeOpacity={0.8}
              >
                <Text style={[s.mobileBtnText, canSubmit && s.mobileBtnTextActive]}>
                  {canSubmit ? 'Start Typing' : 'Enter your name first'}
                </Text>
                {canSubmit && <Ionicons name="arrow-forward" size={16} color="#fff" />}
              </TouchableOpacity>

              {users.length > 0 && (
                <View style={s.mobileUsersSection}>
                  <Text style={s.mobileUsersTitle}>OR CONTINUE AS</Text>
                  <View style={s.mobileUsersList}>
                    {users.slice(0, 3).map((user, idx) => (
                      <TouchableOpacity
                        key={user}
                        style={s.mobileUserChip}
                        onPress={() => setName(user)}
                        activeOpacity={0.7}
                      >
                        <View style={[s.mobileUserAvatar, { backgroundColor: ['#16a34a', '#d97706', '#e11d48'][idx % 3] }]}>
                          <Text style={s.mobileUserAvatarText}>{initial(user)}</Text>
                        </View>
                        <Text style={s.mobileUserName} numberOfLines={1}>{user}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={s.mobileSkipBtn}>
                <Text style={s.mobileSkipText}>Skip for now</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  // Desktop layout - Clean split
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.desktopRoot}>
        {/* Left - Branding */}
        <View style={s.desktopLeft}>
          <View style={s.desktopLeftContent}>
            <View style={s.desktopLogoWrap}>
              <View style={s.desktopLogoCircle}>
                <Text style={s.desktopLogoLetter}>T</Text>
              </View>
            </View>

            <Text style={s.desktopAppName}>Antriksh{'\n'}Typing Master</Text>
            <Text style={s.desktopVersion}>v1.0</Text>

            <View style={s.desktopDivider} />

            <Text style={s.desktopTagline}>Professional Hindi Typing Software</Text>

            <View style={s.desktopFeatures}>
              <View style={s.desktopFeatureRow}>
                <View style={s.desktopFeatureDot} />
                <Text style={s.desktopFeatureText}>Krutidev & Unicode Layouts</Text>
              </View>
              <View style={s.desktopFeatureRow}>
                <View style={s.desktopFeatureDot} />
                <Text style={s.desktopFeatureText}>Real-time Accuracy Feedback</Text>
              </View>
              <View style={s.desktopFeatureRow}>
                <View style={s.desktopFeatureDot} />
                <Text style={s.desktopFeatureText}>WPM & Progress Tracking</Text>
              </View>
              <View style={s.desktopFeatureRow}>
                <View style={s.desktopFeatureDot} />
                <Text style={s.desktopFeatureText}>50+ Practice Lessons</Text>
              </View>
            </View>
          </View>

          <Text style={s.desktopCopyright}>2024 Antriksh. All rights reserved.</Text>
        </View>

        {/* Right - Form */}
        <KeyboardAvoidingView
          style={s.desktopRight}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={s.desktopFormArea}>
            <View style={s.desktopFormHeader}>
              <Text style={s.desktopFormTitle}>Welcome</Text>
              <Text style={s.desktopFormSubtitle}>Enter your name to get started</Text>
            </View>

            <View style={s.desktopInputGroup}>
              <Text style={s.desktopInputLabel}>YOUR NAME</Text>
              <View style={[s.desktopInputWrap, (focused || name.length > 0) && s.desktopInputWrapActive]}>
                <Ionicons
                  name="person-outline"
                  size={18}
                  color={focused ? COLORS.teal : '#555'}
                />
                <TextInput
                  style={s.desktopInput}
                  placeholder="Type your name here"
                  placeholderTextColor="#444"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleSubmit}
                  maxLength={40}
                  autoFocus
                />
                {name.length > 0 && (
                  <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="close-circle" size={18} color="#555" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <TouchableOpacity
              style={[s.desktopBtn, canSubmit && s.desktopBtnActive]}
              onPress={handleSubmit}
              disabled={!canSubmit}
              activeOpacity={0.85}
            >
              <Text style={[s.desktopBtnText, canSubmit && s.desktopBtnTextActive]}>
                Start Typing
              </Text>
              <Ionicons
                name={canSubmit ? 'arrow-forward' : 'lock-closed'}
                size={16}
                color={canSubmit ? '#fff' : '#555'}
              />
            </TouchableOpacity>

            {users.length > 0 && (
              <View style={s.desktopUsersSection}>
                <View style={s.desktopUsersDivider}>
                  <View style={s.desktopUsersDividerLine} />
                  <Text style={s.desktopUsersDividerText}>OR</Text>
                  <View style={s.desktopUsersDividerLine} />
                </View>

                <View style={s.desktopUsersList}>
                  {users.slice(0, 4).map((user, idx) => (
                    <TouchableOpacity
                      key={user}
                      style={s.desktopUserChip}
                      onPress={() => setName(user)}
                      activeOpacity={0.7}
                    >
                      <View style={[s.desktopUserAvatar, { backgroundColor: ['#16a34a', '#d97706', '#e11d48', '#0d9488'][idx % 4] }]}>
                        <Text style={s.desktopUserAvatarText}>{initial(user)}</Text>
                      </View>
                      <Text style={s.desktopUserName} numberOfLines={1}>{user}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            <TouchableOpacity onPress={handleCancel} activeOpacity={0.7} style={s.desktopSkipBtn}>
              <Text style={s.desktopSkipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0a0a0a' },

  // ---- MOBILE ----
  mobileRoot: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  mobileLeft: {
    alignItems: 'center',
    marginBottom: 32,
  },
  mobileLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  mobileLogoLetter: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 32,
  },
  mobileAppName: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 22,
    textAlign: 'center',
    lineHeight: 28,
  },
  mobileTagline: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.teal,
    fontSize: 13,
    marginTop: 6,
  },
  mobileFeatures: {
    marginTop: 16,
    gap: 6,
  },
  mobileFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mobileFeatureText: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#888',
    fontSize: 12,
  },
  mobileFormCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222',
    padding: 24,
  },
  mobileFormTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 20,
  },
  mobileFormSubtitle: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#666',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 20,
  },
  mobileInput: {
    backgroundColor: '#0e0e0e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textWhite,
    fontSize: 15,
  },
  mobileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1e1e1e',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  mobileBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  mobileBtnText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#555',
    fontSize: 15,
  },
  mobileBtnTextActive: {
    color: '#fff',
  },
  mobileUsersSection: {
    marginTop: 20,
  },
  mobileUsersTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#444',
    fontSize: 10,
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  mobileUsersList: {
    flexDirection: 'row',
    gap: 8,
  },
  mobileUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#252525',
  },
  mobileUserAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileUserAvatarText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 11,
  },
  mobileUserName: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#999',
    fontSize: 12,
    maxWidth: 80,
  },
  mobileSkipBtn: {
    alignItems: 'center',
    marginTop: 16,
  },
  mobileSkipText: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#444',
    fontSize: 13,
  },

  // ---- DESKTOP ----
  desktopRoot: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0a0a0a',
  },
  desktopLeft: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    borderRightWidth: 1,
    borderRightColor: '#1a1a1a',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 48,
  },
  desktopLeftContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 360,
  },
  desktopLogoWrap: {
    marginBottom: 32,
  },
  desktopLogoCircle: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopLogoLetter: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 36,
  },
  desktopAppName: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 26,
    textAlign: 'center',
    lineHeight: 34,
  },
  desktopVersion: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#333',
    fontSize: 12,
    marginTop: 4,
  },
  desktopDivider: {
    width: 40,
    height: 2,
    backgroundColor: COLORS.teal,
    marginVertical: 24,
    borderRadius: 1,
  },
  desktopTagline: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
  },
  desktopFeatures: {
    marginTop: 32,
    gap: 12,
  },
  desktopFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  desktopFeatureDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.teal,
  },
  desktopFeatureText: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#555',
    fontSize: 13,
  },
  desktopCopyright: {
    fontFamily: 'Calibri',
    fontWeight: '500',
    color: '#2a2a2a',
    fontSize: 11,
  },

  desktopRight: {
    width: 440,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 48,
  },
  desktopFormArea: {
    width: '100%',
    maxWidth: 340,
  },
  desktopFormHeader: {
    marginBottom: 36,
  },
  desktopFormTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 28,
  },
  desktopFormSubtitle: {
    fontFamily: 'Calibri',
    fontWeight: '500',
    color: '#555',
    fontSize: 14,
    marginTop: 6,
  },

  desktopInputGroup: {
    marginBottom: 20,
  },
  desktopInputLabel: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#444',
    fontSize: 11,
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  desktopInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#252525',
    paddingHorizontal: 14,
    gap: 10,
  },
  desktopInputWrapActive: {
    borderColor: COLORS.teal,
  },
  desktopInput: {
    flex: 1,
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textWhite,
    fontSize: 15,
    paddingVertical: 14,
  },

  desktopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  desktopBtnActive: {
    backgroundColor: COLORS.teal,
    borderColor: COLORS.teal,
  },
  desktopBtnText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#444',
    fontSize: 15,
  },
  desktopBtnTextActive: {
    color: '#fff',
  },

  desktopUsersSection: {
    marginTop: 32,
  },
  desktopUsersDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  desktopUsersDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e1e1e',
  },
  desktopUsersDividerText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#333',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  desktopUsersList: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  desktopUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#1e1e1e',
  },
  desktopUserAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  desktopUserAvatarText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 11,
  },
  desktopUserName: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#777',
    fontSize: 13,
    maxWidth: 100,
  },

  desktopSkipBtn: {
    alignItems: 'center',
    marginTop: 24,
  },
  desktopSkipText: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#333',
    fontSize: 13,
  },
});
