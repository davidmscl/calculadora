import { useState, useRef, useEffect, useMemo } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, PanResponder,
} from 'react-native'
import Svg, { Line, Path, Text as SvgText } from 'react-native-svg'

const COLORS = ['#e94560', '#4fc3f7', '#a5d6a7', '#ffcc02', '#ce93d8', '#ffab91']
const INITIAL_VIEW = { xMin: -10, xMax: 10, yMin: -6, yMax: 6 }

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

function niceStep(range, target = 8) {
  const rough = range / target
  const exp = Math.floor(Math.log10(rough))
  const pow = Math.pow(10, exp)
  const m = rough / pow
  return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * pow
}

function buildPath(fn, view, W, H) {
  const { xMin, xMax, yMin, yMax } = view
  const toX = (x) => ((x - xMin) / (xMax - xMin)) * W
  const toY = (y) => H - ((y - yMin) / (yMax - yMin)) * H
  const toXVal = (px) => xMin + (px / W) * (xMax - xMin)

  let d = ''
  let penDown = false
  let prevPy = null
  const steps = Math.min(Math.round(W), 600)

  for (let i = 0; i <= steps; i++) {
    const px = (i / steps) * W
    const y = fn(toXVal(px))

    if (!isFinite(y) || isNaN(y)) {
      penDown = false; prevPy = null; continue
    }

    const py = toY(y)

    if (prevPy !== null && Math.abs(py - prevPy) > H * 2.5) {
      penDown = false
    }

    if (!penDown) {
      d += `M ${px.toFixed(1)} ${py.toFixed(1)} `
      penDown = true
    } else {
      d += `L ${px.toFixed(1)} ${py.toFixed(1)} `
    }
    prevPy = py
  }
  return d
}

export default function Graph({ theme }) {
  const [view, setView] = useState(INITIAL_VIEW)
  const [entries, setEntries] = useState([{ expr: 'sin(x)', fn: buildFn('sin(x)') }])
  const [canvasSize, setCanvasSize] = useState({ w: 0, h: 0 })

  const viewRef = useRef(view)
  const sizeRef = useRef(canvasSize)
  const dragStart = useRef(null)

  useEffect(() => { viewRef.current = view }, [view])
  useEffect(() => { sizeRef.current = canvasSize }, [canvasSize])

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        dragStart.current = { view: viewRef.current }
      },
      onPanResponderMove: (_, g) => {
        if (!dragStart.current) return
        const { view: v } = dragStart.current
        const { w: W, h: H } = sizeRef.current
        if (!W || !H) return
        const dx = (g.dx / W) * (v.xMax - v.xMin)
        const dy = (g.dy / H) * (v.yMax - v.yMin)
        setView({
          xMin: v.xMin - dx, xMax: v.xMax - dx,
          yMin: v.yMin + dy, yMax: v.yMax + dy,
        })
      },
      onPanResponderRelease: () => { dragStart.current = null },
      onPanResponderTerminate: () => { dragStart.current = null },
    })
  ).current

  const zoom = (factor) =>
    setView((v) => {
      const xM = (v.xMin + v.xMax) / 2, yM = (v.yMin + v.yMax) / 2
      const xR = (v.xMax - v.xMin) / 2, yR = (v.yMax - v.yMin) / 2
      return { xMin: xM - xR * factor, xMax: xM + xR * factor, yMin: yM - yR * factor, yMax: yM + yR * factor }
    })

  const updateExpr = (i, val) =>
    setEntries((prev) => prev.map((e, j) => j === i ? { expr: val, fn: buildFn(val) } : e))

  const addEntry = () => {
    if (entries.length >= COLORS.length) return
    setEntries((p) => [...p, { expr: '', fn: null }])
  }

  const removeEntry = (i) => setEntries((p) => p.filter((_, j) => j !== i))

  const { w: W, h: H } = canvasSize

  const svgContent = useMemo(() => {
    if (!W || !H) return null

    const { xMin, xMax, yMin, yMax } = view
    const cx = (x) => ((x - xMin) / (xMax - xMin)) * W
    const cy = (y) => H - ((y - yMin) / (yMax - yMin)) * H

    const xStep = niceStep(xMax - xMin)
    const yStep = niceStep(yMax - yMin)

    const gridLines = []
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      gridLines.push(
        <Line key={`gx${x}`} x1={cx(x)} y1={0} x2={cx(x)} y2={H}
          stroke={theme.graphGrid} strokeWidth={1} />
      )
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      gridLines.push(
        <Line key={`gy${y}`} x1={0} y1={cy(y)} x2={W} y2={cy(y)}
          stroke={theme.graphGrid} strokeWidth={1} />
      )
    }

    const axes = []
    const ax = cx(0)
    if (ax >= 0 && ax <= W)
      axes.push(<Line key="ax" x1={ax} y1={0} x2={ax} y2={H} stroke={theme.graphAxis} strokeWidth={1.5} />)
    const ay = cy(0)
    if (ay >= 0 && ay <= H)
      axes.push(<Line key="ay" x1={0} y1={ay} x2={W} y2={ay} stroke={theme.graphAxis} strokeWidth={1.5} />)

    const labelY = Math.min(Math.max(ay + 14, 14), H - 6)
    const labelX = Math.min(Math.max(ax - 5, 5), W - 5)

    const labels = []
    for (let x = Math.ceil(xMin / xStep) * xStep; x <= xMax; x += xStep) {
      if (Math.abs(x) < xStep * 0.01) continue
      labels.push(
        <SvgText key={`lx${x}`} x={cx(x)} y={labelY}
          fill={theme.graphLabel} fontSize={10} textAnchor="middle">
          {parseFloat(x.toPrecision(6))}
        </SvgText>
      )
    }
    for (let y = Math.ceil(yMin / yStep) * yStep; y <= yMax; y += yStep) {
      if (Math.abs(y) < yStep * 0.01) continue
      labels.push(
        <SvgText key={`ly${y}`} x={labelX} y={cy(y) + 4}
          fill={theme.graphLabel} fontSize={10} textAnchor="end">
          {parseFloat(y.toPrecision(6))}
        </SvgText>
      )
    }

    const curves = entries.map(({ fn, expr }, i) => {
      if (!fn || !expr.trim()) return null
      const d = buildPath(fn, view, W, H)
      if (!d) return null
      return (
        <Path key={i} d={d}
          stroke={COLORS[i % COLORS.length]} strokeWidth={2.5}
          fill="none" strokeLinejoin="round" />
      )
    })

    return <>{gridLines}{axes}{labels}{curves}</>
  }, [view, entries, W, H, theme])

  return (
    <View style={styles.wrap}>
      <View style={[styles.fnList, { backgroundColor: theme.bgCalc }, theme.shadow]}>
        {entries.map((e, i) => (
          <View key={i} style={styles.fnRow}>
            <View style={[styles.fnDot, { backgroundColor: COLORS[i % COLORS.length] }]} />
            <Text style={[styles.fnLabel, { color: theme.colorExpr }]}>f(x)=</Text>
            <TextInput
              style={[styles.fnInput, { backgroundColor: theme.bgDisplay, color: theme.colorNumber }]}
              value={e.expr}
              onChangeText={(val) => updateExpr(i, val)}
              placeholder="sin(x), x^2, ln(x)…"
              placeholderTextColor={theme.colorExpr}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {entries.length > 1 && (
              <TouchableOpacity style={styles.fnRm} onPress={() => removeEntry(i)}>
                <Text style={{ color: theme.colorExpr, fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.ctrlBtn, { backgroundColor: theme.bgBtnSpecial }]}
          onPress={addEntry}
          disabled={entries.length >= COLORS.length}
        >
          <Text style={[styles.ctrlText, { color: theme.colorBtnSpecial }]}>+ Función</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: theme.bgBtnSpecial }]} onPress={() => setView(INITIAL_VIEW)}>
          <Text style={[styles.ctrlText, { color: theme.colorBtnSpecial }]}>⊙ Reset</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: theme.bgBtnSpecial }]} onPress={() => zoom(0.7)}>
          <Text style={[styles.ctrlText, { color: theme.colorBtnSpecial }]}>＋ Zoom</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.ctrlBtn, { backgroundColor: theme.bgBtnSpecial }]} onPress={() => zoom(1 / 0.7)}>
          <Text style={[styles.ctrlText, { color: theme.colorBtnSpecial }]}>－ Zoom</Text>
        </TouchableOpacity>
      </View>

      <View
        style={[styles.canvas, { backgroundColor: theme.graphBg }, theme.shadow]}
        onLayout={(e) => {
          const { width, height } = e.nativeEvent.layout
          setCanvasSize({ w: width, h: height })
        }}
        {...panResponder.panHandlers}
      >
        {W > 0 && H > 0 && (
          <Svg width={W} height={H}>{svgContent}</Svg>
        )}
      </View>

      <Text style={[styles.hint, { color: theme.graphLabel }]}>
        Arrastra para mover · Botones para zoom
      </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { flex: 1, gap: 8 },
  fnList: {
    borderRadius: 16,
    padding: 10,
    gap: 8,
  },
  fnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  fnDot: { width: 10, height: 10, borderRadius: 5 },
  fnLabel: { fontSize: 12, fontFamily: 'monospace' },
  fnInput: {
    flex: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    fontSize: 13,
    fontFamily: 'monospace',
  },
  fnRm: { width: 24, height: 24, alignItems: 'center', justifyContent: 'center' },
  controls: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  ctrlBtn: {
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  ctrlText: { fontSize: 12, fontWeight: '500' },
  canvas: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    minHeight: 200,
  },
  hint: {
    fontSize: 11,
    textAlign: 'center',
  },
})
