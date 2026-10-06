# Interactive presentations

Next.js + React Three Fiber + drei, using the classic Three.js WebGL renderer.
Run `npm run dev` from the monorepo root, then open http://localhost:3000.

## Routes

- `/`: responsive tile catalogue.
- `/presentations/rotation`: 22-slide rotation course in English and Russian.

## React presentation structure

```tsx
function CoursePage() {
  const controller = useCourseController(22);
  let slide;
  switch (controller.index) {
    case 0: slide = <PointSlide index={0} language="en" />; break;
    case 1: slide = <PointSlide index={1} language="en" scene={{ translation: true }} />; break;
    // Other components, or the same component with different props.
  }
  return <>
    <Fragment key={controller.index}>{slide}</Fragment>
    <CourseControls controller={controller} titles={titles} language="en" />
  </>;
}
```

`useCourseController` is a small React hook: it holds the current index and exposes
`goTo`, `next`, and `previous`. Jumps select the requested component directly.
`CourseControls` renders navigation, the slide selector and progress, and owns
the keyboard listener and its cleanup. It has no knowledge of the course scene.

`RotationPresentation` contains the course's switch. `PointSlide`, `ModelSlide`,
`GimbalSlide`, `InterpolationSlide`, `QuaternionSlide` and `ObjectSlide` reuse the
R3F visualization with declarative props. `RotationSlide` owns its interactive
parameters and camera with `useState`, and playback with `useEffect` and RAF cleanup.
Scene features such as `panel`, `mode` and `dimension` follow props on every render;
angles and other interactive values in `scene` supply initial state on mount.

The rotation page keys independent examples by index, resetting controls, camera
and playback to the new step's defaults. The basis/matrix pair (5–6) and
quaternion/matrix pair (18–19) share keys: panels change through props while their
interactive parameters and camera stay intact. Switching language preserves state.
To keep local state across other related steps, use the same component and key.
No transition queue, scene snapshots, or imperative slide lifecycle is needed.

To add a course, create a React page with its controller, switch and slide
components, reuse `CourseControls`, add its route and catalogue tile. Each component
describes its full example, independently of how the learner reached it.

The scene uses the sandbox's gradient sky, equivalent lighting, and OrbitControls.
Labels use a projected DOM layer owned by React effects, avoiding extra React roots
inside Fiber's teardown. Declarative geometry is disposed by Fiber;
explicitly created sky and knot resources have disposal effects. Rendering is on
demand; the timeline drives it only during playback. Unmounting a slide cancels
playback. Mobile controls use normal touch-friendly form elements.

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
