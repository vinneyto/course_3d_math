# 9. Rotating a local basis

A local vector attached to the clock disc keeps the same components. It rotates in the global system because the local basis rotates.

These formulas are related to the [polar coordinate system](https://en.wikipedia.org/wiki/Polar_coordinate_system): the coordinates of a unit vector rotated by an angle are expressed through `cos` and `sin`.

## Radians and degrees

Angles are sometimes easier to describe in degrees, but `Math.sin()`, `Math.cos()`, and the Three.js rotation API accept angles **in radians**.

```text
90°  = PI / 2 radians
180° = PI radians
360° = 2 * PI radians
```

In this exercise's code, angles are always measured in radians. Variables and parameters therefore contain the word `Radians`, as in `clockwiseAngleRadians`.

For a clockwise rotation by `clockwiseAngleRadians`:

```text
X = (cos(clockwiseAngleRadians), -sin(clockwiseAngleRadians), 0)
Y = (sin(clockwiseAngleRadians),  cos(clockwiseAngleRadians), 0)
Z = (0,                           0,                          1)
```

When `clockwiseAngleDegrees = 90°`, so `clockwiseAngleRadians = Math.PI / 2`:

```text
X = (0, -1, 0)
Y = (1,  0, 0)
Z = (0,  0, 1)
```

For the local vector `(2, 6, 0)`, the function from the previous exercise gives:

```text
2X + 6Y = (6, -2, 0)
```

## Task

Implement `createRotatedLocalBasis(clockwiseAngleRadians)`. The angle is passed in radians.

`rotateLocalVectorInGlobal()` already calls `localVectorToGlobal()` from the previous exercise. Its tests demonstrate that the same local vector gets different global coordinates as the basis rotates.

In this exercise's formulas, a positive angle means a clockwise rotation. This is a local convention for the clock example.

Run the exercise tests:

```bash
npm test -- exercises/09-rotate-local-basis
```
