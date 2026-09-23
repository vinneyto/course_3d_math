# 13. Higher-dimensional vectors and similarity

A vector need not have just two or three components. An array of `n` numbers is an **n-dimensional vector**. Its coordinates do not have to represent physical X, Y, and Z positions.

The dot product extends naturally to any positive dimension:

```text
a · b = Σ ai*bi                 (sum over matching components)
|a| = sqrt(Σ ai*ai)
cosineSimilarity(a, b) = (a · b) / (|a| |b|)
```

Both vectors must have the same dimension. The dot product is still a scalar and still commutative. Cosine similarity is undefined if either vector is zero. For nonzero inputs, `+1` means the same direction and `−1` the opposite direction; both are collinear. In similarity search we usually want a high **positive** similarity, not merely collinearity.

In machine learning, an **embedding** (a latent representation) is a vector of features produced by a trained model. For example, a model can map each face image to hundreds of numbers so that images of the same person tend to have similar representations. These are learned features: individual components generally do not have simple labels such as “nose length”.

One possible recognition pipeline compares a new image's embedding with stored embeddings using cosine similarity. Lighting, pose, training data, and the chosen threshold affect results. A high score is evidence of similarity, **not a probability or proof of identity**. Real systems require validation; this is a general educational example, not a description of Apple's Face ID.

## Task

Implement `dotProductND(a, b)` and `cosineSimilarity(a, b)` in [task.ts](./task.ts) using loops or array operations, without Three.js. Accept readonly arrays of finite numbers of equal, nonzero length. Throw `RangeError` for empty arrays, unequal lengths, or nonfinite components. `cosineSimilarity` must additionally reject zero vectors. Do not change the arrays. Tests use moderate magnitudes; handling floating-point overflow is outside this exercise.

Verify that multiplying an embedding by a positive scalar changes its raw dot product but not its cosine similarity. What happens for a negative scalar?

Run from the repository root:

```bash
npm test -- exercises/13-high-dimensional-vectors
```

## Visualization

Inspect synthetic six-dimensional embeddings as a table of **all six components**, not a misleading 3D projection. Choose a similar, orthogonal, opposite, or zero candidate and adjust its scale. Compare the raw dot product and cosine similarity. The numbers are hand-made teaching examples, not outputs of a face recognition model.

Run from the repository root:

```bash
npm run demo -- exercises/13-high-dimensional-vectors
```

---

[← Previous: 12. Diffuse lighting with the dot product](../12-diffuse-lighting/) | [Next: 14. Nested coordinate systems →](../14-local-vector-to-global/)
