# 1. Creating a vector

A vector describes a directed quantity: it has a direction and a length (magnitude). For example, a wind-velocity vector can show both the direction in which the wind is blowing and how strong it is.

A vector in three-dimensional space is described by three numbers:

```text
v = (x, y, z)
```

These numbers are the vector's coordinates relative to a coordinate system with three axes: X, Y, and Z. In our initial model, we draw a vector as an arrow that starts at the coordinate origin.

Three.js provides a ready-made `Vector3` data structure:

```ts
const vector = new Vector3(2, 3, 4);
```

Three.js is used only as a convenient implementation. The mathematical concept of a vector does not depend on a graphics framework.

## Task

Implement `createVector()` in `task.ts`. The function must return the vector `(2, 3, 4)`.

```bash
npm test -- exercises/01-create-vector
```

## Visualization

Run the demo to see the vector `(2, 3, 4)` in a three-dimensional coordinate system:

```bash
npm run demo -- exercises/01-create-vector
```

The colored segments show the vector components: `2` along X, `3` along Y, and `4` along Z. Use the mouse to orbit the camera and inspect the vector from different angles.

---

[Next: 2. Adding two vectors →](../02-add-two-vectors/)
