# Practical 3D Math

A hands-on course about vectors, matrices, and linear transformations in computer graphics.

The course uses TypeScript, Vitest, and Three.js, but it is not a Three.js course. `Vector3`, `Vector4`, `Matrix3`, and `Matrix4` are used as convenient implementations of universal mathematical concepts.

Exercises 1–14 work only with vectors and `3 × 3` matrices. Exercise 15 introduces points, and exercise 17 introduces `4 × 4` matrices. World space and handedness are intentionally left out for now. The terms **local** and **global** are used throughout the course.

Russian translation: [translations/ru/README.md](translations/ru/README.md)

## Getting started

Node.js 20 or newer is required.

```bash
npm install
npm test
```

Run a single exercise:

```bash
npm test -- exercises/01-create-vector
```

Run an exercise visualization:

```bash
npm run demo -- exercises/01-create-vector
```

This opens a full-screen Three.js sandbox. Drag with the left mouse button to orbit the camera, use the mouse wheel to zoom, and drag with the right mouse button to pan.

Run the TypeScript check:

```bash
npm run typecheck
```

The starter files deliberately contain `TODO` markers, so tests begin to pass as you complete the exercises.

## Contents

1. [Creating a vector](exercises/01-create-vector/README.md)
2. [Adding two vectors](exercises/02-add-two-vectors/README.md)
3. [Adding multiple vectors](exercises/03-sum-vectors/README.md)
4. [Vector length](exercises/04-vector-length/README.md)
5. [Manual normalization](exercises/05-normalize-manually/README.md)
6. [Normalization with Three.js](exercises/06-normalize-three/README.md)
7. [Coordinate systems and basis vectors](exercises/07-basis-vectors/README.md)
8. [Nested coordinate systems](exercises/08-local-vector-to-global/README.md)
9. [Rotating a local basis](exercises/09-rotate-local-basis/README.md)
10. [Storing a basis in Matrix3](exercises/10-basis-matrix/README.md)
11. [Multiplying a matrix by a vector](exercises/11-matrix-vector/README.md)
12. [Matrix multiplication](exercises/12-matrix-multiplication/README.md)
13. [Non-commutativity of matrix multiplication](exercises/13-non-commutative/README.md)
14. [Converting a local vector with Matrix3](exercises/14-local-to-global-matrix/README.md)
15. [Points and vectors](exercises/15-points-and-vectors/README.md)
16. [Homogeneous coordinates](exercises/16-homogeneous-coordinates/README.md)
17. [Matrix4: transforming points and vectors](exercises/17-transform-points-vectors/README.md)
18. [A long transformation chain](exercises/18-matrix-transform-chain/README.md)
