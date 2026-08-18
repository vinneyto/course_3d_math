import {
  ArrowHelper,
  AxesHelper,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  Vector3,
} from "three";
import type { DemoContext } from "../../sandbox/types";

const VECTOR = new Vector3(2, 3, 4);

export function mountDemo({ scene }: DemoContext): () => void {
  const axes = new AxesHelper(5);

  const arrow = new ArrowHelper(
    VECTOR.clone().normalize(),
    new Vector3(),
    VECTOR.length(),
    0xffd166,
    0.45,
    0.24,
  );

  const componentPath = new Line(
    new BufferGeometry().setFromPoints([
      new Vector3(0, 0, 0),
      new Vector3(VECTOR.x, 0, 0),
      new Vector3(VECTOR.x, VECTOR.y, 0),
      VECTOR,
    ]),
    new LineBasicMaterial({ color: 0x8ecae6 }),
  );

  scene.add(axes, arrow, componentPath);

  return () => {
    scene.remove(axes, arrow, componentPath);
    axes.dispose();
    arrow.dispose();
    componentPath.geometry.dispose();
    componentPath.material.dispose();
  };
}
