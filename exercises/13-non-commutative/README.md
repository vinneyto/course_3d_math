# 13. Non-commutativity of matrix multiplication

For ordinary numbers, `2 * 3 = 3 * 2`. For matrices, in general, `A * B != B * A`.

Consider two matrices:

```text
    [ 2  0  0 ]       [  0  1  0 ]
A = [ 0  1  0 ]   B = [ -1  0  0 ]
    [ 0  0  1 ]       [  0  0  1 ]
```

They produce different results:

```text
        [  0  2  0 ]
A * B = [ -1  0  0 ]
        [  0  0  1 ]

        [  0  1  0 ]
B * A = [ -2  0  0 ]
        [  0  0  1 ]
```

Order matters. In graphics, this means that rearranging transformations usually changes the result.

## Task

Implement `multiplyInBothOrders(matrixA, matrixB)`. Return `productAB` and `productBA`, and verify that they differ.

The order in which compound transformations are applied to vectors will be covered separately. This exercise therefore uses the literal names `productAB` and `productBA`.

Run the exercise tests:

```bash
npm test -- exercises/13-non-commutative
```

---

[← Previous: 12. Matrix multiplication](../12-matrix-multiplication/) | [Next: 14. Converting a local vector with Matrix3 →](../14-local-to-global-matrix/)
