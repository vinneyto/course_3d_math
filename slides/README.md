# Interactive presentations

Next.js + React Three Fiber + drei, using the classic Three.js WebGL renderer.
Run `npm run dev` from the monorepo root, then open http://localhost:3000.

## Routes

- `/`: responsive tile catalogue.
- `/presentations/rotation`: 22-slide rotation course in English and Russian.

## Slide contract

```ts
interface Slide<Context> {
  id: string;
  apply(context: Context, signal: AbortSignal): Promise<void>;
  revert(context: Context, signal: AbortSignal): Promise<void>;
}
```

`apply` and `revert` name a symmetrical change rather than a visibility event.
`Presentation` serializes navigation and traverses intermediate changes for every
jump. A step's index advances only after its asynchronous method succeeds. Failed
steps restore their prior immutable context; disposing a presentation aborts its
signal and removes subscribers. Async custom slides should honor that signal.

`reversibleSlide` captures the immutable context before applying its patch. Revert
restores that snapshot, including previous user edits, without duplicating another
slide's code. State and vector tuples must be replaced, never mutated in place.

The rotation course is in `src/courses/rotation`: immutable step patches, bilingual
lesson content, math functions, scene, and numeric controls. To add a course, create
its own state and slide sequence, reuse `Presentation`, add a player route, and add
its tile to the catalogue. The engine has no Three.js or React dependencies.

The scene uses the sandbox's gradient sky, equivalent lighting, and OrbitControls.
Labels are DOM-backed via drei `Html`. Declarative geometry is disposed by Fiber;
explicitly created sky and knot resources have disposal effects. Rendering is on
demand; the timeline drives it only during playback. Playback cancels on slide
navigation or unmount. Mobile controls use normal touch-friendly form elements.

## Rotation course

1–4: point, translation, local-frame rotation, offset origin. 5–9: basis sum,
colored Matrix4 columns, world coordinate calculation, fixed axis points, recap.
10–12: cube, torus knot, orthonormality versus deformation. 13–17: axis formulas,
Euler composition, order comparison, gimbal lock, angle boundary interpolation.
18–22: axis–angle quaternion, quaternion matrix, SLERP, Object3D, recap.

For XYZ, the scripted gimbal demo reaches y=90° at t=0.5, then increases x and
decreases z equally. It compares this cancellation to y=80°, and offers separate
manual angle controls. The rings show the successive rotation frames, rather than
mislabeling the final model basis as gimbal axes.

The interpolation comparison samples an actual vertex trajectory. Angular speeds
are degrees per normalized time t, not degrees per second. The compound example
compares the same endpoint orientations. The Object3D example supports Euler and
axis-to-quaternion input and an optional parent rotation.

The full authoring scenario lives in [Google Docs](https://docs.google.com/document/d/1-fET7tLlbFPbg-6VB6uop51qskeiLZWIn274aTkDQFo/edit).

## Validation

From the root: `npm run typecheck`, `npm run test:slides`, `npm run build`.
For browsers: `npx playwright install chromium`, then `npm run build` and
`npm run test:e2e`. Browser tests run against the production server.
An existing Chromium can be used via `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.
CI checks desktop and mobile Chromium viewports, not physical iOS/Android devices.
Exercise `task.test.ts` files remain intentionally failing until solved by learners;
they are kept separate from presentation validation.
