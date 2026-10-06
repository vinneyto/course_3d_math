import { TorusKnotGeometry, Vector3 } from "three";

export const createKnotGeometry = (): TorusKnotGeometry =>
  new TorusKnotGeometry(0.85, 0.25, 112, 20);

// The highlighted marker and its trajectory use a real geometry vertex.
const sample = createKnotGeometry();
export const modelVertex = new Vector3()
  .fromBufferAttribute(sample.getAttribute("position"), 0)
  .toArray();
sample.dispose();
