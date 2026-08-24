# 10. Storing a basis in Matrix3

Three.js provides the `Matrix3` class, which represents a `3 × 3` matrix—a table of nine numbers:

```ts
import { Matrix3 } from "three";

const matrix = new Matrix3();
```

With no arguments, it creates the identity matrix:

```text
[ 1  0  0 ]
[ 0  1  0 ]
[ 0  0  1 ]
```

The numbers are available through the `elements` property:

```ts
matrix.elements;
// [1, 0, 0, 0, 1, 0, 0, 0, 1]
```

## A matrix as basis storage

A `3 × 3` matrix can be used as a data structure for storing three basis vectors. Each basis vector occupies one matrix column:

```text
    [ X.x  Y.x  Z.x ]
M = [ X.y  Y.y  Z.y ]
    [ X.z  Y.z  Z.z ]
```

You can think of this as simply placing three column vectors side by side.

`Matrix3` itself does not know that the stored numbers represent a basis. We assign that meaning: the first column stores the local X axis, the second stores the local Y axis, and the third stores the local Z axis.

## The set() method

Use `set()` to write the nine values:

```ts
const matrix = new Matrix3();

matrix.set(
  xAxis.x, yAxis.x, zAxis.x,
  xAxis.y, yAxis.y, zAxis.y,
  xAxis.z, yAxis.z, zAxis.z,
);
```

`set()` accepts arguments row by row, so the components of the three basis vectors alternate in the call. Inside `elements`, values use column-major storage, and each column's components are contiguous:

```text
[
  xAxis.x, xAxis.y, xAxis.z,
  yAxis.x, yAxis.y, yAxis.z,
  zAxis.x, zAxis.y, zAxis.z,
]
```

## Task

Implement `createBasisMatrix(xAxis, yAxis, zAxis)`:

1. Create `new Matrix3()`.
2. Write the basis vectors into its columns with `set()`.
3. Return the resulting matrix.

For now, use `Matrix3` only as a structure for storing a basis. The next exercises introduce mathematical operations on matrices.

Run the exercise tests:

```bash
npm test -- exercises/10-basis-matrix
```
