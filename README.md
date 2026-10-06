# Practical 3D Math

A hands-on course about vectors, matrices, and linear transformations in computer graphics.

The course uses TypeScript, Vitest, and Three.js, but it is not a Three.js course. `Vector3`, `Vector4`, `Matrix3`, and `Matrix4` are used as convenient implementations of universal mathematical concepts.

Exercises 1–14 work only with vectors and `3 × 3` matrices. Exercise 15 introduces points, and exercise 17 introduces `4 × 4` matrices. World space and handedness are intentionally left out of these exercises for now. The interactive rotation manual additionally introduces local/world frames and a right-handed rotation basis.

Russian translation: [translations/ru/README.md](translations/ru/README.md)

## Getting started

Node.js 20.19 or newer is required (Node.js 24 is used in CI).

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

## Monorepo

The three npm workspaces stay at their existing top-level paths:

| Package | Purpose |
| --- | --- |
| `exercises` | TypeScript tasks, task tests, and lesson pages |
| `sandbox` | Vite exercise viewer and shared Three.js visualization utilities |
| `slides` | Next.js catalogue and interactive manuals using React Three Fiber, drei, and classic WebGL |

Install once at the repository root. Existing exercise commands above keep working.

## Interactive manuals

```bash
npm run dev
```

Open http://localhost:3000. The catalogue contains **Rotation in 3D**, an interactive
manual with 103 atomic snapshots across 19 topics, English by default and a Russian
language switch. On desktop the scene and sidebar sit side by side; on mobile they
stack with persistent step navigation. Each step supplies its scene, explanation,
formulas and read-only parameter indicators. Only navigation changes lesson values.
Drag to orbit the camera, zoom with the wheel or a pinch, and hover for coordinates.
The application uses `WebGLRenderer`.

```bash
npm run test:slides  # independent math, snapshots and navigation tests
npm run build        # Next.js application and Vite sandbox
npx playwright install chromium
npm run test:e2e     # Chromium desktop and mobile viewport checks
```

The browser checks emulate a mobile viewport/touch input; they do not replace
testing on a physical phone. For a production server, run `npm run start -w slides`
after building. Deployment is a separate step.

The course page creates a `useCourseController` and selects React step components
and props with a switch. `CourseControls` provides navigation. Each destination is
a full immutable snapshot, so revisiting it restores the same mathematical values
regardless of navigation history. A persistent React stage animates the scene from the currently visible state;
sidebar content switches immediately and readouts follow the displayed transform.
The WebGL canvas remains mounted
across forward, reverse and interrupted transitions. Camera and hover belong to
the viewer; they cannot edit lesson parameters. See [slides/README.md](slides/README.md)
and the interactive manual contract in [AGENTS.md](AGENTS.md).

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
