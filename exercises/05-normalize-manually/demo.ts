import {
  AxesHelper,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import type { DemoContext } from "../../sandbox/types";
import {
  createLabel,
  createVectorArrow,
  disposeObject3D,
} from "../../sandbox/vector-visualization";

const VECTOR = new Vector3(3, 4, 0);
const NORMALIZED_VECTOR = VECTOR.clone().divideScalar(VECTOR.length());

export function mountDemo({
  scene,
  camera,
  controls,
}: DemoContext): () => void {
  const previousCameraPosition = camera.position.clone();
  const previousControlsTarget = controls.target.clone();
  camera.position.set(7, 6, 10);
  controls.target.set(1.7, 2.1, 0);
  controls.update();

  const axes = new AxesHelper(6);
  const originalArrow = createVectorArrow(VECTOR, {
    color: 0x4dd0e1,
    shaftRadius: 0.055,
    headLength: 0.55,
    headRadius: 0.22,
  });
  const normalizedArrow = createVectorArrow(NORMALIZED_VECTOR, {
    color: 0xffd166,
    shaftRadius: 0.095,
    headLength: 0.3,
    headRadius: 0.2,
  });

  originalArrow.traverse((object) => {
    if (object instanceof Mesh && object.material instanceof MeshStandardMaterial) {
      object.material.transparent = true;
      object.material.opacity = 0.42;
      object.material.depthWrite = false;
    }
  });

  const axisLabels = [
    createLabel("X", new Vector3(6.3, 0, 0), "#ff5b5b", "axis-label"),
    createLabel("Y", new Vector3(0, 6.3, 0), "#68e06f", "axis-label"),
    createLabel("Z", new Vector3(0, 0, 6.3), "#5b8cff", "axis-label"),
  ];
  const originalLabel = createLabel(
    "v = (3, 4, 0), |v| = 5",
    VECTOR.clone().add(new Vector3(0.2, 0.15, 0)),
    "#75e6f2",
  );
  const normalizedLabel = createLabel(
    "normalized = (0.6, 0.8, 0), |normalized| = 1",
    NORMALIZED_VECTOR.clone().add(new Vector3(0.25, -0.18, 0)),
    "#ffe08a",
  );
  const directionLabel = createLabel(
    "direction preserved",
    VECTOR.clone().multiplyScalar(0.52).add(new Vector3(0.2, -0.2, 0)),
    "#ffffff",
  );

  const demoObjects: Object3D[] = [
    axes,
    originalArrow,
    normalizedArrow,
    ...axisLabels,
    originalLabel,
    normalizedLabel,
    directionLabel,
  ];
  scene.add(...demoObjects);

  return () => {
    scene.remove(...demoObjects);
    axes.dispose();
    disposeObject3D(originalArrow);
    disposeObject3D(normalizedArrow);
    [...axisLabels, originalLabel, normalizedLabel, directionLabel].forEach(
      (label) => label.element.remove(),
    );
    camera.position.copy(previousCameraPosition);
    controls.target.copy(previousControlsTarget);
    controls.update();
  };
}
