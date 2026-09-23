# 10. Triangle normals from vertices

A **normal** is a vector perpendicular to a surface. For a flat triangle it is perpendicular to the triangle's plane. Normals describe surface orientation and are used for lighting and deciding which side of a surface we are looking at. A **unit normal** has length `1`.

A vertex is a point: a location in space. Subtracting two vertex positions gives an edge vector. This is a first practical look at points; lesson 21 will explore the distinction between points and vectors in more detail.

For triangle vertices `A, B, C` in the intended winding order:

```text
edge1 = B − A
edge2 = C − A
areaVector = edge1 × edge2
normal = normalize(areaVector)
triangleArea = |areaVector| / 2
```

The edges need not be perpendicular. Both must start at the same vertex. Translating all three vertices by the same amount leaves the edge vectors and normal unchanged.

For `A = (0, 0, 0)`, `B = (2, 0, 0)`, `C = (1, 2, 0)`, the normal is `(0, 0, 1)` and the area is `2`. Viewed from the tip of that normal toward the triangle, `A → B → C` is counterclockwise. Swapping `B` and `C` reverses the winding and normal. Winding determines which of the two normal directions is selected; it does not by itself tell us what is physically “outside” an arbitrary mesh.

Collinear or repeated vertices form a **degenerate triangle**: area is zero and a unit normal is undefined. In this exercise, reject an area-vector length `≤ 1e-6` (an absolute tolerance in squared coordinate units).

This computes a **face normal**. Smooth shading often uses per-vertex normals averaged from adjacent faces; at sharp edges those normals may deliberately differ. We are not computing smooth vertex normals here.

## Task

Implement `triangleNormal(a, b, c)` in [task.ts](./task.ts). Return a new unit `Vector3`, preserve inputs, and throw `RangeError` for the degenerate cases described above. Use subtraction, cross product, and normalization.

Predict the effect of swapping the last two vertices and of translating the whole triangle by `(5, −2, 3)`.

Run from the repository root:

```bash
npm test -- exercises/10-triangle-normals
```

## Visualization

Reverse **A → B → C / A → C → B** and change the triangle height, including zero. The translucent triangle, edge arrows, and normal show the winding change. The normal starts at the centroid for readability; moving its origin does not change its direction. Vertex coordinates, edge components, area, and normal are shown in the panel.

Run from the repository root:

```bash
npm run demo -- exercises/10-triangle-normals
```

---

[← Previous: 9. Building an orthonormal basis](../09-build-orthonormal-basis/) | [Next: 11. Dot product →](../11-dot-product/)
