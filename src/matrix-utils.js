/**
 * Funciones de álgebra lineal: matrices 2×2 y 3×3.
 */

export function det(m) {
  if (m.length === 1) return m[0][0]
  if (m.length === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0]
  return m[0].reduce((s, v, j) => {
    const minor = m.slice(1).map(r => r.filter((_, k) => k !== j))
    return s + (j % 2 === 0 ? 1 : -1) * v * det(minor)
  }, 0)
}

export function matT(m) {
  return m[0].map((_, j) => m.map(r => r[j]))
}

export function matAdd(a, b) {
  return a.map((r, i) => r.map((v, j) => v + b[i][j]))
}

export function matSub(a, b) {
  return a.map((r, i) => r.map((v, j) => v - b[i][j]))
}

export function matMul(a, b) {
  const n = a.length
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      a[i].reduce((s, _, k) => s + a[i][k] * b[k][j], 0)
    )
  )
}

export function matInv(m) {
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

export function makeMatrix(n) {
  return Array.from({ length: n }, () => Array(n).fill('0'))
}

export function parseMatrix(raw) {
  const m = raw.map(r => r.map(v => parseFloat(v)))
  if (m.some(r => r.some(isNaN))) return null
  return m
}
