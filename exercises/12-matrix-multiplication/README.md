# 12. Matrix multiplication

When multiplying matrices, each element of the result is computed from a row of the first matrix and a column of the second:

```text
C[i][j] =
    A[i][0] * B[0][j]
  + A[i][1] * B[1][j]
  + A[i][2] * B[2][j]
```

For example:

```text
[ 1  2  0 ]   [ 2  0  0 ]   [ 2  6  0 ]
[ 0  1  0 ] * [ 0  3  0 ] = [ 0  3  0 ]
[ 0  0  1 ]   [ 0  0  1 ]   [ 0  0  1 ]
```

Three.js provides several APIs:

```ts
new Matrix3().multiplyMatrices(a, b); // a * b
a.clone().multiply(b);               // a * b
a.clone().premultiply(b);            // b * a
```

## Task

Implement `multiplyMatrices(first, second)` using the `Matrix3` API. The function must return `first * second` without modifying its arguments.

Run the exercise tests:

```bash
npm test -- exercises/12-matrix-multiplication
```

---

[← Previous: 11. Multiplying a matrix by a vector](../11-matrix-vector/) | [Next: 13. Non-commutativity of matrix multiplication →](../13-non-commutative/)
