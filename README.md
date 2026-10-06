# Practical 3D Math

A hands-on course about vectors, matrices, and linear transformations in computer graphics.

The course uses TypeScript, Vitest, and Three.js, but it is not a Three.js course. `Vector3`, `Vector4`, `Matrix3`, and `Matrix4` are used as convenient implementations of universal mathematical concepts.

Exercises 1–14 work only with vectors and `3 × 3` matrices. Exercise 15 introduces points, and exercise 17 introduces `4 × 4` matrices. World space and handedness are intentionally left out of these exercises for now. The interactive rotation presentation additionally introduces local/world frames and a right-handed rotation basis.

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
| `slides` | Next.js catalogue and interactive presentations using React Three Fiber, drei, and classic WebGL |

Install once at the repository root. Existing exercise commands above keep working.

## Interactive presentations

```bash
npm run dev
```

Open http://localhost:3000. The catalogue contains **Rotation in 3D**, a 22-slide
presentation with English as the default and a Russian language switch. On desktop
the scene and lesson sit side by side; on mobile they stack with persistent slide
navigation. Orbit by dragging, zoom with the wheel or a pinch, and explore the
sliders, matrices, Euler-order comparison, gimbal-lock graphs and quaternion SLERP.
The application uses `WebGLRenderer`; no WebGPU device is requested.

```bash
npm run test:slides  # independent math and navigation tests
npm run build        # Next.js application and Vite sandbox
npx playwright install chromium
npm run test:e2e     # Chromium desktop and mobile viewport checks
```

The browser checks emulate a mobile viewport/touch input; they do not replace
testing on a physical phone. For a production server, run `npm run start -w slides`
after building. Deployment is a separate step.

The course page creates a `useCourseController` and selects React slide components
and props with a switch. Navigation selects the requested index directly.
`CourseControls` provides the shared navigation UI. React state and effect cleanup
own interactions and playback. Rotation steps use explicit React keys, resetting
controls and camera for independent examples. The basis/matrix and quaternion/matrix
pairs share keys to preserve parameters while their panels change through props.
See [slides/README.md](slides/README.md).

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
