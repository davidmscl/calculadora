import { useState } from 'react'
import {
  View, Text, TouchableOpacity, StyleSheet,
  SafeAreaView, StatusBar,
} from 'react-native'
import Calculator from './Calculator'
import Graph from './Graph'
import { dark, light } from './theme'

export default function App() {
  const [tab, setTab] = useState('calc')
  const [themeName, setThemeName] = useState('dark')
  const theme = themeName === 'dark' ? dark : light

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.bgBody }]}>
      <StatusBar
        barStyle={themeName === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.bgBody}
      />

      <View style={[styles.tabBar, { backgroundColor: theme.bgCalc }, theme.shadow]}>
        <TouchableOpacity
          style={[styles.tab, tab === 'calc' && styles.tabActive]}
          onPress={() => setTab('calc')}
        >
          <Text style={[styles.tabText, { color: theme.colorExpr }, tab === 'calc' && styles.tabTextActive]}>
            Calculadora
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, tab === 'graph' && styles.tabActive]}
          onPress={() => setTab('graph')}
        >
          <Text style={[styles.tabText, { color: theme.colorExpr }, tab === 'graph' && styles.tabTextActive]}>
            Gráficas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.themeBtn}
          onPress={() => setThemeName(n => n === 'dark' ? 'light' : 'dark')}
        >
          <Text style={styles.themeIcon}>{themeName === 'dark' ? '☀' : '☾'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {tab === 'calc'
          ? <Calculator theme={theme} />
          : <Graph theme={theme} />}
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
  tab: {
    paddingVertical: 7,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: '#e94560' },
  tabText: { fontSize: 14, fontWeight: '500' },
  tabTextActive: { color: '#fff' },
  themeBtn: { marginLeft: 'auto', padding: 6, paddingHorizontal: 10, borderRadius: 8 },
  themeIcon: { fontSize: 18 },
  content: { flex: 1, paddingHorizontal: 12, paddingBottom: 12 },
})
