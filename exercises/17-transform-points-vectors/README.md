# 17. Matrix4: transforming points and vectors

Until now, we stored basis vectors in `Matrix3`. Such a matrix can rotate and scale vectors, but it cannot store a translation.

After introducing homogeneous coordinates, we can move to a `4 × 4` matrix. Three.js represents it with the `Matrix4` class.

## Basis and the position of the local origin

A typical local-to-global transformation matrix can be represented as:

```text
                      [ X.x  Y.x  Z.x  T.x ]
localToGlobalMatrix = [ X.y  Y.y  Z.y  T.y ]
                      [ X.z  Y.z  Z.z  T.z ]
                      [  0    0    0    1  ]
```

The first three columns are familiar from `Matrix3`:

- `X` is the local X basis vector in global coordinates;
- `Y` is the local Y basis vector in global coordinates;
- `Z` is the local Z basis vector in global coordinates.

The fourth column, `T`, contains the position of the local coordinate system's origin in global coordinates.

The final row `(0, 0, 0, 1)` enables homogeneous coordinates. This exercise considers only matrices of this form. More general projective matrices may have a different final row.

## A local point in global coordinates

Let a local point have the coordinates `(x, y, z)`. Its global coordinate is:

```text
globalPoint = x * X + y * Y + z * Z + T
```

Or, more compactly:

```text
globalPoint = basis * localPoint + translation
```

First, the point's local coordinates are expanded in the basis vectors. The global coordinate of the local origin, `T`, is then added to the result.

For example, after a 90-degree counterclockwise rotation around Z:

```text
localPoint   = (2, 0, 0)
rotatedPoint = (0, 2, 0)
translation  = (4, 1, 0)
globalPoint  = (0, 2, 0) + (4, 1, 0)
globalPoint  = (4, 3, 0)
```

## Important: which coordinate system stores the translation

In the matrix above, column `T` is expressed in global coordinates. It does not mean “move by `T.x` along the rotated X axis and by `T.y` along the rotated Y axis.”

The value:

```text
T = (4, 1, 0)
```

means that the local coordinate system's origin is located at the global point `(4, 1, 0)`.

It is therefore useful to think of the transformation as two stages:

1. Rotate the point with the local basis around the origin.
2. Translate the result by `T` in global space.

## Transformation order

Denote the rotation matrix by `R` and the global translation matrix by `T`. A standard Three.js object matrix contains the product:

```text
M = T * R
```

When using column vectors, matrices are applied from right to left:

```text
globalPoint = M * localPoint
globalPoint = T * R * localPoint
```

## Why the expression is read from right to left

The local point is on the right side of the expression. The nearest matrix, `R`, therefore multiplies it first:

```text
rotatedPoint = R * localPoint
```

Matrix `T` is then applied to the rotation result:

```text
globalPoint = T * rotatedPoint
globalPoint = T * (R * localPoint)
```

The expression:

```text
T * R * localPoint
```

must therefore be read by starting at `localPoint` and moving left:

```text
localPoint → rotation R → translation T → globalPoint
```

This is not a peculiarity of the names `T` and `R`; it follows from the column-vector convention. The vector is written to the right of the matrices, and the matrices act on it from the left.

The point is consequently rotated first and then translated in global space.

If the product is reversed:

```text
M = R * T
```

then the translation happens first, and the complete result—including the translation vector—is rotated around the origin. That is a different transformation.

## Why translation affects a point

Write the point in homogeneous coordinates:

```text
point = (x, y, z, 1)
```

Multiplying it by `Matrix4` gives:

```text
[ B  T ] [ p ]   [ B * p + T ]
[ 0  1 ] [ 1 ] = [     1     ]
```

Here, `B` is the `3 × 3` basis matrix, `T` is the translation column, and `p = (x, y, z)` is the local point.

Because `w = 1`, the matrix's fourth column contributes to the result.

For a point at the local origin:

```text
localOrigin  = (0, 0, 0, 1)
globalOrigin = (T.x, T.y, T.z, 1)
```

Rotation does not change the position of `(0, 0, 0)`, but translation moves it to global point `T`.

## Why translation does not affect a vector

For a vector, use `w = 0`:

```text
vector = (x, y, z, 0)
```

The contribution from the fourth column is now multiplied by zero:

```text
globalVector = basis * localVector
```

The vector rotates and scales with the basis, but it is not translated. A direction has no position of its own, so moving the coordinate origin must not affect it.

## Relationship to Object3D

A Three.js object's local matrix is usually composed from its `scale`, `rotation`, and `position` properties in this order:

```text
M = T(position) * R(rotation) * S(scale)
```

For a point, this means:

1. Apply scale.
2. Apply rotation.
3. Apply the `position` translation.

`position` is expressed in the parent object's coordinates. For an object without a transformed parent, those coordinates coincide with global coordinates.

## Running the demo

```bash
npm run demo -- exercises/17-transform-points-vectors
```

The demo shows three states of a cube and a separate point: their initial position, the result of rotation, and the result of the subsequent global translation.

## Task

Implement two functions.

### Creating the matrix

`createLocalToGlobalMatrix(rotationRadians, translation)` must create a new `Matrix4` that:

1. Rotates the value around the Z axis by `rotationRadians`.
2. Then translates the point by `translation`.

The resulting matrix must use the order:

```text
M = T * R
```

The angle is passed in radians, which is made explicit in the parameter name.

### Transforming a homogeneous value

`localToGlobal(value, matrix)` must apply the `Matrix4` to a `Vector4`.

For a value with `w = 1`, the matrix must apply both rotation and translation. For a value with `w = 0`, the translation must disappear.

Both functions must return new objects without modifying their inputs.

Run the exercise tests:

```bash
npm test -- exercises/17-transform-points-vectors
```
