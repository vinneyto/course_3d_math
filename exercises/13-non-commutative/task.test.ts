import { describe, expect, it } from "vitest";
import { Matrix3 } from "three";
import { multiplyInBothOrders } from "./task";

describe("multiplyInBothOrders", () => {
  it("shows that matrix multiplication is not commutative", () => {
    const matrixA = new Matrix3().set(2, 0, 0, 0, 1, 0, 0, 0, 1);
    const matrixB = new Matrix3().set(0, 1, 0, -1, 0, 0, 0, 0, 1);

    const { productAB, productBA } = multiplyInBothOrders(matrixA, matrixB);

    expect(productAB.toArray()).toEqual(
      new Matrix3().set(0, 2, 0, -1, 0, 0, 0, 0, 1).toArray(),
    );
    expect(productBA.toArray()).toEqual(
      new Matrix3().set(0, 1, 0, -2, 0, 0, 0, 0, 1).toArray(),
    );
    expect(productAB.equals(productBA)).toBe(false);
  });
});
