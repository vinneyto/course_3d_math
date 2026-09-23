import type { DemoContext } from "../../sandbox/types";
import { format, productDemo } from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "13 · Similarity in six dimensions");
  ui.root.visible = false;
  ui.panel.classList.add("embedding-panel");
  const note = document.createElement("p");
  note.textContent =
    "Synthetic embeddings, not actual face data. Every coordinate participates; there is no 3D projection.";
  ui.panel.append(note);
  const candidate = ui.select(
    "Candidate",
    ["Similar direction", "Orthogonal", "Opposite direction", "Zero vector"],
    render,
  );
  const scale = ui.slider("Candidate scale", 0, 3, 1, 0.1, render);
  const table = document.createElement("table");
  const caption = table.createCaption();
  caption.textContent = "All six latent coordinates and their products";
  const head = table.createTHead().insertRow();
  for (const title of ["i", "aᵢ", "bᵢ", "aᵢ × bᵢ"]) {
    const th = document.createElement("th");
    th.scope = "col";
    th.textContent = title;
    head.append(th);
  }
  const body = table.createTBody();
  ui.panel.append(table);
  const output = ui.readout();
  function render() {
    const a = [1, 2, 0, -1, 1, 0.5];
    const choices = [
      [1.1, 1.8, 0.1, -0.9, 1.2, 0.4],
      [2, -1, 0, 0, 0, 0],
      a.map((x) => -x),
      [0, 0, 0, 0, 0, 0],
    ];
    const b = choices[candidate()].map((x) => x * scale());
    body.replaceChildren();
    a.forEach((value, i) => {
      const row = body.insertRow();
      for (const text of [
        String(i + 1),
        format(value),
        format(b[i]),
        format(value * b[i]),
      ])
        row.insertCell().textContent = text;
    });
    const dot = a.reduce((sum, x, i) => sum + x * b[i], 0);
    const lengthA = Math.hypot(...a),
      lengthB = Math.hypot(...b);
    output(
      `a · b = Σ aᵢbᵢ = ${format(dot)}\n|a| = ${format(lengthA)}\n|b| = ${format(lengthB)}\nCosine similarity = ${lengthB ? format(dot / (lengthA * lengthB)) : "undefined (zero vector)"}\n\nPositive scaling changes the raw dot product, but preserves cosine similarity.\nA score is not a probability of identity.`,
    );
  }
  render();
  return ui.dispose;
}
