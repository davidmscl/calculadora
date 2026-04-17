import { useState } from 'react'
import './Calculator.css'

const BUTTONS = [
  ['C', '±', '%', '÷'],
  ['7', '8', '9', '×'],
  ['4', '5', '6', '−'],
  ['1', '2', '3', '+'],
  ['0', '.', '='],
]

const OPS = { '÷': '/', '×': '*', '−': '-', '+': '+' }

export default function Calculator() {
  const [display, setDisplay] = useState('0')
  const [prev, setPrev] = useState(null)
  const [op, setOp] = useState(null)
  const [resetNext, setResetNext] = useState(false)

  const handleButton = (btn) => {
    if (btn === 'C') {
      setDisplay('0')
      setPrev(null)
      setOp(null)
      setResetNext(false)
      return
    }

    if (btn === '±') {
      setDisplay((d) => String(parseFloat(d) * -1))
      return
    }

    if (btn === '%') {
      setDisplay((d) => String(parseFloat(d) / 100))
      return
    }

    if (btn in OPS) {
      setPrev(parseFloat(display))
      setOp(btn)
      setResetNext(true)
      return
    }

    if (btn === '=') {
      if (op === null || prev === null) return
      const a = prev
      const b = parseFloat(display)
      const ops = { '÷': (x, y) => x / y, '×': (x, y) => x * y, '−': (x, y) => x - y, '+': (x, y) => x + y }
      const result = ops[op](a, b)
      setDisplay(String(parseFloat(result.toFixed(10))))
      setPrev(null)
      setOp(null)
      setResetNext(true)
      return
    }

    if (btn === '.') {
      if (resetNext) {
        setDisplay('0.')
        setResetNext(false)
        return
      }
      if (display.includes('.')) return
      setDisplay((d) => d + '.')
      return
    }

    // digit
    if (resetNext) {
      setDisplay(btn)
      setResetNext(false)
    } else {
      setDisplay((d) => (d === '0' ? btn : d + btn))
    }
  }

  const isOp = (btn) => btn in OPS
  const isEquals = (btn) => btn === '='

  return (
    <div className="calc">
      <div className="display">
        <span className="op-indicator">{op ?? ''}</span>
        <span className="number">{display}</span>
      </div>
      <div className="buttons">
        {BUTTONS.map((row, i) => (
          <div key={i} className="row">
            {row.map((btn) => (
              <button
                key={btn}
                className={`btn ${isOp(btn) ? 'op' : ''} ${isEquals(btn) ? 'equals' : ''} ${btn === '0' ? 'zero' : ''} ${btn === 'C' ? 'clear' : ''}`}
                onClick={() => handleButton(btn)}
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
