// src/screens/LessonsScreen.js

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import { LESSON_DIFFICULTY } from '../data/lessons';

const LESSONS = {
  english: [
    { id: 1, title: 'Home Row - Letters', desc: 'ASDF JKL;', time: '2 min', characters: 54 },
    { id: 2, title: 'Home Row - Easy Words 1', desc: 'sad, lad, fall', time: '2 min', characters: 42 },
    { id: 3, title: 'Home Row - Easy Words 2', desc: 'ask, all, jazz', time: '2 min', characters: 44 },
    { id: 4, title: 'Middle Row (G H)', desc: 'gh asdfghjkl', time: '2 min', characters: 48 },
    { id: 5, title: 'Middle Row - Words', desc: 'has, gas, dash', time: '2 min', characters: 37 },
    { id: 6, title: 'Top Row - Letters', desc: 'QWERTYUIOP', time: '3 min', characters: 48 },
    { id: 7, title: 'Top Row - Words 1', desc: 'write, quiet', time: '3 min', characters: 42 },
    { id: 8, title: 'Top Row - Words 2', desc: 'great, water', time: '3 min', characters: 44 },
    { id: 9, title: 'Bottom Row - Letters', desc: 'ZXCVBNM', time: '3 min', characters: 42 },
    { id: 10, title: 'Bottom Row - Words', desc: 'buzz, zinc, box', time: '3 min', characters: 44 },
    { id: 11, title: 'All Letters - Mixed Words', desc: 'quick brown fox', time: '4 min', characters: 44 },
    { id: 12, title: 'Common Words 1', desc: 'the, and, for', time: '4 min', characters: 44 },
    { id: 13, title: 'Common Words 2', desc: 'was, not, but', time: '4 min', characters: 42 },
    { id: 14, title: 'Common Words 3', desc: 'from, have, this', time: '4 min', characters: 46 },
    { id: 15, title: 'Sight Words', desc: 'jump, rain, tree', time: '4 min', characters: 46 },
    { id: 16, title: 'Action Verbs', desc: 'run, walk, speak', time: '5 min', characters: 46 },
    { id: 17, title: 'Short Sentences', desc: 'i am fine...', time: '5 min', characters: 44 },
    { id: 18, title: 'Question Words', desc: 'who, what, when', time: '5 min', characters: 48 },
    { id: 19, title: 'Colours', desc: 'red, blue, green', time: '5 min', characters: 47 },
    { id: 20, title: 'Days of Week', desc: 'monday...sunday', time: '5 min', characters: 49 },
    { id: 21, title: 'Months of Year', desc: 'january...august', time: '6 min', characters: 45 },
    { id: 22, title: 'Numbers', desc: 'one...ten', time: '6 min', characters: 43 },
    { id: 23, title: 'School Words', desc: 'teacher, student', time: '6 min', characters: 48 },
    { id: 24, title: 'Family Words', desc: 'father, mother', time: '6 min', characters: 56 },
    { id: 25, title: 'Nature - Sentence', desc: 'the sun rises...', time: '7 min', characters: 49 },
    { id: 26, title: 'About Me', desc: 'my name is...', time: '7 min', characters: 49 },
    { id: 27, title: 'Proverb Practice', desc: 'practice makes...', time: '8 min', characters: 57 },
    { id: 28, title: 'Tongue Twister', desc: 'she sells...', time: '8 min', characters: 62 },
    { id: 29, title: 'Long Paragraph', desc: 'the early morning...', time: '9 min', characters: 75 },
    { id: 30, title: 'Final Exam', desc: 'typing fast and...', time: '10 min', characters: 118 },
  ],
  hindi: [
    { id: 1, title: 'क, ख, ग', desc: 'वर्णमाला अभ्यास', time: '2 min', characters: 48 },
    { id: 2, title: 'स्वर', desc: 'अ आ इ ई', time: '2 min', characters: 28 },
    { id: 3, title: 'शब्द अभ्यास', desc: 'नमस्ते, धन्यवाद', time: '3 min', characters: 48 },
    { id: 4, title: 'वाक्य लेखन', desc: 'छोटे वाक्य टाइप करो', time: '5 min', characters: 90 },
    { id: 5, title: 'पैराग्राफ', desc: 'लंबा पाठ अभ्यास', time: '5 min', characters: 100 },
    { id: 6, title: 'च, छ, ज, झ, ञ', desc: 'दूसरा वर्ण समूह', time: '2 min', characters: 40 },
    { id: 7, title: 'ट, ठ, ड, ढ, ण', desc: 'तीसरा वर्ण समूह', time: '2 min', characters: 40 },
    { id: 8, title: 'त, थ, द, ध, न', desc: 'चौथा वर्ण समूह', time: '2 min', characters: 40 },
    { id: 9, title: 'प, फ, ब, भ, म', desc: 'पाँचवाँ वर्ण समूह', time: '2 min', characters: 40 },
    { id: 10, title: 'य, र, ल, व, श, ष, स, ह', desc: 'अंतिम वर्ण समूह', time: '3 min', characters: 40 },
    { id: 11, title: 'छोटे वाक्य', desc: 'रोज़मर्रा के वाक्य', time: '4 min', characters: 88 },
    { id: 12, title: 'संवाद अभ्यास', desc: 'बातचीत के वाक्य', time: '5 min', characters: 104 },
    { id: 13, title: 'भारत परिचय', desc: 'देश के बारे में', time: '5 min', characters: 96 },
    { id: 14, title: 'प्रौद्योगिकी', desc: 'तकनीक पर निबंध', time: '6 min', characters: 120 },
    { id: 15, title: 'अभ्यास परीक्षा', desc: 'लंबा पाठ — समय सीमा', time: '8 min', characters: 160 },
  ],
};

const LESSON_COLORS = [COLORS.green, COLORS.amber, COLORS.teal, COLORS.rose];

// Hindi Character Map data
const CHARMAP_CONSONANTS = [
  { unicode: 'क', kruti: 'd' }, { unicode: 'ख', kruti: '[k' }, { unicode: 'ग', kruti: 'x' },
  { unicode: 'घ', kruti: '?k' }, { unicode: 'ङ', kruti: '\xb3' }, { unicode: 'च', kruti: 'p' },
  { unicode: 'छ', kruti: 'N' }, { unicode: 'ज', kruti: 't' }, { unicode: 'झ', kruti: '>' },
  { unicode: 'ञ', kruti: '\xa5' }, { unicode: 'ट', kruti: 'V' }, { unicode: 'ठ', kruti: 'B' },
  { unicode: 'ड', kruti: 'M' }, { unicode: 'ढ', kruti: '<' }, { unicode: 'ण', kruti: '.k' },
  { unicode: 'त', kruti: 'r' }, { unicode: 'थ', kruti: 'Fk' }, { unicode: 'द', kruti: 'n' },
  { unicode: 'ध', kruti: '/k' }, { unicode: 'न', kruti: 'u' }, { unicode: 'प', kruti: 'i' },
  { unicode: 'फ', kruti: 'Q' }, { unicode: 'ब', kruti: 'c' }, { unicode: 'भ', kruti: 'Hk' },
  { unicode: 'म', kruti: 'e' }, { unicode: 'य', kruti: ';' }, { unicode: 'र', kruti: 'j' },
  { unicode: 'ल', kruti: 'y' }, { unicode: 'व', kruti: 'o' }, { unicode: 'श', kruti: "'k" },
  { unicode: 'ष', kruti: '"k' }, { unicode: 'स', kruti: 'l' }, { unicode: 'ह', kruti: 'g' },
];

const CHARMAP_VOWELS = [
  { unicode: 'अ', kruti: 'v' }, { unicode: 'आ', kruti: 'vk' }, { unicode: 'इ', kruti: 'b' },
  { unicode: 'ई', kruti: 'bZ' }, { unicode: 'उ', kruti: 'm' }, { unicode: 'ऊ', kruti: '\xc5' },
  { unicode: 'ए', kruti: ',' }, { unicode: 'ऐ', kruti: ',s' }, { unicode: 'ओ', kruti: 'vks' },
  { unicode: 'औ', kruti: 'vkS' },
];

const CHARMAP_MATRAS = [
  { unicode: 'ा', kruti: 'k' }, { unicode: 'ि', kruti: 'f' }, { unicode: 'ी', kruti: 'h' },
  { unicode: 'ु', kruti: 'q' }, { unicode: 'ू', kruti: 'w' }, { unicode: 'ृ', kruti: '`' },
  { unicode: 'े', kruti: 's' }, { unicode: 'ै', kruti: 'S' }, { unicode: 'ो', kruti: 'ks' },
  { unicode: 'ौ', kruti: 'kS' }, { unicode: 'ं', kruti: 'a' }, { unicode: 'ः', kruti: '%' },
  { unicode: 'ँ', kruti: '\xa1' }, { unicode: 'ॅ', kruti: 'W' },
];

const CHARMAP_NUMBERS = [
  { unicode: '०', kruti: '\xe5' }, { unicode: '१', kruti: '\x0192' },
  { unicode: '२', kruti: '\u201e' }, { unicode: '३', kruti: '\u2026' },
  { unicode: '४', kruti: '\u2020' }, { unicode: '५', kruti: '\u2021' },
  { unicode: '६', kruti: '\u02c6' }, { unicode: '७', kruti: '\u2030' },
  { unicode: '८', kruti: '\u0160' }, { unicode: '९', kruti: '\u2039' },
];

const getDifficultyColor = (diff) => {
  switch (diff) {
    case 'Easy': return COLORS.green;
    case 'Medium': return COLORS.amber;
    case 'Hard': return COLORS.rose;
    default: return COLORS.teal;
  }
};

export default function LessonsScreen({
  onStartLesson,
  onBack,
  unlockedLessons = { english: [1], hindi: [1] },
  hindiLayout = 'mangal',
  onChangeHindiLayout,
}) {
  const [selectedLang, setSelectedLang] = useState('english');
  const [chosenLayout, setChosenLayout] = useState(hindiLayout);
  const [showCharMap, setShowCharMap] = useState(false);
  const [charMapTab, setCharMapTab] = useState('mangal');
  const lessons = LESSONS[selectedLang];
  const unlocked = unlockedLessons[selectedLang] || [];
  const countUnlocked = lessons.filter((l) => unlocked.includes(l.id)).length;

  const handleLessonPress = (lesson) => {
    onStartLesson(selectedLang, lesson.id, lesson.title, parseInt(lesson.time) * 60);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
          </TouchableOpacity>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Lessons</Text>
            <Text style={styles.subtitle}>Choose a category and start learning</Text>
          </View>
        </View>

        {/* Language Toggle */}
        <View style={styles.langToggle}>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === 'english' && styles.langBtnActive]}
            onPress={() => setSelectedLang('english')}
          >
            <Ionicons name="globe" size={16} color={selectedLang === 'english' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.langBtnText, selectedLang === 'english' && styles.langBtnTextActive]}>English</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langBtn, selectedLang === 'hindi' && styles.langBtnActive]}
            onPress={() => setSelectedLang('hindi')}
          >
            <Ionicons name="language" size={16} color={selectedLang === 'hindi' ? '#fff' : COLORS.textMuted} />
            <Text style={[styles.langBtnText, selectedLang === 'hindi' && styles.langBtnTextActive]}>हिंदी</Text>
          </TouchableOpacity>
        </View>

        {/* Hindi Typing Layout */}
        {selectedLang === 'hindi' && (
          <View style={styles.layoutCard}>
            <View style={styles.layoutHeader}>
              <Ionicons name="keypad" size={16} color={COLORS.teal} />
              <Text style={styles.layoutTitle}>Typing Layout</Text>
            </View>
            <View style={styles.layoutSegment}>
              {[
                { label: 'Mangal', value: 'mangal' },
                { label: 'Kruti Dev', value: 'krutidev' },
              ].map((d) => {
                const sel = hindiLayout === d.value;
                return (
                  <TouchableOpacity
                    key={d.value}
                    style={[styles.layoutItem, sel && styles.layoutItemActive]}
                    onPress={() => onChangeHindiLayout && onChangeHindiLayout(d.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.layoutItemText, sel && styles.layoutItemTextActive]}>
                      {d.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.layoutHint}>
              {hindiLayout === 'krutidev'
                ? 'Kruti Dev keyboard se type karo, display Unicode (Mangal) me hoga.'
                : 'Normal Unicode (Mangal) Hindi keyboard se type karo.'}
            </Text>
            <TouchableOpacity
              style={styles.charMapBtn}
              onPress={() => { setCharMapTab(hindiLayout); setShowCharMap(true); }}
              activeOpacity={0.8}
            >
              <Ionicons name="grid" size={14} color={COLORS.teal} />
              <Text style={styles.charMapBtnText}>View Character Map</Text>
              <Ionicons name="chevron-forward" size={14} color={COLORS.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="trophy" size={18} color={COLORS.amber} />
            <Text style={styles.progressTitle}>{countUnlocked} of {lessons.length} Unlocked</Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${(countUnlocked / lessons.length) * 100}%`, backgroundColor: COLORS.green }]}
            />
          </View>
        </View>

        {/* Lessons List */}
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {lessons.map((lesson, idx) => {
            const locked = !unlocked.includes(lesson.id);
            const diffColor = getDifficultyColor(LESSON_DIFFICULTY[lesson.id]);
            const accentColor = LESSON_COLORS[idx % LESSON_COLORS.length];
            return (
              <TouchableOpacity
                key={lesson.id}
                style={[styles.lessonCard, locked && styles.lessonCardLocked]}
                onPress={() => !locked && handleLessonPress(lesson)}
                activeOpacity={locked ? 1 : 0.8}
                disabled={locked}
              >
                <View style={[styles.lessonIcon, { backgroundColor: locked ? 'rgba(255,255,255,0.06)' : accentColor + '20' }]}>
                  <Ionicons
                    name={locked ? 'lock-closed' : 'keypad'}
                    size={20}
                    color={locked ? COLORS.textDim : accentColor}
                  />
                </View>
                <View style={styles.lessonInfo}>
                  <Text style={[styles.lessonNumber, { color: accentColor }]}>LESSON {lesson.id}</Text>
                  <Text style={[styles.lessonTitle, locked && { color: COLORS.textDim }]}>{lesson.title}</Text>
                  <Text style={[styles.lessonDesc, locked && { color: COLORS.textDim }]}>{lesson.desc}</Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.badge}>
                      <Ionicons name="time" size={10} color={COLORS.textMuted} />
                      <Text style={styles.badgeText}>{lesson.time}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: diffColor + '18' }]}>
                      <Ionicons name="speedometer" size={10} color={diffColor} />
                      <Text style={[styles.badgeText, { color: diffColor }]}>{LESSON_DIFFICULTY[lesson.id]}</Text>
                    </View>
                    <View style={styles.badge}>
                      <Ionicons name="text" size={10} color={COLORS.textMuted} />
                      <Text style={styles.badgeText}>{lesson.characters} chars</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.lessonRight}>
                  {locked ? (
                    <Ionicons name="lock-closed" size={16} color={COLORS.textDim} />
                  ) : (
                    <View style={[styles.playBtn, { backgroundColor: accentColor + '20' }]}>
                      <Ionicons name="chevron-forward" size={18} color={accentColor} />
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Character Map Modal */}
        <Modal
          visible={showCharMap}
          transparent
          animationType="slide"
          onRequestClose={() => setShowCharMap(false)}
        >
          <View style={styles.cmOverlay}>
            <View style={styles.cmCard}>
              {/* Header */}
              <View style={styles.cmHeader}>
                <Text style={styles.cmTitle}>Hindi Character Map</Text>
                <TouchableOpacity onPress={() => setShowCharMap(false)} style={styles.cmClose}>
                  <Ionicons name="close" size={20} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.cmTabs}>
                {[
                  { label: 'Mangal (Unicode)', value: 'mangal' },
                  { label: 'Kruti Dev', value: 'krutidev' },
                ].map((t) => {
                  const sel = charMapTab === t.value;
                  return (
                    <TouchableOpacity
                      key={t.value}
                      style={[styles.cmTab, sel && styles.cmTabActive]}
                      onPress={() => setCharMapTab(t.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.cmTabText, sel && styles.cmTabTextActive]}>{t.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <ScrollView style={styles.cmScroll} contentContainerStyle={styles.cmScrollContent}>
                {/* Consonants */}
                <Text style={styles.cmSectionTitle}>व्यंजन (Consonants)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_CONSONANTS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>

                {/* Vowels */}
                <Text style={styles.cmSectionTitle}>स्वर (Vowels)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_VOWELS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>

                {/* Matras */}
                <Text style={styles.cmSectionTitle}>मात्राएँ (Matras)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_MATRAS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{'अ' + c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>

                {/* Numbers */}
                <Text style={styles.cmSectionTitle}>अंक (Numbers)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_NUMBERS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : String(i)}</Text>
                    </View>
                  ))}
                </View>

                {/* Special */}
                <Text style={styles.cmSectionTitle}>विशेष</Text>
                <View style={styles.cmGrid}>
                  {[
                    { unicode: '्', label: 'halant', kruti: '~' },
                    { unicode: '़', label: 'nukta', kruti: '+' },
                    { unicode: 'ॐ', label: 'om', kruti: '=\u0915\u094d\u0930' },
                    { unicode: '।', label: 'purna viram', kruti: 'A' },
                  ].map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.label}</Text>
                    </View>
                  ))}
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  container: { flex: 1, padding: scaleSize(16) },
  containerDesktop: {
    padding: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(16) },
  backBtn: {
    width: scaleSize(38), height: scaleSize(38), borderRadius: scaleSize(19),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, fontSize: scaleFont(24) },
  subtitle: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(12), marginTop: 2 },

  langToggle: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBg,
    borderRadius: scaleSize(14), padding: scaleSize(4), marginBottom: scaleSize(14),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  langBtn: { flex: 1, paddingVertical: scaleSize(10), borderRadius: scaleSize(10), alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: scaleSize(6) },
  langBtnActive: { backgroundColor: COLORS.green },
  langBtnText: { color: COLORS.textMuted, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  langBtnTextActive: { color: '#fff', fontFamily: 'Calibri', fontWeight: '700'},

  progressCard: {
    borderRadius: scaleSize(14), borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg, padding: scaleSize(14), marginBottom: scaleSize(14),
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700'},
  progressTrack: {
    height: 7, borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: scaleSize(10), overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },

  scrollContent: { paddingBottom: scaleSize(120) },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    padding: scaleSize(12), marginBottom: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  lessonCardLocked: { opacity: 0.45 },
  lessonIcon: {
    width: scaleSize(44), height: scaleSize(44), borderRadius: scaleSize(12),
    alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo: { marginLeft: scaleSize(10), flex: 1 },
  lessonNumber: { fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700', letterSpacing: 1, marginBottom: 1 },
  lessonTitle: { color: COLORS.textWhite, fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700'},
  lessonDesc: { fontFamily: 'Calibri', color: COLORS.textMuted, fontSize: scaleFont(11), marginTop: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(5), marginTop: scaleSize(6) },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: scaleSize(6), paddingHorizontal: scaleSize(5), paddingVertical: scaleSize(2),
  },
  badgeText: { color: COLORS.textMuted, fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700'},
  lessonRight: { marginLeft: scaleSize(6) },
  playBtn: {
    width: scaleSize(32), height: scaleSize(32), borderRadius: scaleSize(16),
    alignItems: 'center', justifyContent: 'center',
  },

  layoutCard: {
    borderRadius: scaleSize(14), borderWidth: 1, borderColor: COLORS.cardBorder,
    backgroundColor: COLORS.cardBg, padding: scaleSize(12), marginBottom: scaleSize(14),
  },
  layoutHeader: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(6), marginBottom: scaleSize(10) },
  layoutTitle: { color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  layoutSegment: { flexDirection: 'row', gap: scaleSize(8) },
  layoutItem: {
    flex: 1, paddingVertical: scaleSize(9), borderRadius: scaleSize(10), alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  layoutItemActive: { backgroundColor: COLORS.teal + '22', borderColor: COLORS.teal },
  layoutItemText: { color: COLORS.textMuted, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700' },
  layoutItemTextActive: { color: COLORS.teal },
  layoutHint: { color: COLORS.textMuted, fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', marginTop: scaleSize(9), lineHeight: scaleFont(15) },

  // CharMap button
  charMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: scaleSize(6),
    marginTop: scaleSize(10), paddingVertical: scaleSize(8), paddingHorizontal: scaleSize(12),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(10),
    borderWidth: 1, borderColor: COLORS.teal + '30',
  },
  charMapBtnText: { flex: 1, color: COLORS.teal, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },

  // CharMap Modal
  cmOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  cmCard: {
    height: '85%', backgroundColor: '#1a1a1a',
    borderTopLeftRadius: scaleSize(20), borderTopRightRadius: scaleSize(20),
    borderWidth: 1, borderBottomWidth: 0, borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  cmHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: scaleSize(16), paddingBottom: scaleSize(10),
  },
  cmTitle: { color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  cmClose: {
    width: scaleSize(32), height: scaleSize(32), borderRadius: scaleSize(16),
    backgroundColor: COLORS.cardBg, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cmTabs: {
    flexDirection: 'row', marginHorizontal: scaleSize(16), gap: scaleSize(8),
    marginBottom: scaleSize(12),
  },
  cmTab: {
    flex: 1, paddingVertical: scaleSize(9), borderRadius: scaleSize(10), alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.cardBorder, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cmTabActive: { backgroundColor: COLORS.teal + '22', borderColor: COLORS.teal },
  cmTabText: { color: COLORS.textMuted, fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700' },
  cmTabTextActive: { color: COLORS.teal },
  cmScroll: { flex: 1 },
  cmScrollContent: { padding: scaleSize(16), paddingBottom: scaleSize(40) },
  cmSectionTitle: {
    color: COLORS.textWhite, fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700',
    marginBottom: scaleSize(8), marginTop: scaleSize(14),
  },
  cmGrid: {
    flexDirection: 'row', flexWrap: 'wrap', gap: scaleSize(6),
  },
  cmItem: {
    width: scaleSize(58), alignItems: 'center', paddingVertical: scaleSize(8),
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: scaleSize(8),
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  cmUnicode: { color: COLORS.textWhite, fontSize: scaleFont(18), fontFamily: 'Calibri', fontWeight: '700' },
  cmKey: { color: COLORS.textMuted, fontSize: scaleFont(9), fontFamily: 'Calibri', fontWeight: '700', marginTop: 2 },
});
