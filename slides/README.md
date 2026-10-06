# Interactive manuals

Next.js + React Three Fiber + drei, using the classic Three.js WebGL renderer.
Run `npm run dev` from the monorepo root, then open http://localhost:3000.

## Routes

- `/`: responsive tile catalogue.
- `/presentations/rotation`: rotation manual in English and Russian.

Existing workspace and route names remain stable. User-facing terminology is
**interactive manual** and **step**. The rotation manual contains 88 atomic snapshots
covering 21 topics. Each snapshot describes the complete scene and sidebar.

## React structure

`RotationPresentation` creates `useCourseController(snapshots.length)` and selects
`PointSlide`, `ModelSlide`, `GimbalSlide`, `InterpolationSlide`, `QuaternionSlide`
or `ObjectSlide` through a switch on the snapshot kind, passing its complete scene.
A component can serve multiple consecutive snapshots with different props.
`CourseControls` handles next, previous, direct selection and keyboard navigation.

`snapshots.ts` is the authored timeline. Its immutable destinations contain all
lesson parameters; returning or jumping to a frame restores its exact values.
Changes of angle, geometry representation, composition stage, parent transform or
timeline sample are additional snapshots. Every multi-step demonstration has named
operations in its heading and a timeline with stage markers and hover/focus tooltips.
The playhead follows the displayed transition; the chronological sequence continues
when an example resets its numerical time. Markers inspect stages without seeking. There are no editable lesson controls,
chart seeking, point dragging, vertex-selection clicks or automatic playback.
Viewer interaction consists of camera orbit/zoom/pan and hover tooltips.

Step components declare destinations through context and a React layout effect.
`RotationStage` stays mounted outside the switch and owns the animated scene.
`useSceneTransition` animates from the visible state over 1.1s; a new destination
cancels and retargets the previous RAF. Rotations generally use quaternion SLERP;
the gimbal and Euler/SLERP examples follow their own mathematical paths, keeping
rings, angles and model consistent. Position, camera and visibility interpolate.
Reduced-motion preferences reach the destination immediately.

`SnapshotSidebar` contains the full explanation, parameter indicators, formulas
and numerical readouts. Panel text and layout switch immediately without
entry/exit animation, crossfades or height transitions. Numbers and indicators
follow the displayed scene. Timeline labels show the current operation name;
markers use a normal cursor. Destination parameters never inherit edits or
values from earlier visits. Viewer camera state is preserved between frames with
the same authored camera; a changed framing animates to the new view. Language
switching preserves course progress.

The R3F Canvas, renderer and shared geometry remain mounted. Point, cube, model,
grids and helpers crossfade; surface, wireframe and vertices also share mounted
geometry. Labels use an effect-owned projected DOM layer. Geometry and explicit
sky resources have disposal cleanup. Demand rendering runs while transitions,
camera movement or hover updates require it. Leaving the manual cancels animation.

To add a course, create its authored snapshots, React page/controller and switch,
reuse `CourseControls`, then add a route and catalogue tile. Follow the contract
in the root [AGENTS.md](../AGENTS.md).

## Rotation topics

1–4: point, translation, local-frame rotation, offset origin. 5–8: the basis in
colored Matrix4 columns, world coordinate calculation, fixed axis points, recap.
The matrix table sits inside a displayed `new Matrix4().set(...)` call, followed
by `positionLocal.clone().applyMatrix4(matrixLocalToWorld)`. The combined basis
and matrix sequence starts with symbolic columns, then 0°, 90° and 180° turns
around X, a return to 0°, and 15°, 30° and 60° examples.
9–11: cube, torus knot, orthonormality versus deformation. 12–16: axis formulas,
Euler composition, order comparison, gimbal lock, angle boundary interpolation.
17–21: axis–angle quaternion, quaternion matrix, SLERP, Object3D, recap.

For XYZ, scripted gimbal snapshots reach y=90°, then increase x and decrease z
equally. Further snapshots compare y=80° and change x then z separately at the
singularity: either angle still rotates the model, but their effects become
linearly dependent. Rings show successive rotation frames. Translucent signed angle
sectors follow those same moving Euler axes, including negative angles. The axis,
Euler-composition and order-comparison examples also show these sectors. Indicators
show the angles actually applied so far. Sector buffers stay mounted and update
through the transition. Graphs observe the
snapshot time; clicking them cannot change it.

Interpolation snapshots compare an actual vertex trajectory. Angular speeds are
degrees per normalized time t. Single-axis and compound comparisons share their
endpoint orientations. Object3D snapshots first show Euler input, then the same
orientation as a quaternion, then add a parent rotation.

The authoring scenario lives in [Google Docs](https://docs.google.com/document/d/1-fET7tLlbFPbg-6VB6uop51qskeiLZWIn274aTkDQFo/edit).

## Validation

From the root: `npm run typecheck`, `npm run test:slides`, `npm run build`.
For browsers: `npx playwright install chromium`, then `npm run build` and
`npm run test:e2e`. Browser tests run against the production server.
An existing Chromium can be used via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
Tests cover all snapshots, read-only/reproducible values, renderer continuity,
animated sidebar values, reverse/interrupted transitions, camera/hover, graphics
failure, and desktop/mobile layouts. Mobile coverage is Chromium viewport emulation.
Exercise task tests intentionally fail until solved and stay separate.
