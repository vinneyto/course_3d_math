# Reference implementation map

Locate these paths relative to an existing course_3d_math repository root. They
are source examples, not files assumed to exist in another project. The main
skill and other references describe the pattern independently of this checkout.

| Concern | Source path |
| --- | --- |
| Shared controller | `slides/src/platform/use-course-controller.ts` |
| Footer picker/buttons/keyboard | `slides/src/platform/CourseControls.tsx` |
| Catalogue tile and SVG artwork | `slides/src/components/Catalogue.tsx` |
| Language persistence | `slides/src/components/use-language.ts` |
| Course controller and switch | `slides/src/courses/rotation/RotationPresentation.tsx` |
| Step destination effects and persistent stage | `slides/src/courses/rotation/RotationSlide.tsx`, `slides.tsx` in that directory |
| Immutable destinations/group boundaries | `slides/src/courses/rotation/snapshots.ts` |
| Translated copy and stage labels | `slides/src/courses/rotation/content.ts` |
| RAF lifecycle and reduced motion | `slides/src/courses/rotation/use-scene-transition.ts` |
| Transform paths, helper weights, Euler order resets | `slides/src/courses/rotation/transition.ts` |
| Mathematical state and displayed-angle ownership | `slides/src/courses/rotation/state.ts`, `math.ts` |
| DOM labels, hover, axes, camera, sectors, models | `slides/src/courses/rotation/Scene.tsx` |
| Fixed-buffer signed sector math | `slides/src/courses/rotation/euler-sweeps.ts` |
| Sidebar and group scroll behavior | `slides/src/courses/rotation/SnapshotSidebar.tsx` |
| Parameters, matrices, plots, formulas | `slides/src/courses/rotation/Panels.tsx` |
| Read-only stage rail and tooltips | `slides/src/courses/rotation/StageTimeline.tsx` |
| Scene geometry/sample vertex | `slides/src/courses/rotation/geometry.ts` |
| Visual tokens and responsive layout | `slides/src/app/globals.css` |
| Camera-following sky | `sandbox/sky.ts` |
| Unit regression cases | `slides/src/courses/rotation/*.test.ts` |
| Production desktop/mobile checks | `slides/e2e/presentation.spec.ts`, `slides/playwright.config.ts` |

Inspect the current sources before copying or extending them. Reuse controller
and controls directly in this project. For another project, replace the rotation
domain, translations, artwork, scene paths, and workspace environment dependency.
Keep the lifecycle, snapshot, UI, and navigation contracts from this bundle.

Use regression cases as examples of important invariants: no sectors while
crossing the early basis-restoration/axis-introduction boundary, source-order
sectors during an order reset, no model movement during compensation, model-specific
Euler readouts during and after interpolation, and bounded hover tooltips.
