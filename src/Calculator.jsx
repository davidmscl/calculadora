import { useState } from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'

const BINARY_OPS = {
  '÷': (a, b) => a / b,
  '×': (a, b) => a * b,
  '−': (a, b) => a - b,
  '+': (a, b) => a + b,
  'xʸ': (a, b) => Math.pow(a, b),
}

const UNARY_OPS = {
  'sin':  (a) => Math.sin(a * Math.PI / 180),
  'cos':  (a) => Math.cos(a * Math.PI / 180),
  'tan':  (a) => Math.tan(a * Math.PI / 180),
  'ln':   (a) => Math.log(a),
  'log':  (a) => Math.log10(a),
  '√':    (a) => Math.sqrt(a),
  'x²':   (a) => a * a,
  'x³':   (a) => a * a * a,
  '1/x':  (a) => 1 / a,
  'eˣ':   (a) => Math.exp(a),
  '10ˣ':  (a) => Math.pow(10, a),
  'n!':   (a) => factorial(a),
  '|x|':  (a) => Math.abs(a),
}

function factorial(n) {
  n = Math.floor(n)
  if (n < 0) return NaN
  if (n === 0 || n === 1) return 1
  let r = 1
  for (let i = 2; i <= n; i++) r *= i
  return r
}

const BUTTONS = [
  ['sin', 'cos', 'tan', 'ln',  'log'],
  ['√',   'x²',  'x³',  'xʸ', '1/x'],
  ['eˣ',  '10ˣ', 'n!',  '|x|', 'π'],
  ['C',   '±',   '%',   '(',   ')'],
  ['7',   '8',   '9',   '÷',   'DEL'],
  ['4',   '5',   '6',   '×',   'e'],
  ['1',   '2',   '3',   '−',   ''],
  ['0',   '.',   '=',   '+',   ''],
]

function formatResult(n) {
  if (!isFinite(n)) return isNaN(n) ? 'Error' : n > 0 ? 'Infinito' : '-Infinito'
  return String(parseFloat(n.toPrecision(12)))
}

export default function Calculator({ theme }) {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)
  const [resetNext, setResetNext] = useState(false)
  const [parenCount, setParenCount] = useState(0)

  const handleButton = (btn) => {
    if (btn === '') return

    if (btn === 'C') {
      setDisplay('0'); setPrev(null); setOp(null)
      setResetNext(false); setExpr(''); setParenCount(0)
      return
    }
    if (btn === 'DEL') {
      setDisplay((d) => d.length > 1 ? d.slice(0, -1) : '0')
      return
    }
    if (btn === '±') {
      setDisplay((d) => d.startsWith('-') ? d.slice(1) : '-' + d)
      return
    }
    if (btn === '%') {
      setDisplay((d) => formatResult(parseFloat(d) / 100))
      return
    }
    if (btn === 'π') {
      setDisplay(String(Math.PI)); setResetNext(true); return
    }
    if (btn === 'e' && !(btn in BINARY_OPS)) {
      setDisplay(String(Math.E)); setResetNext(true); return
    }
    if (btn in UNARY_OPS) {
      const res = formatResult(UNARY_OPS[btn](parseFloat(display)))
      setExpr(`${btn}(${display}) =`)
      setDisplay(res); setResetNext(true); return
    }
    if (btn in BINARY_OPS) {
      setPrev(parseFloat(display))
      setOp(btn)
      setExpr(`${display} ${btn}`)
      setResetNext(true)
      return
    }
    if (btn === '=') {
      if (op === null || prev === null) return
      const result = BINARY_OPS[op](prev, parseFloat(display))
      setExpr(`${prev} ${op} ${display} =`)
      setDisplay(formatResult(result))
      setPrev(null); setOp(null); setResetNext(true)
      return
    }
    if (btn === '(' || btn === ')') {
      if (btn === '(') setParenCount((c) => c + 1)
      else if (parenCount === 0) return
      else setParenCount((c) => c - 1)
      setDisplay((d) => (d === '0' ? btn : d + btn))
      return
    }
    if (btn === '.') {
      if (resetNext) { setDisplay('0.'); setResetNext(false); return }
      if (display.includes('.')) return
      setDisplay((d) => d + '.'); return
    }
    if (resetNext) { setDisplay(btn); setResetNext(false) }
    else setDisplay((d) => d === '0' ? btn : d + btn)
  }

  const getBtnBg = (btn) => {
    if (btn in BINARY_OPS || btn === '=') return theme.bgBtnOp
    if (btn in UNARY_OPS) return theme.bgBtnSci
    if (['C', 'DEL', '(', ')'].includes(btn)) return theme.bgBtnSpecial
    return theme.bgBtn
  }

  const getBtnColor = (btn) => {
    if (btn in BINARY_OPS || btn === '=') return theme.colorBtnOp
    if (btn in UNARY_OPS) return theme.colorBtnSci
    if (['C', 'DEL', '(', ')'].includes(btn)) return theme.colorBtnSpecial
    return theme.colorBtn
  }

  const displayFontSize = display.length > 12 ? 22 : display.length > 8 ? 30 : 38

  return (
    <View style={[styles.calc, { backgroundColor: theme.bgCalc }, theme.shadow]}>
      <View style={[styles.display, { backgroundColor: theme.bgDisplay }]}>
        <Text style={[styles.expr, { color: theme.colorExpr }]} numberOfLines={1}>
          {expr}
        </Text>
        <Text
          style={[styles.number, { color: theme.colorNumber, fontSize: displayFontSize }]}
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {display}
        </Text>
      </View>

      <View style={styles.buttons}>
        {BUTTONS.map((row, i) => (
          <View key={i} style={styles.row}>
            {row.map((btn, j) => (
              <TouchableOpacity
                key={j}
                style={[
                  styles.btn,
                  { backgroundColor: getBtnBg(btn) },
                  btn === '' && styles.btnHidden,
                ]}
                onPress={() => handleButton(btn)}
                disabled={btn === ''}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.btnText,
                  { color: getBtnColor(btn) },
                  btn in UNARY_OPS && styles.btnTextSci,
                ]}>
                  {btn}
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
  calc: {
    flex: 1,
    borderRadius: 24,
    padding: 14,
  },
  display: {
    borderRadius: 16,
    padding: 14,
    paddingBottom: 10,
    marginBottom: 10,
    minHeight: 72,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  expr: {
    fontSize: 12,
    marginBottom: 2,
  },
  number: {
    fontWeight: '300',
    letterSpacing: -1,
  },
  buttons: {
    flex: 1,
    gap: 5,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 5,
  },
  btn: {
    flex: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnHidden: { opacity: 0 },
  btnText: { fontSize: 15, fontWeight: '400' },
  btnTextSci: { fontSize: 12 },
})
