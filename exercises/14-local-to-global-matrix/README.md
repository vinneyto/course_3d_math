# 14. Converting a local vector with Matrix3

Return to the second-hand coordinate system. Its basis, expressed in global coordinates, can be stored in the columns of a matrix:

```text
                      [ X.x  Y.x  Z.x ]
localToGlobalMatrix = [ X.y  Y.y  Z.y ]
                      [ X.z  Y.z  Z.z ]
```

For a 90° clockwise rotation:

```text
                      [  0  1  0 ]
localToGlobalMatrix = [ -1  0  0 ]
                      [  0  0  1 ]
```

Multiply it by the local vector:

```text
globalVector = localToGlobalMatrix * localVector

[  0  1  0 ]   [ 2 ]   [  6 ]
[ -1  0  0 ] * [ 6 ] = [ -2 ]
[  0  0  1 ]   [ 0 ]   [  0 ]
```

This is the same result produced by `localVectorToGlobal()` in exercise 8. That function performed the transformation without a matrix:

```text
globalVector = localVector.x * X
             + localVector.y * Y
             + localVector.z * Z
```

The following two operations are therefore equivalent:

```text
globalVector = localVectorToGlobal(localVector, X, Y, Z)
globalVector = localToGlobalMatrix * localVector
```

In the first case, the basis is passed as three separate vectors. In the second, it is passed as a matrix whose columns contain the same vectors `X`, `Y`, and `Z`. Matrix-vector multiplication is not a new magical operation: it formalizes the familiar linear combination of basis vectors.

## Task

Implement `localVectorToGlobalWithMatrix(localVector, localToGlobalMatrix)` using `applyMatrix3()`.

The function must return a new global vector without modifying the local vector.

Run the exercise tests:

```bash
npm test -- exercises/14-local-to-global-matrix
```
