import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  Vector3,
} from "three";
import type { DemoContext } from "../../sandbox/types";
import { createLabel } from "../../sandbox/vector-visualization";
import { components, format, productDemo } from "../../sandbox/product-demo";

export function mountDemo(context: DemoContext): () => void {
  const ui = productDemo(context, "12 · Diffuse lighting");
  const angle = ui.slider("Angle N to L (degrees)", 0, 180, 45, 1, render);
  const output = ui.readout();
  function render() {
    ui.clear();
    const radians = (angle() * Math.PI) / 180;
    const n = new Vector3(0, 0, 1),
      l = new Vector3(Math.sin(radians), 0, Math.cos(radians));
    const dot = n.dot(l),
      intensity = Math.max(0, dot);
    // This flat swatch is the mathematical output, not a solid object shaded by sandbox lights.
    const surface = new Mesh(
      new PlaneGeometry(3, 2),
      new MeshBasicMaterial({
        color: 0xffffff,
        side: DoubleSide,
        toneMapped: false,
      }),
    );
    surface.material.color.setRGB(intensity, intensity, intensity);
    ui.content.add(surface);
    ui.arrow("N", n, 0xdba5ff);
    ui.arrow("L (unit)", l, 0xffd166);
    ui.content.add(
      createLabel(
        `Diffuse factor = ${format(intensity)}`,
        new Vector3(0, -1.2, 0),
        "#ffffff",
      ),
    );
    output(
      `N = ${components(n)}\nL = ${components(l)}\n|N| = |L| = 1\nθ = ${angle()}°\nN · L = ${format(dot)}\nmax(0, N · L) = ${format(intensity)}\n\nOrbit the camera: intensity is unchanged.\nThe swatch represents this side's factor, even when viewed from behind.\nNo ambient light or distance falloff.`,
    );
  }
  render();
  return ui.dispose;
}
