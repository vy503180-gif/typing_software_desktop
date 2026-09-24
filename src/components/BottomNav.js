import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, scaleFont, scaleSize, IS_DESKTOP, SIDEBAR_WIDTH, HEADER_HEIGHT } from '../theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home-outline', iconActive: 'home', color: COLORS.teal },
  { key: 'Lessons', label: 'Lessons', icon: 'book-outline', iconActive: 'book', color: COLORS.green },
  { key: 'History', label: 'History', icon: 'time-outline', iconActive: 'time', color: COLORS.amber },
  { key: 'Stats', label: 'Stats', icon: 'bar-chart-outline', iconActive: 'bar-chart', color: COLORS.rose },
];

// Desktop sidebar navigation
export function DesktopSidebar({ activeTab, onTabPress }) {
  return (
    <View style={sidebarStyles.container}>
      <View style={sidebarStyles.logoArea}>
        <View style={sidebarStyles.logoCircle}>
          <Text style={sidebarStyles.logoLetter}>T</Text>
        </View>
        <Text style={sidebarStyles.appName}>Typing Master</Text>
      </View>

      <View style={sidebarStyles.navSection}>
        <Text style={sidebarStyles.navSectionLabel}>MAIN</Text>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[sidebarStyles.navItem, isActive && sidebarStyles.navItemActive]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={18}
                color={isActive ? tab.color : COLORS.textMuted}
              />
              <Text style={[sidebarStyles.navLabel, isActive && { color: tab.color, fontWeight: '700' }]}>
                {tab.label}
              </Text>
              {isActive && <View style={[sidebarStyles.activeIndicator, { backgroundColor: tab.color }]} />}
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={sidebarStyles.versionArea}>
        <Text style={sidebarStyles.versionText}>v1.0.0</Text>
      </View>
    </View>
  );
}

const sidebarStyles = StyleSheet.create({
  container: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: COLORS.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.headerBorder,
    flexDirection: 'column',
    paddingTop: HEADER_HEIGHT + 8,
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    gap: 10,
  },
  logoCircle: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLetter: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: '#ffffff',
    fontSize: 16,
  },
  appName: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textWhite,
    fontSize: 14,
    letterSpacing: 1,
  },
  navSection: {
    flex: 1,
    paddingHorizontal: 8,
  },
  navSectionLabel: {
    fontFamily: 'Poppins_700Bold',
    fontWeight: '700',
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.5,
    paddingHorizontal: 12,
    marginBottom: 6,
    marginTop: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 2,
    gap: 10,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: COLORS.sidebarActive,
  },
  navLabel: {
    fontFamily: 'Poppins_600SemiBold',
    fontWeight: '600',
    color: COLORS.textMuted,
    fontSize: 13,
  },
  activeIndicator: {
    position: 'absolute',
    right: 0,
    top: '50%',
    marginTop: -10,
    width: 3,
    height: 20,
    borderRadius: 2,
  },
  versionArea: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  versionText: {
    fontFamily: 'Poppins_400Regular',
    color: COLORS.textDim,
    fontSize: 10,
  },
});

// Mobile bottom tab navigation (existing)
export default function BottomNav({ activeTab, onTabPress }) {
  if (IS_DESKTOP) return null;

  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.navBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.iconWrap, isActive && { backgroundColor: tab.color + '30' }]}>
                <Ionicons
                  name={isActive ? tab.iconActive : tab.icon}
                  size={22}
                  color={isActive ? tab.color : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && { color: tab.color, fontFamily: 'Poppins_700Bold', fontWeight: '700'}]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: scaleSize(16),
    paddingBottom: scaleSize(20),
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: scaleSize(28),
    padding: scaleSize(8),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
    backgroundColor: 'rgba(15,12,41,0.9)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: scaleSize(8),
    borderRadius: scaleSize(20),
  },
  tabActive: {
    backgroundColor: 'rgba(20,184,166,0.15)',
  },
  iconWrap: {
    width: scaleSize(36),
    height: scaleSize(28),
    borderRadius: scaleSize(14),
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontFamily: 'Poppins_700Bold', fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: scaleFont(10),
    marginTop: 2,
  },
});
