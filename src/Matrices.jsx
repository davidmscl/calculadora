import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'

function det(m) {
  if (m.length === 1) return m[0][0]
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return m[0].reduce((s, v, j) => {
    const minor = m.slice(1).map(r => r.filter((_, k) => k !== j))
    return s + (j % 2 === 0 ? 1 : -1) * v * det(minor)
  }, 0)
}

function matT(m) { return m[0].map((_, j) => m.map(r => r[j])) }

function matAdd(a, b) { return a.map((r, i) => r.map((v, j) => v + b[i][j])) }
function matSub(a, b) { return a.map((r, i) => r.map((v, j) => v - b[i][j])) }
function matMul(a, b) {
  const n = a.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      a[i].reduce((s, _, k) => s + a[i][k] * b[k][j], 0)
    )
  )
}

function matInv(m) {
  const d = det(m)
  if (Math.abs(d) < 1e-10) return null
  if (m.length === 2) {
    return [
      [ m[1][1] / d, -m[0][1] / d],
      [-m[1][0] / d,  m[0][0] / d],
    ]
  }
  const cofactors = m.map((row, i) =>
    row.map((_, j) => {
      const minor = m.filter((_, r) => r !== i).map(r => r.filter((_, c) => c !== j))
      return ((i + j) % 2 === 0 ? 1 : -1) * det(minor)
    })
  )
  return matT(cofactors).map(r => r.map(v => v / d))
}

function makeMatrix(n) { return Array.from({ length: n }, () => Array(n).fill('0')) }

function parseMatrix(raw) {
  const m = raw.map(r => r.map(v => parseFloat(v)))
  if (m.some(r => r.some(isNaN))) return null
  return m
}

function fmtNum(n) {
  if (Math.abs(n) < 1e-9) return '0'
  return String(parseFloat(n.toPrecision(6)))
}

const BINARY_OPS = ['A + B', 'A − B', 'A × B']
const UNARY_OPS  = ['Transpuesta', 'Determinante', 'Inversa']

export default function Matrices({ theme }) {
  const [size, setSize] = useState(2)
  const [matA, setMatA] = useState(makeMatrix(2))
  const [matB, setMatB] = useState(makeMatrix(2))
  const [op, setOp]     = useState('A + B')
  const [result, setResult] = useState(null)
  const [error, setError]   = useState(null)

  const changeSize = (n) => {
    setSize(n)
    setMatA(makeMatrix(n))
    setMatB(makeMatrix(n))
    setResult(null); setError(null)
  }

  const setCell = (mat, setMat, i, j, val) => {
    const copy = mat.map(r => [...r])
    copy[i][j] = val
    setMat(copy)
  }

  const isBinary = BINARY_OPS.includes(op)

  const compute = () => {
    const a = parseMatrix(matA)
    if (!a) { setError('Matriz A contiene valores inválidos'); setResult(null); return }
    const b = isBinary ? parseMatrix(matB) : null
    if (isBinary && !b) { setError('Matriz B contiene valores inválidos'); setResult(null); return }

    let res
    try {
      if      (op === 'A + B')          res = { type: 'matrix', val: matAdd(a, b) }
      else if (op === 'A − B')          res = { type: 'matrix', val: matSub(a, b) }
      else if (op === 'A × B')          res = { type: 'matrix', val: matMul(a, b) }
      else if (op === 'Transpuesta')    res = { type: 'matrix', val: matT(a) }
      else if (op === 'Determinante')   res = { type: 'scalar', label: 'det(A)', val: det(a) }
      else if (op === 'Inversa') {
        const inv = matInv(a)
        if (!inv) { setError('La matriz es singular (no tiene inversa)'); setResult(null); return }
        res = { type: 'matrix', val: inv }
      }
    } catch {
      setError('Error en el cálculo'); setResult(null); return
    }
    setResult(res); setError(null)
  }

  const MatGrid = ({ mat, setMat }) => (
    <View style={styles.grid}>
      {mat.map((row, i) => (
        <View key={i} style={styles.gridRow}>
          {row.map((val, j) => (
            <TextInput
              key={j}
              style={[styles.cell, { backgroundColor: theme.bgDisplay, color: theme.colorNumber }]}
              value={val}
              onChangeText={t => setCell(mat, setMat, i, j, t)}
              keyboardType="numbers-and-punctuation"
              textAlign="center"
            />
          ))}
        </View>
      ))}
    </View>
  )

  const ResultGrid = ({ m }) => (
    <View style={styles.grid}>
      {m.map((row, i) => (
        <View key={i} style={styles.gridRow}>
          {row.map((v, j) => (
            <View key={j} style={[styles.resCell, { backgroundColor: theme.bgDisplay }]}>
              <Text style={[styles.resCellText, { color: theme.colorNumber }]}>{fmtNum(v)}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )

  return (
    <View style={[styles.root, { backgroundColor: theme.bgCalc }, theme.shadow]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.title, { color: theme.colorNumber }]}>Matrices</Text>

        <View style={styles.sizeRow}>
          <Text style={[styles.label, { color: theme.colorExpr }]}>Tamaño:</Text>
          {[2, 3].map(n => (
            <TouchableOpacity
              key={n}
              style={[styles.sizeBtn, { backgroundColor: size === n ? theme.bgBtnOp : theme.bgBtn }]}
              onPress={() => changeSize(n)}
            >
              <Text style={[styles.sizeTxt, { color: size === n ? theme.colorBtnOp : theme.colorBtn }]}>
                {n}×{n}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.opGrid}>
          {[...BINARY_OPS, ...UNARY_OPS].map(o => (
            <TouchableOpacity
              key={o}
              style={[styles.opBtn, { backgroundColor: op === o ? theme.bgBtnSci : theme.bgBtn }]}
              onPress={() => setOp(o)}
            >
              <Text style={[styles.opTxt, { color: op === o ? theme.colorBtnSci : theme.colorBtn }]}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={[styles.mats, isBinary && styles.matsRow]}>
          <View style={styles.matBlock}>
            <Text style={[styles.matLabel, { color: theme.colorExpr }]}>Matriz A</Text>
            <MatGrid mat={matA} setMat={setMatA} />
          </View>
          {isBinary && (
            <View style={styles.matBlock}>
              <Text style={[styles.matLabel, { color: theme.colorExpr }]}>Matriz B</Text>
              <MatGrid mat={matB} setMat={setMatB} />
            </View>
          )}
        </View>

        <TouchableOpacity style={[styles.calcBtn, { backgroundColor: theme.bgBtnOp }]} onPress={compute}>
          <Text style={[styles.calcBtnText, { color: theme.colorBtnOp }]}>Calcular</Text>
        </TouchableOpacity>

        {error && (
          <View style={[styles.resultBox, { backgroundColor: theme.bgDisplay }]}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {result && !error && (
          <View style={[styles.resultBox, { backgroundColor: theme.bgDisplay }]}>
            <Text style={[styles.label, { color: theme.colorExpr }]}>Resultado</Text>
            {result.type === 'matrix' && <ResultGrid m={result.val} />}
            {result.type === 'scalar' && (
              <>
                <Text style={[styles.scalarLabel, { color: theme.colorExpr }]}>{result.label} =</Text>
                <Text style={[styles.scalarVal, { color: theme.colorNumber }]}>{fmtNum(result.val)}</Text>
              </>
            )}
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
  sizeRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  label: { fontSize: 13 },
  sizeBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  sizeTxt: { fontSize: 13, fontWeight: '500' },
  opGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  opBtn: { paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10 },
  opTxt: { fontSize: 12, fontWeight: '500' },
  mats: { gap: 14 },
  matsRow: { flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 14 },
  matBlock: { gap: 6 },
  matLabel: { fontSize: 12, fontWeight: '500' },
  grid: { gap: 4 },
  gridRow: { flexDirection: 'row', gap: 4 },
  cell: { width: 52, height: 38, borderRadius: 8, fontSize: 14, textAlign: 'center' },
  resCell: { width: 52, height: 38, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  resCellText: { fontSize: 12 },
  calcBtn: { borderRadius: 14, padding: 14, alignItems: 'center' },
  calcBtnText: { fontSize: 16, fontWeight: '600' },
  resultBox: { borderRadius: 16, padding: 16, alignItems: 'center', gap: 10 },
  scalarLabel: { fontSize: 14 },
  scalarVal: { fontSize: 40, fontWeight: '300' },
  errorText: { color: '#e94560', fontSize: 15 },
})
