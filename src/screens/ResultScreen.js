// src/screens/ResultScreen.js
// Course completion screen with professional result summary.

import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS } from '../theme';

export default function ResultScreen({ course, onBack }) {
  const name = course && course.title ? course.title : 'Course';

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.badge}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
          <Text style={styles.title}>Course Completed!</Text>
          <Text style={styles.sub}>
            Congratulations — you have finished every lesson in{' '}
            <Text style={styles.strong}>{name}</Text>.
          </Text>

          <View style={styles.items}>
            <View style={styles.item}>
              <Ionicons name="ribbon" size={20} color={COLORS.amber} />
              <Text style={styles.itemText}>You earned the {name} badge</Text>
            </View>
            <View style={styles.item}>
              <Ionicons name="trending-up" size={20} color={COLORS.blueBright} />
              <Text style={styles.itemText}>Your typing speed has grown</Text>
            </View>
            <View style={styles.item}>
              <Ionicons name="trophy" size={20} color={COLORS.green} />
              <Text style={styles.itemText}>Ready for the next challenge</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={onBack} activeOpacity={0.85}>
            <Ionicons name="arrow-back" size={17} color="#fff" />
            <Text style={styles.btnPrimaryText}>Back to Course</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    alignItems: 'center',
    backgroundColor: 'rgba(30,46,84,0.5)',
    borderWidth: 1, borderColor: 'rgba(59,130,246,0.4)',
    borderRadius: 20, padding: 32,
    maxWidth: 520, width: '100%', alignSelf: 'center',
    shadowColor: '#14b8a6', shadowOpacity: 0.25, shadowOffset: { width: 0, height: 8 }, shadowRadius: 24, elevation: 8,
  },
  badge: {
    width: 76, height: 76, borderRadius: 38,
    backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    shadowColor: '#22c55e', shadowOpacity: 0.5, shadowOffset: { width: 0, height: 6 }, shadowRadius: 18, elevation: 6,
  },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: '#fff', fontSize: 24, textAlign: 'center' },
  sub: {
    fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textMuted,
    fontSize: 14, textAlign: 'center', marginTop: 8, lineHeight: 21,
  },
  strong: { color: COLORS.cyan, fontFamily: 'Calibri', fontWeight: '700' },
  items: { width: '100%', marginTop: 22, gap: 10 },
  item: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    borderRadius: 12, padding: 12,
  },
  itemText: { flex: 1, fontFamily: 'Calibri', fontWeight: '600', color: COLORS.textLight, fontSize: 13 },
  btnPrimary: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#0e9488', borderRadius: 12,
    paddingVertical: 13, marginTop: 24, width: '100%',
  },
  btnPrimaryText: { color: '#fff', fontFamily: 'Calibri', fontWeight: '700', fontSize: 14 },
});