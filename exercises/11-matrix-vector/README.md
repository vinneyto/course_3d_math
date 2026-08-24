# 11. Multiplying a matrix by a vector

Without an application, matrices can look like a game played with tables of numbers. In 3D graphics, however, they formalize transformations of vectors and coordinate systems.

Mathematically, a vector can be represented as a table with one column:

```text
    [ x ]
v = [ y ]
    [ z ]
```

This representation has three rows and one column. A three-dimensional vector can therefore be treated as a special case of a `3 × 1` matrix.

A matrix is multiplied by a vector using the row-by-column rule:

```text
[ 1  2  0 ]   [ 3 ]   [ 1*3 + 2*4 + 0*5 ]   [ 11 ]
[ 0  1  0 ] * [ 4 ] = [ 0*3 + 1*4 + 0*5 ] = [  4 ]
[ 0  0  1 ]   [ 5 ]   [ 0*3 + 0*4 + 1*5 ]   [  5 ]
```

In Three.js, the operation is written as:

```ts
const result = vector.clone().applyMatrix3(matrix);
```

## Task

Implement `multiplyMatrixByVector(matrix, vector)`. Return a new vector and leave the arguments unchanged.

Run the exercise tests:

```bash
npm test -- exercises/11-matrix-vector
```

---

[← Previous: 10. Storing a basis in Matrix3](../10-basis-matrix/) | [Next: 12. Matrix multiplication →](../12-matrix-multiplication/)
