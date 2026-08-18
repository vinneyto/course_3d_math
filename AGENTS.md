# Repository instructions

## Exercise visualizations

- Put each exercise visualization in `exercises/<exercise>/demo.ts` and export
  `mountDemo(context)`.
- Make every mathematical value visible and readable. Label coordinate axes and
  label vector components, projections, angles, or other quantities demonstrated
  by the lesson.
- Follow the conventional coordinate colors: X is red, Y is green, and Z is blue.
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
