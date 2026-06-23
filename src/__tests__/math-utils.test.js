/**
 * Tests para math-utils.js — buildFn, numericalLimit, deriv1, deriv2
 */

import { buildFn, numericalLimit, deriv1, deriv2 } from '../math-utils'

// ── buildFn ──────────────────────────────────────────────────────────────────

describe('buildFn', () => {
  test('parsea y evalúa una función lineal', () => {
    const fn = buildFn('2*x + 1')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(1)
    expect(fn(5)).toBeCloseTo(11)
  })

  test('parsea funciones trigonométricas (en radianes en el parser)', () => {
    const fn = buildFn('sin(x)')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(0)
    expect(fn(Math.PI / 2)).toBeCloseTo(1)
  })

  test('parsea cos(x)', () => {
    const fn = buildFn('cos(x)')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(1)
    expect(fn(Math.PI)).toBeCloseTo(-1)
  })

  test('parsea ln(x) como logaritmo natural', () => {
    const fn = buildFn('ln(x)')
    expect(fn).not.toBeNull()
    expect(fn(1)).toBeCloseTo(0)
    expect(fn(Math.E)).toBeCloseTo(1)
  })

  test('parsea log(x) como logaritmo base 10', () => {
    const fn = buildFn('log(x)')
    expect(fn).not.toBeNull()
    expect(fn(1)).toBeCloseTo(0)
    expect(fn(100)).toBeCloseTo(2)
  })

  test('parsea sqrt(x)', () => {
    const fn = buildFn('sqrt(x)')
    expect(fn).not.toBeNull()
    expect(fn(4)).toBeCloseTo(2)
    expect(fn(0)).toBeCloseTo(0)
  })

  test('parsea potencias con ^', () => {
    const fn = buildFn('x^2')
    expect(fn).not.toBeNull()
    expect(fn(3)).toBeCloseTo(9)
    expect(fn(-2)).toBeCloseTo(4)
  })

  test('soporta la constante π', () => {
    const fn = buildFn('sin(π)')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(0) // independiente de x
  })

  test('soporta la constante pi (texto)', () => {
    const fn = buildFn('sin(pi)')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(0)
  })

  test('soporta la constante e', () => {
    const fn = buildFn('e^x')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(1)
    expect(fn(1)).toBeCloseTo(Math.E)
  })

  test('retorna null para expresión vacía', () => {
    expect(buildFn('')).toBeNull()
    expect(buildFn('   ')).toBeNull()
  })

  test('retorna NaN para puntos fuera del dominio', () => {
    const fn = buildFn('sqrt(x)')
    expect(fn(-1)).toBeNaN()
  })

  test('parsea abs(x)', () => {
    const fn = buildFn('abs(x)')
    expect(fn).not.toBeNull()
    expect(fn(-5)).toBeCloseTo(5)
    expect(fn(3)).toBeCloseTo(3)
  })

  test('parsea asin, acos, atan', () => {
    const asin = buildFn('asin(x)')
    expect(asin).not.toBeNull()
    expect(asin(0)).toBeCloseTo(0)

    const acos = buildFn('acos(x)')
    expect(acos).not.toBeNull()
    expect(acos(1)).toBeCloseTo(0)

    const atan = buildFn('atan(x)')
    expect(atan).not.toBeNull()
    expect(atan(0)).toBeCloseTo(0)
  })

  test('parsea exp(x)', () => {
    const fn = buildFn('exp(x)')
    expect(fn).not.toBeNull()
    expect(fn(0)).toBeCloseTo(1)
    expect(fn(1)).toBeCloseTo(Math.E)
  })
})

// ── numericalLimit ───────────────────────────────────────────────────────────

describe('numericalLimit', () => {
  test('límite de x^2 cuando x→2 es 4', () => {
    const fn = buildFn('x^2')
    const lim = numericalLimit(fn, 2)
    expect(lim.exists).toBe(true)
    expect(lim.value).toBeCloseTo(4)
  })

  test('límite de sin(x)/x cuando x→0 es 1', () => {
    const fn = buildFn('sin(x)/x')
    const lim = numericalLimit(fn, 0)
    expect(lim.exists).toBe(true)
    expect(lim.value).toBeCloseTo(1)
  })

  test('límite de 1/x cuando x→0 no existe (laterales distintos)', () => {
    const fn = buildFn('1/x')
    const lim = numericalLimit(fn, 0)
    // Los límites laterales son -∞ y +∞ → no existe
    expect(lim.exists).toBe(false)
  })
})

// ── deriv1 y deriv2 ──────────────────────────────────────────────────────────

describe('deriv1', () => {
  test('derivada de x^2 en x=3 es 6', () => {
    const fn = buildFn('x^2')
    const d = deriv1(fn, 3)
    expect(d).toBeCloseTo(6, 4)
  })

  test('derivada de sin(x) en x=0 es 1', () => {
    const fn = buildFn('sin(x)')
    const d = deriv1(fn, 0)
    expect(d).toBeCloseTo(1, 3)
  })

  test('derivada de 2x+1 es 2 para cualquier x', () => {
    const fn = buildFn('2*x + 1')
    expect(deriv1(fn, 0)).toBeCloseTo(2, 5)
    expect(deriv1(fn, 10)).toBeCloseTo(2, 5)
    expect(deriv1(fn, -5)).toBeCloseTo(2, 5)
  })
})

describe('deriv2', () => {
  test('segunda derivada de x^3 en x=2 es 12', () => {
    const fn = buildFn('x^3')
    const d2 = deriv2(fn, 2)
    expect(d2).toBeCloseTo(12, 3)
  })

  test('segunda derivada de sin(x) en x=0 es 0', () => {
    const fn = buildFn('sin(x)')
    const d2 = deriv2(fn, 0)
    expect(d2).toBeCloseTo(0, 2)
  })
})
