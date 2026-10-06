# React and transition architecture

## Contents

- Stack and project structure
- Controller and React composition
- Authored, visible, and viewer state
- Animation and mathematical paths
- Sidebar synchronization and resources

## Stack and project structure

Use Next.js App Router, TypeScript, React, `@react-three/fiber`, `@react-three/drei`,
Three.js, Vitest, and Playwright. Use classic WebGLRenderer; do not silently switch
to WebGPU. Read installed Next.js documentation and package versions rather than
assuming APIs from another release. Preserve the target lockfile and conventions.

The reference project uses npm workspaces `exercises`, `sandbox`, `slides`. Its
manual app currently uses Next.js 16.3.8, React 19, R3F 9, drei 10, Three.js 0.185.0.
Treat these as an inspected compatible cohort, not a claim about latest versions.
Use the sandbox's camera-following sky through its workspace dependency there.
For a standalone project, supply that environment locally without requiring an
unavailable `@course/sandbox` package.

Separate shared platform code from each course:

- `src/platform`: navigation controller, course controls, shared player primitives.
- `src/components`: catalogue and language management.
- `src/courses/<slug>`: snapshots, copy, step components, persistent stage, scene,
  mathematical helpers, transition hook, sidebar, timeline, and domain tests.
- `src/app/presentations/<slug>/page.tsx`: route to the course component.
- Global stylesheet: the shared design tokens and responsive player layout.

Reuse actual shared components; keep domain mathematics in each course. Extract
a generic stage only when it is useful for the requested course, rather than
adding a large animation or undo/redo framework preemptively.

## Controller and React composition

Create the controller in the course presentation component. Track `index`,
`count`, `goTo`, `next`, and `previous`; validate direct indices and clamp bounds.
Reject an empty course. Use stable IDs for authored steps and derive display
numbers from their order.

Select lightweight step components with a switch. Allow the same component to
serve consecutive indices with different snapshot props. Keep the stage outside
the switch:

```tsx
const controller = useCourseController(steps.length);
const snapshot = steps[controller.index];
let step: React.ReactNode;
switch (snapshot.kind) {
  case "point": step = <PointStep snapshot={snapshot} />; break;
  case "model": step = <ModelStep snapshot={snapshot} />; break;
  case "comparison": step = <ComparisonStep snapshot={snapshot} />; break;
}
return (
  <main className="presentation">
    <PlayerHeader />
    <PersistentStage>{step}</PersistentStage>
    <CourseControls controller={controller} titles={titles} language={language} />
  </main>
);
```

Treat this as composition pseudocode, not a drop-in module with existing imports.
Implement `PersistentStage` and the domain steps in the target project. In the
reference project, a step declares a complete destination through context in a
layout effect and renders no Canvas. The stage receives that destination and
renders both persistent scene and sidebar. Passing a complete snapshot through
stage props is also valid if it preserves this lifecycle.

Let React own mounting and cleanup. Do not key Canvas, stage, renderer, environment,
or shared geometry by step index. A sidebar content subtree may be keyed to switch
text and layout immediately; that key must not reach the scene.

## Authored, visible, and viewer state

Keep three concerns separate:

| State | Purpose | Allowed changes |
| --- | --- | --- |
| Authored snapshot | Complete immutable destination and explanation | Authoring / selected course step |
| Visible frame | Current animated transforms, helper weights and readouts | Transition calculation |
| Viewer state | Orbit camera, hover target, language | Camera/hover/language controls |

Use a generic snapshot shape such as stable `id`, `kind`, `topic`, optional
`groupId`, translated `stageTitle/body/takeaway/hint`, `operation`, and complete
`scene`. Put all mathematical defaults into each destination before freezing it.
Keep runtime animation metadata outside the authored data.

Derive visibility from the complete destination. Support explicit helper overrides
where a general topic default would be distracting, for example optional
`sectors: boolean` with undefined meaning the topic default and false hiding it.
Do not conflate mathematical model orientation, an Euler representation, authored
progress, and camera orientation.

## Animation and mathematical paths

Use a React transition hook with a ref containing the current visible frame, a
generation/token to reject stale RAF work, and cleanup that cancels the scheduled
frame. On a new target, capture the current frame as `from`; never restart from
the old authored endpoint. Keep this behavior for previous, next, direct jumps,
rapid interruptions, and camera updates during a transition.

Use approximately 1100 ms with smoothstep `u*u*(3-2*u)` as the reference pacing.
Under `prefers-reduced-motion`, reach the complete target immediately. Use linear
interpolation for suitable scalar/vector values, opacity weights for crossfades,
and quaternion SLERP for ordinary rigid orientation changes. Interpolate camera
position/target when authored framing changes; preserve user framing when the
authored camera has not changed.

Supply domain paths explicitly when ordinary SLERP would contradict the lesson:

- Follow successive intrinsic Euler turns and their moving axes when teaching
  composition. Distinguish stored XYZ values from which angles are applied so far.
- Follow coupled Euler angles during gimbal compensation even while the composed
  orientation is constant. Let timeline/graphs advance without inventing motion.
- For Euler-versus-SLERP comparisons, animate each model with its own formula;
  never SLERP both models simply because they share endpoints.
- During an XYZ-to-YXZ reset, retain the visible source decomposition and sector
  radii until identity, where sectors are empty. If interrupted by another advance,
  finish that reset before applying the new order. Do not reinterpret a nonzero
  source quaternion in the target Euler order at transition start.

Do not interpolate raw matrix entries for rigid rotations; that can shear or
scale a supposedly orthonormal frame. Compute matrices from the interpolated
rotation and translation. Give paths an authored reference origin/orientation
instead of assuming every arc starts at zero.

For a new mathematical domain, define invalid and degenerate intermediate states
explicitly. Recompute derived geometry and readouts from the visible inputs;
guard division by zero, undefined directions, clipping, and non-finite values.
Hide an undefined helper and explain its status instead of drawing invented motion
or formatting NaN/Infinity. Test transitions across these states in both directions.

## Sidebar synchronization and resources

Switch destination topic/title/body/formulas/layout immediately, without sidebar
translation, fade, animated height, or an outgoing panel. Derive changing values
and order labels from the visible frame. At rest, derive values from the actual
representation used by the scene, not inherited placeholder fields.

For multiple models, label each readout's owner. In the reference interpolation
panel, show the left Euler/lerp model's angles during animation and at rest:
179°, 0°, −179°. Do not use the right SLERP quaternion for those indicators or
fall back to a generic model's stored 20°/25°/15° angles at the endpoint.

Keep point/model/grid/sector/ring geometry mounted and crossfade only when useful.
Use `frameloop="demand"`; invalidate for animated React state, camera controls,
or hover updates. Do not leave a perpetual CPU/GPU loop running on a settled page.
Dispose explicit sky/geometries/materials and remove DOM labels/listeners in
React cleanup. Let R3F manage its declarative resources; avoid double disposal.
Cancel all pending work when leaving the manual. Check StrictMode and graphics
context loss; keep readable lesson copy and numerical results in the fallback.
