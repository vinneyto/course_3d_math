import { describe, expect, it } from "vitest";
import { createVector } from "./task";

describe("createVector", () => {
  it("creates Vector3(2, 3, 4)", () => {
    const vector = createVector();

    expect(vector.x).toBe(2);
    expect(vector.y).toBe(3);
    expect(vector.z).toBe(4);
  });
});
