# 5. Manual normalization

Normalization preserves a vector's direction but changes its length to one.

To normalize a vector, divide each component by its length:

```text
normalized = (x / |v|, y / |v|, z / |v|)
```

For example:

```text
v = (3, 4, 0)
|v| = 5
normalized = (0.6, 0.8, 0)
```

## Task

Implement `normalizeManually(vector)` without using `Vector3.normalize()`.

The function must return a new vector and leave the original unchanged. In this exercise, the input vector is guaranteed to have a nonzero length.

Run the exercise tests:

```bash
npm test -- exercises/05-normalize-manually
```

## Visualization

Run the demo to compare the original vector `(3, 4, 0)` of length `5` with the normalized vector `(0.6, 0.8, 0)` of length `1`:

```bash
npm run demo -- exercises/05-normalize-manually
```

Both vectors lie on the same ray, making it clear that normalization changes the length but preserves the direction.
