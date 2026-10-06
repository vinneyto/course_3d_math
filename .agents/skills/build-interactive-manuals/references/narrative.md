# Narrative and snapshot authoring

## Contents

- Learning path
- Grouped and standalone steps
- Atomic operations and consolidation
- Labels and explanation
- A reusable example

## Learning path

Begin with a concrete scene and familiar action. Let the learner observe its
consequence, then reveal the representation or formula that describes it. Reuse
the same objects, camera framing, reference origin, and colors so the next step
feels like an evolution of the previous one.

Prefer the sequence: observe an object, perform one operation, expose the relevant
representation, apply it, state the consequence, demonstrate a limitation, then
introduce the next representation. Write an introductory or bridging step before
a difficult new topic so a long demonstration has an unmistakable beginning.

Use plain mathematical language. For example, replace "weighted basis vectors"
with "Multiply each basis vector by the corresponding coordinate, then add the
local origin." Describe the actual action instead of unexplained labels such as
"move toward a singularity."

## Grouped and standalone steps

Give each multi-step demonstration a stable sequence/group ID and one visible
topic. Derive its timeline stages from authored destinations in course order.
Use a distinct sequence ID for a repeated demonstration, even if its broad topic
is unchanged: a basis-only explanation and its subsequent ring demonstration
need separate timelines and scroll resets.

Give each stage a short descriptive name and an operation string/formula for its
tooltip. Derive timeline position from its ordinal within the group, or from a
separate authored chronological coordinate. Keep it separate from a lesson
parameter named `t`; a sequence may advance while that parameter resets.

Use a standalone step for an introduction, concept bridge, or recap that has no
multi-stage operation. Omit the operation timeline entirely for singletons. Do
not render a meaningless one-marker rail.

Use the same group identity for the scene topic chip, sidebar eyebrow, navigation
entries, timeline labels, and scroll-reset behavior. Reset scroll on a group
change in either direction. Preserve it within a group.

## Atomic operations and consolidation

Describe a complete scene destination per step. Include its geometry, mathematical
parameters, origin, transforms, visibility of helpers, authored camera, sidebar
content, representations, and sequence metadata. Expand reusable defaults at
authoring time; do not copy parameters from the previously visited step.

Split actions with independent causal meaning. Moving a point off an axis and
then rotating its container are two steps. Successive intrinsic Euler turns
around X, then Y, then Z are three steps. Resetting before comparing another
rotation order is a separate destination.

Consolidate views that explain the same operation. Show the colored basis, matrix
columns, and resulting world position together instead of replaying the same
angle sequence twice. Avoid steps whose only difference is another arbitrary
intermediate angle; the animation already shows those values.

Preserve useful special cases, such as 0°, 90°, and 180°, when they explain where
matrix entries move or change sign. Show a smaller angle afterward. Avoid adding
sectors before discussing angular sweeps: an early basis/orthonormality or reset
step can suppress sectors explicitly while retaining axes and hover inspection.

Default to one model when comparing operation order: reset it and perform the
other ordered sequence. Use two models when simultaneous paths are the actual
comparison, such as Euler interpolation versus SLERP. Label which readouts belong
to which model.

## Labels and explanation

Use `Topic: short stage description` for navigation and timeline tooltips. Use
the current stage name as the main heading and timeline heading, not a completion
percentage or the anonymous word "Timeline." Put the topic above the heading
and on the scene chip so group boundaries are visible without reading the rail.

Give each step one main observation, one concrete explanation, and one takeaway.
Use an observation hint such as "Step backward and forward to compare the two
orders." Do not ask the reader to drag a slider or edit a number in this manual.

Keep English primary and maintain Russian copy in the source project's language
structure. Keep stable IDs and mathematical destinations shared across languages.
Changing language must preserve index, scene, and viewer camera state.
For a standalone project, use the languages requested for that project; do not
require bilingual content merely because the reference course has it.

## A reusable example

For a new ray-intersection manual, an appropriate initial authoring table is:

| ID | Topic / group | Stage | Operation | Visible content |
| --- | --- | --- | --- | --- |
| ray-intro | Ray / singleton | Define origin and direction | No transform | Origin, direction arrow, labels |
| ray-start | Ray position / ray-position | Start at the origin | Set t = 0 | Equation and read-only t |
| ray-along | Ray position / ray-position | Move along the direction | Set t = 2 | Same ray, moving point, coordinates |
| plane-intro | Intersection / singleton | Introduce the plane | Reveal plane | Ray and translucent plane |
| hit-before | Intersection / ray-hit | Approach the plane | Set t before hit | Point and plane distance |
| hit-on | Intersection / ray-hit | Reach the intersection | Set t to hit | Highlight the contact and formula |
| hit-after | Intersection / ray-hit | Continue beyond the plane | Set t after hit | Same scene, changed signed distance |
| ray-recap | Recap / singleton | Summarize the relation | No new transform | Compact equation and takeaway |

Animate point positions using the ray equation; do not substitute unrelated
straight-line transitions for an operation with a different authored path. Keep
the ray/plane mounted, expose inspection through camera and hover only, and add
read-only stage timelines to the two grouped demonstrations.
