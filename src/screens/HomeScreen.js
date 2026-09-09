// src/screens/HomeScreen.js
// यह app का modern home screen है।
// इसमें student profile (photo, name, current level),
// Total Practice Time / Best WPM / Best Accuracy / Completed Lessons की stats,
// Start Typing button और Continue Last Lesson दिखते हैं।
// Design blue + purple gradient और glassmorphism (blur) पर आधारित है।

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';

// Student profile का demo data
// (बाद में इसे real user data / storage से बदला जा सकता है)
const STUDENT = {
  level: 'Intermediate',
  levelProgress: 65, // अगले level तक का progress %
  photo: null, // photo न होने पर person icon दिखेगा
};

// Home page पर दिखने वाली student stats
const PROFILE_STATS = [
  { label: 'Total Practice Time', value: '5.2h', icon: 'time-outline', color: '#67E8F9' },
  { label: 'Best WPM', value: '68', icon: 'speedometer-outline', color: '#60A5FA' },
  { label: 'Best Accuracy', value: '98%', icon: 'checkmark-circle-outline', color: '#4ADE80' },
  { label: 'Completed Lessons', value: '12', icon: 'book-outline', color: '#A78BFA' },
];

// एक छोटा animation hook -
// card को fade + slight slide-up के साथ दिखाता है
function useFadeInUp(delay = 0) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(value, {
      toValue: 1,
      duration: 550,
      delay,
      useNativeDriver: true,
    }).start();
  }, [value, delay]);

  return {
    opacity: value,
    transform: [
      {
        translateY: value.interpolate({
          inputRange: [0, 1],
          outputRange: [30, 0],
        }),
      },
    ],
  };
}

// Reusable glass card
function GlassCard({ children, style, delay = 0 }) {
  const animStyle = useFadeInUp(delay);
  return (
    <Animated.View style={[animStyle, style]}>
      <View style={styles.glassWrap}>
        <BlurView intensity={25} tint="dark" style={styles.glassInner}>
          {children}
        </BlurView>
      </View>
    </Animated.View>
  );
}

// Home screen का मुख्य component
export default function HomeScreen({ studentName, onStartTyping, onContinueLesson }) {
  const profileAnim = useFadeInUp(0);
  const statsAnim = useFadeInUp(150);
  const startAnim = useFadeInUp(300);
  const continueAnim = useFadeInUp(400);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />

      {/* Blue + Purple gradient background */}
      <LinearGradient
        colors={['#1D4ED8', '#6D28D9', '#7C3AED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
        >
          {/* App Logo + नाम */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="rocket" size={26} color="#ffffff" />
            </View>
            <Text style={styles.appName}>ANTRIKSH TYPING MASTER</Text>
          </View>

          {/* Student Profile card - Photo + Name + Current Level */}
          <GlassCard style={styles.fullWidth} delay={0}>
            <Animated.View style={[styles.profileRow, profileAnim]}>
              {/* Photo - circular avatar */}
              <View style={styles.avatarWrap}>
                {STUDENT.photo ? (
                  <Image source={{ uri: STUDENT.photo }} style={styles.avatar} />
                ) : (
                  <Ionicons name="person" size={52} color="#ffffff" />
                )}
                <View style={styles.onlineDot} />
              </View>

              {/* Student Name + Level */}
              <View style={styles.profileInfo}>
                <Text style={styles.studentName}>{studentName}</Text>

                <View style={styles.levelBadge}>
                  <Ionicons name="star" size={14} color="#FBBF24" />
                  <Text style={styles.levelText}>Current Level: {STUDENT.level}</Text>
                </View>

                {/* Level progress bar */}
                <View style={styles.progressTrack}>
                  <View
                    style={[styles.progressFill, { width: `${STUDENT.levelProgress}%` }]}
                  />
                </View>
                <Text style={styles.progressLabel}>
                  {STUDENT.levelProgress}% to next level
                </Text>
              </View>
            </Animated.View>
          </GlassCard>

          {/* Live practice time */}
          <GlassCard style={styles.fullWidth} delay={100}>
            <Animated.View style={[styles.practiceRow, statsAnim]}>
              <Ionicons name="pulse" size={24} color="#4ADE80" />
              <View style={styles.practiceInfo}>
                <Text style={styles.practiceValue}>05:12:40</Text>
                <Text style={styles.practiceLabel}>Today's Live Practice</Text>
              </View>
              <TouchableOpacity style={styles.practiceBtn} onPress={onStartTyping}>
                <Text style={styles.practiceBtnText}>Continue</Text>
              </TouchableOpacity>
            </Animated.View>
          </GlassCard>

          {/* Start Typing - big main gradient button */}
          <Animated.View style={[styles.fullWidth, startAnim]}>
            <TouchableOpacity onPress={onStartTyping} activeOpacity={0.85}>
              <LinearGradient
                colors={['#FFFFFF', '#E0E7FF']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.startButton}
              >
                <Ionicons name="play" size={20} color="#4338CA" />
                <Text style={styles.startButtonText}>Start Typing</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {/* Continue Last Lesson - glass card button */}
          <GlassCard style={styles.fullWidth} delay={400}>
            <TouchableOpacity
              onPress={onContinueLesson}
              style={styles.continueRow}
              activeOpacity={0.8}
            >
              <View style={styles.continueIcon}>
                <Ionicons name="book" size={22} color="#A78BFA" />
              </View>
              <View style={styles.continueText}>
                <Text style={styles.continueTitle}>Continue Last Lesson</Text>
                <Text style={styles.continueSub}>Lesson 3 • Basic Words</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.55)" />
            </TouchableOpacity>
          </GlassCard>

          {/* Student Stats - Best WPM, Best Accuracy, etc. */}
          <GlassCard style={styles.fullWidth} delay={500}>
            <Text style={styles.sectionTitle}>Your Stats</Text>
            <View style={styles.grid}>
              {PROFILE_STATS.map((stat) => (
                <View key={stat.label} style={styles.gridItem}>
                  <Ionicons name={stat.icon} size={20} color={stat.color} />
                  <Text style={styles.gridValue}>{stat.value}</Text>
                  <Text style={styles.gridLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

// ----- Styles -----
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1D4ED8',
  },
  gradient: {
    flex: 1,
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 120, // bottom navigation के लिए जगह
  },
  fullWidth: {
    width: '100%',
    marginTop: 14,
  },

  // Logo section
  logoWrap: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 6,
  },
  logoCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  appName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 2,
    flexShrink: 1,
  },

  // Glass card styling (glassmorphism)
  glassWrap: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  glassInner: {
    padding: 16,
  },

  // ----- Student Profile card -----
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  onlineDot: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4ADE80',
    borderWidth: 2,
    borderColor: '#6D28D9',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  levelText: {
    color: '#FBBF24',
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 10,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
    backgroundColor: '#FBBF24',
  },
  progressLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 11,
    marginTop: 4,
  },

  // ----- Live practice bar -----
  practiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  practiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  practiceValue: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  practiceLabel: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },
  practiceBtn: {
    backgroundColor: 'rgba(74,222,128,0.25)',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  practiceBtnText: {
    color: '#4ADE80',
    fontSize: 13,
    fontWeight: '700',
  },

  // Start typing button
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingVertical: 16,
    gap: 8,
    shadowColor: '#A78BFA',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 8,
  },
  startButtonText: {
    color: '#4338CA',
    fontSize: 18,
    fontWeight: '800',
  },

  // Continue last lesson
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(167,139,250,0.25)',
  },
  continueText: {
    flex: 1,
    marginLeft: 12,
  },
  continueTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  continueSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
    marginTop: 2,
  },

  // Stats card
  sectionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  gridValue: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  gridLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 2,
  },
});