import {
  AxesHelper,
  BufferGeometry,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshStandardMaterial,
  Vector3,
} from "three";
import type { DemoContext } from "./types";
import {
  createLabel,
  createVectorArrow,
  disposeObject3D,
} from "./vector-visualization";

export const format = (n: number): string =>
  (Math.abs(n) < 0.0005 ? 0 : n).toFixed(3);
export const components = (v: Vector3): string =>
  `(${v.toArray().map(format).join(", ")})`;

/** Shared UI/lifecycle only; each lesson owns its mathematics and scene. */
export function productDemo(context: DemoContext, title: string) {
  const { scene, camera, controls } = context;
  const oldCamera = camera.position.clone(),
    oldTarget = controls.target.clone();
  camera.position.set(7, 5, 9);
  controls.target.set(0.5, 0.5, 0);
  controls.update();
  const root = new Group();
  const content = new Group();
  const axes = new AxesHelper(3.6);
  root.add(axes, content);
  root.add(createLabel("+X", new Vector3(3.8, 0, 0), "#ff7878", "axis-label"));
  root.add(createLabel("+Y", new Vector3(0, 3.8, 0), "#80ee86", "axis-label"));
  root.add(createLabel("+Z", new Vector3(0, 0, 3.8), "#7aa0ff", "axis-label"));
  scene.add(root);
  const panel = document.createElement("section");
  panel.className = "product-panel";
  panel.setAttribute("aria-label", title);
  const heading = document.createElement("h1");
  heading.textContent = title;
  panel.append(heading);
  document.body.append(panel);
  const cleanups: (() => void)[] = [];

  function select(label: string, choices: string[], changed: () => void) {
    const row = document.createElement("label");
    row.textContent = label;
    const input = document.createElement("select");
    choices.forEach((text, i) => {
      const option = document.createElement("option");
      option.value = String(i);
      option.textContent = text;
      input.append(option);
    });
    input.addEventListener("change", changed);
    cleanups.push(() => input.removeEventListener("change", changed));
    row.append(input);
    panel.append(row);
    return () => Number(input.value);
  }
  function slider(
    label: string,
    min: number,
    max: number,
    initial: number,
    step: number,
    changed: () => void,
  ) {
    const row = document.createElement("label");
    const caption = document.createElement("span");
    const input = document.createElement("input");
    input.type = "range";
    input.min = String(min);
    input.max = String(max);
    input.step = String(step);
    input.value = String(initial);
    input.setAttribute("aria-label", label);
    const updateCaption = () => {
      caption.textContent = `${label}: ${input.value}`;
    };
    const onInput = () => {
      updateCaption();
      changed();
    };
    updateCaption();
    input.addEventListener("input", onInput);
    cleanups.push(() => input.removeEventListener("input", onInput));
    row.append(caption, input);
    panel.append(row);
    return () => Number(input.value);
  }
  function readout() {
    const output = document.createElement("pre");
    output.className = "product-readout";
    panel.append(output);
    return (text: string) => {
      output.textContent = text;
    };
  }
  function clear() {
    disposeObject3D(content);
    content.clear();
  }
  function arrow(
    name: string,
    v: Vector3,
    color: number,
    origin = new Vector3(),
  ) {
    // Never manufacture an arrowhead for a zero vector. Scale short arrowheads too.
    const length = v.length();
    if (length < 1e-8) return;
    content.add(
      createVectorArrow(v, {
        color,
        origin,
        shaftRadius: 0.025,
        headLength: Math.min(0.22, length * 0.3),
        headRadius: Math.min(0.1, length * 0.14),
      }),
    );
    content.add(
      createLabel(
        name,
        origin
          .clone()
          .add(v)
          .add(new Vector3(0.08, 0.1, 0)),
        `#${color.toString(16).padStart(6, "0")}`,
      ),
    );
  }
  function polygon(vertices: Vector3[], color: number) {
    const geometry = new BufferGeometry();
    geometry.setAttribute(
      "position",
      new Float32BufferAttribute(
        vertices.flatMap((v) => v.toArray()),
        3,
      ),
    );
    geometry.setIndex(vertices.length === 4 ? [0, 1, 2, 0, 2, 3] : [0, 1, 2]);
    geometry.computeVertexNormals();
    const mesh = new Mesh(
      geometry,
      new MeshStandardMaterial({
        color,
        side: DoubleSide,
        transparent: true,
        opacity: 0.32,
        depthWrite: false,
        roughness: 0.65,
      }),
    );
    content.add(mesh);
  }
  function dispose() {
    cleanups.forEach((cleanup) => cleanup());
    clear();
    root.remove(axes);
    axes.dispose();
    disposeObject3D(root);
    scene.remove(root);
    panel.remove();
    camera.position.copy(oldCamera);
    controls.target.copy(oldTarget);
    controls.update();
  }
  return {
    root,
    content,
    panel,
    select,
    slider,
    readout,
    clear,
    arrow,
    polygon,
    dispose,
  };
}

export function planarVector(length: number, degrees: number): Vector3 {
  const radians = (degrees * Math.PI) / 180;
  // Exact endpoints make parallel-vector states visually and numerically explicit.
  return new Vector3(
    length * Math.cos(radians),
    degrees === 0 || degrees === 180 ? 0 : length * Math.sin(radians),
    0,
  );
}
