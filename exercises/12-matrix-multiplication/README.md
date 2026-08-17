# 12. Умножение матриц

При умножении матриц каждый элемент результата вычисляется как произведение строки первой матрицы на столбец второй:

\[
C_{ij}=A_{i1}B_{1j}+A_{i2}B_{2j}+A_{i3}B_{3j}
\]

Например:

\[
\begin{bmatrix}1&2&0\\0&1&0\\0&0&1\end{bmatrix}
\begin{bmatrix}2&0&0\\0&3&0\\0&0&1\end{bmatrix}
=
\begin{bmatrix}2&6&0\\0&3&0\\0&0&1\end{bmatrix}
\]

Three.js предоставляет несколько API:

```ts
new Matrix3().multiplyMatrices(a, b); // a * b
a.clone().multiply(b);               // a * b
a.clone().premultiply(b);            // b * a
```

## Задание

Реализуйте `multiplyMatrices(first, second)` через API `Matrix3`. Функция должна вернуть `first * second` и не изменить аргументы.
