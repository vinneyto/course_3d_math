# Catalogue, player, sidebar, and navigation

## Contents

- Design tokens
- Catalogue
- Desktop and mobile player
- Sidebar composition
- Operation timelines
- Read-only parameters and charts
- Navigation and accessibility

## Design tokens

Use these source-project values as the default visual baseline. Keep one shared
stylesheet and adapt spacing to content instead of imposing screenshot dimensions.

| Token | Value / use |
| --- | --- |
| Background | `#0c1422` |
| Panel | `#111d2e` |
| Borders | `#2a3a50` |
| Main text | `#e9f0f7` |
| Muted text | `#99aac1` |
| Mint accent | `#a3e7d6` |
| X / Y / Z | `#f78189` / `#8fd29d` / `#7ea9ff` |
| Comparison / attention | Peach `#ffbd80` |
| World axes | Muted blue-gray `#6b819b` |

Use a system sans-serif stack with Inter when available. Use monospace for code,
coordinates, matrices and changing numbers. Use subdued 9–11 px uppercase topic
eyebrows, generous stage headings, 13–14 px explanatory text with 1.6–1.75 line
height, thin borders, and 8 px control/panel corners. Avoid bright dashboard noise.

## Catalogue

Build a responsive tile list. Use a brand and language button in a header, a short
introductory heading with mint emphasis, and a grid of manual cards. Each whole
card links to its manual route and contains an SVG or other light preview,
step-count badge, topic eyebrow, title with a directional icon, short description,
and technology/subject tags. Keep a subdued footer.

Use a centered 1200 px container, 52 px desktop side padding, grid columns such
as `repeat(auto-fill, minmax(290px, 1fr))`, 24 px gaps, 16 px card corners, and
cards no wider than about 480 px. Reduce side padding to 24/20 px and use one
column on narrow screens. A modest card-hover border/lift is allowed; it is not
an animation of the lesson sidebar. Respect reduced motion.

## Desktop and mobile player

Use a full-height `100dvh` desktop grid: 62 px header, flexible central content,
68 px footer. Split the center into the flexible scene and a 350–410 px sidebar;
at widths of 1500 px and above, allow a 460 px sidebar and slightly larger text.
Set min-width/min-height to zero on flexible children to prevent overflow.

Header: catalogue back link, centered course title, language toggle. Scene overlay:
top-left pill with dimension/topic and mint dot, top-right camera reset; bottom-left
colored XYZ legend and bottom-right camera/hover hint. Let overlay decorations
ignore pointer events; enable events only on the reset button.

At 850 px and below, stack scene above lesson; let the document scroll rather
than trapping a narrow sidebar. Keep header and footer sticky. Use a 54 px header,
66 px footer, scene around 45dvh with 280–510 px bounds, and lesson padding near
25 px. At 560 px and below, use about 39dvh/minimum 260 px scene height, 25 px
lesson headings, smaller navigation/picker text, and a single-column catalogue.
Keep the footer picker between Previous and Next; prevent long titles from
forcing horizontal page scroll. Keep matrices locally scrollable when needed.

Preserve sidebar scroll within one sequence. Reset it instantly when entering a
different sequence, including reverse jumps and repeated demonstrations. On
mobile, return to the lesson heading below the sticky header only if the reader
has scrolled below that heading; do not scroll down a reader still viewing the scene.

## Sidebar composition

Treat the sidebar as part of each snapshot. Render these elements in a clear order:

1. Topic eyebrow at left and two-digit step count / total at right.
2. Descriptive stage heading.
3. Short explanatory paragraph.
4. Takeaway box with a mint left border, subtle tint, small IDEA label, and conclusion.
5. An observation/navigation hint.
6. Divider and Frame parameters: compact label/value definition list and meters.
7. Operation timeline for grouped steps; optional read-only plots below it.
8. Relevant formulas, coordinate readouts, color-coded matrices, quaternion values,
   code blocks, or a concise comparison/limitations table.

Switch text and layout immediately with no panel animation. Let mathematical
numbers and indicators animate with the scene. Make a key mathematical artifact
visible near the heading when it is the focus: matrix/code frames can put that
artifact before the prose and parameters rather than burying it below the fold.

For a matrix-as-basis lesson, render a code sandwich with the actual table inside:

```ts
const matrixLocalToWorld = new Matrix4().set(
  // Render the 4 × 4 colored table here, in Matrix4.set row order.
);
const worldPosition = positionLocal.clone()
  .applyMatrix4(matrixLocalToWorld);
```

Use numerical cells plus a colored column legend/symbolic labels X, Y, Z, T.
Group basis components by columns, but display `.set()` arguments by rows.
Keep translation T distinct from rotation R and `elements` column-major storage.
Show coordinate expansion and world position beside the same example. Keep code
selectable and locally scrollable. Preserve local vectors when an API mutates them.

## Operation timelines

Render a thin muted rail with a mint completed section, one circular marker per
authored stage, and a small triangular playhead that follows the visible transition.
Mark previous stages, highlight the current marker with a soft halo, and preserve
the destination stage name in the heading while the playhead travels toward it.

Use `Topic: stage description` as the timeline title. Do not write "Timeline" or
replace the stage heading with a percentage. Hide the whole component for a
singleton. Space markers by ordinal within the group, independently of a lesson
parameter that might reset or have nonuniform samples.

Let each marker inspect a tooltip by hover or keyboard focus. Include the stage
name and its actual operation/formula; clamp the tooltip inside the panel. Use a
normal cursor, not a question-mark/help cursor. Keep markers read-only: clicking
does not seek, edit a parameter, or start playback. Use `aria-current="step"`,
clear accessible names, focus outline, and tooltip relationships.

## Read-only parameters and charts

Use definition lists for geometry, origin/translation, order, representation,
axis, and other fixed metadata. Use compact meter-style bars for changing angles
or scalar parameters: label at left, formatted value and units at right, mint
fill on a muted 4 px rail. Supply `role="meter"` and appropriate value/range.
Do not turn these into inputs, sliders, switches, or hidden controls.

Use compact SVG plots for authored time-series values. For a three-angle example,
show aligned X/Y/Z rows with colored axis labels, signed angle curves, shared time
coordinates, a current-position marker, and relevant minimum/maximum values.
Highlight important intervals in peach/orange (for example, compensation), derived
from authored stages rather than arbitrary animation timestamps. Let plots advance
even when combined model motion cancels. Keep graphs observational: no seeking
on click, drag, or scrub. Give each plot a descriptive accessible name and expose
the same important values in text/meters. Maintain consistent time and units.

## Navigation and accessibility

Use Previous, a native direct step select, and Next in a bottom footer. Format
options as `NN · Topic: stage`. Disable Previous at the first step; replace Next
with Finish linking to the catalogue at the last. The thin footer progress rail
shows course position; keep it distinct from the operation timeline.

Let unmodified ArrowLeft/ArrowRight navigate while ignoring inputs, select,
textarea, buttons, and contenteditable targets. Ignore modified key combinations.
Remove the listener on unmount. Jumps select the requested snapshot directly; do
not replay all intervening steps.

Keep language state independent of navigation and camera; persist it when storage
is available and update the document language. Give icon buttons accessible names,
use visible focus outlines, and announce the stage heading politely. Explain
camera drag and hover in the scene. Leave course navigation usable if WebGL fails.

On touch-only devices, keep camera gestures and course navigation available and
put essential coordinates/results in the sidebar or authored persistent labels.
Do not depend on hover for learning the lesson, and do not silently add tap-to-select
scene behavior. Add another inspection gesture only when the user requests it.
Timeline descriptions must remain accessible through focus and ordinary text.
