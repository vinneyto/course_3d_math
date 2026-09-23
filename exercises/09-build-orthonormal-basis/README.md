# 9. Building an orthonormal basis

Two nonparallel vectors can define three mutually perpendicular directions. Start with `a = (2, 0, 0)` and `b = (1, 2, 0)`: these inputs are not orthogonal.

```text
x = normalize(a)
z = normalize(x × normalize(b))
y = z × x
```

The first cross product gives a direction perpendicular to both inputs. The second gives a direction perpendicular to `z` and `x`. It lies in the original plane. We preserve the direction of `a`, but generally **replace the direction of b**.

Three mutually perpendicular, nonzero vectors form an **orthogonal basis**. If their lengths are also `1`, the basis is **orthonormal**. In the example, the result is the standard X, Y, Z basis. Together with a chosen origin, these axes define a coordinate system.

Order matters: `z × x` produces `y`, whereas `x × z` produces `−y`. We use a **right-handed** basis: `x × y = z`. This is a direction convention, not an extra normalization step.

Zero or parallel inputs cannot determine this basis: there is no unique plane from which to obtain `z`. Nearly parallel inputs are also numerically unstable. Normalize the inputs first and reject a cross-product length at or below `1e-6`; this makes the tolerance depend on the angle rather than on the input lengths.

## Task

Implement `buildOrthonormalBasis(a, b)` in [task.ts](./task.ts), returning `{ x, y, z }` as new `Vector3` objects. You may use Three.js vector operations. Throw `RangeError` for a zero input or when the cross product of normalized inputs has length `≤ 1e-6`. Do not mutate the inputs.

Explain why normalizing `a` and `b` alone would not make them orthogonal.

Run from the repository root:

```bash
npm test -- exercises/09-build-orthonormal-basis
```

## Visualization

Change the angle of `b` and tilt the plane of both inputs. The cyan and gold arrows show the original vectors; red, green, and blue show the unit basis. The panel gives components, lengths, and pairwise dot products (introduced in lesson 11; zero means perpendicular). At parallel inputs, the demo reports that no basis can be constructed instead of drawing invalid axes.

Run from the repository root:

```bash
npm run demo -- exercises/09-build-orthonormal-basis
```

---

[← Previous: 8. Cross product](../08-cross-product/) | [Next: 10. Triangle normals from vertices →](../10-triangle-normals/)
