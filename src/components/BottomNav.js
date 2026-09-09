// src/components/BottomNav.js
// App का bottom navigation bar -
// तीन tabs: Home, Type, Stats
// active tab को highlight करता है और onTabPress callback को call करता है।

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

const TABS = [
  { key: 'Home', label: 'Home', icon: 'home' },
  { key: 'Lessons', label: 'Lessons', icon: 'book' },
  { key: 'Type', label: 'Type', icon: 'keypad' },
  { key: 'Stats', label: 'Stats', icon: 'stats-chart' },
];

// Icon को Ionicons की तरह render करने के लिए छोटा wrapper
function TabIcon({ name, color }) {
  const icons = {
    home: '⌂',
    book: '▤',
    keypad: '⌨',
    'stats-chart': '▦',
  };
  return <Text style={[styles.icon, { color }]}>{icons[name]}</Text>;
}

export default function BottomNav({ activeTab, onTabPress }) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <BlurView intensity={50} tint="dark" style={styles.navBar}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onTabPress(tab.key)}
              activeOpacity={0.7}
            >
              <TabIcon name={tab.icon} color={isActive ? '#FFFFFF' : 'rgba(255,255,255,0.6)'} />
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  navBar: {
    flexDirection: 'row',
    borderRadius: 24,
    padding: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
    backgroundColor: 'rgba(30,27,75,0.55)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 18,
  },
  tabActive: {
    backgroundColor: 'rgba(167,139,250,0.45)',
  },
  icon: {
    fontSize: 20,
    lineHeight: 22,
  },
  tabLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabLabelActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});