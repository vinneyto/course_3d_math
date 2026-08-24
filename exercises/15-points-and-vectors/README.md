# 15. Points and vectors

So far, we have mostly discussed vectors.

A vector specifies a direction and a magnitude, represented by its length. For example, a vector can describe the direction and strength of the wind, or the direction and distance of an object's movement.

A vector by itself does not identify a particular location in space. A different concept—a **point**—is used to describe position.

## Point

A point represents a position in space. In a three-dimensional coordinate system, that position is specified by three coordinates:

```text
P = (2, 3, 4)
```

This means that point `P` is located at `x = 2`, `y = 3`, and `z = 4`. Point coordinates are interpreted relative to the chosen coordinate system and its origin `(0, 0, 0)`.

## A vector has no fixed position

A vector's direction and length matter, but it has no fixed position in space. You can therefore translate a vector parallel to itself. If its direction and length do not change, it is still the same vector.

For example, arrows that start at different points represent the same vector when they all have the components:

```text
v = (3, 4, 0)
```

The arrow's position changed, but the vector's direction, length, and components remained the same.

## A vector from the origin to a point

Consider the point:

```text
P = (2, 3, 4)
```

Draw an arrow from the origin `O = (0, 0, 0)` to point `P`. This gives the point's position vector:

```text
OP = P - O
OP = (2, 3, 4)
```

The point's coordinates and this vector's components have the same numerical values:

```text
point:   P  = (2, 3, 4)
vector:  OP = (2, 3, 4)
```

But their meanings differ:

- `P` denotes a position in space;
- `OP` denotes the direction and distance from the origin to point `P`.

## A vector between two points

A vector does not have to start at the origin. Consider two points:

```text
A = (1, 2, 0)
B = (4, 6, 0)
```

The vector from point `A` to point `B` is the difference between the end point and the start point:

```text
AB = B - A
AB = (4, 6, 0) - (1, 2, 0)
AB = (3, 4, 0)
```

This vector tells us in which direction and how far to move from point `A` to reach point `B`.

After calculating `AB`, you can imagine translating it so that it starts at the origin. The translated arrow has the same components, direction, and length. The result `(3, 4, 0)` itself no longer stores any information about point `A`.

## Relationship between points and vectors

Two points define the vector between them:

```text
vectorAB = pointB - pointA
```

Adding a vector to a point produces a new point:

```text
pointB = pointA + vectorAB
```

Therefore:

```text
point - point = vector
point + vector = point
```

Vectors describe differences between point positions.

## Points and vectors in Three.js

In Three.js, both points and vectors can be stored with `Vector3`:

```ts
const pointA = new Vector3(1, 2, 0);
const pointB = new Vector3(4, 6, 0);
```

The class is the same, but the meanings of the variables differ: `pointA` and `pointB` denote positions, while the result of subtracting them denotes a vector. Variable names help make that meaning explicit.

## Task

Implement `createVectorFromPoints(pointA, pointB)`.

The function must return a vector directed from `pointA` to `pointB`:

```text
vector = pointB - pointA
```

For example:

```text
pointA = (1, 2, 0)
pointB = (4, 6, 0)
vector = (3, 4, 0)
```

Return a new `Vector3` without modifying the input points. Do not normalize the result: the vector's length must remain equal to the distance between the points.

Run the exercise tests:

```bash
npm test -- exercises/15-points-and-vectors
```

## Visualization

Run the demo to see two points and the direction vector from `A` to `B`:

```bash
npm run demo -- exercises/15-points-and-vectors
```

The animation moves vector `AB` to the coordinate origin without changing its length or direction.
