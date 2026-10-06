# Repository instructions

## Monorepo and interactive slides

- Keep `exercises`, `sandbox`, and `slides` as npm workspaces. Preserve root
  exercise commands and relative lesson links when changing package organization.
- `slides` uses Next.js, React Three Fiber, drei, and classic WebGLRenderer.
  Do not switch to WebGPU without an explicit request.
- Keep English primary and maintain the Russian presentation text alongside it.
- Build presentation slides as React components. The course page creates a
  `useCourseController` and selects its slide components and props with a switch.
  Navigation changes the index directly; do not replay intermediate slides.
- Keep controls and animation state in React. Use effect cleanup for animation,
  subscriptions and explicit resources. Keep the Canvas and shared narrative
  stage mounted across steps. Animate from the current visible transform to the
  next destination, including reverse and interrupted transitions. Do not key
  the renderer or shared scene by slide index. Use crossfades for different content
  and respect reduced-motion preferences.
- Check slides with `npm run test:slides`, `npm run typecheck`, `npm run build`,
  and `npm run test:e2e`. Test desktop and mobile layouts; do not claim physical
  device coverage from viewport emulation.
- Exercise tasks intentionally contain TODOs. Do not solve them to make the
  presentation CI pass; keep their tests independent.

## Interactive manual contract

- Treat this product as an interactive manual, not a conventional slide deck or
  a parameter playground. A step is a complete, deterministic snapshot of course
  progress: scene, explanation, sidebar layout, displayed parameters and values.
- Prefer many atomic steps with a small meaningful delta over fewer steps with
  editable controls. Author angle changes, geometry modes, comparison options,
  composition stages and timeline samples as additional snapshots.
- Course navigation is the only way to change lesson parameters. Do not add
  editable sliders, numeric inputs, toggles, model-selection clicks, point dragging,
  chart scrubbing, playback buttons or autonomous playback. Sidebar indicators may
  resemble controls but must be read-only and derive their values from the frame.
- Viewer interaction is limited to orbit/zoom/pan of the camera and hovering
  scene/panel elements for tooltips. Camera and hover state are separate from the
  authored snapshot and must never change its mathematical values.
- The sidebar is part of each snapshot. Switch its text, formulas and layout
  immediately without entry/exit motion, crossfades or animated height. Numeric
  readouts and indicators follow the displayed scene during its transition.
  Reset sidebar scroll immediately when the operation timeline group changes,
  including reverse navigation. Preserve scroll within a group. On mobile, where
  the document scrolls, return to the lesson heading if the reader is below it.
- Every multi-step demonstration has an operation timeline with stage markers and
  hover/focus tooltips. Use the current stage's descriptive name as its heading;
  do not substitute completion percentages or an anonymous time/progress meter.
  Label the timeline with the current stage name, not the word "Timeline".
  Timeline markers inspect stages with a normal cursor; course navigation changes
  the snapshot.
  Treat each timeline group as a visible topic. Navigation entries and timeline
  tooltips use "Topic: short stage description"; show the current topic above
  the sidebar heading and in the scene label, including repeated demonstrations.
- Keep the shared R3F Canvas, renderer and narrative scene mounted. Forward,
  reverse and interrupted navigation transition from the current visible state.
  Different content may crossfade; respect reduced-motion preferences.
- Each snapshot supplies its full destination, without inheriting parameters from
  the previous visit. Returning to a step must restore its authored scene and
  sidebar values regardless of navigation history. React owns lifecycle and
  cleanup; do not introduce imperative apply/revert slide methods.
- Keep workspace/package and existing route names stable; use "interactive manual"
  and "step" in user-facing copy. Do not rename packages merely for terminology.

## Exercise page navigation

- End every exercise `README.md` with a navigation block separated from the
  lesson by a horizontal rule (`---`). Link to the previous and next exercises
  using their titles; the first exercise has only a next link, and the last
  exercise has only a previous link.
- Keep the navigation in the primary English pages and the corresponding pages
  under `translations/ru` in sync. Russian pages must use Russian link labels
  and stay within the Russian translation tree.
- When adding a new exercise, add its navigation block and update the formerly
  last exercise so that its next link points to the new page.

## Exercise visualizations

- Put each exercise visualization in `exercises/<exercise>/demo.ts` and export
  `mountDemo(context)`.
- Whenever an exercise has a `demo.ts`, document how to launch it in that
  exercise's `README.md`. Add a `## Visualization` section with the exact command
  `npm run demo -- exercises/<exercise>`. Treat the demo and its launch
  instructions as parts of the same change.
- Every exercise `README.md` must document how to run that exercise's task
  tests with the exact command `npm test -- exercises/<exercise>`. The path in
  the command must match the exercise directory.
- Make every mathematical value visible and readable. Label coordinate axes and
  label vector components, projections, angles, or other quantities demonstrated
  by the lesson.
- Follow the conventional coordinate colors: X is red, Y is green, and Z is blue.
- When visualizing vector components, use an axis-aligned construction such as
  `(0, 0, 0) → (x, 0, 0) → (x, y, 0) → (x, y, z)`. This keeps the construction
  anchored to the coordinate axes and planes. Label each segment with its
  component value. Do not draw lines directly from the vector endpoint to each
  axis unless the lesson specifically teaches orthogonal projection onto a line;
  those lines leave the coordinate planes and make the components harder to read.
- In vector-addition demos, animate the addends between two states: all arrows
  start at the coordinate origin, then move into a head-to-tail chain, then return
  to the origin. Start easing into the chain immediately when the demo loads.
  Then continue a repeating twelve-second cycle with three-second phases: ease
  into the chain, hold the chain, ease back, and hold at the origin. Keep the
  result vector and its component construction fixed throughout the animation.
- Use lit 3D geometry with enough segments for objects intended to look solid.
  Avoid unlit low-poly substitutes for cylinders, cones, spheres, and similar
  shapes.
- Keep labels legible while orbiting the camera. Prefer `CSS2DObject` labels over
  text baked into the WebGL canvas.
- Reuse the sandbox camera-following gradient sky, lighting, render loop, and
  `OrbitControls` instead of recreating them in each demo.
- Dispose geometries, materials, helpers, and DOM-backed labels when a demo is
  unloaded.
- Validate changes with `npm run typecheck` and a Vite build or dev-server launch
  for the affected demo.
