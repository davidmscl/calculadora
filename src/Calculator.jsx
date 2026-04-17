import { useState, useEffect } from 'react'
import './Calculator.css'

const BINARY_OPS = { '÷': (a, b) => a / b, '×': (a, b) => a * b, '−': (a, b) => a - b, '+': (a, b) => a + b, 'xʸ': (a, b) => Math.pow(a, b) }
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

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [expr, setExpr] = useState('')
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)
  const [resetNext, setResetNext] = useState(false)
  const [parenCount, setParenCount] = useState(0)
  const [theme, setTheme] = useState('dark')

  useEffect(() => {
    document.body.dataset.theme = theme
  }, [theme])

  const applyUnary = (fn, val) => {
    const result = UNARY_OPS[fn](val)
    return formatResult(result)
  }

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

    if (btn === 'e' && !Object.keys(BINARY_OPS).includes(btn)) {
      setDisplay(String(Math.E)); setResetNext(true); return
    }

    if (btn in UNARY_OPS) {
      const val = parseFloat(display)
      const res = applyUnary(btn, val)
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
      const a = prev, b = parseFloat(display)
      const result = BINARY_OPS[op](a, b)
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

    // digit
    if (resetNext) { setDisplay(btn); setResetNext(false) }
    else setDisplay((d) => d === '0' ? btn : d + btn)
  }

  const isBinOp = (btn) => btn in BINARY_OPS
  const isUnary = (btn) => btn in UNARY_OPS
  const isEquals = (btn) => btn === '='
  const isSpecial = (btn) => ['C', 'DEL', '(', ')'].includes(btn)

  const displaySize = display.length > 12 ? '22px' : display.length > 8 ? '30px' : '38px'

  return (
    <div className="calc">
      <button
        className="theme-toggle"
        onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
        title={theme === 'dark' ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
      >
        {theme === 'dark' ? '☀' : '☾'}
      </button>
      <div className="display">
        <span className="expr">{expr}</span>
        <span className="number" style={{ fontSize: displaySize }}>{display}</span>
      </div>
      <div className="buttons">
        {BUTTONS.map((row, i) => (
          <div key={i} className="row">
            {row.map((btn, j) => (
              <button
                key={j}
                className={[
                  'btn',
                  isBinOp(btn) ? 'op' : '',
                  isUnary(btn) ? 'sci' : '',
                  isEquals(btn) ? 'equals' : '',
                  isSpecial(btn) ? 'special' : '',
                  btn === '' ? 'hidden' : '',
                ].join(' ')}
                onClick={() => handleButton(btn)}
                disabled={btn === ''}
              >
                {btn}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
