// src/screens/LessonsScreen.js
// Professional lessons page with Beginner / Intermediate / Advanced categories.

import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, StatusBar, Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BG, COLORS, IS_DESKTOP } from '../theme';
import { LESSON_DIFFICULTY } from '../data/lessons';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

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
    { id: 16, title: 'संयुक्त अक्षर', desc: 'क्ष, त्र, ज्ञ, श्र', time: '2 min', characters: 48 },
    { id: 17, title: 'मात्रा अभ्यास', desc: 'का, की, कु, के, कौ', time: '3 min', characters: 60 },
    { id: 18, title: 'आम शब्द', desc: 'पानी, घर, स्कूल', time: '3 min', characters: 70 },
    { id: 19, title: 'रोज़-भर के वाक्य', desc: 'मैं रोज़ विद्यालय जाता हूँ', time: '4 min', characters: 80 },
    { id: 20, title: 'दिन और महीने', desc: 'सोमवार...रविवार', time: '4 min', characters: 90 },
    { id: 21, title: 'गिनती', desc: 'एक...चालीस', time: '4 min', characters: 85 },
    { id: 22, title: 'प्रश्न वाक्य', desc: 'आप कैसे हैं? क्या है?', time: '4 min', characters: 78 },
    { id: 23, title: 'प्रकृति', desc: 'सूरज, बादल, नदियाँ', time: '5 min', characters: 90 },
    { id: 24, title: 'भारत परिचय', desc: 'हमारा देश', time: '5 min', characters: 85 },
    { id: 25, title: 'समय का महत्व', desc: 'अनुच्छेद', time: '5 min', characters: 120 },
    { id: 26, title: 'शिक्षा', desc: 'विद्या का महत्व', time: '6 min', characters: 110 },
    { id: 27, title: 'कंप्यूटर', desc: 'आधुनिक युग', time: '6 min', characters: 140 },
    { id: 28, title: 'प्रौद्योगिकी 2', desc: 'डिजिटल जीवन', time: '7 min', characters: 160 },
    { id: 29, title: 'स्वास्थ्य', desc: 'स्वास्थ्य ही धन', time: '7 min', characters: 150 },
    { id: 30, title: 'अंतिम परीक्षा', desc: 'संस्कृति और कर्तव्य', time: '10 min', characters: 220 },
  ],
};

const CATEGORIES = [
  { id: 'beginner', label: 'Beginner', icon: 'leaf', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], color: COLORS.green },
  { id: 'intermediate', label: 'Intermediate', icon: 'book', ids: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20], color: COLORS.blue },
  { id: 'advanced', label: 'Advanced', icon: 'rocket', ids: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30], color: COLORS.purple },
];

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
    case 'Medium': return COLORS.blue;
    case 'Hard': return COLORS.purple;
    default: return COLORS.teal;
  }
};

export default function LessonsScreen({
  onStartLesson,
  onBack,
  studentName = '',
  unlockedLessons = { english: [1], hindi: [1] },
  hindiLayout = 'mangal',
  onChangeHindiLayout,
}) {
  const [selectedLang, setSelectedLang] = useState('english');
  const [category, setCategory] = useState('beginner');
  const [showCharMap, setShowCharMap] = useState(false);
  const [charMapTab, setCharMapTab] = useState('mangal');
  const [history, setHistory] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(getHistoryKey(studentName))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          if (Array.isArray(all)) setHistory(all);
        } catch {}
      })
      .catch(() => {});
  }, [studentName]);

  const lessons = LESSONS[selectedLang];
  const unlocked = unlockedLessons[selectedLang] || [];
  const activeCat = CATEGORIES.find((c) => c.id === category);
  const catLessons = lessons.filter((l) => activeCat.ids.includes(l.id));
  const catUnlockedCount = catLessons.filter((l) => unlocked.includes(l.id)).length;
  const countUnlocked = lessons.filter((l) => unlocked.includes(l.id)).length;

  const statsForLesson = (title) => {
    const recs = history.filter((r) => r.lesson === title);
    if (recs.length === 0) return { done: false, bestWpm: null, acc: null };
    return {
      done: true,
      bestWpm: Math.max(...recs.map((r) => r.wpm || 0)),
      acc: Math.round(recs.reduce((s, r) => s + (r.accuracy || 0), 0) / recs.length),
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={18} color={COLORS.textLight} />
              </TouchableOpacity>
            )}
            <View style={styles.headerTextWrap}>
              <Text style={styles.title}>Lessons</Text>
              <Text style={styles.subtitle}>Master the keyboard, one step at a time</Text>
            </View>
          </View>

          {/* Language toggle */}
          <View style={styles.langToggle}>
            {[
              { label: 'English', value: 'english', icon: 'globe' },
              { label: 'हिंदी', value: 'hindi', icon: 'language' },
            ].map((d) => (
              <TouchableOpacity
                key={d.value}
                style={[styles.langBtn, selectedLang === d.value && styles.langBtnActive]}
                onPress={() => { setSelectedLang(d.value); setCategory('beginner'); }}
                activeOpacity={0.7}
              >
                <Ionicons name={d.icon} size={15} color={selectedLang === d.value ? '#fff' : COLORS.textMuted} />
                <Text style={[styles.langBtnText, selectedLang === d.value && styles.langBtnTextActive]}>{d.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Hindi layout */}
          {selectedLang === 'hindi' && (
            <View style={styles.layoutRow}>
              <View style={styles.segment}>
                {[{ label: 'Mangal', value: 'mangal' }, { label: 'Kruti Dev', value: 'krutidev' }].map((l) => {
                  const sel = hindiLayout === l.value;
                  return (
                    <TouchableOpacity
                      key={l.value}
                      style={[styles.segmentItem, sel && styles.segmentItemActive]}
                      onPress={() => onChangeHindiLayout && onChangeHindiLayout(l.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.segmentText, sel && styles.segmentTextActive]}>{l.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity
                style={styles.charMapBtn}
                onPress={() => { setCharMapTab(hindiLayout); setShowCharMap(true); }}
                activeOpacity={0.8}
              >
                <Ionicons name="grid" size={14} color={COLORS.cyan} />
                <Text style={styles.charMapBtnText}>Character Map</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Overall progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLeft}>
                <Ionicons name="trophy" size={17} color={COLORS.amber} />
                <Text style={styles.progressTitle}>{countUnlocked}/{lessons.length} lessons unlocked</Text>
              </View>
              <Text style={styles.progressPct}>{Math.round((countUnlocked / lessons.length) * 100)}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${(countUnlocked / lessons.length) * 100}%` }]} />
            </View>
          </View>

          {/* Categories */}
          <View style={styles.catRow}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.catPill, category === c.id && { backgroundColor: c.color + '22', borderColor: c.color }]}
                onPress={() => setCategory(c.id)}
                activeOpacity={0.75}
              >
                <Ionicons name={c.icon} size={14} color={category === c.id ? c.color : COLORS.textMuted} />
                <Text style={[styles.catPillText, category === c.id && { color: c.color }]}>{c.label}</Text>
                <View style={[styles.catCount, { backgroundColor: c.color + '22' }]}>
                  <Text style={[styles.catCountText, { color: c.color }]}>{catUnlockedCount}/{catLessons.length}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Lesson cards */}
          {catLessons.map((lesson) => {
            const locked = !unlocked.includes(lesson.id);
            const diffColor = getDifficultyColor(LESSON_DIFFICULTY[lesson.id]);
            const st = statsForLesson(lesson.title);
            return (
              <View key={lesson.id} style={[styles.lessonCard, locked && styles.lessonCardLocked]}>
                <View style={styles.lessonLeft}>
                  <View style={[styles.lessonIcon, { backgroundColor: locked ? 'rgba(255,255,255,0.06)' : diffColor + '22' }]}>
                    <Ionicons name={locked ? 'lock-closed' : 'keypad'} size={20} color={locked ? COLORS.textDim : diffColor} />
                  </View>
                  <View style={styles.lessonInfo}>
                    <Text style={[styles.lessonNum, { color: diffColor }]}>LESSON {lesson.id}</Text>
                    <Text style={[styles.lessonTitle, locked && { color: COLORS.textDim }]}>{lesson.title}</Text>
                    <Text style={styles.lessonDesc}>{lesson.desc}</Text>
                    <View style={styles.badgeRow}>
                      <View style={styles.badge}>
                        <Ionicons name="time" size={10} color={COLORS.textMuted} />
                        <Text style={styles.badgeText}>{lesson.time}</Text>
                      </View>
                      <View style={[styles.badge, { backgroundColor: diffColor + '18' }]}>
                        <Ionicons name="speedometer" size={10} color={diffColor} />
                        <Text style={[styles.badgeText, { color: diffColor }]}>{LESSON_DIFFICULTY[lesson.id]}</Text>
                      </View>
                      {st.done && (
                        <>
                          <View style={[styles.badge, { backgroundColor: COLORS.green + '18' }]}>
                            <Ionicons name="flash" size={10} color={COLORS.green} />
                            <Text style={[styles.badgeText, { color: COLORS.green }]}>{st.bestWpm} WPM</Text>
                          </View>
                          <View style={[styles.badge, { backgroundColor: COLORS.cyan + '18' }]}>
                            <Ionicons name="checkmark-circle" size={10} color={COLORS.cyan} />
                            <Text style={[styles.badgeText, { color: COLORS.cyan }]}>{st.acc}%</Text>
                          </View>
                        </>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.lessonRight}>
                  {locked ? (
                    <Ionicons name="lock-closed" size={18} color={COLORS.textDim} />
                  ) : (
                    <TouchableOpacity
                      style={[styles.startBtn, { backgroundColor: diffColor + '22', borderColor: diffColor + '66' }]}
                      onPress={() => onStartLesson(selectedLang, lesson.id, lesson.title, parseInt(lesson.time) * 60)}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.startBtnText, { color: diffColor }]}>Start Lesson</Text>
                      <Ionicons name="play" size={13} color={diffColor} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}

          <View style={{ height: 30 }} />
        </ScrollView>

        {/* Character Map Modal */}
        <Modal visible={showCharMap} transparent animationType="slide" onRequestClose={() => setShowCharMap(false)}>
          <View style={styles.cmOverlay}>
            <View style={styles.cmCard}>
              <View style={styles.cmHeader}>
                <Text style={styles.cmTitle}>Hindi Character Map</Text>
                <TouchableOpacity onPress={() => setShowCharMap(false)} style={styles.cmClose}>
                  <Ionicons name="close" size={20} color={COLORS.textWhite} />
                </TouchableOpacity>
              </View>
              <View style={styles.cmTabs}>
                {[{ label: 'Mangal (Unicode)', value: 'mangal' }, { label: 'Kruti Dev', value: 'krutidev' }].map((t) => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.cmTab, charMapTab === t.value && styles.cmTabActive]}
                    onPress={() => setCharMapTab(t.value)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.cmTabText, charMapTab === t.value && styles.cmTabTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <ScrollView style={styles.cmScroll} contentContainerStyle={styles.cmScrollContent}>
                <Text style={styles.cmSectionTitle}>व्यंजन (Consonants)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_CONSONANTS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cmSectionTitle}>स्वर (Vowels)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_VOWELS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cmSectionTitle}>मात्राएँ (Matras)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_MATRAS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{'अ' + c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? c.kruti : c.unicode}</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.cmSectionTitle}>अंक (Numbers)</Text>
                <View style={styles.cmGrid}>
                  {CHARMAP_NUMBERS.map((c, i) => (
                    <View key={i} style={styles.cmItem}>
                      <Text style={styles.cmUnicode}>{c.unicode}</Text>
                      <Text style={styles.cmKey}>{charMapTab === 'krutidev' ? String(i) : c.unicode}</Text>
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
  scroll: {
    padding: 20,
    paddingBottom: 30,
    maxWidth: 1180,
    width: '100%',
    alignSelf: 'center',
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  backBtn: {
    width: 38, height: 38, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTextWrap: { flex: 1 },
  title: { fontFamily: 'Poppins_700Bold', fontWeight: '700', color: '#fff', fontSize: 24 },
  subtitle: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 12, marginTop: 2 },

  langToggle: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12, padding: 4, marginBottom: 12,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  langBtn: {
    flex: 1, paddingVertical: 9, borderRadius: 9, alignItems: 'center',
    flexDirection: 'row', justifyContent: 'center', gap: 6,
  },
  langBtnActive: { backgroundColor: '#0e9488' },
  langBtnText: { color: COLORS.textMuted, fontSize: 13.5, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  langBtnTextActive: { color: '#fff' },

  layoutRow: {
    flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap',
  },
  segment: {
    flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 10, padding: 3, borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  segmentItem: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 8,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  segmentItemActive: { backgroundColor: COLORS.cyan + '22', borderWidth: 1, borderColor: COLORS.cyan },
  segmentText: { color: COLORS.textMuted, fontSize: 12.5, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  segmentTextActive: { color: COLORS.cyan },
  charMapBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(14,116,144,0.1)', borderWidth: 1, borderColor: 'rgba(14,116,144,0.4)',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8,
  },
  charMapBtnText: { color: COLORS.cyan, fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700' },

  progressCard: {
    backgroundColor: 'rgba(30,46,84,0.45)', borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.cardBorder, padding: 14, marginBottom: 14,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  progressLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressTitle: { color: COLORS.textLight, fontSize: 13, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  progressPct: { color: COLORS.cyan, fontSize: 15, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  progressTrack: {
    height: 7, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 10, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4, backgroundColor: '#0e9488' },

  catRow: { flexDirection: 'row', gap: 8, marginBottom: 14, flexWrap: 'wrap' },
  catPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5,
    borderColor: COLORS.cardBorder, borderRadius: 20,
    paddingHorizontal: 13, paddingVertical: 8,
  },
  catPillText: { color: COLORS.textMuted, fontSize: 12.5, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  catCount: { borderRadius: 9, paddingHorizontal: 7, paddingVertical: 2 },
  catCountText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 10 },

  lessonCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.cardBgSolid, borderRadius: 16,
    padding: 14, marginBottom: 10,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
    shadowColor: '#000', shadowOpacity: 0.18, shadowOffset: { width: 0, height: 4 }, shadowRadius: 10, elevation: 3,
  },
  lessonCardLocked: { opacity: 0.5 },
  lessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  lessonIcon: {
    width: 46, height: 46, borderRadius: 13,
    alignItems: 'center', justifyContent: 'center',
  },
  lessonInfo: { marginLeft: 12, flex: 1 },
  lessonNum: { fontSize: 10, fontFamily: 'Poppins_700Bold', fontWeight: '700', letterSpacing: 1, marginBottom: 1 },
  lessonTitle: { color: '#fff', fontSize: 14.5, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  lessonDesc: { fontFamily: 'Poppins_600SemiBold', fontWeight: '600', color: COLORS.textMuted, fontSize: 11, marginTop: 1 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 7 },
  badge: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2,
  },
  badgeText: { color: COLORS.textMuted, fontSize: 10, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  lessonRight: { marginLeft: 10 },
  startBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: 10, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9,
  },
  startBtnText: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: 12.5 },

  // CharMap modal
  cmOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'flex-end' },
  cmCard: {
    height: '85%', backgroundColor: '#101a30',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    borderWidth: 1.5, borderBottomWidth: 0, borderColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  cmHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, paddingBottom: 10,
  },
  cmTitle: { color: '#fff', fontSize: 18, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  cmClose: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.06)', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  cmTabs: { flexDirection: 'row', marginHorizontal: 16, gap: 8, marginBottom: 12 },
  cmTab: {
    flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center',
    borderWidth: 1.5, borderColor: COLORS.cardBorder, backgroundColor: 'rgba(255,255,255,0.04)',
  },
  cmTabActive: { backgroundColor: COLORS.cyan + '22', borderColor: COLORS.cyan },
  cmTabText: { color: COLORS.textMuted, fontSize: 12, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  cmTabTextActive: { color: COLORS.cyan },
  cmScroll: { flex: 1 },
  cmScrollContent: { padding: 16, paddingBottom: 40 },
  cmSectionTitle: {
    color: '#fff', fontSize: 13, fontFamily: 'Poppins_700Bold', fontWeight: '700',
    marginBottom: 8, marginTop: 14,
  },
  cmGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  cmItem: {
    width: 58, alignItems: 'center', paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 8,
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  cmUnicode: { color: '#fff', fontSize: 18, fontFamily: 'Poppins_700Bold', fontWeight: '700' },
  cmKey: { color: COLORS.textMuted, fontSize: 9, fontFamily: 'Poppins_700Bold', fontWeight: '700', marginTop: 2 },
});