/**
 * Funciones de aritmética racional, operaciones unarias y formateo.
 */

// ── Aritmética racional exacta ───────────────────────────────────────────────

export function gcd(a, b) {
  a = Math.abs(Math.floor(a)); b = Math.abs(Math.floor(b))
  while (b) { [a, b] = [b, a % b] }
  return a || 1
}

export function makeFrac(num, den) {
  if (!Number.isFinite(num) || !Number.isFinite(den)) return null
  if (den === 0) return null
  if (num === 0) return { num: 0, den: 1 }
  const sign = den < 0 ? -1 : 1
  num = sign * num; den = sign * den
  const g = gcd(Math.abs(num), Math.abs(den))
  return { num: num / g, den: den / g }
}

export const FRAC_OPS = {
  '+':  (a, b) => makeFrac(a.num * b.den + b.num * a.den, a.den * b.den),
  '−':  (a, b) => makeFrac(a.num * b.den - b.num * a.den, a.den * b.den),
  '×':  (a, b) => makeFrac(a.num * b.num, a.den * b.den),
  '÷':  (a, b) => b.num === 0 ? null : makeFrac(a.num * b.den, a.den * b.num),
  'xʸ': (a, b) => {
    if (b.den !== 1) return null
    if (b.num === 0) return { num: 1, den: 1 }
    if (b.num > 0)  return makeFrac(Math.pow(a.num, b.num), Math.pow(a.den, b.num))
    return makeFrac(Math.pow(a.den, -b.num), Math.pow(a.num, -b.num))
  },
}

export const FLOAT_OPS = {
  '+': (a, b) => a + b, '−': (a, b) => a - b,
  '×': (a, b) => a * b, '÷': (a, b) => a / b,
  'xʸ': (a, b) => Math.pow(a, b),
}

export function floatToCleanFrac(v, maxDen = 1000) {
  if (!Number.isFinite(v) || isNaN(v)) return null
  if (Number.isInteger(v)) return { num: v, den: 1 }
  const sign = v < 0 ? -1 : 1; const x = Math.abs(v)
  let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = x
  do {
    const a = Math.floor(b), h = a * h1 + h2, k = a * k1 + k2
    if (k > maxDen) return null
    h2 = h1; h1 = h; k2 = k1; k1 = k
    if (Math.abs(x - h1 / k1) < 1e-9) return makeFrac(sign * h1, k1)
    b = 1 / (b - a)
  } while (Number.isFinite(b))
  return null
}

export function parseToFrac(d) {
  if (!d || d === 'Error' || d === 'Infinito' || d === '-Infinito') return null
  if (d.includes('/')) {
    const [nStr, dStr] = d.split('/')
    const n = parseInt(nStr, 10)
    if (isNaN(n)) return null
    if (!dStr) return { num: n, den: 1 }
    const dn = parseInt(dStr, 10)
    if (isNaN(dn) || dn === 0) return null
    return makeFrac(n, dn)
  }
  const v = parseFloat(d)
  if (isNaN(v)) return null
  if (Number.isInteger(v)) return { num: v, den: 1 }
  const dotIdx = d.indexOf('.')
  if (dotIdx >= 0) {
    const dec = d.replace('-', '').length - dotIdx - 1
    return makeFrac(Math.round(v * Math.pow(10, dec)), Math.pow(10, dec))
  }
  return { num: v, den: 1 }
}

export function fracToStr(f) {
  if (!f) return 'Error'
  return f.den === 1 ? String(f.num) : `${f.num}/${f.den}`
}

export function fracToFloat(f) {
  return f ? f.num / f.den : NaN
}

// ── Operaciones unarias ──────────────────────────────────────────────────────

export function factorial(n) {
  n = Math.floor(n); if (n < 0) return NaN; if (n <= 1) return 1
  let r = 1; for (let i = 2; i <= n; i++) r *= i; return r
}

export function computeUnary(btn, f) {
  if (btn === 'x²')  return { frac: makeFrac(f.num ** 2, f.den ** 2) }
  if (btn === 'x³')  return { frac: makeFrac(f.num ** 3, f.den ** 3) }
  if (btn === '1/x') return { frac: f.num !== 0 ? makeFrac(f.den, f.num) : null }
  if (btn === '|x|') return { frac: { num: Math.abs(f.num), den: f.den } }
  const v = fracToFloat(f)
  const floatFns = {
    'sin': () => Math.sin(v * Math.PI / 180),
    'cos': () => Math.cos(v * Math.PI / 180),
    'tan': () => Math.tan(v * Math.PI / 180),
    'ln':  () => Math.log(v),
    'log': () => Math.log10(v),
    '√':   () => Math.sqrt(v),
    'eˣ':  () => Math.exp(v),
    '10ˣ': () => Math.pow(10, v),
    'n!':  () => factorial(v),
  }
  const fl = floatFns[btn]?.() ?? NaN
  return { frac: floatToCleanFrac(fl), float: fl }
}

export function formatFloat(v) {
  if (!Number.isFinite(v)) return isNaN(v) ? 'Error' : v > 0 ? 'Infinito' : '-Infinito'
  return String(parseFloat(v.toPrecision(12)))
}

export function fracOrFloat(v) {
  const f = floatToCleanFrac(v)
  return f ? fracToStr(f) : formatFloat(v)
}
