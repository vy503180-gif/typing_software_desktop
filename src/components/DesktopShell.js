// src/components/DesktopShell.js
// Professional desktop app shell: Sidebar + Header.

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIDEBAR_WIDTH, HEADER_HEIGHT, levelForWpm, card } from '../theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getHistoryKey = (name) => `antriksh_typing_history_${name || 'default'}`;

const MAIN_NAV = [
  { key: 'Home', label: 'Home', icon: 'home', iconOutline: 'home-outline' },
  { key: 'Practice', label: 'Typing Practice', icon: 'keypad', iconOutline: 'keypad-outline' },
  { key: 'Lessons', label: 'Lessons', icon: 'book', iconOutline: 'book-outline' },
  { key: 'Tests', label: 'Tests', icon: 'timer', iconOutline: 'timer-outline' },
  { key: 'Games', label: 'Typing Games', icon: 'game-controller', iconOutline: 'game-controller-outline' },
];

const DATA_NAV = [
  { key: 'Statistics', label: 'Statistics', icon: 'bar-chart', iconOutline: 'bar-chart-outline' },
  { key: 'Certificates', label: 'Certificates', icon: 'ribbon', iconOutline: 'ribbon-outline' },
  { key: 'Settings', label: 'Settings', icon: 'settings', iconOutline: 'settings-outline' },
  { key: 'Profile', label: 'Profile', icon: 'person', iconOutline: 'person-outline' },
];

export function Sidebar({ activeTab, onTabPress, studentName, bestWpm }) {
  const level = levelForWpm(bestWpm);
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoArea}>
        <View style={styles.logoBox}>
          <Ionicons name="keypad" size={20} color="#fff" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.navScroll}>
        <Text style={styles.navSectionLabel}>MAIN</Text>
        {MAIN_NAV.map((item) => {
          const active = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onTabPress(item.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Ionicons
                  name={active ? item.icon : item.iconOutline}
                  size={18}
                  color={active ? '#fff' : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              {active && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}

        <Text style={[styles.navSectionLabel, { marginTop: 20 }]}>LEARN & TRACK</Text>
        {DATA_NAV.map((item) => {
          const active = activeTab === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, active && styles.navItemActive]}
              onPress={() => onTabPress(item.key)}
              activeOpacity={0.75}
            >
              <View style={[styles.navIconWrap, active && styles.navIconWrapActive]}>
                <Ionicons
                  name={active ? item.icon : item.iconOutline}
                  size={18}
                  color={active ? '#fff' : COLORS.textMuted}
                />
              </View>
              <Text style={[styles.navLabel, active && styles.navLabelActive]}>{item.label}</Text>
              {active && <View style={styles.activeBar} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {studentName ? (
        <TouchableOpacity style={styles.userCard} onPress={() => onTabPress('Profile')} activeOpacity={0.8}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>{studentName.trim()[0].toUpperCase()}</Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName} numberOfLines={1}>{studentName}</Text>
            <Text style={[styles.userLevel, { color: level.color }]}>{level.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={14} color={COLORS.textDim} />
        </TouchableOpacity>
      ) : null}

      <Text style={styles.version}>v2.0</Text>
    </View>
  );
}

function Dropdown({ items, onClose, width = 220 }) {
  return (
    <View style={[styles.dropdown, { width }]}>
      {items.map((it, i) => (
        <TouchableOpacity
          key={i}
          style={styles.dropdownItem}
          onPress={() => {
            onClose();
            it.action && it.action();
          }}
          activeOpacity={0.7}
        >
          <Ionicons name={it.icon} size={16} color={it.color || COLORS.textMuted} />
          <Text style={styles.dropdownItemText}>{it.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

export function Header({ studentName, bestWpm, onNavigate, onSwitchUser }) {
  const [menu, setMenu] = useState(null); // 'notify' | 'user'
  const [recent, setRecent] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    if (menu !== 'notify') return;
    AsyncStorage.getItem(getHistoryKey(studentName))
      .then((raw) => {
        try {
          const all = raw ? JSON.parse(raw) : [];
          setRecent(all.slice(0, 5));
        } catch { setRecent([]); }
      })
      .catch(() => {});
  }, [menu, studentName]);

  useEffect(() => {
    if (typeof document === 'undefined' || menu === null) return;
    const onDown = (e) => {
      if (wrapRef.current && wrapRef.current.contains(e.target)) return;
      setMenu(null);
    };
    document.addEventListener('mousedown', onDown, true);
    return () => document.removeEventListener('mousedown', onDown, true);
  }, [menu]);

  const initial = studentName && studentName.trim() ? studentName.trim()[0].toUpperCase() : '?';

  return (
    <View style={styles.header} ref={wrapRef}>
      <View style={styles.headerBrand}>
        <Text style={styles.headerTitle}>Typing Master</Text>
        <Text style={styles.headerTagline}>Type Better • Faster • Smarter</Text>
      </View>

      <View style={styles.headerActions}>
        <View style={styles.windowBtnWrap}>
          <TouchableOpacity style={styles.windowBtn} onPress={() => { if (typeof window !== 'undefined') window.close(); }}>
            <Ionicons name="remove" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.windowBtn} onPress={() => { if (typeof window !== 'undefined') window.close(); }}>
            <Ionicons name="close" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        <View style={styles.notifWrap}>
          <TouchableOpacity
            style={[styles.headerIconBtn, menu === 'notify' && styles.headerIconBtnActive]}
            onPress={() => setMenu(menu === 'notify' ? null : 'notify')}
            activeOpacity={0.7}
          >
            <Ionicons name="notifications-outline" size={19} color={COLORS.textLight} />
            {recent.length > 0 && <View style={styles.notifDot} />}
          </TouchableOpacity>
          {menu === 'notify' && (
            <Dropdown
              width={280}
              onClose={() => setMenu(null)}
              items={[
                ...(recent.length > 0
                  ? [{
                      label: 'Recent Results',
                      icon: 'time',
                      color: '#f59e0b',
                      action: () => onNavigate && onNavigate('History'),
                    }]
                  : [{ label: 'No recent tests yet', icon: 'information-circle-outline', color: '#8ea0bf' }]),
                { label: 'View Statistics', icon: 'bar-chart', color: '#0e7490', action: () => onNavigate && onNavigate('Statistics') },
              ]}
            />
          )}
        </View>

        <TouchableOpacity
          style={styles.headerIconBtn}
          onPress={() => onNavigate && onNavigate('Settings')}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={19} color={COLORS.textLight} />
        </TouchableOpacity>

        <View style={styles.userWrap}>
          <TouchableOpacity
            style={[styles.headerUserBtn, menu === 'user' && styles.headerIconBtnActive]}
            onPress={() => setMenu(menu === 'user' ? null : 'user')}
            activeOpacity={0.75}
          >
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{initial}</Text>
            </View>
            <Text style={styles.headerUserName} numberOfLines={1}>{studentName || 'Guest'}</Text>
            <Ionicons name="chevron-down" size={13} color={COLORS.textMuted} />
          </TouchableOpacity>
          {menu === 'user' && (
            <Dropdown
              width={200}
              onClose={() => setMenu(null)}
              items={[
                { label: 'My Profile', icon: 'person-outline', color: '#0e7490', action: () => onNavigate && onNavigate('Profile') },
                { label: 'Statistics', icon: 'bar-chart-outline', color: '#14b8a6', action: () => onNavigate && onNavigate('Statistics') },
                { label: 'Settings', icon: 'settings-outline', color: '#f59e0b', action: () => onNavigate && onNavigate('Settings') },
                { label: 'Switch User', icon: 'people-outline', color: '#f43f5e', action: () => onSwitchUser && onSwitchUser() },
              ]}
            />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: COLORS.sidebarBg,
    borderRightWidth: 1,
    borderRightColor: COLORS.headerBorder,
    flexDirection: 'column',
  },
  logoArea: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 18,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#0e9488',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0e9488',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  logoTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  logoTag: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textDim,
    fontSize: 9.5,
    marginTop: 1,
  },
  navScroll: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  navSectionLabel: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: COLORS.textDim,
    fontSize: 10,
    letterSpacing: 1.6,
    paddingHorizontal: 10,
    marginBottom: 6,
    marginTop: 12,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 3,
    gap: 11,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: COLORS.sidebarActive,
    shadowColor: '#0e9488',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 2,
  },
  navIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconWrapActive: {
    backgroundColor: '#0e9488',
    shadowColor: '#0e9488',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 6,
    elevation: 3,
  },
  navLabel: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textMuted,
    fontSize: 13.5,
  },
  navLabelActive: {
    color: '#fff',
    fontWeight: '700',
  },
  activeBar: {
    position: 'absolute',
    right: -12,
    top: '50%',
    marginTop: -11,
    width: 3,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#0e7490',
    shadowColor: '#0e7490',
    shadowOpacity: 0.8,
    shadowRadius: 4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(59,130,246,0.08)',
    borderWidth: 1.5,
    borderColor: COLORS.cardBorder,
  },
  userAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0e9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: '#fff',
    fontFamily: 'Calibri',
    fontWeight: '700',
    fontSize: 15,
  },
  userInfo: { flex: 1 },
  userName: {
    color: '#fff',
    fontFamily: 'Calibri',
    fontWeight: '700',
    fontSize: 13,
  },
  userLevel: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    fontSize: 10.5,
    marginTop: 1,
  },
  version: {
    paddingHorizontal: 18,
    paddingBottom: 12,
    color: COLORS.textDim,
    fontFamily: 'Calibri',
    fontSize: 10,
  },

  header: {
    height: HEADER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: COLORS.headerBg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.headerBorder,
    zIndex: 20,
  },
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 14,
  },
  headerTitle: {
    fontFamily: 'Calibri',
    fontWeight: '700',
    color: '#fff',
    fontSize: 17,
    letterSpacing: 0.5,
  },
  headerTagline: {
    fontFamily: 'Calibri',
    fontWeight: '600',
    color: COLORS.textDim,
    fontSize: 11,
    letterSpacing: 0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  windowBtnWrap: {
    flexDirection: 'row',
    gap: 4,
    marginRight: 6,
  },
  windowBtn: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
  },
  headerIconBtnActive: {
    backgroundColor: COLORS.sidebarActive,
    borderColor: 'rgba(59,130,246,0.6)',
  },
  notifWrap: { position: 'relative' },
  notifDot: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#f43f5e',
    borderWidth: 1,
    borderColor: '#0d1424',
  },
  userWrap: { position: 'relative' },
  headerUserBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: COLORS.headerBorder,
  },
  headerAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#0e9488',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: {
    color: '#fff',
    fontFamily: 'Calibri',
    fontWeight: '700',
    fontSize: 12,
  },
  headerUserName: {
    color: COLORS.textLight,
    fontFamily: 'Calibri',
    fontWeight: '700',
    fontSize: 13,
    maxWidth: 110,
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#101a30',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(96,136,210,0.35)',
    paddingVertical: 6,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 10,
    zIndex: 50,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  dropdownItemText: {
    color: COLORS.textLight,
    fontFamily: 'Calibri',
    fontWeight: '600',
    fontSize: 13,
    flex: 1,
  },
});