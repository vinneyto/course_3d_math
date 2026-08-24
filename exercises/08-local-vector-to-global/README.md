# 8. Nested coordinate systems

Coordinate systems can be nested inside one another. A nested system has its own axes and basis vectors, but it can move and rotate relative to its parent coordinate system.

Consider an ordinary clock face. You may have seen clocks where a transparent plastic disc with a picture replaces the second hand. The entire disc rotates around the center of the clock, and the picture rotates with it.

We can associate a separate coordinate system with this disc. It rotates relative to the coordinate system of the clock face:

- the clock-face coordinate system is the parent and global system;
- the second-hand disc coordinate system is nested and local;
- the origins of both systems coincide at the center of the clock face;
- the local coordinate system rotates relative to the global system.

When the second hand points to 12 o'clock, the basis vectors of the local system may coincide with the basis vectors of the global system:

```text
local X in global = (1, 0, 0)
local Y in global = (0, 1, 0)
local Z in global = (0, 0, 1)
```

After the disc rotates, its local axes rotate with it. For example, after a 90-degree clockwise rotation:

```text
local X in global = (0, -1, 0)
local Y in global = (1,  0, 0)
local Z in global = (0,  0, 1)
```

These are still the X, Y, and Z axes of the local system, but their directions no longer coincide with the corresponding global axes. The local basis must therefore be expressed in the parent coordinate system.

## A vector on the rotating disc

Draw a vector from the center of the clock to a point in the picture on the transparent disc. The vector is fixed relative to the disc, so its local coordinates do not change. The disc rotates, however, so the local basis vectors and the vector itself rotate in the global system.

Let `localVector = (a, b, c)`, with the basis vectors of the local system expressed in global coordinates as `X`, `Y`, and `Z`. The corresponding global vector is:

```text
globalVector = aX + bY + cZ
```

The local vector components specify how many copies of each local basis vector to take. Adding those scaled vectors converts the local vector into the global coordinate system of the clock.

## Task

Implement `localVectorToGlobal(...)` without `Matrix3` or `Matrix4`:

```ts
localVectorToGlobal(
  localVector,
  localXAxisInGlobal,
  localYAxisInGlobal,
  localZAxisInGlobal,
);
```

Return a new vector without modifying the arguments.

Run the exercise tests:

```bash
npm test -- exercises/08-local-vector-to-global
```

---

[← Previous: 7. Coordinate systems and basis vectors](../07-basis-vectors/) | [Next: 9. Rotating a local basis →](../09-rotate-local-basis/)
