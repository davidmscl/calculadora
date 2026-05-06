import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar, ScrollView,
} from 'react-native'
import { useFonts } from 'expo-font'
import Calculator from './Calculator'
import Graph from './Graph'
import Matrices from './Matrices'
import { dark, light } from './theme'

const TABS = [
  { id: 'calc',     label: 'Calculadora' },
  { id: 'graph',    label: 'Gráficas'    },
  { id: 'matrices', label: 'Matrices'    },
]

export default function App() {
  const [tab, setTab] = useState('calc')
  const [themeName, setThemeName] = useState('dark')
  const theme = themeName === 'dark' ? dark : light

  const [fontsLoaded] = useFonts({
    'DotMatrix':     require('../DOTMATRI.ttf'),
    'DotMatrixBold': require('../dot_matrix/DOTMBold.ttf'),
  })

  if (!fontsLoaded) return null

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bgBody }]}>
      <StatusBar
        barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgBody}
      />

      <View style={[styles.tabBar, { backgroundColor: theme.bgCalc }, theme.shadow]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabScroll}
        >
          {TABS.map(t => (
            <TouchableOpacity
              key={t.id}
              style={[styles.tab, tab === t.id && styles.tabActive]}
              onPress={() => setTab(t.id)}
            >
              <Text style={[
                styles.tabText,
                { color: theme.colorExpr, fontFamily: 'DotMatrix' },
                tab === t.id && styles.tabTextActive,
              ]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={styles.themeBtn}
          onPress={() => setThemeName(n => n === 'dark' ? 'light' : 'dark')}
        >
          <Text style={[styles.themeIcon, { fontFamily: 'DotMatrix' }]}>
            {themeName === 'dark' ? '☀' : '☾'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'calc'     && <Calculator theme={theme} />}
        {tab === 'graph'    && <Graph      theme={theme} />}
        {tab === 'matrices' && <Matrices   theme={theme} />}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 12,
    marginBottom: 8,
    borderRadius: 14,
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  tabScroll: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  tab: { paddingVertical: 7, paddingHorizontal: 13, borderRadius: 10 },
  tabActive: { backgroundColor: '#e94560' },
  tabText: { fontSize: 13 },
  tabTextActive: { color: '#fff' },
  themeBtn: { padding: 6, paddingHorizontal: 10, borderRadius: 8 },
  themeIcon: { fontSize: 18 },
  content: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
})
