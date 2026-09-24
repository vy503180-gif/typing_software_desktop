import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';

const SCREEN_W = SCREEN.width;

const COURSES = [
  {
    id: 'speed',
    title: 'Speed Building Course',
    totalDuration: '2:00 h',
    lessons: [
      {
        id: 1, title: 'Focus on the home row', color: COLORS.teal,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.teal + '50',
        subLessons: [
          { id: '1.1', title: 'Speed building course description', duration: null, text: 'welcome to the speed building course this course will help you type faster and more accurately practice every day for best results' },
          { id: '1.2', title: 'Review the home row', duration: '3 min', text: 'asdf jkl; asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj fdsa ;lkj asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj asdf jkl; asdf jkl; fdsa ;lkj fdsa ;lkj' },
          { id: '1.3', title: 'Fun phrases with A F J', duration: '4 min', text: 'a fat cat sat on a mat and had a nap jack and jill went up the hill to fetch a pail of water flash the lamp and dash the flag a lad had a bad bag and a sad dad and a glad gal had a salad' },
          { id: '1.4', title: 'Fun phrases with D K', duration: '4 min', text: 'the dog did a dance and got a kick the kid made a deck of cards and asked dad to look dark shadows lurk in the park after dusk a dark deck had a card and a dock had a duck and a lad had a bag' },
          { id: '1.5', title: 'Fun phrases with S L', duration: '4 min', text: 'sam sat on the sill and saw a seal the little lady sold some silk and lace slides and slopes are fun in the snow a sly lass had a glass and a slack lake had a seal and a small lad sat on a sill' },
          { id: '1.6', title: 'Text drill, all letters', duration: '5 min', text: 'the quick brown fox jumps over the lazy dog pack my box with five dozen liquor jugs how vexingly quick daft zebras jump the five boxing wizards jump quickly bright vixens jump dozy fowl quack jack the big fjord kept aloft my sage wolf den whack the big jumping foxes over the lazy dog' },
        ],
      },
      {
        id: 2, title: 'Focus on the index finger keys', color: COLORS.amber,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.amber + '50',
        subLessons: [
          { id: '2.1', title: 'Introduction to index finger keys', duration: '3 min', text: 'the index fingers control the letters r t f g v and b these are the strongest fingers and handle most of the typing work on the keyboard' },
          { id: '2.2', title: 'Right index finger practice', duration: '4 min', text: 'rtfgvb rtfgvb rtfgvb rtfgvb the the the the the the the the the the the the the the the the the the the the the the the the the the' },
          { id: '2.3', title: 'Left index finger practice', duration: '4 min', text: 'give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give give' },
          { id: '2.4', title: 'Combined index finger drill', duration: '5 min', text: 'the brave fox ran through the green field very fast to grab the big bag of grain before the bright light faded from the sky a great frog gave a big grin and drove a fast car over the bridge to the green garden where the big tree stood tall' },
          { id: '2.5', title: 'Speed challenge with index fingers', duration: '5 min', text: 'type fast but stay accurate every letter matters the best typists are both fast and precise keep practicing and you will improve over time the brave tigers run very fast through the green fields and grab the big bags of grain before the bright sun fades from the sky above the great garden' },
        ],
      },
      {
        id: 3, title: 'Focus on the middle finger keys', color: COLORS.green,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.green + '50',
        subLessons: [
          { id: '3.1', title: 'Middle finger key introduction', duration: '3 min', text: 'the middle fingers control the letters e d c i k and these are important for reaching the center of the keyboard effectively' },
          { id: '3.2', title: 'Middle finger practice', duration: '4 min', text: 'edcik edcik edcik edcik did did did did did did did did did did did did did did did did did did did did did did did did did did did did did did' },
          { id: '3.3', title: 'Mixed middle finger words', duration: '4 min', text: 'the deep sea has many secrets we can pick up the nice cake and eat it while we make a decision about what to do next the city desk had a code and the dice case had a nice side and the kids cried' },
          { id: '3.4', title: 'Middle finger speed drill', duration: '5 min', text: 'keep your fingers on the home row and reach for the middle keys with precision accuracy is more important than raw speed when learning new keys the city desk had a nice code and the kids decided to pick a cake and eat it beside the deep sea where the dice game kept them busy' },
        ],
      },
      {
        id: 4, title: 'Focus on the ring finger keys', color: COLORS.teal,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.teal + '50',
        subLessons: [
          { id: '4.1', title: 'Ring finger key introduction', duration: '3 min', text: 'the ring fingers control the letters w s x o l and these are weaker fingers that need extra practice to build strength and speed' },
          { id: '4.2', title: 'Ring finger practice', duration: '4 min', text: 'wsxol wsxol wsxol wsxol was was was was was was was was was was was was was was was was was was was was was was was was was was was was was' },
          { id: '4.3', title: 'Ring finger word drill', duration: '4 min', text: 'we saw some wolves loose in the snow the old owl sat on the slow low branch and watched the world below with wise eyes the wise fox saw some wool and spun a slow song while the snow fell softly on the old wall' },
          { id: '4.4', title: 'Ring finger speed test', duration: '5 min', text: 'slow and steady wins the race focus on hitting each key correctly rather than trying to type very fast accuracy builds speed over time the wise old owl sat on a slow low branch watching the wolves loose in the snow while the wool spun softly on the old wall beside the wise owl den' },
        ],
      },
      {
        id: 5, title: 'Focus on the little finger keys', color: COLORS.rose,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.rose + '50',
        subLessons: [
          { id: '5.1', title: 'Little finger key introduction', duration: '3 min', text: 'the little fingers control the letters q z m p and these are the weakest fingers that need the most practice and attention to master' },
          { id: '5.2', title: 'Little finger practice', duration: '4 min', text: 'qzmp qzmp qzmp qzmp pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay pay' },
          { id: '5.3', title: 'Little finger word drill', duration: '4 min', text: 'the quick brown fox made a jump over the lazy dog and landed on a soft pile of hay near the old wooden barn a quick map helped the man pay the cost and the small pile of money kept the shop happy and the calm park made the kids smile' },
          { id: '5.4', title: 'All fingers combined drill', duration: '5 min', text: 'now you have learned all the keys practice combining them into smooth sentences the quick brown fox jumps over the lazy dog every single day a calm park made the small kids smile while the wise man paid the cost and kept the happy shop full of money and the quick map led them to the old barn' },
        ],
      },
      {
        id: 6, title: 'Common words', color: COLORS.teal,
        bgColor: COLORS.cardBgSolid, borderColor: COLORS.teal + '50',
        subLessons: [
          { id: '6.1', title: 'Top 50 common words', duration: '4 min', text: 'the and for are but not you all any can had her was one our out day has his how its may now old see two way who did get let say she too use would make like just over such take than when what so up out if about' },
          { id: '6.2', title: 'Common words practice', duration: '4 min', text: 'can you this that with have from they been will would make like just over such take than when what so up out if about who get which go me when make them some time very well when know just also back after use two how our work first' },
          { id: '6.3', title: 'Common phrases', duration: '5 min', text: 'thank you very much i appreciate your help looking forward to hearing from you please let me know if you have any questions have a great day and best regards i hope this email finds you well as we discussed earlier please find the attached document for your review and let me know your thoughts on the matter' },
          { id: '6.4', title: 'Speed building final test', duration: '5 min', text: 'this is your final test for the speed building course type as fast as you can while maintaining high accuracy you have practiced all the keys and common words now show what you can do the quick brown fox jumps over the lazy dog every single day and the brave tigers run fast through the green fields grabbing bags of grain before the bright sun fades away' },
        ],
      },
    ],
  },
];

export { COURSES };

export default function CourseScreen({ onBack, onStartLesson, completedSubLessons = [], onViewResult }) {
  const [selectedCourse, setSelectedCourse] = useState(COURSES[0]);

  const isLessonComplete = (lesson) => lesson.subLessons.every((s) => completedSubLessons.includes(s.id));
  const completedLessons = selectedCourse.lessons.filter(isLessonComplete).length;
  const currentLesson = selectedCourse.lessons.find((lesson) => !isLessonComplete(lesson)) || null;
  const allComplete = completedLessons === selectedCourse.lessons.length;

  const handleStartLesson = (lesson) => {
    if (onStartLesson) onStartLesson(selectedCourse, lesson);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      <View style={styles.gradient}>
        <ScrollView contentContainerStyle={[styles.container, IS_DESKTOP && styles.containerDesktop]}>
          {/* Header */}
          <View style={styles.header}>
            {onBack && (
              <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={20} color={COLORS.textWhite} />
              </TouchableOpacity>
            )}
            <Ionicons name="school" size={22} color={COLORS.teal} />
            <Text style={styles.headerTitle}>Course</Text>
          </View>

          {/* Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Ionicons name="trophy" size={16} color={COLORS.amber} />
              <Text style={styles.progressTitle}>{completedLessons} of {selectedCourse.lessons.length} Lessons Complete</Text>
            </View>
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${(completedLessons / selectedCourse.lessons.length) * 100}%`, backgroundColor: COLORS.teal }]}
              />
            </View>
            <Text style={styles.progressSub}>
              {allComplete ? 'Course Complete!' : `You are on Lesson ${currentLesson ? currentLesson.id : '-'}`}
            </Text>
            {allComplete && onViewResult && (
              <TouchableOpacity style={[styles.viewResultBtn, { backgroundColor: COLORS.amber }]} onPress={onViewResult} activeOpacity={0.7}>
                <Ionicons name="bar-chart" size={14} color="#fff" />
                <Text style={styles.viewResultBtnText}>View Result</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Lessons List */}
          <View style={styles.lessonsCard}>
            <Text style={styles.sectionTitle}>Lessons</Text>
            {selectedCourse.lessons.map((lesson) => {
              const complete = isLessonComplete(lesson);
              const isCurrent = currentLesson && currentLesson.id === lesson.id;
              return (
                <TouchableOpacity
                  key={lesson.id}
                  style={[styles.lessonItem, isCurrent && { backgroundColor: lesson.color + '10' }]}
                  onPress={() => handleStartLesson(lesson)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.lessonIcon, { backgroundColor: complete ? COLORS.green + '20' : lesson.color + '20' }]}>
                    <Ionicons name={complete ? 'checkmark-circle' : 'play-circle'} size={18} color={complete ? COLORS.green : lesson.color} />
                  </View>
                  <View style={styles.lessonTextWrap}>
                    <Text style={styles.lessonNum}>Lesson {lesson.id}</Text>
                    <Text style={[styles.lessonTitle, { color: lesson.color }]}>{lesson.title}</Text>
                  </View>
                  {complete && (
                    <View style={[styles.doneBadge, { backgroundColor: COLORS.green + '20' }]}>
                      <Text style={[styles.doneBadgeText, { color: COLORS.green }]}>Done</Text>
                    </View>
                  )}
                  {isCurrent && !complete && (
                    <View style={[styles.currentBadge, { backgroundColor: lesson.color + '20' }]}>
                      <Text style={[styles.currentBadgeText, { color: lesson.color }]}>Current</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  gradient: { flex: 1 },
  container: { flexGrow: 1, padding: scaleSize(16), paddingBottom: scaleSize(20) },
  containerDesktop: {
    padding: 24,
    paddingBottom: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  header: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8), marginBottom: scaleSize(12) },
  backBtn: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(17),
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.cardBg, borderWidth: 1.5, borderColor: COLORS.cardBorder,
  },
  headerTitle: { fontFamily: 'Calibri', fontWeight: '700', fontSize: scaleFont(20), color: COLORS.textWhite, flex: 1 },

  progressCard: {
    backgroundColor: COLORS.cardBg, borderRadius: scaleSize(14),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, padding: scaleSize(14), marginBottom: scaleSize(12),
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', gap: scaleSize(8) },
  progressTitle: { fontSize: scaleFont(13), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite },
  progressTrack: {
    height: scaleSize(7), borderRadius: scaleSize(4), backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: scaleSize(8), overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: scaleSize(4) },
  progressSub: { fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textMuted, marginTop: scaleSize(6) },
  viewResultBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: scaleSize(6),
    borderRadius: scaleSize(10), paddingVertical: scaleSize(8), marginTop: scaleSize(8),
  },
  viewResultBtnText: { color: '#fff', fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700'},

  lessonsCard: {
    backgroundColor: COLORS.cardBgSolid, borderRadius: scaleSize(14),
    borderWidth: 1.5, borderColor: COLORS.cardBorder, padding: scaleSize(12),
    marginTop: scaleSize(10),
  },
  sectionTitle: { fontSize: scaleFont(14), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.textWhite, marginBottom: scaleSize(8) },
  lessonItem: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: scaleSize(10),
    borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder, gap: scaleSize(8),
  },
  lessonIcon: {
    width: scaleSize(34), height: scaleSize(34), borderRadius: scaleSize(10),
    alignItems: 'center', justifyContent: 'center',
  },
  lessonTextWrap: { flex: 1 },
  lessonNum: { fontSize: scaleFont(11), color: COLORS.textMuted, fontFamily: 'Calibri', fontWeight: '700'},
  lessonTitle: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700'},
  doneBadge: { borderRadius: scaleSize(6), paddingHorizontal: scaleSize(8), paddingVertical: scaleSize(3) },
  doneBadgeText: { fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700'},
  currentBadge: { borderRadius: scaleSize(6), paddingHorizontal: scaleSize(8), paddingVertical: scaleSize(3) },
  currentBadgeText: { fontSize: scaleFont(10), fontFamily: 'Calibri', fontWeight: '700'},
});
