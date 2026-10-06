import { describe, expect, it } from "vitest";
import { snapshots } from "./snapshots";
import { lessons } from "./content";
import { orientation } from "./state";
import { worldPoint, blendScene, modelOrientation } from "./transition";
import { eulerQuaternion, interpolation } from "./math";

const scene = (id: string) => snapshots.find((step) => step.id === id)!.scene;
describe("authored manual snapshots", () => {
  it("covers every topic in both languages with immutable, unique destinations", () => {
    expect(new Set(snapshots.map((step) => step.id)).size).toBe(
      snapshots.length,
    );
    expect(new Set(snapshots.map((step) => step.topic)).size).toBe(22);
    expect(lessons.en.length).toBe(snapshots.length);
    expect(lessons.ru.length).toBe(snapshots.length);
    expect(snapshots.length).toBeGreaterThan(22);
    for (const step of snapshots) {
      expect(Object.isFrozen(step.scene)).toBe(true);
      expect(Object.isFrozen(step.scene.angles)).toBe(true);
      expect(step.scene.visual).toBeUndefined();
    }
  });
  it("changes the representation without changing Object3D orientation", () => {
    expect(
      orientation(scene("object-euler")).angleTo(
        orientation(scene("object-quaternion")),
      ),
    ).toBeLessThan(1e-7);
    worldPoint(scene("compute-90"))
      .toArray()
      .forEach((value, index) => {
        expect(value).toBeCloseTo([2, 3, 0][index], 10);
      });
  });
  it("shows independent angle movement as well as cancellation at the singularity", () => {
    const a = orientation(scene("gimbal-independent-0"));
    expect(
      a.angleTo(orientation(scene("gimbal-independent-1"))),
    ).toBeGreaterThan(0.4);
    expect(a.angleTo(orientation(scene("gimbal-independent-2")))).toBeLessThan(
      1e-7,
    );
    expect(
      orientation(scene("gimbal-90-0.5")).angleTo(
        orientation(scene("gimbal-90-1")),
      ),
    ).toBeLessThan(1e-7);
    expect(
      orientation(scene("gimbal-80-0.5")).angleTo(
        orientation(scene("gimbal-80-1")),
      ),
    ).toBeGreaterThan(0.1);
  });
  it("keeps gimbal rings, displayed angles and orientation consistent between frames", () => {
    const middle = blendScene(
      scene("gimbal-80-0.5"),
      scene("gimbal-80-1"),
      0.5,
    );
    expect(
      orientation(middle).angleTo(eulerQuaternion(middle.visual!.gimbalAngles)),
    ).toBeLessThan(1e-7);
    const compound = blendScene(
      scene("slerp-compound-0.25"),
      scene("slerp-compound-0.5"),
      0.5,
    );
    expect(
      modelOrientation(compound).angleTo(interpolation(compound.t, true).euler),
    ).toBeLessThan(1e-7);
  });
  it("retargets an interrupted entrance without snapping onto the new example's path", () => {
    for (const [first, next] of [
      ["gimbal-90-0.5", "gimbal-90-0.75"],
      ["slerp-compound-0.25", "slerp-compound-0.5"],
    ]) {
      const visible = blendScene(scene("cube-30"), scene(first), 0.4);
      const retargeted = blendScene(visible, scene(next), 0);
      expect(
        orientation(visible).angleTo(orientation(retargeted)),
      ).toBeLessThan(1e-7);
      expect(
        modelOrientation(visible).angleTo(modelOrientation(retargeted)),
      ).toBeLessThan(1e-7);
      expect(
        worldPoint(visible).distanceTo(worldPoint(retargeted)),
      ).toBeLessThan(1e-7);
    }
  });
});
