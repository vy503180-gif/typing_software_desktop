// src/screens/NameEntryScreen.js
// जब app पहली बार open होती है तो यह screen दिखती है।
// यहाँ user अपना name भरता है और "Enter" दबाता है,
// फिर app के अंदर जाकर typing practice कर सकता है।
// वही name Home screen के profile में दिखता है।

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
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

export default function NameEntryScreen({ onSubmit }) {
  const [name, setName] = useState('');

  const canSubmit = name.trim().length > 0;

  const handleSubmit = () => {
    if (canSubmit) {
      Keyboard.dismiss();
      onSubmit(name.trim());
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#1D4ED8', '#6D28D9', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Logo */}
            <View style={styles.logoCircle}>
              <Ionicons name="rocket" size={40} color="#ffffff" />
            </View>
            <Text style={styles.appName}>ANTRIKSH TYPING MASTER</Text>
            <Text style={styles.tagline}>अपनी typing की शुरुआत करें</Text>

            {/* Name panel - glass card */}
            <View style={styles.cardWrap}>
              <BlurView intensity={25} tint="dark" style={styles.card}>
                <Text style={styles.cardTitle}>Welcome!</Text>
                <Text style={styles.cardSub}>Enter your name to get started</Text>

                {/* Name input */}
                <View style={styles.inputWrap}>
                  <Ionicons name="person-outline" size={20} color="#A78BFA" />
                  <TextInput
                    style={styles.input}
                    placeholder="Student name"
                    placeholderTextColor="rgba(255,255,255,0.45)"
                    value={name}
                    onChangeText={setName}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit}
                    maxLength={40}
                  />
                </View>

                {/* Enter button */}
                <TouchableOpacity
                  style={[styles.enterBtn, !canSubmit && styles.enterBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!canSubmit}
                  activeOpacity={0.85}
                >
                  <Text style={styles.enterBtnText}>Enter App</Text>
                  <Ionicons name="arrow-forward" size={18} color="#4338CA" />
                </TouchableOpacity>
              </BlurView>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D4ED8',
  },
  gradient: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  logoCircle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  appName: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 14,
    textAlign: 'center',
  },
  tagline: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 6,
  },
  cardWrap: {
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 32,
  },
  card: {
    padding: 24,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  cardSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    color: '#ffffff',
    fontSize: 17,
    paddingVertical: 14,
    marginLeft: 10,
  },
  enterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 15,
    marginTop: 16,
    shadowColor: '#A78BFA',
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
  },
  enterBtnDisabled: {
    opacity: 0.5,
  },
  enterBtnText: {
    color: '#4338CA',
    fontSize: 17,
    fontWeight: '800',
  },
});