import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

export default function ReviewScreen({ onBack, onStartReview }) {
  const [selectedKey, setSelectedKey] = useState('Difficult Keys');
  const [selectedExercise, setSelectedExercise] = useState('Keyboard Drill');
  const [gameOpen, setGameOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState('Clouds');

  const keyOptions = ['Difficult Keys', 'Studied Keys'];
  const exerciseOptions = ['Keyboard Drill', 'Word Drill', 'Game'];
  const gameOptions = ['Clouds', 'WordTris'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView contentContainerStyle={[styles.container, IS_DESKTOP && styles.containerDesktop]} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Ionicons name="refresh-circle" size={22} color={COLORS.amber} />
            <Text style={styles.headerTitle}>Review</Text>
          </View>

          {/* Two columns */}
          <View style={styles.columns}>
            {/* Column 1: Key to Review */}
            <View style={styles.column}>
              <Text style={styles.item}>1. Key to Review</Text>
              <View style={[styles.columnDivider, { backgroundColor: COLORS.amber + '40' }]} />
              <View style={styles.optionsBox}>
                {keyOptions.map((option) => (
                  <View key={option} style={styles.optionRow}>
                    <TouchableOpacity style={styles.radioOuter} onPress={() => setSelectedKey(option)} activeOpacity={0.7}>
                      <Ionicons
                        name={selectedKey === option ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={selectedKey === option ? COLORS.amber : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedKey(option)} activeOpacity={0.7}>
                      <Text style={[styles.optionLabel, selectedKey === option && { color: COLORS.amber }]}>{option}</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Column 2: Exercise Type */}
            <View style={styles.column}>
              <Text style={styles.item}>2. Exercise Type</Text>
              <View style={[styles.columnDivider, { backgroundColor: COLORS.teal + '40' }]} />
              <View style={styles.optionsBox}>
                {exerciseOptions.map((option) => (
                  <View key={option} style={styles.optionRow}>
                    <TouchableOpacity style={styles.radioOuter} onPress={() => setSelectedExercise(option)} activeOpacity={0.7}>
                      <Ionicons
                        name={selectedExercise === option ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={selectedExercise === option ? COLORS.teal : COLORS.textMuted}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setSelectedExercise(option)} activeOpacity={0.7}>
                      <Text style={[styles.optionLabel, selectedExercise === option && { color: COLORS.teal }]}>{option}</Text>
                    </TouchableOpacity>
                    {option === 'Game' && (
                      <View style={styles.dropdownWrap}>
                        <TouchableOpacity
                          style={[styles.dropdownBtn, { borderColor: COLORS.green + '40' }]}
                          onPress={() => setGameOpen(!gameOpen)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.dropdownText, { color: COLORS.green }]}>{selectedGame}</Text>
                          <Ionicons name="chevron-down" size={14} color={COLORS.green} />
                        </TouchableOpacity>
                        {gameOpen && (
                          <View style={styles.dropdownList}>
                            {gameOptions.map((game) => (
                              <TouchableOpacity
                                key={game}
                                style={[styles.dropdownItem, selectedGame === game && { backgroundColor: COLORS.green + '20' }]}
                                onPress={() => { setSelectedGame(game); setGameOpen(false); }}
                                activeOpacity={0.7}
                              >
                                <Text style={[styles.dropdownItemText, selectedGame === game && { color: COLORS.green, fontFamily: 'Calibri', fontWeight: '700'}]}>
                                  {game}
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Start Review button */}
          <TouchableOpacity
            style={styles.startBtn}
            activeOpacity={0.85}
            onPress={() => {
              if (onStartReview) {
                onStartReview({ keyOption: selectedKey, exercise: selectedExercise, game: selectedGame });
              }
            }}
          >
            <View style={[styles.startBtnGradient, { backgroundColor: COLORS.green }]}>
              <Ionicons name="play" size={16} color="#fff" />
              <Text style={styles.startBtnText}>Start Review</Text>
            </View>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: scaleSize(16) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginBottom: scaleSize(16) },
  backBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontFamily: 'Calibri', fontWeight: '700', fontSize: scaleFont(20), color: COLORS.textWhite, flex: 1 },

  columns: { flexDirection: 'row', gap: scaleSize(12), marginHorizontal: scaleSize(8), flexWrap: 'wrap' },
  column: { flex: 1 },
  item: { fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, letterSpacing: 0.5 },
  columnDivider: { height: 1, marginTop: scaleSize(8) },
  optionsBox: { marginTop: scaleSize(10), gap: scaleSize(8) },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(6), flexWrap: 'wrap' },
  radioOuter: { justifyContent: 'center', alignItems: 'center' },
  optionLabel: { fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight },

  dropdownWrap: { marginLeft: scaleSize(8), position: 'relative', zIndex: 100, elevation: 20, alignSelf: 'flex-start' },
  dropdownBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: COLORS.cardBg, borderWidth: 1,
    borderRadius: scaleSize(8), paddingHorizontal: scaleSize(10), paddingVertical: scaleSize(5),
  },
  dropdownText: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700'},
  dropdownList: {
    position: 'absolute', top: '100%', left: 0, right: 0, minWidth: 140,
    marginTop: 4, backgroundColor: '#1a1a2e', borderWidth: 1.5,
    borderColor: COLORS.cardBorder,     borderRadius: scaleSize(8), overflow: 'hidden',
    zIndex: 100, elevation: 25,
  },
  dropdownItem: { paddingHorizontal: scaleSize(12), paddingVertical: scaleSize(8) },
  dropdownItemText: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textLight },

  startBtn: { alignSelf: 'center', marginTop: scaleSize(28), borderRadius: scaleSize(28), overflow: 'hidden' },
  startBtnGradient: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: scaleSize(8), paddingVertical: scaleSize(14), paddingHorizontal: scaleSize(36),
  },
  startBtnText: { color: '#fff', fontSize: scaleFont(15), fontFamily: 'Calibri', fontWeight: '700'},
});
