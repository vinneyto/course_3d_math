# 12. Diffuse lighting with the dot product

A matte surface receives the most direct light when it faces the light source. At a grazing angle, the same beam spreads over a larger area. **Lambert's cosine law** models this using the normal from lesson 10 and the dot product from lesson 11.

At a surface point, let `N` be a unit outward normal and `L` a unit vector **from the surface toward the light**. Both must be expressed in the same coordinate system.

```text
intensity = max(0, N · L)
```

This is a dimensionless diffuse factor between `0` and `1`, not the complete final pixel color. A simple renderer multiplies it by the surface color and light strength. We omit ambient light, shadows, and distance attenuation in this exercise.

- `N` and `L` coincide: intensity `1`.
- They are perpendicular: intensity `0`.
- The light is behind the surface: the negative dot product is clamped to `0`.

Normalizing matters: longer input arrows must not make a surface brighter. The viewing direction is absent from this diffuse model. Moving the camera or placing it at the light source does **not** guarantee maximum intensity; the surface normal still matters. Specular highlights are a separate topic that also involves the viewing direction.

## Task

Implement `diffuseIntensity(normal, toLight)` in [task.ts](./task.ts). Normalize copies of both inputs, then clamp their dot product below at zero. Preserve the inputs. Throw `RangeError` if either vector is zero: a direction cannot be obtained from it.

Why does reversing the triangle winding potentially change its lighting?

Run from the repository root:

```bash
npm test -- exercises/12-diffuse-lighting
```

## Visualization

Rotate the light direction from 0° to 180° relative to the normal. Orbit the camera independently. The surface stays equally bright while only the camera moves. The labeled swatch shows the exact diffuse factor as grayscale; the surrounding arrows use the sandbox's usual lighting. The swatch deliberately bypasses those lights so no hidden ambient contribution changes the formula.

Run from the repository root:

```bash
npm run demo -- exercises/12-diffuse-lighting
```

---

[← Previous: 11. Dot product](../11-dot-product/) | [Next: 13. Higher-dimensional vectors and similarity →](../13-high-dimensional-vectors/)
