import { useState, useRef, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native'
import { buildFn, numericalLimit, deriv1, deriv2 } from './math-utils'
import { gcd, makeFrac, FRAC_OPS, FLOAT_OPS, floatToCleanFrac, parseToFrac, fracToStr, fracToFloat, factorial, computeUnary, formatFloat, fracOrFloat } from './arithmetic-utils'

const FONT      = 'DotMatrix'
const FONT_BOLD = 'DotMatrixBold'

// ── Tokens de acceso rápido para escribir f(x) ────────────────────────────────
const FUNC_TOKENS = [
  { label: 'x',     ins: 'x'      },
  { label: 'x²',    ins: 'x^2'   },
  { label: '^',     ins: '^'      },
  { label: '(',     ins: '('      },
  { label: ')',     ins: ')'      },
  { label: 'π',     ins: 'π'     },
  { label: 'e',     ins: 'e'     },
  { label: 'sin(',  ins: 'sin('  },
  { label: 'cos(',  ins: 'cos('  },
  { label: 'tan(',  ins: 'tan('  },
  { label: 'ln(',   ins: 'ln('   },
  { label: '√(',    ins: 'sqrt(' },
  { label: 'abs(',  ins: 'abs('  },
  { label: '⌫',    ins: '⌫'    },
  { label: 'CLR',   ins: 'CLR'   },
]

// ── Layout de botones ────────────────────────────────────────────────────────

const BUTTONS = [
  ['sin', 'cos', 'tan', 'ln',  'log'],
  ['√',   'x²',  'x³',  'xʸ', '1/x'],
  ['eˣ',  '10ˣ', 'n!',  '|x|', 'π'],
  ['C',   '±',   '%',   '(',   ')'],
  ['7',   '8',   '9',   '÷',   'DEL'],
  ['4',   '5',   '6',   '×',   'e'],
  ['1',   '2',   '3',   '−',   'a/b'],
  ['0',   '.',   '=',   '+',   '∂'],
]

const UNARY_SET  = new Set(['sin','cos','tan','ln','log','√','x²','x³','1/x','eˣ','10ˣ','n!','|x|'])
const BINARY_SET = new Set(['+','−','×','÷','xʸ'])
const CALC_MODES = ['none', 'limit', 'deriv']
const MAX_HISTORY = 50

// ── Componente ───────────────────────────────────────────────────────────────

export default function Calculator({ theme }) {
  const [display, setDisplay]         = useState('0')
  const [expr, setExpr]               = useState('')
  const [prevFrac, setPrevFrac]       = useState(null)
  const [op, setOp]                   = useState(null)
  const [resetNext, setResetNext]     = useState(false)
  const [parenCount, setParenCount]   = useState(0)
  const [fracDenMode, setFracDenMode] = useState(false)
  const [history, setHistory]         = useState([])
  // Cálculo
  const [calcMode, setCalcMode]       = useState('none') // 'none' | 'limit' | 'deriv'
  const [funcExpr, setFuncExpr]       = useState('')

  const historyRef = useRef(null)
  const funcRef    = useRef(null)

  const handleFuncToken = ({ ins }) => {
    if (ins === '⌫')  { setFuncExpr(f => f.slice(0, -1)); return }
    if (ins === 'CLR') { setFuncExpr(''); return }
    setFuncExpr(f => f + ins)
    setTimeout(() => funcRef.current?.focus(), 0)
  }

  useEffect(() => {
    if (history.length > 0)
      setTimeout(() => historyRef.current?.scrollToEnd({ animated: true }), 60)
  }, [history])

  useEffect(() => {
    if (calcMode !== 'none')
      setTimeout(() => funcRef.current?.focus(), 80)
  }, [calcMode])

  const pushHistory = (label, result) =>
    setHistory(h => {
      const next = [...h, { label, result }]
      return next.length > MAX_HISTORY ? next.slice(-MAX_HISTORY) : next
    })

  // ── Manejador central ────────────────────────────────────────────────────

  const handleButton = (btn) => {
    if (btn === '') return

    // ── ∂ — cicla entre modos de cálculo ──
    if (btn === '∂') {
      const next = CALC_MODES[(CALC_MODES.indexOf(calcMode) + 1) % CALC_MODES.length]
      setCalcMode(next)
      if (next !== 'none') {
        setFuncExpr('')
        setResetNext(true)
        setPrevFrac(null); setOp(null); setFracDenMode(false)
      }
      return
    }

    // ── C ──
    if (btn === 'C') {
      setDisplay('0'); setPrevFrac(null); setOp(null)
      setResetNext(false); setExpr(''); setParenCount(0); setFracDenMode(false)
      setHistory([]); setCalcMode('none'); setFuncExpr('')
      return
    }

    // ── DEL ──
    if (btn === 'DEL') {
      const newD = display.length > 1 ? display.slice(0, -1) : '0'
      setDisplay(newD)
      if (fracDenMode && !newD.includes('/')) setFracDenMode(false)
      return
    }

    // ── ± ──
    if (btn === '±') {
      setDisplay(d => {
        if (d.includes('/')) {
          const [n, dn] = d.split('/')
          return (n.startsWith('-') ? n.slice(1) : '-' + n) + '/' + dn
        }
        return d.startsWith('-') ? d.slice(1) : '-' + d
      })
      return
    }

    // ── % ──
    if (btn === '%') {
      const f = parseToFrac(display)
      if (f) setDisplay(fracToStr(makeFrac(f.num, f.den * 100) ?? f))
      return
    }

    // ── Constantes ──
    if (btn === 'π') { setDisplay(String(Math.PI)); setResetNext(true); setFracDenMode(false); return }
    if (btn === 'e') { setDisplay(String(Math.E));  setResetNext(true); setFracDenMode(false); return }

    // ── a/b — fracción ──
    if (btn === 'a/b') {
      if (resetNext) {
        const f = parseToFrac(display)
        if (f) {
          const asFrac = fracToStr(f), asDec = formatFloat(fracToFloat(f))
          setDisplay(display === asFrac ? asDec : asFrac)
        }
      } else if (!fracDenMode && !display.includes('/') && !display.includes('.')
                 && display !== '0' && !display.includes('(') && display !== 'Error') {
        setDisplay(d => d + '/'); setFracDenMode(true)
      }
      return
    }

    // ── Unarias ──
    if (UNARY_SET.has(btn)) {
      const f = parseToFrac(display)
      if (!f) return
      const { frac, float } = computeUnary(btn, f)
      const result = frac ? fracToStr(frac) : formatFloat(float ?? NaN)
      const label  = `${btn}(${display})`
      pushHistory(label, result)
      setExpr(`${label} =`)
      setDisplay(result); setResetNext(true); setFracDenMode(false)
      return
    }

    // ── Binarias (ignoradas en modo cálculo) ──
    if (BINARY_SET.has(btn)) {
      if (calcMode !== 'none') return
      const f = parseToFrac(display)
      if (!f) return
      setPrevFrac(f); setOp(btn)
      setExpr(`${display} ${btn}`)
      setResetNext(true); setFracDenMode(false)
      return
    }

    // ── = ──
    if (btn === '=') {
      // Modo cálculo: límite o derivada
      if (calcMode !== 'none') {
        const x = fracToFloat(parseToFrac(display))
        if (isNaN(x)) return
        const fn = buildFn(funcExpr)
        if (!fn) {
          pushHistory(funcExpr, 'Función inválida')
          setDisplay('Error'); setExpr('Función inválida'); setResetNext(true)
          return
        }

        if (calcMode === 'limit') {
          const lim = numericalLimit(fn, x)
          const base = `lim(x→${display}) ${funcExpr}`
          if (lim.exists) {
            const result = fracOrFloat(lim.value)
            pushHistory(base, result)
            setExpr(`${base} =`)
            setDisplay(result)
          } else {
            pushHistory(`${base}  (izq.)`, fracOrFloat(lim.L))
            pushHistory(`${base}  (der.)`, fracOrFloat(lim.R))
            setExpr(`${base} = No existe`)
            setDisplay('No existe')
          }
        } else {
          const d1 = deriv1(fn, x), d2 = deriv2(fn, x)
          const d1s = fracOrFloat(d1), d2s = fracOrFloat(d2)
          pushHistory(`${funcExpr}'(${display})`,  d1s)
          pushHistory(`${funcExpr}''(${display})`, d2s)
          setExpr(`${funcExpr}'(${display}) =`)
          setDisplay(d1s)
        }

        setResetNext(true)
        return
      }

      // Modo normal
      if (!op || !prevFrac) return
      const bFrac = parseToFrac(display)
      if (!bFrac) return

      const fracResult = FRAC_OPS[op](prevFrac, bFrac)
      let result
      if (fracResult) {
        result = fracToStr(fracResult)
      } else if (op === '÷' && bFrac.num === 0) {
        result = 'Error'
      } else {
        const fl = FLOAT_OPS[op](fracToFloat(prevFrac), fracToFloat(bFrac))
        result = Number.isFinite(fl) ? (floatToCleanFrac(fl) ? fracToStr(floatToCleanFrac(fl)) : formatFloat(fl)) : formatFloat(fl)
      }

      const label = `${fracToStr(prevFrac)} ${op} ${display}`
      pushHistory(label, result)
      setExpr(`${label} =`)
      setDisplay(result)
      setPrevFrac(null); setOp(null); setResetNext(true); setFracDenMode(false)
      return
    }

    // ── Paréntesis ──
    if (btn === '(' || btn === ')') {
      if (fracDenMode || calcMode !== 'none') return
      if (btn === '(') setParenCount(c => c + 1)
      else if (parenCount === 0) return
      else setParenCount(c => c - 1)
      if (resetNext) { setDisplay(btn); setResetNext(false) }
      else setDisplay(d => d === '0' ? btn : d + btn)
      return
    }

    // ── Punto decimal ──
    if (btn === '.') {
      if (fracDenMode) return
      if (resetNext) { setDisplay('0.'); setResetNext(false); return }
      if (display.includes('.')) return
      setDisplay(d => d + '.')
      return
    }

    // ── Dígitos ──
    if (fracDenMode) {
      setDisplay(d => {
        const [n, dn = ''] = d.split('/')
        return n + '/' + (dn === '0' || dn === '' ? btn : dn + btn)
      })
      return
    }
    if (resetNext) { setDisplay(btn); setResetNext(false); setFracDenMode(false) }
    else setDisplay(d => d === '0' ? btn : d + btn)
  }

  // ── Estilos de botones ───────────────────────────────────────────────────

  const isFracActive = display.includes('/') || fracDenMode
  const isCalcActive = calcMode !== 'none'

  const getBtnBg = (btn) => {
    if (btn === 'a/b') return isFracActive ? theme.bgBtnOp : theme.bgBtnSci
    if (btn === '∂')   return isCalcActive ? theme.bgBtnOp : theme.bgBtnSci
    if (BINARY_SET.has(btn) || btn === '=') return theme.bgBtnOp
    if (UNARY_SET.has(btn))                 return theme.bgBtnSci
    if (['C', 'DEL', '(', ')'].includes(btn)) return theme.bgBtnSpecial
    return theme.bgBtn
  }

  const getBtnColor = (btn) => {
    if (btn === 'a/b') return isFracActive ? theme.colorBtnOp : theme.colorBtnSci
    if (btn === '∂')   return isCalcActive ? theme.colorBtnOp : theme.colorBtnSci
    if (BINARY_SET.has(btn) || btn === '=') return theme.colorBtnOp
    if (UNARY_SET.has(btn))                 return theme.colorBtnSci
    if (['C', 'DEL', '(', ')'].includes(btn)) return theme.colorBtnSpecial
    return theme.colorBtn
  }

  // El botón ∂ muestra la etiqueta del modo actual
  const getBtnLabel = (btn) => {
    if (btn !== '∂') return btn
    return calcMode === 'limit' ? 'lim' : calcMode === 'deriv' ? 'd/dx' : '∂'
  }

  // ── Área de display ──────────────────────────────────────────────────────

  const displayFontSize = display.length > 14 ? 18 : display.length > 10 ? 24 : display.length > 6 ? 30 : 38

  const fracHint = !isCalcActive && display.includes('/') ? (() => {
    const f = parseToFrac(display); return f ? formatFloat(fracToFloat(f)) : null
  })() : null

  // En modo cálculo, el panel de entrada reemplaza la expresión/valor actuales
  const showCalcPanel = isCalcActive && !resetNext

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={[styles.calc, { backgroundColor: theme.bgCalc }, theme.shadow]}>

      {/* ── Display ── */}
      <View style={[styles.displayWrapper, { backgroundColor: theme.bgDisplay }]}>

        {/* Historial desplazable */}
        <ScrollView
          ref={historyRef}
          style={styles.historyScroll}
          contentContainerStyle={styles.historyContent}
          showsVerticalScrollIndicator={false}
        >
          {history.length === 0 && (
            <Text style={[styles.historyEmpty, { color: theme.colorExpr, fontFamily: FONT }]}>
              — historial vacío —
            </Text>
          )}
          {history.map((item, idx) => {
            const age   = history.length - 1 - idx
            const alpha = Math.max(0.25, 1 - age * 0.07)
            return (
              <View key={idx} style={styles.historyRow}>
                <Text style={[styles.historyLabel,  { color: theme.colorExpr,   fontFamily: FONT,      opacity: alpha }]} numberOfLines={1}>
                  {item.label}
                </Text>
                <Text style={[styles.historyResult, { color: theme.colorNumber, fontFamily: FONT_BOLD, opacity: alpha }]} numberOfLines={1}>
                  = {item.result}
                </Text>
              </View>
            )
          })}
        </ScrollView>

        <View style={[styles.separator, { backgroundColor: theme.colorExpr, opacity: 0.15 }]} />

        {/* Panel de cálculo (límite / derivada) */}
        {showCalcPanel ? (
          <View style={styles.calcPanel}>
            <Text style={[styles.calcModeLabel, { color: theme.colorExpr, fontFamily: FONT }]}>
              {calcMode === 'limit'
                ? `lim ( x → ${display} )  f(x) =`
                : `f' ( x = ${display} ) =`}
            </Text>
            <View style={[styles.calcInputRow, { borderColor: theme.colorExpr }]}>
              <Text style={[styles.calcInputPrefix, { color: theme.colorExpr, fontFamily: FONT }]}>
                f(x) =
              </Text>
              <TextInput
                ref={funcRef}
                style={[styles.calcInput, { color: theme.colorNumber, fontFamily: FONT }]}
                value={funcExpr}
                onChangeText={setFuncExpr}
                placeholder={calcMode === 'limit' ? 'sin(x)/x' : 'sin(x)'}
                placeholderTextColor={theme.colorExpr}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>
        ) : (
          <>
            <Text style={[styles.expr, { color: theme.colorExpr, fontFamily: FONT }]} numberOfLines={1}>
              {expr || ' '}
            </Text>
            {fracHint && (
              <Text style={[styles.fracHint, { color: theme.colorExpr, fontFamily: FONT }]} numberOfLines={1}>
                = {fracHint}
              </Text>
            )}
            <Text
              style={[styles.number, { color: theme.colorNumber, fontSize: displayFontSize, fontFamily: FONT_BOLD }]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {display}
            </Text>
          </>
        )}
      </View>

      {/* ── Barra de tokens para f(x) — solo en modo cálculo ── */}
      {isCalcActive && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.tokenBar}
          contentContainerStyle={styles.tokenContent}
        >
          {FUNC_TOKENS.map(tok => (
            <TouchableOpacity
              key={tok.label}
              style={[
                styles.token,
                {
                  backgroundColor:
                    tok.ins === 'CLR' ? theme.bgBtnSpecial :
                    tok.ins === '⌫'  ? theme.bgBtnSpecial :
                    tok.ins === 'x'   ? theme.bgBtnOp      : theme.bgBtnSci,
                },
              ]}
              onPress={() => handleFuncToken(tok)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.tokenText,
                {
                  color:
                    tok.ins === 'CLR' ? theme.colorBtnSpecial :
                    tok.ins === '⌫'  ? theme.colorBtnSpecial :
                    tok.ins === 'x'   ? theme.colorBtnOp      : theme.colorBtnSci,
                  fontFamily: FONT,
                },
              ]}>
                {tok.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* ── Botones ── */}
      <View style={styles.buttons}>
        {BUTTONS.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((btn, j) => (
              <TouchableOpacity
                key={j}
                style={[
                  styles.btn,
                  { backgroundColor: getBtnBg(btn) },
                ]}
                onPress={() => handleButton(btn)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.btnText,
                  { color: getBtnColor(btn), fontFamily: FONT },
                  (UNARY_SET.has(btn) || btn === 'a/b' || btn === '∂') && styles.btnTextSci,
                ]}>
                  {getBtnLabel(btn)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  calc: { flex: 1, borderRadius: 24, padding: 14, gap: 10 },

  displayWrapper: {
    flex: 2,
    borderRadius: 16,
    padding: 12,
    paddingBottom: 10,
    overflow: 'hidden',
  },

  historyScroll:   { flex: 1 },
  historyContent:  { justifyContent: 'flex-end', paddingBottom: 4, gap: 2 },
  historyEmpty:    { fontSize: 11, textAlign: 'center', paddingVertical: 6 },
  historyRow:      { alignItems: 'flex-end' },
  historyLabel:    { fontSize: 11 },
  historyResult:   { fontSize: 13 },

  separator: { height: 1, marginVertical: 6 },

  // Modo cálculo
  calcPanel:       { gap: 8 },
  calcModeLabel:   { fontSize: 12, textAlign: 'right' },
  calcInputRow:    { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4, opacity: 0.9 },
  calcInputPrefix: { fontSize: 12, marginRight: 6 },
  calcInput:       { flex: 1, fontSize: 15, paddingVertical: 4 },

  // Modo normal
  expr:     { fontSize: 12, textAlign: 'right' },
  fracHint: { fontSize: 11, textAlign: 'right' },
  number:   { textAlign: 'right', letterSpacing: 1 },

  tokenBar:     { flexShrink: 0 },
  tokenContent: { flexDirection: 'row', gap: 5, paddingVertical: 2 },
  token:        { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7, alignItems: 'center', justifyContent: 'center' },
  tokenText:    { fontSize: 12 },

  buttons: { flex: 3, gap: 5 },
  row:     { flex: 1, flexDirection: 'row', gap: 5 },
  btn:     { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  btnText:    { fontSize: 14 },
  btnTextSci: { fontSize: 11 },
})
