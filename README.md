# Practical 3D Math

A hands-on course about vectors, matrices, and linear transformations in computer graphics.

The course uses TypeScript, Vitest, and Three.js, but it is not a Three.js course. `Vector3`, `Vector4`, `Matrix3`, and `Matrix4` are used as convenient implementations of universal mathematical concepts.

Exercises 1–13 cover vectors, their products, and applications to normals, lighting, and similarity. Exercises 14–20 develop coordinate transforms with `3 × 3` matrices. Triangle vertices preview points in exercise 10; exercise 21 develops points explicitly, and exercise 23 introduces `4 × 4` matrices. Exercise 9 briefly introduces a right-handed basis; world space is left out for now. The terms **local** and **global** are used throughout the course.

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
8. [Cross product](exercises/08-cross-product/README.md)
9. [Building an orthonormal basis](exercises/09-build-orthonormal-basis/README.md)
10. [Triangle normals from vertices](exercises/10-triangle-normals/README.md)
11. [Dot product](exercises/11-dot-product/README.md)
12. [Diffuse lighting with the dot product](exercises/12-diffuse-lighting/README.md)
13. [Higher-dimensional vectors and similarity](exercises/13-high-dimensional-vectors/README.md)
14. [Nested coordinate systems](exercises/14-local-vector-to-global/README.md)
15. [Rotating a local basis](exercises/15-rotate-local-basis/README.md)
16. [Storing a basis in Matrix3](exercises/16-basis-matrix/README.md)
17. [Multiplying a matrix by a vector](exercises/17-matrix-vector/README.md)
18. [Matrix multiplication](exercises/18-matrix-multiplication/README.md)
19. [Non-commutativity of matrix multiplication](exercises/19-non-commutative/README.md)
20. [Converting a local vector with Matrix3](exercises/20-local-to-global-matrix/README.md)
21. [Points and vectors](exercises/21-points-and-vectors/README.md)
22. [Homogeneous coordinates](exercises/22-homogeneous-coordinates/README.md)
23. [Matrix4: transforming points and vectors](exercises/23-transform-points-vectors/README.md)
24. [A long transformation chain](exercises/24-matrix-transform-chain/README.md)
