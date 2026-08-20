import { AxesHelper, Object3D, Vector3 } from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  createLabel,
  createVectorArrow,
  disposeObject3D,
} from "../../sandbox/vector-visualization";

const BASIS_VECTORS = [
  {
    name: "X",
    vector: new Vector3(1, 0, 0),
    color: 0xff5b5b,
    cssColor: "#ff7878",
    labelOffset: new Vector3(0.18, 0.2, 0),
  },
  {
    name: "Y",
    vector: new Vector3(0, 1, 0),
    color: 0x68e06f,
    cssColor: "#80ee86",
    labelOffset: new Vector3(0.18, 0.12, 0),
  },
  {
    name: "Z",
    vector: new Vector3(0, 0, 1),
    color: 0x5b8cff,
    cssColor: "#7aa0ff",
    labelOffset: new Vector3(0.18, 0.2, 0),
  },
] as const;

export function mountDemo({
  scene,
  camera,
  controls,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(4, 3.2, 5);
  controls.target.set(0.35, 0.35, 0.35);
  controls.update();

  const axes = new AxesHelper(3.5);
  const basisArrows = BASIS_VECTORS.map(({ vector, color }) =>
    createVectorArrow(vector, {
      color,
      shaftRadius: 0.065,
      headLength: 0.3,
      headRadius: 0.17,
    }),
  );
  const axisLabels = [
    createLabel("+X", new Vector3(3.8, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("+Y", new Vector3(0, 3.8, 0), "#68e06f", "axis-label"),
    createLabel("+Z", new Vector3(0, 0, 3.8), "#5b8cff", "axis-label"),
  ];
  const basisLabels = BASIS_VECTORS.map(
    ({ name, vector, cssColor, labelOffset }) =>
      createLabel(
        `${name} = (${vector.x}, ${vector.y}, ${vector.z})`,
        vector.clone().add(labelOffset),
        cssColor,
      ),
  );
  const originLabel = createLabel(
    "(0, 0, 0)",
    new Vector3(-0.18, -0.18, -0.18),
    "#ffffff",
  );

  const demoObjects: Object3D[] = [
    axes,
    ...basisArrows,
    ...axisLabels,
    ...basisLabels,
    originLabel,
  ];
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    basisArrows.forEach(disposeObject3D);
    [...axisLabels, ...basisLabels, originLabel].forEach((label) =>
      label.element.remove(),
    );
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
