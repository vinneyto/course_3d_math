# 18. A long transformation chain

In the previous exercise, we combined a rotation and a translation:

```text
M = T * R
```

Now we will assemble a longer chain. This exercise is primarily practice with matrix order.

## Sequence of operations

Suppose a local point must undergo five transformations in exactly this chronological order:

```text
localPoint
→ rotation1
→ translation1
→ rotation2
→ scale
→ translation2
→ globalPoint
```

Denote the corresponding matrices by `R1`, `T1`, `R2`, `S`, and `T2`.

Three.js and GLSL use column vectors. The point is to the right of the matrices, so the matrix nearest to it is applied first:

```text
globalPoint = T2 * S * R2 * T1 * R1 * localPoint
```

The combined matrix is:

```text
M = T2 * S * R2 * T1 * R1
```

The expression is read from `localPoint` right to left. `R1` is therefore the first operation and `T2` is the last.

## How this looks in a shader

In GLSL, the same chain can be written as:

```glsl
vec4 globalPoint =
    translation2 *
    scale *
    rotation2 *
    translation1 *
    rotation1 *
    localPoint;
```

The matrix factors appear top to bottom in left-to-right order, but they are applied to the point from bottom to top.

## Composing with Matrix4.multiply

`multiplyMatrices(a, b)` accepts only two matrices. For a long chain, it is convenient to start with the identity matrix and call `multiply()` repeatedly:

```ts
const transform = new Matrix4()
  .identity()
  .multiply(translation2)
  .multiply(scale)
  .multiply(rotation2)
  .multiply(translation1)
  .multiply(rotation1);
```

`matrix.multiply(other)` performs:

```text
matrix = matrix * other
```

The code above therefore creates this exact product:

```text
M = I * T2 * S * R2 * T1 * R1
M = T2 * S * R2 * T1 * R1
```

The order of the `.multiply()` lines matches the left-to-right order of the matrices in the shader expression. The actual operations on the point occur in the reverse order, from right to left.

## The main pitfall

Do not pass matrices to `multiply()` in the chronological order of the operations:

```ts
// This matrix applies the transformations in reverse order.
const wrongTransform = new Matrix4()
  .identity()
  .multiply(rotation1)
  .multiply(translation1)
  .multiply(rotation2)
  .multiply(scale)
  .multiply(translation2);
```

This produces:

```text
R1 * T1 * R2 * S * T2
```

The rightmost matrix, `T2`, is applied to the point first—not `R1`.

## Numerical example

The demo and tests use these values:

```text
localPoint = (2, 1, 1)

R1 = rotation Z by  90°
T1 = translation (3, 0, 0)
R2 = rotation Y by  90°
S  = scale       (1.5, 0.75, 1)
T2 = translation (-1, 2, 4)
```

Check each operation separately:

```text
(2, 1, 1)
  --R1--> (-1, 2, 1)
  --T1--> ( 2, 2, 1)
  --R2--> ( 1, 2, -2)
  --S --> ( 1.5, 1.5, -2)
  --T2--> ( 0.5, 3.5, 2)
```

The chain is also applied to a cube centered at the local origin. This makes it possible to see how the intermediate rotations and scaling affect both its orientation and translations performed earlier.

## Running the demo

```bash
npm run demo -- exercises/18-matrix-transform-chain
```

The static legend shows the actual operation order on the left and the order of `multiply()` calls on the right. The current operation is highlighted in both lists.

## Task

Implement two functions.

### Composing the chain

`composeTransformChain(rotation1, translation1, rotation2, scale, translation2)` must return a new `Matrix4`:

```text
M = T2 * S * R2 * T1 * R1
```

Start with the identity matrix and use `multiply()`. Do not modify the input matrices.

### Applying the chain

`applyTransformChain(value, transform)` must apply the completed matrix to a copy of `Vector4` and return the result without modifying either argument.

Run the exercise tests:

```bash
npm test -- exercises/18-matrix-transform-chain
```

---

[← Previous: 17. Matrix4: transforming points and vectors](../17-transform-points-vectors/)
