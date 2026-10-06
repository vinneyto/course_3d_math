import { describe, expect, it } from "vitest";
import { Vector3 } from "three";
import { initialState, orientation } from "./state";
import { blendScene, modelOrientation, worldPoint } from "./transition";

describe("continuous scene transitions", () => {
  it("rotates along an arc with an orthonormal basis, rather than cutting through the circle", () => {
    const from = {
      ...initialState,
      point: [2, 0, 0] as [number, number, number],
    };
    const to = { ...from, angles: [0, 0, 90] as [number, number, number] };
    const middle = blendScene(from, to, 0.5);
    expect(
      worldPoint(middle).distanceTo(new Vector3(Math.SQRT2, Math.SQRT2, 0)),
    ).toBeLessThan(1e-12);
    expect(worldPoint(middle).length()).toBeCloseTo(2, 12);
    expect(orientation(middle).length()).toBeCloseTo(1, 12);
    expect(blendScene(from, to, 1)).toBe(to);
  });
  it("interrupts from the visible position, orientation and visibility, including reverse navigation", () => {
    const to = {
      ...initialState,
      mode: "cube" as const,
      dimension: 3 as const,
      origin: [3, 1, 0] as [number, number, number],
      angles: [60, 30, 0] as [number, number, number],
    };
    const current = blendScene(initialState, to, 0.4);
    const reverse = blendScene(current, initialState, 0);
    expect(worldPoint(reverse).distanceTo(worldPoint(current))).toBeLessThan(
      1e-12,
    );
    expect(orientation(reverse).angleTo(orientation(current))).toBeLessThan(
      1e-7,
    );
    expect(reverse.visual!.visibility).toEqual(current.visual!.visibility);
    expect(reverse.cameraPosition).toEqual(current.cameraPosition);
    const middle = blendScene(current, initialState, 0.5);
    expect(middle.visual!.visibility.cube).toBeLessThan(
      current.visual!.visibility.cube,
    );
  });
  it("preserves the visible Euler comparison when leaving an interpolated example", () => {
    const from = {
      ...initialState,
      mode: "model" as const,
      panel: "interpolation" as const,
      t: 0.4,
    };
    const start = blendScene(from, { ...initialState, panel: "quaternion" }, 0);
    expect(
      modelOrientation(start).angleTo(modelOrientation(from)),
    ).toBeLessThan(1e-7);
    expect(worldPoint(start).distanceTo(worldPoint(from))).toBeLessThan(1e-12);
  });
});
