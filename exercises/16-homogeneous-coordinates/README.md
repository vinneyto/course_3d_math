# 16. Homogeneous coordinates

In the previous exercise, we introduced points and saw that Three.js can store both a point and a vector in `Vector3`:

```ts
const point = new Vector3(2, 3, 4);
const vector = new Vector3(2, 3, 4);
```

The values `x`, `y`, and `z` alone do not reveal a variable's meaning. `point` denotes a position in space, while `vector` denotes a direction and magnitude.

To store this distinction directly in the data, we can add a fourth component, `w`.

## The fourth component, w

Homogeneous coordinates use four components:

```text
(x, y, z, w)
```

The first three components are familiar from `Vector3`. The fourth component, `w`, helps distinguish points from vectors:

```text
point:  (x, y, z, 1)
vector: (x, y, z, 0)
```

In Three.js, these values can be stored in `Vector4`:

```ts
const point = new Vector4(2, 3, 4, 1);
const vector = new Vector4(2, 3, 4, 0);
```

The `Vector4` class itself does not prevent you from storing any number in `w`. By convention, however, `w = 1` represents an ordinary point and `w = 0` represents a vector.

## Converting to Cartesian coordinates

A point in homogeneous coordinates can be converted to ordinary Cartesian coordinates by dividing `x`, `y`, and `z` by `w`:

```text
cartesianX = x / w
cartesianY = y / w
cartesianZ = z / w
```

For example:

```text
homogeneousPoint = (4, 6, 8, 2)
cartesianPoint = (4 / 2, 6 / 2, 8 / 2)
cartesianPoint = (2, 3, 4)
```

The same Cartesian point can therefore have different homogeneous representations:

```text
(2, 3, 4, 1)
(4, 6, 8, 2)
(1, 1.5, 2, 0.5)
```

After dividing the first three components by `w`, all of these representations become the point `(2, 3, 4)`. A point is usually written in normalized form with `w = 1`.

## Intermediate values of w

The `w` component does not have to contain only `0` or `1`. For example:

```text
homogeneousPoint = (1, 2, 3, 0.5)
cartesianPoint = (1 / 0.5, 2 / 0.5, 3 / 0.5)
cartesianPoint = (2, 4, 6)
```

The value `w = 0.5` does not mean that the value is halfway between a point and a vector. Any nonzero `w` represents a finite point after division by `w`:

```text
w != 0 — finite point
w == 0 — direction
```

## What happens as w approaches zero

Consider the homogeneous point `(1, 2, 0, w)` and decrease `w`:

```text
w = 1     → (1, 2, 0)
w = 0.1   → (10, 20, 0)
w = 0.01  → (100, 200, 0)
```

As `w` decreases, the point moves farther from the origin while remaining in the direction `(1, 2, 0)`.

The farther away the point is, the less a small finite translation affects the direction from the origin to that point. In the limit `w → 0`, we obtain a point infinitely far away in the direction `(1, 2, 0)`. This is called a **point at infinity**.

A finite translation does not change the direction toward such an infinitely distant point. It therefore behaves like a vector: it describes a direction rather than a position in space. In homogeneous coordinates, we call `(1, 2, 0, 0)` the vector `(1, 2, 0)`.

## Point and vector

The same first three components can now carry different meanings:

```text
point  = (3, 4, 0, 1)
vector = (3, 4, 0, 0)
```

A point denotes a position, has a nonzero `w`, and can be converted to Cartesian coordinates by dividing by `w`.

A vector denotes a direction and magnitude, has `w = 0`, and cannot be converted into a point by dividing by `w`.

The fourth component therefore stores the distinction between a point and a vector directly in the data.

## Task

Implement three functions.

### Point in homogeneous coordinates

`toHomogeneousPoint(point)` must convert a `Vector3` into a `Vector4` by adding `w = 1`:

```text
(2, 3, 4) → (2, 3, 4, 1)
```

### Vector in homogeneous coordinates

`toHomogeneousVector(vector)` must convert a `Vector3` into a `Vector4` by adding `w = 0`:

```text
(2, 3, 4) → (2, 3, 4, 0)
```

### Homogeneous point to Cartesian coordinates

`homogeneousPointToCartesian(point)` must return a `Vector3` by dividing `x`, `y`, and `z` by `w`:

```text
(4, 6, 8, 2) → (2, 3, 4)
```

If `w = 0`, the function must throw an error: such a value represents a vector or direction and cannot be converted to a finite Cartesian point.

All functions must return new objects without modifying their inputs.

Run the exercise tests:

```bash
npm test -- exercises/16-homogeneous-coordinates
```

## Visualization

Run the demo to see the transition from a finite point to a direction as `w` decreases:

```bash
npm run demo -- exercises/16-homogeneous-coordinates
```

In the loop, `w` decreases from `1` to `0`, then returns to `1`.
