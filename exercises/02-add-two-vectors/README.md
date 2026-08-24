# 2. Adding two vectors

Vectors are added component by component:

```text
a + b = (a.x + b.x, a.y + b.y, a.z + b.z)

(1, 2, 3) + (4, 5, 6) = (5, 7, 9)
```

## Geometric meaning

Draw `a` from the origin. Then imagine moving the start of `b` to the end of `a` without changing the length or direction of `b`. The sum is the vector from the start of `a` to the end of the translated `b`. This is the triangle rule.

In other words: first move by `a`, then by `b`; the total displacement is `a + b`.

In Three.js, `add()` mutates the object on which it is called. If you need to preserve the original vector, create a copy with `clone()` first.

## Task

Implement `addVectors(first, second)`. The function must return a new vector without modifying its arguments.

Run the exercise tests:

```bash
npm test -- exercises/02-add-two-vectors
```

## Visualization

Run the demo to see the triangle rule for `(1, 2, 3) + (4, 5, 6) = (5, 7, 9)`:

```bash
npm run demo -- exercises/02-add-two-vectors
```

The second vector is moved to the end of the first. The yellow arrow shows their sum. Projections onto the coordinate planes are shown only for the resulting vector. The animation alternates between the initial position, where both addends start at the origin, and the triangle-rule arrangement.

---

[← Previous: 1. Creating a vector](../01-create-vector/) | [Next: 3. Adding multiple vectors →](../03-sum-vectors/)
