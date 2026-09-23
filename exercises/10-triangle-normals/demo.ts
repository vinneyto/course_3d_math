import { Vector3 } from "three";
import type { DemoContext } from "../../sandbox/types";
import { createLabel } from "../../sandbox/vector-visualization";
import { components, format, productDemo } from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "10 · Triangle normals");
  const height = ui.slider("Triangle height", 0, 3, 2, 0.1, render);
  const order = ui.select("Winding", ["A → B → C", "A → C → B"], render);
  const output = ui.readout();
  function render() {
    ui.clear();
    const a = new Vector3(-1, -0.5, 0),
      b = new Vector3(1, -0.5, 0),
      c = new Vector3(0, height() - 0.5, 0);
    const edge1 = (order() ? c : b).clone().sub(a),
      edge2 = (order() ? b : c).clone().sub(a);
    const areaVector = edge1.clone().cross(edge2),
      area = areaVector.length() / 2;
    ui.polygon(order() ? [a, c, b] : [a, b, c], 0x70ddcd);
    ui.arrow(order() ? "C · edge1" : "B · edge1", edge1, 0x75e6f2, a);
    ui.arrow(order() ? "B · edge2" : "C · edge2", edge2, 0xffd166, a);
    ui.content.add(
      createLabel("A", a.clone().add(new Vector3(-0.25, -0.35, 0)), "#ffffff"),
    );
    const centroid = a.clone().add(b).add(c).divideScalar(3);
    if (areaVector.length() > 1e-6)
      ui.arrow("normal", areaVector.clone().normalize(), 0xdba5ff, centroid);
    output(
      `A = ${components(a)}\nB = ${components(b)}\nC = ${components(c)}\nedge1 = ${components(edge1)}\nedge2 = ${components(edge2)}\n|edge1| = ${format(edge1.length())}\n|edge2| = ${format(edge2.length())}\nTriangle area = ${format(area)}\n${areaVector.length() > 1e-6 ? `normal = ${components(areaVector.normalize())}\n|normal| = 1` : "Degenerate: unit normal undefined."}`,
    );
  }
  render();
  return ui.dispose;
}
