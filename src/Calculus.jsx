import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

function buildFn(expr) {
  if (!expr.trim()) return null
  const s = expr
    .replace(/\^/g, '**')
    .replace(/\basin\b/g, 'Math.asin')
    .replace(/\bacos\b/g, 'Math.acos')
    .replace(/\batan\b/g, 'Math.atan')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\blog\b/g, 'Math.log10')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bpow\b/g, 'Math.pow')
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
  try {
    // eslint-disable-next-line no-new-func
    return new Function('x', `"use strict"; try { return +(${s}) } catch { return NaN }`)
  } catch {
    return null
  }
}

function approachFrom(fn, a, sign) {
  for (const h of [1e-5, 1e-6, 1e-7, 1e-8]) {
    const v = fn(a + sign * h)
    if (isFinite(v) && !isNaN(v)) return v
  }
  const v4 = fn(a + sign * 1e-4)
  const v6 = fn(a + sign * 1e-6)
  if (isNaN(v4) || isNaN(v6)) return NaN
  return v4 > v6 ? Infinity : -Infinity
}

function numericalLimit(fn, a) {
  const L = approachFrom(fn, a, -1)
  const R = approachFrom(fn, a, +1)
  if (isNaN(L) && isNaN(R)) return { L, R, exists: false }
  if (!isFinite(L) || !isFinite(R)) {
    return L === R ? { L, R, exists: true, value: L } : { L, R, exists: false }
  }
  const tol = 1e-4 * (Math.abs(L) + Math.abs(R) + 1)
  return Math.abs(L - R) < tol
    ? { L, R, exists: true, value: (L + R) / 2 }
    : { L, R, exists: false }
}

function deriv1(fn, x) {
  const h = 1e-7
  return (fn(x + h) - fn(x - h)) / (2 * h)
}

function deriv2(fn, x) {
  const h = 1e-4
  return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h)
}

function fmt(n) {
  if (isNaN(n)) return 'No definido'
  if (!isFinite(n)) return n > 0 ? '+∞' : '−∞'
  return String(parseFloat(n.toPrecision(8)))
}

export default function Calculus({ theme }) {
  const [mode, setMode] = useState('limit')
  const [expr, setExpr] = useState('sin(x)/x')
  const [xVal, setXVal] = useState('0')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState(null)

  const compute = () => {
    const fn = buildFn(expr)
    if (!fn) { setError('Función inválida'); setResult(null); return }
    const x = parseFloat(xVal)
    if (isNaN(x)) { setError('Valor de x inválido'); setResult(null); return }

    if (mode === 'limit') {
      setResult({ type: 'limit', x, ...numericalLimit(fn, x) })
    } else {
      setResult({
        type: 'deriv',
        x,
        fx: fn(x),
        d1: deriv1(fn, x),
        d2: deriv2(fn, x),
      })
    }
    setError(null)
  }

  const ModeTab = ({ id, label }) => (
    <TouchableOpacity
      style={[styles.modeTab, mode === id && { backgroundColor: theme.bgBtnOp }]}
      onPress={() => { setMode(id); setResult(null) }}
    >
      <Text style={[styles.modeTxt, { color: mode === id ? theme.colorBtnOp : theme.colorExpr }]}>
        {label}
      </Text>
    </TouchableOpacity>
  )

  return (
    <View style={[styles.root, { backgroundColor: theme.bgCalc }, theme.shadow]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colorNumber }]}>Límites y Derivadas</Text>

        <View style={[styles.modeTabs, { backgroundColor: theme.bgDisplay }]}>
          <ModeTab id="limit" label="Límite" />
          <ModeTab id="deriv" label="Derivada" />
        </View>

        <View style={[styles.inputRow, { backgroundColor: theme.bgDisplay }]}>
          <Text style={[styles.inputLabel, { color: theme.colorExpr }]}>f(x) =</Text>
          <TextInput
            style={[styles.funcInput, { color: theme.colorNumber }]}
            value={expr}
            onChangeText={setExpr}
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="sin(x), x^2, ln(x)…"
            placeholderTextColor={theme.colorExpr}
          />
        </View>

        <View style={[styles.inputRow, { backgroundColor: theme.bgDisplay }]}>
          <Text style={[styles.inputLabel, { color: theme.colorExpr }]}>
            {mode === 'limit' ? 'x →' : 'x ='}
          </Text>
          <TextInput
            style={[styles.xInput, { color: theme.colorNumber }]}
            value={xVal}
            onChangeText={setXVal}
            keyboardType="numbers-and-punctuation"
            placeholder="0"
            placeholderTextColor={theme.colorExpr}
          />
        </View>

        <TouchableOpacity style={[styles.calcBtn, { backgroundColor: theme.bgBtnOp }]} onPress={compute}>
          <Text style={[styles.calcBtnText, { color: theme.colorBtnOp }]}>Calcular</Text>
        </TouchableOpacity>

        {error && (
          <View style={[styles.box, { backgroundColor: theme.bgDisplay }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && !error && result.type === 'limit' && (
          <View style={[styles.box, { backgroundColor: theme.bgDisplay }]}>
            <Text style={[styles.boxTitle, { color: theme.colorExpr }]}>
              lim(x → {result.x})  f(x)
            </Text>
            {result.exists ? (
              <Text style={[styles.bigVal, { color: theme.colorNumber }]}>{fmt(result.value)}</Text>
            ) : (
              <>
                <Text style={[styles.bigVal, { color: '#e94560' }]}>No existe</Text>
                <View style={styles.limRow}>
                  <View style={styles.limCol}>
                    <Text style={[styles.limLabel, { color: theme.colorExpr }]}>Límite izquierdo</Text>
                    <Text style={[styles.limVal, { color: theme.colorNumber }]}>{fmt(result.L)}</Text>
                  </View>
                  <View style={[styles.limDiv, { backgroundColor: theme.colorExpr }]} />
                  <View style={styles.limCol}>
                    <Text style={[styles.limLabel, { color: theme.colorExpr }]}>Límite derecho</Text>
                    <Text style={[styles.limVal, { color: theme.colorNumber }]}>{fmt(result.R)}</Text>
                  </View>
                </View>
              </>
            )}
          </View>
        )}

        {result && !error && result.type === 'deriv' && (
          <View style={[styles.box, { backgroundColor: theme.bgDisplay }]}>
            <Text style={[styles.boxTitle, { color: theme.colorExpr }]}>
              En x = {result.x}
            </Text>
            {[
              ['f(' + result.x + ')', result.fx],
              ["f'(" + result.x + ')', result.d1],
              ['f″(' + result.x + ')', result.d2],
            ].map(([label, val], i, arr) => (
              <View key={label} style={styles.derivBlock}>
                <View style={styles.derivRow}>
                  <Text style={[styles.derivLabel, { color: theme.colorExpr }]}>{label} =</Text>
                  <Text style={[styles.derivVal, { color: theme.colorNumber }]}>{fmt(val)}</Text>
                </View>
                {i < arr.length - 1 && (
                  <View style={[styles.divider, { backgroundColor: theme.bgCalc }]} />
                )}
              </View>
            ))}
            <Text style={[styles.hint, { color: theme.colorExpr }]}>
              Recta tangente: y = {fmt(result.d1)}(x − {result.x}) + {fmt(result.fx)}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, borderRadius: 24, overflow: 'hidden' },
  content: { padding: 16, gap: 14, flexGrow: 1 },
  title: { fontSize: 17, fontWeight: '600', textAlign: 'center' },
  modeTabs: { flexDirection: 'row', borderRadius: 14, padding: 4, gap: 4 },
  modeTab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  modeTxt: { fontSize: 14, fontWeight: '500' },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  inputLabel: { fontSize: 14, minWidth: 44 },
  funcInput: { flex: 1, fontSize: 15, fontFamily: 'monospace' },
  xInput: { flex: 1, fontSize: 18 },
  calcBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
  calcBtnText: { fontSize: 16, fontWeight: '600' },
  box: { borderRadius: 18, padding: 18, alignItems: 'center', gap: 12 },
  boxTitle: { fontSize: 13 },
  bigVal: { fontSize: 40, fontWeight: '300' },
  limRow: { flexDirection: 'row', gap: 20, alignItems: 'center' },
  limCol: { alignItems: 'center', gap: 4 },
  limLabel: { fontSize: 12 },
  limVal: { fontSize: 22, fontWeight: '300' },
  limDiv: { width: 1, height: 44 },
  derivBlock: { width: '100%' },
  derivRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, paddingHorizontal: 4 },
  divider: { height: 1 },
  derivLabel: { fontSize: 14 },
  derivVal: { fontSize: 18, fontWeight: '300' },
  hint: { fontSize: 11, textAlign: 'center', fontFamily: 'monospace', paddingTop: 4 },
  errorText: { color: '#e94560', fontSize: 15 },
})
