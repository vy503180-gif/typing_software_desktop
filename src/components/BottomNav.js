// src/components/BottomNav.js
// App का bottom navigation bar -
// चार tabs: Home, Lessons, History, Statistics
// active tab को highlight करता है और onTabPress callback को call करता है।

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, scaleFont, scaleSize, SCREEN } from '../theme';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home-outline', iconActive: 'home', color: COLORS.teal },
  { key: 'Lessons', label: 'Lessons', icon: 'book-outline', iconActive: 'book', color: COLORS.green },
  { key: 'History', label: 'History', icon: 'time-outline', iconActive: 'time', color: COLORS.amber },
  { key: 'Stats', label: 'Stats', icon: 'bar-chart-outline', iconActive: 'bar-chart', color: COLORS.rose },
];

export default function BottomNav({ activeTab, onTabPress }) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <BlurView intensity={60} tint="dark" style={styles.navBar}>
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
              <Text style={[styles.tabLabel, isActive && { color: tab.color, fontFamily: 'Calibri', fontWeight: '700'}]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </BlurView>
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
    backgroundColor: 'rgba(15,12,41,0.75)',
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
    fontFamily: 'Calibri', fontWeight: '700',
    color: COLORS.textMuted,
    fontSize: scaleFont(10),
    marginTop: 2,
  },
});
