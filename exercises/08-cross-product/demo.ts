import { Vector3 } from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  components,
  format,
  planarVector,
  productDemo,
} from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "8 · Cross product");
  const angle = ui.slider("Angle θ (degrees)", 0, 180, 60, 1, render);
  const lengthA = ui.slider("Length |a|", 0, 2, 2, 0.1, render);
  const lengthB = ui.slider("Length |b|", 0, 2, 1.5, 0.1, render);
  const order = ui.select("Order", ["a × b", "b × a"], render);
  const output = ui.readout();
  function render() {
    ui.clear();
    const a = new Vector3(lengthA(), 0, 0),
      b = planarVector(lengthB(), angle());
    const c = order() ? b.clone().cross(a) : a.clone().cross(b);
    ui.polygon([new Vector3(), a, a.clone().add(b), b], 0x70ddcd);
    ui.arrow("a", a, 0x75e6f2);
    ui.arrow("b", b, 0xffd166);
    ui.arrow(order() ? "b × a" : "a × b", c, 0xdba5ff);
    const theta =
      a.length() && b.length() ? `${angle()}°` : "undefined (zero input)";
    output(
      `a = ${components(a)}\nb = ${components(b)}\nθ = ${theta}\n${order() ? "b × a" : "a × b"} = ${components(c)}\nArea = |result| = ${format(c.length())}\n|a| |b| sin θ = ${a.length() && b.length() ? format(a.length() * b.length() * Math.sin((angle() * Math.PI) / 180)) : "undefined θ; area is 0"}${c.length() < 1e-8 ? "\nZero vector: no direction." : "\nSwap order: same area, opposite direction."}`,
    );
  }
  render();
  return ui.dispose;
}
