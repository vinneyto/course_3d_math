# 6. Normalization with Three.js

In the previous exercise, you normalized a vector manually. Now use the ready-made API:

```ts
vector.normalize();
```

`normalize()` mutates the current `Vector3`. To preserve the input vector, normalize a copy:

```ts
const copy = vector.clone();
```

## Task

Implement `normalizeWithThree(vector)` using `clone()` and `normalize()`.

The result must match the manual normalization and have a length of `1`.

Run the exercise tests:

```bash
npm test -- exercises/06-normalize-three
```

---

[← Previous: 5. Manual normalization](../05-normalize-manually/) | [Next: 7. Coordinate systems and basis vectors →](../07-basis-vectors/)
