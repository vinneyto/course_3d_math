# 11. Dot product

The **dot product** of two vectors is a **scalar**: a single number, not an arrow.

```text
a · b = ax*bx + ay*by + az*bz = |a| |b| cos(θ)
a · b = b · a
```

It is **commutative**: swapping the operands does not change the result. For nonzero vectors, the sign tells us about the angle: positive for an acute angle, zero for 90°, negative for an obtuse angle.

Vectors are **collinear** when they lie along the same line direction, including opposite directions. For **normalized** vectors, the dot product equals `cos(θ)` and lies in `[−1, 1]`:

- `+1`: same direction;
- `0`: perpendicular (orthogonal);
- `−1`: opposite directions.

Both `+1` and `−1` mean collinearity. “Similarity of directions” distinguishes them; the absolute value measures closeness to collinearity without regard to sign.

For unnormalized inputs, the lengths matter too: `(2, 0, 0) · (3, 0, 0) = 6`, whereas their normalized versions give `1`. Therefore the raw dot product alone is not a length-independent measure of alignment. To compare directions, divide by `|a| |b|` or normalize both inputs first.

A zero vector has dot product zero with every vector, but has **no direction**. Its cosine similarity is undefined; a zero result does not then describe a 90° angle.

## Task

Implement `dotProduct(a, b)` in [task.ts](./task.ts) from the component formula without using `.dot()`. Return a number and preserve both inputs.

Predict the results for `(1, 2, 0) · (−2, 1, 0)` and `(2, 0, 0) · (−3, 0, 0)`. Which property changes if you double only the length of `a`?

Run from the repository root:

```bash
npm test -- exercises/11-dot-product
```

## Visualization

Adjust the angle and both lengths, then switch between raw and normalized inputs. Swap operands to verify commutativity. The panel displays the scalar result, lengths, coordinates, and cosine. Try 0°, 90°, and 180°, then a zero length; undefined cosine is reported explicitly.

Run from the repository root:

```bash
npm run demo -- exercises/11-dot-product
```

---

[← Previous: 10. Triangle normals from vertices](../10-triangle-normals/) | [Next: 12. Diffuse lighting with the dot product →](../12-diffuse-lighting/)
