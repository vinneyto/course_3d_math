# 12. Умножение матриц

При умножении матриц каждый элемент результата вычисляется как произведение строки первой матрицы на столбец второй:

```text
C[i][j] =
    A[i][0] * B[0][j]
  + A[i][1] * B[1][j]
  + A[i][2] * B[2][j]
```

Например:

```text
[ 1  2  0 ]   [ 2  0  0 ]   [ 2  6  0 ]
[ 0  1  0 ] * [ 0  3  0 ] = [ 0  3  0 ]
[ 0  0  1 ]   [ 0  0  1 ]   [ 0  0  1 ]
```

Three.js предоставляет несколько API:

```ts
new Matrix3().multiplyMatrices(a, b); // a * b
a.clone().multiply(b);               // a * b
a.clone().premultiply(b);            // b * a
```

## Задание

Реализуйте `multiplyMatrices(first, second)` через API `Matrix3`. Функция должна вернуть `first * second` и не изменить аргументы.

Запустите тесты упражнения:

```bash
npm test -- exercises/12-matrix-multiplication
```
