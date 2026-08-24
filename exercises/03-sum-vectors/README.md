# 3. Adding multiple vectors

You can add any number of vectors, not just two:

```text
(1, 0, 2) + (0, 3, 1) + (4, 2, 0) = (5, 5, 3)
```

Geometrically, the vectors form a chain: the start of each next vector is moved to the end of the previous one. The sum runs from the start of the first vector to the end of the last.

It is convenient to accumulate the sum starting with the zero vector:

```text
0 = (0, 0, 0)
v + 0 = v
```

## Task

Implement `sumVectors(vectors)`.

The function must:

- return the sum of all vectors;
- leave the array elements unchanged;
- return `(0, 0, 0)` for an empty array.

Run the exercise tests:

```bash
npm test -- exercises/03-sum-vectors
```

## Visualization

Run the demo to see a chain of three vectors and their sum:

```bash
npm run demo -- exercises/03-sum-vectors
```

Each next vector starts at the end of the previous one. The yellow arrow runs from the origin to the end of the chain and shows the sum `(5, 5, 3)`. The stepwise component construction is shown only for the resulting vector. The animation alternates between the initial position, where every addend starts at the origin, and the assembled vector chain.

---

[← Previous: 2. Adding two vectors](../02-add-two-vectors/) | [Next: 4. Vector length →](../04-vector-length/)
