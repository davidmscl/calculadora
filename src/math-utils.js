/**
 * Funciones matemáticas compartidas entre Calculadora, Gráficas y Cálculo.
 *
 * - buildFn       → convierte expresión string en función ejecutable (new Function)
 * - approachFrom  → aproximación lateral para límites
 * - numericalLimit→ límite numérico bilateral
 * - deriv1, deriv2→ derivadas numéricas (1.ª y 2.ª)
 */

// ── Parseo de funciones ─────────────────────────────────────────────────────

export function buildFn(expr) {
  if (!expr.trim()) return null
  const s = expr
    .replace(/\^/g, '**')
    .replace(/\basin\b/g, 'Math.asin')
    .replace(/\bacos\b/g, 'Math.acos')
    .replace(/\batan\b/g, 'Math.atan')
    .replace(/\bsin\b/g, 'Math.sin')
    .replace(/\bcos\b/g, 'Math.cos')
    .replace(/\btan\b/g, 'Math.tan')
    .replace(/\blog\b/g, 'Math.log10')
    .replace(/\bln\b/g, 'Math.log')
    .replace(/\bsqrt\b/g, 'Math.sqrt')
    .replace(/\babs\b/g, 'Math.abs')
    .replace(/\bexp\b/g, 'Math.exp')
    .replace(/\bpow\b/g, 'Math.pow')
    .replace(/\bpi\b/gi, 'Math.PI')
    .replace(/π/g, 'Math.PI')
    .replace(/\be\b/g, 'Math.E')
  try {
    // eslint-disable-next-line no-new-func
    return new Function('x', `"use strict"; try { return +(${s}) } catch { return NaN }`)
  } catch {
    return null
  }
}

// ── Límites numéricos ────────────────────────────────────────────────────────

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

export function numericalLimit(fn, a) {
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

export function deriv1(fn, x) {
  const h = 1e-7
  return (fn(x + h) - fn(x - h)) / (2 * h)
}

export function deriv2(fn, x) {
  const h = 1e-4
  return (fn(x + h) - 2 * fn(x) + fn(x - h)) / (h * h)
}
