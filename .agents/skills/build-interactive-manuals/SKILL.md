---
name: build-interactive-manuals
description: Build and extend responsive web presentations as interactive manuals using Next.js, TypeScript, React Three Fiber, drei, and classic Three.js WebGLRenderer. Use for new manuals in course_3d_math, standalone projects with the same presentation framework, or changes to atomic snapshots, smooth scene transitions, course navigation, lesson sidebars, operation timelines, read-only charts, axes, sectors, and hover tooltips. Preserve the interactive-movie approach rather than creating conventional static slides or editable parameter playgrounds.
---

# Build interactive manuals

Create an interactive film that the reader advances through discrete authored
snapshots. Let the reader orbit, zoom, pan, and inspect hover tooltips. Let course
navigation change the mathematical lesson state. Keep the scene continuous as
the explanation advances.

## Read the appropriate references

- Read [narrative.md](references/narrative.md) before outlining or changing a course.
- Read [architecture.md](references/architecture.md) before implementing state,
  React components, transitions, or a new project.
- Read [ui.md](references/ui.md) before creating the catalogue, player, sidebar,
  responsive layout, timelines, or charts.
- Read [visualization.md](references/visualization.md) before drawing 3D content,
  coordinate frames, sectors, labels, or tooltips.
- Read [source-map.md](references/source-map.md) when extending course_3d_math or
  locating its implementation examples. The other references are self-contained
  and remain usable when the original repository is unavailable.

## Establish the project mode

1. Read the target repository's AGENTS.md, package manifest, routes, and existing
   manual. Inspect its installed framework documentation before changing APIs.
2. For an existing course_3d_math checkout, preserve the exercises/sandbox/slides
   workspaces, existing routes, English primary copy, and Russian translations.
   Reuse the controller and navigation. Add a course directory and catalogue tile;
   keep course-specific scene mathematics separate.
3. For a new project, build a Next.js App Router application with TypeScript,
   React, React Three Fiber, drei, and classic WebGLRenderer. Create a catalogue
   at `/` and manual routes at `/presentations/<slug>`. Use compatible installed
   versions and a lockfile. Do not add exercises or a sandbox unless requested.
4. Treat this bundle as a reusable authoring and implementation recipe. Do not
   assume that the rotation course is an already extracted, domain-neutral engine.
   In another repository, implement the small shared platform and domain stage
   from the architecture reference; do not import missing rotation files.

## Outline the manual before building scenes

Write a compact authoring table with stable step ID, topic, sequence ID, stage
name, single operation, complete destination, visible helpers, explanation, and
takeaway. Make grouped demonstrations share one named operation timeline. Make
standalone introductions and conclusions omit that timeline.

Split independent operations into separate destinations. Merge redundant angle
samples and simultaneous representations of the same operation. Let the animated
transition reveal intermediate values. Introduce helpers only when their meaning
is explained. Use the timeline boundary as the visible topic boundary.

## Implement the persistent React stage

- Create the course controller in the presentation component. Select lightweight
  step components using a switch on snapshot kind or index. Reuse a component for
  multiple steps through props.
- Keep the shared stage and Canvas outside that switch and mounted throughout the
  manual. Let step components declare complete destinations through React props
  or an effect/context. Use React cleanup rather than activate/undo/apply/revert.
- Store immutable authored destinations, the current visible frame, and viewer
  camera/hover state separately. Never infer a destination from navigation history.
- Retarget animations from the actual visible frame when moving forward, backward,
  jumping, or interrupting. Keep geometry mounted and interpolate visibility.
- Switch sidebar text and layout immediately. Derive numbers, indicators, chart
  markers, sectors, and displayed order from the same visible mathematical state.
- Respect reduced motion, cancel animation on unmount, render on demand, and retain
  readable explanations and numerical values if WebGL cannot initialize.

## Apply the visual and interaction contract

Use a dark responsive catalogue and a player with header, scene, lesson sidebar,
and bottom course navigation. Give the sidebar topic and step count, stage title,
explanation, highlighted takeaway, observation hint, read-only parameters, timeline
when grouped, and relevant formulas/plots/code. Keep a main mathematical artifact
near the heading when it is the point of the demonstration.

Use Previous, Next, a direct step picker, and arrow-key navigation. Let timeline
markers inspect stages through hover/focus tooltips with a normal cursor; they do
not seek. Keep plots and meter-style bars read-only. Keep camera reset as a viewer
control. Avoid lesson sliders, editable numbers, toggles, autoplay, play buttons,
point dragging, and chart scrubbing unless the user explicitly changes this contract.

Use red X, green Y, blue Z, muted global axes, lit rounded geometry, a calm grid
and sky, and projected DOM labels. Keep coordinate and sector tooltips bounded and
legible. Follow the detailed rendering and mathematical rules in the references.

## Validate and hand off

1. Check the authoring table against the implemented destinations and every
   supported language. Preserve English/Russian coverage in course_3d_math;
   follow the requested language scope in a standalone project.
2. Check each destination independently and after a reverse visit or interrupted
   transition. Verify the same scene, parameters, topic, and timeline are restored.
3. Add focused mathematical/geometry tests for important invariants and known
   discontinuities. Test meaningful behavior rather than reproducing implementation.
4. Run the repository's typecheck, manual unit tests, production build, and browser
   checks. In course_3d_math run `npm run typecheck`, `npm run test:slides`,
   `npm run build`, and `npm run test:e2e`; keep unsolved exercise tests separate.
5. Check desktop and mobile viewports, persistent Canvas identity, actual WebGL
   animation, synchronized readouts, hover occlusion and tooltip bounds, reduced
   motion, topic scroll resets, keyboard navigation, and graphics failure.
6. Inspect the production output actually served to the browser. If old Next.js
   chunks are served after a successful build, preserve/remove the stale `.next`
   directory and rebuild before trusting browser results.
7. Add the route and catalogue tile, document the course entry point, and update
   the requested PR. Report viewport emulation honestly. Publish or deploy only
   when the user requests it; creating a manual alone does not require deployment.
