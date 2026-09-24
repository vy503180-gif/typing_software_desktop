import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;

export default function LessonDetailScreen({ lesson, course, onStartSubLesson, onBack, onSelectLesson, completedSubLessons = [] }) {
  const lessonIndex = course.lessons.findIndex((l) => l.id === lesson.id);

  const isLessonComplete = (l) => l.subLessons.every((s) => completedSubLessons.includes(s.id));
  const isLessonUnlocked = (i) => i === 0 || course.lessons.slice(0, i).every(isLessonComplete);

  const prevLesson = course.lessons[lessonIndex - 1] || null;
  const nextLesson = course.lessons[lessonIndex + 1] || null;
  const lessonComplete = isLessonComplete(lesson);
  const lessonLocked = !lessonComplete && !isLessonUnlocked(lessonIndex);
  const lessonColor = lesson.color || COLORS.teal;
  const lessonBg = lesson.bgColor || COLORS.cardBgSolid;
  const lessonBorder = lesson.borderColor || COLORS.cardBorder;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: BG }]}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <View style={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Text style={styles.headerTitle}>Lesson {lesson.id}</Text>
          </View>

          {/* Lesson Tabs */}
          <View style={styles.tabRow}>
            {course.lessons.map((l, i) => {
              const thisComplete = isLessonComplete(l);
              const active = l.id === lesson.id;
              return (
                <TouchableOpacity
                  key={l.id}
                  style={[styles.tab, active && { backgroundColor: l.color, borderColor: l.color }]}
                  onPress={() => onSelectLesson(l)}
                  activeOpacity={0.7}
                >
                  {thisComplete ? (
                    <Ionicons name="checkmark" size={14} color={active ? '#fff' : COLORS.green} />
                  ) : (
                    <Text style={[styles.tabText, active && { color: '#fff' }]}>{l.id}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Lesson Title */}
          <Text style={styles.lessonTitle}>Lesson {lesson.id}: {lesson.title}</Text>

          {lessonComplete && (
            <View style={[styles.lessonDoneBanner, { backgroundColor: COLORS.green + '15' }]}>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
              <Text style={[styles.lessonDoneText, { color: COLORS.green }]}>Lesson Complete! Next lesson unlocked.</Text>
            </View>
          )}

          {/* Prev / Next buttons */}
          <TouchableOpacity
            style={[styles.sideNavBtn, { borderColor: lessonColor }, styles.sideNavLeft, !prevLesson && styles.sideNavDisabled]}
            onPress={() => prevLesson && onSelectLesson(prevLesson)}
            activeOpacity={0.7}
            disabled={!prevLesson}
          >
            <Ionicons name="arrow-back" size={24} color={lessonColor} />
            {prevLesson && <Text style={[styles.sideNavLabel, { color: lessonColor }]}>L{prevLesson.id}</Text>}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sideNavBtn, { borderColor: lessonColor }, styles.sideNavRight, !nextLesson && styles.sideNavDisabled]}
            onPress={() => nextLesson && onSelectLesson(nextLesson)}
            activeOpacity={0.7}
            disabled={!nextLesson}
          >
            <Ionicons name="arrow-forward" size={24} color={lessonColor} />
            {nextLesson && <Text style={[styles.sideNavLabel, { color: lessonColor }]}>L{nextLesson.id}</Text>}
          </TouchableOpacity>

          {/* Sub Lessons */}
          <ScrollView style={styles.subLessonsScroll} contentContainerStyle={styles.subLessonsCardWrap}>
            <View style={[styles.subLessonsCard, { backgroundColor: lessonBg, borderColor: lessonBorder }]}>
              {lessonLocked && (
                <View style={styles.lockBox}>
                  <Ionicons name="lock-closed" size={28} color={COLORS.textDim} />
                  <Text style={styles.lockBoxTitle}>Lesson {lesson.id} is Locked</Text>
                  <Text style={styles.lockBoxSub}>
                    Complete Lesson {course.lessons[lessonIndex - 1] ? course.lessons[lessonIndex - 1].id : ''} first to unlock
                  </Text>
                </View>
              )}
              {lesson.subLessons.map((sub) => {
                const subComplete = completedSubLessons.includes(sub.id);
                return (
                  <TouchableOpacity
                    key={sub.id}
                    style={[styles.subLessonItem, subComplete && styles.subLessonItemDone]}
                    onPress={() => !lessonLocked && onStartSubLesson(sub)}
                    activeOpacity={0.7}
                    disabled={lessonLocked}
                  >
                    <View style={styles.subLessonLeft}>
                      {subComplete ? (
                        <Ionicons name="checkmark-circle" size={18} color={COLORS.green} />
                      ) : lessonLocked ? (
                        <Ionicons name="lock-closed" size={14} color={COLORS.textDim} />
                      ) : (
                        <View style={[styles.radio, { borderColor: lessonColor }]}>
                          <View style={[styles.radioInner, { backgroundColor: lessonColor + '40' }]} />
                        </View>
                      )}
                      <Text style={[styles.subLessonNum, subComplete && { color: COLORS.green }, lessonLocked && { color: COLORS.textDim }]}>{sub.id}</Text>
                      <Text style={[styles.subLessonTitle, { color: lessonColor }, subComplete && { color: COLORS.green }, lessonLocked && { color: COLORS.textDim }]}>{sub.title}</Text>
                    </View>
                    {sub.duration && (
                      <Text style={[styles.subLessonDuration, lessonLocked && { color: COLORS.textDim }]}>{sub.duration}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flex: 1, paddingHorizontal: scaleSize(16), paddingTop: scaleSize(8) },
  containerDesktop: {
    paddingHorizontal: 24,
    paddingTop: 16,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', marginBottom: scaleSize(6) },
  backBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, marginRight: scaleSize(8),
    borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontFamily: 'Poppins_700Bold', fontWeight: '700', fontSize: scaleFont(18), color: COLORS.textWhite, flex: 1 },

  tabRow: { flexDirection: 'row', gap: scaleSize(5), marginBottom: scaleSize(8), marginTop: scaleSize(8) },
  tab: {
    width: scaleSize(28), height: scaleSize(28), borderRadius: scaleSize(6),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  tabText: { fontSize: scaleFont(11), color: COLORS.textMuted, fontFamily: 'Poppins_700Bold', fontWeight: '700'},

  lessonTitle: { fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textWhite, marginBottom: scaleSize(8) },

  lessonDoneBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    borderRadius: scaleSize(8), paddingHorizontal: scaleSize(10), paddingVertical: scaleSize(6), marginBottom: scaleSize(8),
  },
  lessonDoneText: { fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700'},

  sideNavBtn: {
    position: 'absolute', width: scaleSize(52), height: scaleSize(52), borderRadius: scaleSize(26),
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
    zIndex: 10, backgroundColor: '#0f0c29',
  },
  sideNavLeft: { left: 20, top: 460 },
  sideNavRight: { right: 20, top: 460 },
  sideNavDisabled: { opacity: 0.3 },
  sideNavLabel: { fontSize: scaleFont(10), fontFamily: 'Poppins_700Bold', fontWeight: '700', marginTop: scaleSize(2) },

  subLessonsCard: { flex: 1, borderRadius: scaleSize(12), borderWidth: 2, padding: scaleSize(10) },
  subLessonsScroll: { flex: 1 },
  subLessonsCardWrap: { paddingBottom: scaleSize(60) },
  lockBox: { alignItems: 'center', paddingVertical: scaleSize(18), borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, marginBottom: scaleSize(4) },
  lockBoxTitle: { fontSize: scaleFont(14), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textLight, marginTop: scaleSize(6) },
  lockBoxSub: { fontSize: scaleFont(11), color: COLORS.textMuted, fontFamily: 'Poppins_700Bold', fontWeight: '700', textAlign: 'center', marginTop: scaleSize(4) },

  subLessonItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: scaleSize(8), borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder,
  },
  subLessonItemDone: { opacity: 0.85 },
  subLessonLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: scaleSize(6) },
  radio: { width: scaleSize(16), height: scaleSize(16), borderRadius: scaleSize(8), borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: scaleSize(8), height: scaleSize(8), borderRadius: scaleSize(4) },
  subLessonNum: { fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700', color: COLORS.textLight, width: scaleSize(24) },
  subLessonTitle: { fontSize: scaleFont(11), fontFamily: 'Poppins_700Bold', fontWeight: '700', textDecorationLine: 'underline', flex: 1 },
  subLessonDuration: { fontSize: scaleFont(10), color: COLORS.textMuted, fontFamily: 'Poppins_700Bold', fontWeight: '700', marginLeft: scaleSize(4) },
});
