# Repository instructions

## Exercise visualizations

- Put each exercise visualization in `exercises/<exercise>/demo.ts` and export
  `mountDemo(context)`.
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
