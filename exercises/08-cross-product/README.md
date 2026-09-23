# 8. Cross product

The **cross product** of two 3D vectors is another vector:

```text
a × b = (ay*bz − az*by, az*bx − ax*bz, ax*by − ay*bx)
```

For nonparallel, nonzero inputs, the result is perpendicular to the plane spanned by `a` and `b`, and therefore to both vectors. **Orthogonal** means **perpendicular** here. The inputs themselves do not have to be perpendicular.

Its length is the **area of the parallelogram** with sides `a` and `b`:

```text
|a × b| = |a| |b| sin(θ),     0° ≤ θ ≤ 180°
```

For example, `(2, 0, 0) × (1, 2, 0) = (0, 0, 4)`. The angle is not 90°, but the area is `base × height = 2 × 2 = 4`. A parallelogram is a flat four-sided shape; a parallelepiped is a 3D solid and needs three edge directions.

The operation is **not commutative**. More precisely, it is **anticommutative**:

```text
b × a = −(a × b)
```

The right-hand rule determines the direction: curl your right-hand fingers from the first vector toward the second through the smaller angle; your thumb points along the result. In the standard basis, `X × Y = Z` and `Y × X = −Z`.

Parallel vectors, including opposite directions and unequal lengths, give **the zero vector**: `(2, 0, 0) × (5, 0, 0) = (0, 0, 0)`. The parallelogram collapses to a line. A zero input also gives zero. The zero vector has no direction and cannot be normalized into a unit normal.

## Task

Implement `crossProduct(a, b)` in [task.ts](./task.ts) directly from the component formula, without `cross()` or `crossVectors()`. Return a new `Vector3`; never mutate the inputs. Support parallel, opposite, and zero vectors.

Predict the result for `(1, 2, 3) × (0, 1, 0)` before running the tests.

Run from the repository root:

```bash
npm test -- exercises/08-cross-product
```

## Visualization

Change the angle and the two lengths. Switch **a × b / b × a** while watching the result reverse and the translucent parallelogram keep the same area. Try 0° and 180° with unequal lengths; the result arrow disappears because its length is zero. The panel displays all components, angle, lengths, and area. Arrows use the same world-unit scale.

Run from the repository root:

```bash
npm run demo -- exercises/08-cross-product
```

---

[← Previous: 7. Coordinate systems and basis vectors](../07-basis-vectors/) | [Next: 9. Building an orthonormal basis →](../09-build-orthonormal-basis/)
