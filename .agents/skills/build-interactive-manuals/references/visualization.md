# Scene, coordinate helpers, and hover inspection

## Contents

- Environment and objects
- Axes and coordinates
- Rotation sectors and rings
- Projected labels and tooltips
- Interaction and continuity checks

## Environment and objects

Use classic WebGLRenderer through a persistent R3F Canvas, antialiasing and a
reasonable DPR cap (reference 1–1.75). Use OrbitControls with a stable target,
bounded zoom (reference distance 4–25), and camera reset. Start with a perspective
camera around 45° FOV and near/far bounds appropriate for the authored scene.

Use a calm gradient sky that follows the camera, hemisphere lighting, and a
directional key light. Use lit meshStandardMaterial geometry with enough segments
for round cylinders, cones, spheres, and models. A built-in TorusKnotGeometry is
a useful complex model without external asset loading; do not assume a monkey
head exists in the standard Three.js library.

Draw a subdued XY grid for a 2D scene (small negative Z offset) and an XZ floor
grid for 3D (reference Y = −1.6). Reuse geometries across surface, wireframe and
vertex representations. Select highlighted vertices from the actual geometry
buffer so trajectory curves and markers correspond to real model points.

## Axes and coordinates

Color local X red, Y green, Z blue. Draw axes as cylindrical shafts and conical
heads with readable projected labels X/Y/Z. Draw world axes in muted blue-gray
with Xw/Yw/Zw labels so local and global frames remain distinguishable. Label the
local origin/translation T; do not confuse it with a basis vector or rotation.

Transform basis endpoints with the displayed rotation and add the origin. Use
proper vector length/direction for shafts and heads. Omit a zero-length arrow.
Show only dimensions and helpers relevant to the current explanation; retaining
axes does not imply that every angular sector or construction must also appear.

For point tooltips, show the point's local and world coordinates separately.
For vector tooltips, show its name, start coordinate, end coordinate on another
line, and length. For model inspection, convert the hit point through the actual
inverse world transform and show local/world values. Format tiny numerical zero
without negative-zero noise and keep units explicit.

For vector-component constructions, use an axis-aligned path such as origin to
(x,0,0), then (x,y,0), then (x,y,z). For basis-coordinate expansion, show each
basis vector multiplied by the corresponding local coordinate and add T. Draw
rotation trajectories using the actual rotating point around its chosen origin,
with the authored reference orientation rather than an assumed zero-angle start.

## Rotation sectors and rings

Introduce semitransparent swept sectors only when explaining angular motion.
Suppress them on early basis/orthonormality and introductory reset steps if they
would confuse the learner. Keep explicit visibility in the snapshot.

Draw a signed angular sector with its starting ray, ending ray, and boundary
arc. Use the rotation axis color, low fill opacity (reference 0.19), thin brighter
boundary lines, DoubleSide, and depthWrite false. Update a fixed segmented buffer
(reference 64 segments) instead of remounting geometry each frame. Hide empty
sectors at approximately zero angle.

Place each intrinsic Euler sector in the frame produced by all preceding turns.
For XYZ, use identity for X, Rx for Y, and Rx·Ry for Z. Do not orient all three
sectors with the final object basis. Use slightly different radii when useful
for legibility (reference 2.15, 1.95, 1.75 in operation order). Retain the visible
order/radii through a reset, and change decomposition only at identity.

Keep the saved first rotation axis fixed when demonstrating gimbal lock. At
XYZ Y = +90°, the third rotation axis aligns with the original first X axis;
the final current X/Z basis remains perpendicular. Align compensation sectors
to a common physical reference ray. Show their individual turns, then hide swept
sectors when simultaneous changes yield no net model rotation. Keep graphs and
timeline moving. If rings are requested, introduce them after the simpler basis
demonstration and repeat that same sequence with moving ring frames.

## Projected labels and tooltips

Use an effect-owned DOM overlay projected through the camera, or an equivalent
DOM label primitive that preserves the same behavior. Keep text readable while
orbiting, update anchors using the object's actual matrixWorld, and hide labels
outside the camera depth range or within a fully hidden ancestor.

Use small monospace labels on translucent dark backgrounds; make scene tooltips
slightly larger with a solid dark fill, thin border, rounded corners, and a bold
name. Allow long text to wrap. Reference width is 210 px, capped to canvas width
minus 16 px. Place the tooltip above its projected anchor and clamp it with its
measured width/height and an 8 px edge margin; do not use a fixed estimated width
or rely on clipping overflowing coordinate text.

Keep label overlays pointer-events none so they do not block camera interaction.
Use ordinary cursors, not help/question-mark cursors. Show tooltips by hover;
force a point-coordinate tooltip only for introductory steps that explicitly
need it. Keep hover state separate from mathematical state and dispose overlay
nodes on unmount.

## Interaction and continuity checks

Exclude invisible mounted objects and hidden ancestors from hover raycasts.
Handle pointer-over and pointer-move on model surfaces and stop propagation so
an axis behind a model does not steal hover. Clear inspection on pointer-out;
leave visible world/local axes inspectable when they are not occluded.

Check numerical and geometric continuity separately: persistent renderer and
geometry, current transforms, world coordinates, visible Euler order, sector
frames/radii, and helper opacities. Test both sides of a transition and rapid
retargeting. In comparison scenes, match each trajectory/readout to its specific
model. Camera inspection and hovering must not alter lesson parameters.
