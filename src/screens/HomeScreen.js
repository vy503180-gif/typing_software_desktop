import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Dimensions,
} from 'react-native';
import { BG, COLORS, scaleFont, scaleSize, SCREEN, IS_DESKTOP, CONTENT_MAX_WIDTH } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

const STUDENT = {
  level: 'Intermediate',
  levelProgress: 65,
  photo: null,
};

const PROFILE_MENU = [
  { id: 'course', label: 'Course', icon: 'book', color: COLORS.teal },
  { id: 'review', label: 'Review', icon: 'star', color: COLORS.amber },
  { id: 'games', label: 'Games', icon: 'game-controller', color: COLORS.green },
  { id: 'satellite', label: 'Explore', icon: 'compass', color: COLORS.rose },
  { id: 'setting', label: 'Setting', icon: 'settings', color: COLORS.teal },
  { id: 'information', label: 'Info', icon: 'information-circle', color: COLORS.teal },
];

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
    transform: [{ translateY: value.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
  };
}

export default function HomeScreen({ studentName, onStartTyping, onContinueLesson, onCourse, onReview, onGames, onSetting, onExplore, onInfo, onSwitchUser }) {
  const profileAnim = useFadeInUp(0);
  const statsAnim = useFadeInUp(150);
  const startAnim = useFadeInUp(300);
  const continueAnim = useFadeInUp(400);

  const [menuWidth, setMenuWidth] = useState(0);
  const MENU_GAP = scaleSize(6);
  const isWide = menuWidth >= 520;
  const menuChipWidth = menuWidth > 0
    ? isWide
      ? (menuWidth - MENU_GAP * (PROFILE_MENU.length - 1)) / PROFILE_MENU.length
      : (menuWidth - MENU_GAP * 2) / 3
    : '31%';

  const handleMenuPress = (menuItem) => {
    if (menuItem.id === 'course' && onCourse) onCourse();
    else if (menuItem.id === 'review' && onReview) onReview();
    else if (menuItem.id === 'games' && onGames) onGames();
    else if (menuItem.id === 'setting' && onSetting) onSetting();
    else if (menuItem.id === 'satellite' && onExplore) onExplore();
    else if (menuItem.id === 'information' && onInfo) onInfo();
    else Alert.alert('Coming Soon', `${menuItem.label} screen is coming soon!`);
  };

  const [dailyStats, setDailyStats] = useState({
    practiceTime: '0m',
    bestWpm: 0,
    bestAccuracy: 0,
    testsDone: 0,
  });

  useEffect(() => {
    const today = new Date().toLocaleDateString();
    AsyncStorage.getItem(getHistoryKey(studentName))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          const todays = all.filter((r) => r.date === today);
          const totalSec = todays.reduce((s, r) => s + (r.timeTaken || 0), 0);
          const h = Math.floor(totalSec / 3600);
          const m = Math.floor((totalSec % 3600) / 60);
          setDailyStats({
            practiceTime: totalSec > 0 ? (h > 0 ? `${h}h ${m}m` : `${m}m`) : '0m',
            bestWpm: todays.length > 0 ? Math.max(...todays.map((r) => r.wpm)) : 0,
            bestAccuracy: todays.length > 0 ? Math.max(...todays.map((r) => r.accuracy)) : 0,
            testsDone: todays.length,
          });
        } catch {}
      })
      .catch(() => {});
  }, [studentName]);

  const PROFILE_STATS = [
    { label: 'Practice Time', value: dailyStats.practiceTime, icon: 'time', color: COLORS.teal },
    { label: 'Best WPM', value: dailyStats.bestWpm, icon: 'speedometer', color: COLORS.amber },
    { label: 'Accuracy', value: `${dailyStats.bestAccuracy}%`, icon: 'checkmark-circle', color: COLORS.green },
    { label: 'Tests Done', value: dailyStats.testsDone, icon: 'library', color: COLORS.teal },
  ];

  const Container = IS_DESKTOP ? View : SafeAreaView;
  const containerProps = IS_DESKTOP ? { style: s.desktopContainer } : { style: s.safeArea };

  return (
    <Container {...containerProps}>
      {!IS_DESKTOP && <StatusBar barStyle="light-content" />}
      <ScrollView
        contentContainerStyle={[s.scrollContainer, IS_DESKTOP && s.desktopScroll]}
        showsVerticalScrollIndicator={false}
      >
        <View style={[s.content, IS_DESKTOP && s.desktopContent]}>
          {/* Logo + Name - hidden on desktop (shown in sidebar header) */}
          {!IS_DESKTOP && (
            <View style={s.logoWrap}>
              <View style={s.logoLeft}>
                <View style={s.logoCircle}>
                  <Text style={s.logoLetter}>T</Text>
                </View>
                <Text style={s.appName}>Typing Master</Text>
              </View>
              {onSwitchUser && (
                <TouchableOpacity style={s.switchBtn} onPress={onSwitchUser} activeOpacity={0.7}>
                  <Ionicons name="people" size={14} color={COLORS.teal} />
                  <Text style={s.switchBtnText}>Switch</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Welcome text on desktop */}
          {IS_DESKTOP && (
            <View style={s.desktopWelcome}>
              <Text style={s.desktopWelcomeText}>
                Welcome back{studentName ? `, ${studentName}` : ''}! Ready to type?
              </Text>
              {onSwitchUser && (
                <TouchableOpacity style={s.switchBtn} onPress={onSwitchUser} activeOpacity={0.7}>
                  <Ionicons name="people" size={14} color={COLORS.teal} />
                  <Text style={s.switchBtnText}>Switch User</Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Menu chips */}
          <View
            style={[s.menuBar, IS_DESKTOP && s.menuBarDesktop]}
            onLayout={(e) => setMenuWidth(e.nativeEvent.layout.width)}
          >
            {PROFILE_MENU.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[s.menuChip, { width: IS_DESKTOP ? undefined : menuChipWidth, borderColor: item.color + '50', backgroundColor: item.color + '1c' }, IS_DESKTOP && s.menuChipDesktop]}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.7}
              >
                <Ionicons name={item.icon} size={14} color={item.color} />
                <Text style={[s.menuChipText, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Desktop: two-column layout for profile + stats */}
          {IS_DESKTOP ? (
            <View style={s.desktopGrid}>
              {/* Left column: Profile + Start */}
              <View style={s.desktopGridCol}>
                <View style={[s.card, { marginTop: scaleSize(12) }]}>
                  <Animated.View style={[s.profileRow, profileAnim]}>
                    <View style={s.avatarWrap}>
                      <Ionicons name="person" size={36} color="#fff" />
                      <View style={s.onlineDot} />
                    </View>
                    <View style={s.profileInfo}>
                      <Text style={s.studentName}>{studentName}</Text>
                      <View style={s.levelBadge}>
                        <Ionicons name="star" size={12} color={COLORS.amber} />
                        <Text style={s.levelText}>{STUDENT.level}</Text>
                      </View>
                      <View style={s.progressTrack}>
                        <View style={[s.progressFill, { width: `${STUDENT.levelProgress}%` }]} />
                      </View>
                      <Text style={s.progressLabel}>{STUDENT.levelProgress}% to next level</Text>
                    </View>
                  </Animated.View>
                </View>

                <View style={[s.card, { marginTop: scaleSize(12) }]}>
                  <Animated.View style={[s.practiceRow, statsAnim]}>
                    <View style={s.pulseIcon}>
                      <Ionicons name="pulse" size={22} color={COLORS.green} />
                    </View>
                    <View style={s.practiceInfo}>
                      <Text style={s.practiceValue}>{dailyStats.practiceTime}</Text>
                      <Text style={s.practiceLabel}>Today's Practice</Text>
                    </View>
                    <TouchableOpacity style={s.practiceBtn} onPress={onStartTyping}>
                      <Text style={s.practiceBtnText}>Continue</Text>
                    </TouchableOpacity>
                  </Animated.View>
                </View>

                <Animated.View style={[{ marginTop: scaleSize(12), width: '100%' }, startAnim]}>
                  <TouchableOpacity onPress={onStartTyping} activeOpacity={0.85}>
                    <View style={s.startButton}>
                      <Ionicons name="play" size={20} color="#fff" />
                      <Text style={s.startButtonText}>Start Typing</Text>
                      <Ionicons name="arrow-forward" size={18} color="#fff" />
                    </View>
                  </TouchableOpacity>
                </Animated.View>

                <View style={[s.card, { marginTop: scaleSize(12) }]}>
                  <Animated.View style={continueAnim}>
                    <TouchableOpacity onPress={onContinueLesson} style={s.continueRow} activeOpacity={0.8}>
                      <View style={s.continueIcon}>
                        <Ionicons name="book" size={20} color={COLORS.teal} />
                      </View>
                      <View style={s.continueText}>
                        <Text style={s.continueTitle}>Continue Last Lesson</Text>
                        <Text style={s.continueSub}>Lesson 3 - Basic Words</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#666" />
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>

              {/* Right column: Stats */}
              <View style={s.desktopGridCol}>
                <View style={[s.card, { marginTop: scaleSize(12) }]}>
                  <Text style={s.sectionTitle}>Today's Stats</Text>
                  <View style={s.desktopStatsGrid}>
                    {PROFILE_STATS.map((stat) => (
                      <View key={stat.label} style={[s.desktopStatItem, { borderLeftColor: stat.color }]}>
                        <Ionicons name={stat.icon} size={20} color={stat.color} />
                        <Text style={s.gridValue}>{stat.value}</Text>
                        <Text style={s.gridLabel}>{stat.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            /* Mobile: single-column layout */
            <>
              <View style={[s.card, { marginTop: scaleSize(12) }]}>
                <Animated.View style={[s.profileRow, profileAnim]}>
                  <View style={s.avatarWrap}>
                    <Ionicons name="person" size={36} color="#fff" />
                    <View style={s.onlineDot} />
                  </View>
                  <View style={s.profileInfo}>
                    <Text style={s.studentName}>{studentName}</Text>
                    <View style={s.levelBadge}>
                      <Ionicons name="star" size={12} color={COLORS.amber} />
                      <Text style={s.levelText}>{STUDENT.level}</Text>
                    </View>
                    <View style={s.progressTrack}>
                      <View style={[s.progressFill, { width: `${STUDENT.levelProgress}%` }]} />
                    </View>
                    <Text style={s.progressLabel}>{STUDENT.levelProgress}% to next level</Text>
                  </View>
                </Animated.View>
              </View>

              <View style={[s.card, { marginTop: scaleSize(12) }]}>
                <Animated.View style={[s.practiceRow, statsAnim]}>
                  <View style={s.pulseIcon}>
                    <Ionicons name="pulse" size={22} color={COLORS.green} />
                  </View>
                  <View style={s.practiceInfo}>
                    <Text style={s.practiceValue}>{dailyStats.practiceTime}</Text>
                    <Text style={s.practiceLabel}>Today's Practice</Text>
                  </View>
                  <TouchableOpacity style={s.practiceBtn} onPress={onStartTyping}>
                    <Text style={s.practiceBtnText}>Continue</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <Animated.View style={[{ marginTop: scaleSize(12), width: '100%' }, startAnim]}>
                <TouchableOpacity onPress={onStartTyping} activeOpacity={0.85}>
                  <View style={s.startButton}>
                    <Ionicons name="play" size={20} color="#fff" />
                    <Text style={s.startButtonText}>Start Typing</Text>
                    <Ionicons name="arrow-forward" size={18} color="#fff" />
                  </View>
                </TouchableOpacity>
              </Animated.View>

              <View style={[s.card, { marginTop: scaleSize(12) }]}>
                <Animated.View style={continueAnim}>
                  <TouchableOpacity onPress={onContinueLesson} style={s.continueRow} activeOpacity={0.8}>
                    <View style={s.continueIcon}>
                      <Ionicons name="book" size={20} color={COLORS.teal} />
                    </View>
                    <View style={s.continueText}>
                      <Text style={s.continueTitle}>Continue Last Lesson</Text>
                      <Text style={s.continueSub}>Lesson 3 - Basic Words</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#666" />
                  </TouchableOpacity>
                </Animated.View>
              </View>

              <View style={[s.card, { marginTop: scaleSize(12), marginBottom: IS_DESKTOP ? scaleSize(20) : scaleSize(120) }]}>
                <Text style={s.sectionTitle}>Today's Stats</Text>
                <View style={s.grid}>
                  {PROFILE_STATS.map((stat) => (
                    <View key={stat.label} style={[s.gridItem, { borderLeftColor: stat.color }]}>
                      <Ionicons name={stat.icon} size={20} color={stat.color} />
                      <Text style={s.gridValue}>{stat.value}</Text>
                      <Text style={s.gridLabel}>{stat.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </Container>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: BG },
  desktopContainer: { flex: 1, backgroundColor: BG },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: BG,
  },
  desktopScroll: {
    paddingVertical: 16,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: scaleSize(16),
    paddingTop: scaleSize(16),
    width: '100%',
  },
  desktopContent: {
    paddingHorizontal: 24,
    maxWidth: CONTENT_MAX_WIDTH,
    alignSelf: 'center',
    width: '100%',
  },

  // Desktop welcome
  desktopWelcome: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: scaleSize(8),
    width: '100%',
  },
  desktopWelcomeText: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: scaleFont(20),
  },

  // Logo
  logoWrap: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: scaleSize(8),
  },
  logoLeft: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: scaleSize(10),
  },
  logoCircle: {
    width: scaleSize(38),
    height: scaleSize(38),
    borderRadius: scaleSize(19),
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: '#ffffff',
    fontSize: scaleFont(20),
  },
  appName: {
    fontFamily: 'Calibri', fontWeight: '700',
    color: '#ffffff',
    fontSize: scaleFont(18),
    letterSpacing: 3,
  },
  switchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(5),
    borderRadius: scaleSize(10),
    borderWidth: 1,
    borderColor: COLORS.teal + '50',
    backgroundColor: COLORS.teal + '15',
    paddingHorizontal: scaleSize(10),
    paddingVertical: scaleSize(6),
  },
  switchBtnText: {
    color: COLORS.teal,
    fontSize: scaleFont(11),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  // Menu
  menuBar: {
    width: '100%',
    maxWidth: scaleSize(620),
    alignSelf: 'flex-start',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: scaleSize(6),
    marginTop: scaleSize(8),
  },
  menuBarDesktop: {
    maxWidth: '100%',
    flexWrap: 'nowrap',
  },
  menuChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: scaleSize(4),
    borderRadius: scaleSize(10),
    borderWidth: 1,
    paddingHorizontal: scaleSize(4),
    paddingVertical: scaleSize(7),
  },
  menuChipDesktop: {
    flex: 1,
    paddingVertical: scaleSize(10),
  },
  menuChipText: {
    fontSize: scaleFont(12),
    fontFamily: 'Calibri',
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Cards
  card: {
    width: '100%',
    backgroundColor: '#141414',
    borderRadius: scaleSize(16),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    padding: scaleSize(14),
  },

  // Desktop grid
  desktopGrid: {
    flexDirection: 'row',
    gap: scaleSize(12),
    width: '100%',
  },
  desktopGridCol: {
    flex: 1,
  },
  desktopStatsGrid: {
    gap: scaleSize(8),
  },
  desktopStatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(10),
    padding: scaleSize(12),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: scaleSize(10),
    borderLeftWidth: 3,
  },

  // Profile
  profileRow: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: {
    width: scaleSize(72),
    height: scaleSize(72),
    borderRadius: scaleSize(36),
    backgroundColor: COLORS.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    right: 0,
    bottom: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.green,
    borderWidth: 2,
    borderColor: '#141414',
  },
  profileInfo: { flex: 1, marginLeft: scaleSize(14) },
  studentName: {
    color: '#ffffff',
    fontSize: scaleFont(20),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: scaleSize(5),
    alignSelf: 'flex-start',
    borderRadius: scaleSize(8),
    backgroundColor: COLORS.amber + '25',
    paddingHorizontal: scaleSize(8),
    paddingVertical: scaleSize(3),
    marginTop: scaleSize(6),
  },
  levelText: { fontSize: scaleFont(11), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.amber },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: scaleSize(8),
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 3, backgroundColor: COLORS.green },
  progressLabel: { fontFamily: 'Calibri', color: '#b0b0b0', fontSize: scaleFont(10), marginTop: 3 },

  // Practice
  practiceRow: { flexDirection: 'row', alignItems: 'center' },
  pulseIcon: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(12),
    backgroundColor: COLORS.green + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  practiceInfo: { flex: 1, marginLeft: scaleSize(10) },
  practiceValue: {
    color: '#ffffff',
    fontSize: scaleFont(18),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  practiceLabel: { fontFamily: 'Calibri', color: '#b0b0b0', fontSize: scaleFont(11), marginTop: 1 },
  practiceBtn: {
    borderRadius: scaleSize(10),
    backgroundColor: COLORS.teal + '25',
    paddingHorizontal: scaleSize(14),
    paddingVertical: scaleSize(8),
  },
  practiceBtnText: { fontSize: scaleFont(12), fontFamily: 'Calibri', fontWeight: '700', color: COLORS.teal },

  // Start button
  startButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    borderRadius: scaleSize(16),
    paddingVertical: scaleSize(16),
    gap: scaleSize(8),
  },
  startButtonText: {
    color: '#fff',
    fontSize: scaleFont(17),
    fontFamily: 'Calibri', fontWeight: '700'
  },

  // Continue
  continueRow: { flexDirection: 'row', alignItems: 'center' },
  continueIcon: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(12),
    backgroundColor: COLORS.teal + '25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueText: { flex: 1, marginLeft: scaleSize(10) },
  continueTitle: {
    color: '#ffffff',
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700'
  },
  continueSub: { fontFamily: 'Calibri', color: '#b0b0b0', fontSize: scaleFont(11), marginTop: 2 },

  // Stats
  sectionTitle: {
    color: '#ffffff',
    fontSize: scaleFont(15),
    fontFamily: 'Calibri', fontWeight: '700',
    marginBottom: scaleSize(10),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    borderRadius: scaleSize(12),
    padding: scaleSize(12),
    marginBottom: scaleSize(8),
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderLeftWidth: 3,
  },
  gridValue: {
    color: '#ffffff',
    fontSize: scaleFont(20),
    fontFamily: 'Calibri', fontWeight: '700',
    marginTop: scaleSize(6),
  },
  gridLabel: { fontFamily: 'Calibri', color: '#b0b0b0', fontSize: scaleFont(11), marginTop: 2 },
});
