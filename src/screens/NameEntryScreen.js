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
                style={[s.mobileBtn, !canSubmit && s.mobileBtnDim]}
                onPress={handleSubmit}
                disabled={!canSubmit}
                activeOpacity={0.8}
              >
                <Text style={[s.mobileBtnText, !canSubmit && s.mobileBtnTextDim]}>
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

  // Desktop layout - Single centered card (500 x 500)
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="light-content" />
      <View style={s.desktopCenter}>
        <View style={s.desktopCard}>
          <View style={s.desktopLogoCircle}>
            <Text style={s.desktopLogoLetter}>T</Text>
          </View>

          <Text style={s.desktopAppName}>Antriksh Typing Master</Text>
          <Text style={s.desktopTagline}>Professional Hindi Typing Software</Text>

          <View style={s.desktopDivider} />

          <Text style={s.desktopFormTitle}>Welcome</Text>
          <Text style={s.desktopFormSubtitle}>Enter your name to get started</Text>

          <View style={[s.desktopInputWrap, (focused || name.length > 0) && s.desktopInputWrapActive]}>
            <Ionicons
              name="person-outline"
              size={18}
              color={focused ? COLORS.teal : '#666'}
            />
            <TextInput
              style={s.desktopInput}
              placeholder="Type your name here"
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
              autoFocus
            />
            {name.length > 0 && (
              <TouchableOpacity onPress={() => setName('')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="close-circle" size={18} color="#666" />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[s.desktopBtn, !canSubmit && s.desktopBtnDim]}
            onPress={handleSubmit}
            disabled={!canSubmit}
            activeOpacity={0.85}
          >
            <Text style={[s.desktopBtnText, !canSubmit && s.desktopBtnTextDim]}>
              Start Typing
            </Text>
            <Ionicons
              name={canSubmit ? 'arrow-forward' : 'lock-closed'}
              size={16}
              color={COLORS.textWhite}
            />
          </TouchableOpacity>

          {users.length > 0 && (
            <View style={s.desktopUsersSection}>
              <View style={s.desktopUsersDivider}>
                <View style={s.desktopUsersDividerLine} />
                <Text style={s.desktopUsersDividerText}>OR CONTINUE AS</Text>
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

          <Text style={s.desktopCopyright}>2024 Antriksh. All rights reserved.</Text>
        </View>
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
    borderWidth: 1.5,
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
    borderWidth: 2,
    borderColor: '#3f516c',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textWhite,
    fontSize: 15,
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  mobileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.teal,
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 14,
    borderWidth: 2,
    borderColor: COLORS.teal,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 12,
    elevation: 5,
  },
  mobileBtnDim: {
    opacity: 0.55,
  },
  mobileBtnText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 15,
  },
  mobileBtnTextDim: {
    color: 'rgba(255,255,255,0.9)',
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
    borderWidth: 1.5,
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
  desktopCenter: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  desktopCard: {
    width: 500,
    height: 500,
    backgroundColor: '#0e0e0e',
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(13,148,136,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 12 },
    shadowRadius: 30,
    elevation: 10,
  },
  desktopLogoCircle: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.55,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  desktopLogoLetter: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 32,
  },
  desktopAppName: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 23,
    textAlign: 'center',
  },
  desktopTagline: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#999',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
  },
  desktopDivider: {
    width: 44,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.teal,
    marginVertical: 22,
  },
  desktopFormTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 24,
    textAlign: 'center',
  },
  desktopFormSubtitle: {
    fontFamily: 'Calibri',
    fontWeight: '500',
    color: '#888',
    fontSize: 13.5,
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 22,
  },

  desktopInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    backgroundColor: '#111',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3f516c',
    paddingHorizontal: 14,
    gap: 10,
  },
  desktopInputWrapActive: {
    borderColor: COLORS.teal,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 8,
    elevation: 3,
  },
  desktopInput: {
    flex: 1,
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textWhite,
    fontSize: 15,
    paddingVertical: 14,
    outlineStyle: 'none',
    outlineWidth: 0,
  },

  desktopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'stretch',
    gap: 8,
    backgroundColor: COLORS.teal,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 18,
    borderWidth: 2,
    borderColor: COLORS.teal,
    shadowColor: '#14b8a6',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 6,
  },
  desktopBtnDim: {
    opacity: 0.55,
  },
  desktopBtnText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 15,
  },
  desktopBtnTextDim: {
    color: 'rgba(255,255,255,0.9)',
  },

  desktopUsersSection: {
    alignSelf: 'stretch',
    marginTop: 20,
  },
  desktopUsersDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  desktopUsersDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#222',
  },
  desktopUsersDividerText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#555',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  desktopUsersList: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  desktopUserChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#2a2a2a',
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
    color: '#aaa',
    fontSize: 13,
    maxWidth: 100,
  },

  desktopSkipBtn: {
    alignItems: 'center',
    marginTop: 18,
  },
  desktopSkipText: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: '#777',
    fontSize: 13,
  },

  desktopCopyright: {
    fontFamily: 'Calibri',
    fontWeight: '500',
    color: '#333',
    fontSize: 11,
    marginTop: 20,
  },
});
