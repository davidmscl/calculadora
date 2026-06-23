/**
 * Tests para matrix-utils.js — det, matT, matAdd, matSub, matMul, matInv
 */

import {
  det, matT, matAdd, matSub, matMul, matInv, makeMatrix, parseMatrix,
} from '../matrix-utils'

// ── makeMatrix / parseMatrix ─────────────────────────────────────────────────

describe('makeMatrix', () => {
  test('crea matriz 2×2 de ceros como strings', () => {
    const m = makeMatrix(2)
    expect(m).toEqual([
      ['0', '0'],
      ['0', '0'],
    ])
  })

  test('crea matriz 3×3 de ceros como strings', () => {
    const m = makeMatrix(3)
    expect(m.length).toBe(3)
    expect(m[0].length).toBe(3)
    expect(m.every(r => r.every(c => c === '0'))).toBe(true)
  })
})

describe('parseMatrix', () => {
  test('parsea strings a números', () => {
    const raw = [['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9']]
    expect(parseMatrix(raw)).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
  })

  test('retorna null si hay NaN', () => {
    const raw = [['1', 'abc'], ['3', '4']]
    expect(parseMatrix(raw)).toBeNull()
  })
})

// ── det ──────────────────────────────────────────────────────────────────────

describe('det', () => {
  test('determinante de [[2]] es 2', () => {
    expect(det([[2]])).toBe(2)
  })

  test('determinante de matriz identidad 2×2 es 1', () => {
    expect(det([[1, 0], [0, 1]])).toBe(1)
  })

  test('determinante de [[1,2],[3,4]] es -2', () => {
    expect(det([[1, 2], [3, 4]])).toBe(-2)
  })

  test('determinante de matriz singular 2×2 es 0', () => {
    expect(det([[2, 4], [1, 2]])).toBe(0)
  })

  test('determinante de matriz identidad 3×3 es 1', () => {
    const I3 = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    expect(det(I3)).toBeCloseTo(1)
  })

  test('determinante 3×3 genérico', () => {
    const m = [[6, 1, 1], [4, -2, 5], [2, 8, 7]]
    // 6*(-2*7 - 5*8) - 1*(4*7 - 5*2) + 1*(4*8 - (-2)*2)
    // = 6*(-14-40) - 1*(28-10) + 1*(32+4)
    // = 6*(-54) - 18 + 36 = -324 - 18 + 36 = -306
    expect(det(m)).toBeCloseTo(-306, 5)
  })
})

// ── matT (transpuesta) ───────────────────────────────────────────────────────

describe('matT', () => {
  test('transpuesta de [[1,2],[3,4]] es [[1,3],[2,4]]', () => {
    expect(matT([[1, 2], [3, 4]])).toEqual([[1, 3], [2, 4]])
  })

  test('transpuesta 3×3', () => {
    const m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    expect(matT(m)).toEqual([[1, 4, 7], [2, 5, 8], [3, 6, 9]])
  })
})

// ── matAdd / matSub ──────────────────────────────────────────────────────────

describe('matAdd', () => {
  test('suma de matrices 2×2', () => {
    const A = [[1, 2], [3, 4]]
    const B = [[5, 6], [7, 8]]
    expect(matAdd(A, B)).toEqual([[6, 8], [10, 12]])
  })
})

describe('matSub', () => {
  test('resta de matrices 2×2', () => {
    const A = [[5, 6], [7, 8]]
    const B = [[1, 2], [3, 4]]
    expect(matSub(A, B)).toEqual([[4, 4], [4, 4]])
  })
})

// ── matMul (multiplicación) ──────────────────────────────────────────────────

describe('matMul', () => {
  test('multiplicación 2×2', () => {
    const A = [[1, 2], [3, 4]]
    const B = [[5, 6], [7, 8]]
    expect(matMul(A, B)).toEqual([[19, 22], [43, 50]])
  })

  test('multiplicación por identidad 3×3', () => {
    const A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
    const I = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]
    expect(matMul(A, I)).toEqual(A)
    expect(matMul(I, A)).toEqual(A)
  })

  test('propiedad asociativa: (AB)C = A(BC) en 3×3', () => {
    const A = [[1, 0, 2], [-1, 3, 1], [0, 1, 2]]
    const B = [[3, 1, 2], [1, 0, 1], [2, 4, 0]]
    const C = [[0, 2, 1], [3, 1, 0], [1, 0, 2]]
    const left = matMul(matMul(A, B), C)
    const right = matMul(A, matMul(B, C))
    expect(left).toEqual(right)
  })
})

// ── matInv (inversa) ─────────────────────────────────────────────────────────

describe('matInv', () => {
  test('inversa de [[3,1],[5,2]] es [[2,-1],[-5,3]]', () => {
    const inv = matInv([[3, 1], [5, 2]])
    expect(inv).not.toBeNull()
    expect(inv[0][0]).toBeCloseTo(2)
    expect(inv[0][1]).toBeCloseTo(-1)
    expect(inv[1][0]).toBeCloseTo(-5)
    expect(inv[1][1]).toBeCloseTo(3)
  })

  test('A * inv(A) = I para 2×2', () => {
    const A = [[4, 7], [2, 6]]
    const inv = matInv(A)
    expect(inv).not.toBeNull()
    const result = matMul(A, inv)
    expect(result[0][0]).toBeCloseTo(1, 5)
    expect(result[0][1]).toBeCloseTo(0, 5)
    expect(result[1][0]).toBeCloseTo(0, 5)
    expect(result[1][1]).toBeCloseTo(1, 5)
  })

  test('retorna null para matriz singular 2×2', () => {
    expect(matInv([[2, 4], [1, 2]])).toBeNull()
  })

  test('inversa 3×3: A * inv(A) ≈ I', () => {
    const A = [[1, 2, 0], [0, 3, 1], [1, 0, 2]]
    const inv = matInv(A)
    expect(inv).not.toBeNull()
    const result = matMul(A, inv)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const expected = i === j ? 1 : 0
        expect(result[i][j]).toBeCloseTo(expected, 4)
      }
    }
  })

  test('retorna null para matriz singular 3×3', () => {
    expect(matInv([[1, 2, 3], [4, 5, 6], [7, 8, 9]])).toBeNull()
  })
})
