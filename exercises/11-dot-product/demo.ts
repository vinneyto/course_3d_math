import { Vector3 } from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  components,
  format,
  planarVector,
  productDemo,
} from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "11 · Dot product");
  const angle = ui.slider("Angle θ (degrees)", 0, 180, 60, 1, render);
  const lengthA = ui.slider("Input |a|", 0, 3, 2, 0.1, render);
  const lengthB = ui.slider("Input |b|", 0, 3, 1.5, 0.1, render);
  const normalized = ui.select(
    "Inputs",
    ["Original lengths", "Normalize both"],
    render,
  );
  const order = ui.select("Order", ["a · b", "b · a"], render);
  const output = ui.readout();
  function render() {
    ui.clear();
    const a = new Vector3(lengthA(), 0, 0),
      b = planarVector(lengthB(), angle());
    const hasDirections = a.length() > 0 && b.length() > 0;
    if (normalized() && !hasDirections) {
      output(
        "Cannot normalize a zero vector.\nChoose nonzero lengths or original inputs.",
      );
      return;
    }
    const cosine = hasDirections
      ? a.dot(b) / (a.length() * b.length())
      : undefined;
    if (normalized()) {
      a.normalize();
      b.normalize();
    }
    ui.arrow("a", a, 0x75e6f2);
    ui.arrow("b", b, 0xffd166);
    output(
      `a = ${components(a)}\nb = ${components(b)}\n|a| = ${format(a.length())}\n|b| = ${format(b.length())}\nθ = ${hasDirections ? `${angle()}°` : "undefined"}\n${order() ? "b · a" : "a · b"} = ${format(order() ? b.dot(a) : a.dot(b))}\ncos θ = ${cosine === undefined ? "undefined (zero input)" : format(cosine)}\nThe result is a number, not an arrow.`,
    );
  }
  render();
  return ui.dispose;
}
