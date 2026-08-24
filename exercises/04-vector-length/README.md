# 4. Vector length

The length of a vector is calculated using the Pythagorean theorem:

```text
|v| = sqrt(x² + y² + z²)
```

For the vector `(3, 4, 12)`:

```text
|v| = sqrt(3² + 4² + 12²) = 13
```

Three.js provides the ready-made `Vector3.length()` method.

## Task

Implement `calculateVectorLength(vector)` yourself using the `x`, `y`, and `z` components and `Math.sqrt()`.

The test compares your manual result with `vector.length()`.

Run the exercise tests:

```bash
npm test -- exercises/04-vector-length
```
