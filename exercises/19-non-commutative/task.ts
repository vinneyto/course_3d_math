import { Matrix3 } from "three";

export interface ProductsInBothOrders {
  productAB: Matrix3;
  productBA: Matrix3;
}

export function multiplyInBothOrders(
  matrixA: Matrix3,
  matrixB: Matrix3,
): ProductsInBothOrders {
  throw new Error("TODO: calculate A*B and B*A");
}
