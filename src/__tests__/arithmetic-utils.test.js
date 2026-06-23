/**
 * Tests para arithmetic-utils.js — gcd, fracciones, operaciones, factorial, etc.
 */

import {
  gcd, makeFrac, FRAC_OPS, FLOAT_OPS,
  floatToCleanFrac, parseToFrac,
  fracToStr, fracToFloat,
  factorial, computeUnary, formatFloat, fracOrFloat,
} from '../arithmetic-utils'

// ── gcd ──────────────────────────────────────────────────────────────────────

describe('gcd', () => {
  test('gcd(12, 8) = 4', () => {
    expect(gcd(12, 8)).toBe(4)
  })

  test('gcd(0, 5) = 5', () => {
    expect(gcd(0, 5)).toBe(5)
  })

  test('gcd(7, 13) = 1 (coprimos)', () => {
    expect(gcd(7, 13)).toBe(1)
  })

  test('gcd con números negativos usa valor absoluto', () => {
    expect(gcd(-12, 8)).toBe(4)
  })

  test('gcd(0, 0) = 1 (caso borde: retorna 1 para evitar div/0)', () => {
    expect(gcd(0, 0)).toBe(1)
  })
})

// ── makeFrac ─────────────────────────────────────────────────────────────────

describe('makeFrac', () => {
  test('fracción simple 1/2', () => {
    expect(makeFrac(1, 2)).toEqual({ num: 1, den: 2 })
  })

  test('simplifica 2/4 a 1/2', () => {
    expect(makeFrac(2, 4)).toEqual({ num: 1, den: 2 })
  })

  test('simplifica 0/5 a 0/1', () => {
    expect(makeFrac(0, 5)).toEqual({ num: 0, den: 1 })
  })

  test('retorna null para denominador 0', () => {
    expect(makeFrac(1, 0)).toBeNull()
  })

  test('retorna null para no finitos', () => {
    expect(makeFrac(Infinity, 1)).toBeNull()
    expect(makeFrac(1, NaN)).toBeNull()
  })

  test('denominador negativo mueve signo al numerador', () => {
    expect(makeFrac(1, -2)).toEqual({ num: -1, den: 2 })
  })

  test('entero 5 → 5/1', () => {
    expect(makeFrac(5, 1)).toEqual({ num: 5, den: 1 })
  })
})

// ── FRAC_OPS ─────────────────────────────────────────────────────────────────

describe('FRAC_OPS', () => {
  const a = { num: 1, den: 2 } // 1/2
  const b = { num: 1, den: 4 } // 1/4

  test('suma 1/2 + 1/4 = 3/4', () => {
    expect(FRAC_OPS['+'](a, b)).toEqual({ num: 3, den: 4 })
  })

  test('resta 1/2 - 1/4 = 1/4', () => {
    expect(FRAC_OPS['−'](a, b)).toEqual({ num: 1, den: 4 })
  })

  test('multiplicación 1/2 × 1/4 = 1/8', () => {
    expect(FRAC_OPS['×'](a, b)).toEqual({ num: 1, den: 8 })
  })

  test('división 1/2 ÷ 1/4 = 2/1 = 2', () => {
    expect(FRAC_OPS['÷'](a, b)).toEqual({ num: 2, den: 1 })
  })

  test('división por cero retorna null', () => {
    expect(FRAC_OPS['÷'](a, { num: 0, den: 1 })).toBeNull()
  })

  test('xʸ: (1/2)^2 = 1/4', () => {
    expect(FRAC_OPS['xʸ'](a, { num: 2, den: 1 })).toEqual({ num: 1, den: 4 })
  })

  test('xʸ: (1/2)^0 = 1', () => {
    expect(FRAC_OPS['xʸ'](a, { num: 0, den: 1 })).toEqual({ num: 1, den: 1 })
  })

  test('xʸ: exponente no entero retorna null', () => {
    expect(FRAC_OPS['xʸ'](a, { num: 1, den: 2 })).toBeNull()
  })
})

// ── FLOAT_OPS ────────────────────────────────────────────────────────────────

describe('FLOAT_OPS', () => {
  test('suma', () => expect(FLOAT_OPS['+'](0.5, 0.25)).toBeCloseTo(0.75))
  test('resta', () => expect(FLOAT_OPS['−'](0.5, 0.25)).toBeCloseTo(0.25))
  test('multiplicación', () => expect(FLOAT_OPS['×'](0.5, 0.25)).toBeCloseTo(0.125))
  test('división', () => expect(FLOAT_OPS['÷'](0.5, 0.25)).toBeCloseTo(2))
  test('potencia', () => expect(FLOAT_OPS['xʸ'](2, 3)).toBeCloseTo(8))
})

// ── floatToCleanFrac ─────────────────────────────────────────────────────────

describe('floatToCleanFrac', () => {
  test('entero 5 → 5/1', () => {
    expect(floatToCleanFrac(5)).toEqual({ num: 5, den: 1 })
  })

  test('0.5 → 1/2', () => {
    const f = floatToCleanFrac(0.5)
    expect(f).not.toBeNull()
    expect(f.num).toBe(1)
    expect(f.den).toBe(2)
  })

  test('0.75 → 3/4 usando algoritmo', () => {
    const f = floatToCleanFrac(0.75)
    // Debería encontrar 3/4 o aproximación cercana
    expect(f).not.toBeNull()
    expect(f.num / f.den).toBeCloseTo(0.75, 5)
  })

  test('retorna null para no finitos', () => {
    expect(floatToCleanFrac(NaN)).toBeNull()
    expect(floatToCleanFrac(Infinity)).toBeNull()
  })
})

// ── parseToFrac ──────────────────────────────────────────────────────────────

describe('parseToFrac', () => {
  test('"3" → 3/1', () => {
    expect(parseToFrac('3')).toEqual({ num: 3, den: 1 })
  })

  test('"1/2" → 1/2', () => {
    expect(parseToFrac('1/2')).toEqual({ num: 1, den: 2 })
  })

  test('"2/4" → 1/2 (simplifica)', () => {
    expect(parseToFrac('2/4')).toEqual({ num: 1, den: 2 })
  })

  test('"3.5" → fracción', () => {
    const f = parseToFrac('3.5')
    expect(f).not.toBeNull()
    expect(f.num / f.den).toBeCloseTo(3.5, 10)
  })

  test('"0" → 0/1', () => {
    expect(parseToFrac('0')).toEqual({ num: 0, den: 1 })
  })

  test('"Error" → null', () => {
    expect(parseToFrac('Error')).toBeNull()
  })

  test('"Infinito" → null', () => {
    expect(parseToFrac('Infinito')).toBeNull()
  })
})

// ── fracToStr / fracToFloat ──────────────────────────────────────────────────

describe('fracToStr', () => {
  test('entero', () => expect(fracToStr({ num: 5, den: 1 })).toBe('5'))
  test('fracción', () => expect(fracToStr({ num: 1, den: 2 })).toBe('1/2'))
  test('null → "Error"', () => expect(fracToStr(null)).toBe('Error'))
})

describe('fracToFloat', () => {
  test('1/2 → 0.5', () => expect(fracToFloat({ num: 1, den: 2 })).toBeCloseTo(0.5))
  test('null → NaN', () => expect(fracToFloat(null)).toBeNaN())
})

// ── factorial ────────────────────────────────────────────────────────────────

describe('factorial', () => {
  test('0! = 1', () => expect(factorial(0)).toBe(1))
  test('1! = 1', () => expect(factorial(1)).toBe(1))
  test('5! = 120', () => expect(factorial(5)).toBe(120))
  test('7! = 5040', () => expect(factorial(7)).toBe(5040))
  test('factorial de negativo es NaN', () => expect(factorial(-3)).toBeNaN())
  test('factorial de float trunca: 4.7! ≈ 24', () => expect(factorial(4.7)).toBe(24))
})

// ── computeUnary ─────────────────────────────────────────────────────────────

describe('computeUnary', () => {
  const half = { num: 1, den: 2 } // 1/2

  test('x² → (1/2)² = 1/4', () => {
    expect(computeUnary('x²', half)).toEqual({ frac: { num: 1, den: 4 } })
  })

  test('x³ → (1/2)³ = 1/8', () => {
    expect(computeUnary('x³', half)).toEqual({ frac: { num: 1, den: 8 } })
  })

  test('1/x → recíproco de 1/2 es 2', () => {
    expect(computeUnary('1/x', half)).toEqual({ frac: { num: 2, den: 1 } })
  })

  test('|x| → valor absoluto', () => {
    const neg = { num: -3, den: 1 }
    expect(computeUnary('|x|', neg)).toEqual({ frac: { num: 3, den: 1 } })
  })

  test('sin(90°) ≈ 1', () => {
    const res = computeUnary('sin', { num: 90, den: 1 })
    expect(res.float).toBeCloseTo(1, 4)
  })

  test('cos(0) ≈ 1', () => {
    const res = computeUnary('cos', { num: 0, den: 1 })
    expect(res.float).toBeCloseTo(1, 4)
  })

  test('ln(1) = 0', () => {
    const res = computeUnary('ln', { num: 1, den: 1 })
    expect(res.float).toBeCloseTo(0, 5)
  })

  test('log(100) = 2', () => {
    const res = computeUnary('log', { num: 100, den: 1 })
    expect(res.float).toBeCloseTo(2, 5)
  })

  test('√(4) = 2', () => {
    const res = computeUnary('√', { num: 4, den: 1 })
    expect(res.float).toBeCloseTo(2, 5)
  })

  test('n! para 5', () => {
    const res = computeUnary('n!', { num: 5, den: 1 })
    expect(res.float).toBe(120)
  })
})

// ── formatFloat ──────────────────────────────────────────────────────────────

describe('formatFloat', () => {
  test('número normal', () => {
    expect(formatFloat(3.14159)).toBe('3.14159')
  })

  test('entero sin decimales', () => {
    expect(formatFloat(42)).toBe('42')
  })

  test('NaN → "Error"', () => {
    expect(formatFloat(NaN)).toBe('Error')
  })

  test('+Infinity → "Infinito"', () => {
    expect(formatFloat(Infinity)).toBe('Infinito')
  })

  test('-Infinity → "-Infinito"', () => {
    expect(formatFloat(-Infinity)).toBe('-Infinito')
  })
})

// ── fracOrFloat ──────────────────────────────────────────────────────────────

describe('fracOrFloat', () => {
  test('entero se queda igual', () => {
    expect(fracOrFloat(5)).toBe('5')
  })

  test('0.5 → "1/2"', () => {
    expect(fracOrFloat(0.5)).toBe('1/2')
  })

  test('número irracional se muestra como float', () => {
    const result = fracOrFloat(Math.PI)
    expect(result).not.toBe('Error')
    expect(result).toContain('.')
  })
})
