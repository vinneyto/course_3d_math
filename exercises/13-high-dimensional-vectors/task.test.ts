import { describe, expect, it } from "vitest";
import { dotProductND, cosineSimilarity } from "./task";

describe("higher-dimensional products", () => {
  it("uses all six coordinates and leaves readonly inputs intact", () => {
    const a = Object.freeze([1, 2, 3, 4, 5, 6]),
      b = Object.freeze([6, 5, 4, 3, 2, 1]);
    expect(dotProductND(a, b)).toBe(56);
    expect(dotProductND(b, a)).toBe(56);
    expect(cosineSimilarity(a, b)).toBeCloseTo(56 / 91);
  });
  it("supports arbitrary positive dimensions", () => {
    expect(dotProductND([2], [3])).toBe(6);
    expect(dotProductND(Array(128).fill(1), Array(128).fill(2))).toBe(256);
  });
  it("compares direction independent of positive scale, including negative and orthogonal cases", () => {
    const a = [1, 2, 0, 0, 0, 1];
    expect(
      dotProductND(
        a,
        a.map((x) => 3 * x),
      ),
    ).toBe(18);
    expect(
      cosineSimilarity(
        a,
        a.map((x) => 3 * x),
      ),
    ).toBeCloseTo(1);
    expect(
      cosineSimilarity(
        a,
        a.map((x) => -2 * x),
      ),
    ).toBeCloseTo(-1);
    expect(cosineSimilarity(a, [2, -1, 0, 0, 0, 0])).toBeCloseTo(0);
  });
  it.each([dotProductND, cosineSimilarity])(
    "rejects invalid dimensions and components",
    (fn) => {
      for (const [a, b] of [
        [[], []],
        [[1], [1, 2]],
        [[NaN], [1]],
        [[1], [Infinity]],
        [[-Infinity], [1]],
      ]) {
        expect(() => fn(a, b)).toThrow(RangeError);
      }
    },
  );
  it("allows a zero raw product but rejects zero-vector cosine", () => {
    expect(dotProductND([0, 0], [1, 2])).toBe(0);
    expect(() => cosineSimilarity([0, 0], [1, 2])).toThrow(RangeError);
    expect(() => cosineSimilarity([1, 2], [0, 0])).toThrow(RangeError);
  });
});
