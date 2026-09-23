import { Euler, Vector3 } from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  components,
  format,
  planarVector,
  productDemo,
} from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "9 · Construct a basis");
  const angle = ui.slider("Angle of b (degrees)", 0, 180, 60, 1, render);
  const tilt = ui.slider("Plane tilt (degrees)", -90, 90, 25, 1, render);
  const output = ui.readout();
  function render() {
    ui.clear();
    const a = new Vector3(2, 0, 0),
      b = planarVector(2, angle());
    const rotation = new Euler((tilt() * Math.PI) / 180, 0.4, 0.25);
    a.applyEuler(rotation);
    b.applyEuler(rotation);
    ui.arrow("a", a, 0x75e6f2);
    ui.arrow("b", b, 0xffd166);
    const x = a.clone().normalize(),
      z = x.clone().cross(b.clone().normalize());
    if (z.length() <= 1e-6) {
      output(
        `a = ${components(a)}\nb = ${components(b)}\nNo unique basis: parallel inputs.`,
      );
      return;
    }
    z.normalize();
    const y = z.clone().cross(x);
    ui.arrow("x", x, 0xff7878);
    ui.arrow("y", y, 0x80ee86);
    ui.arrow("z", z, 0x7aa0ff);
    output(
      `a = ${components(a)}\nb = ${components(b)}\nx = ${components(x)}\ny = ${components(y)}\nz = ${components(z)}\n|x| = ${format(x.length())}\n|y| = ${format(y.length())}\n|z| = ${format(z.length())}\nx · y = ${format(x.dot(y))}\ny · z = ${format(y.dot(z))}\nz · x = ${format(z.dot(x))}\nx × y = z\nThe direction of b is replaced.`,
    );
  }
  render();
  return ui.dispose;
}
