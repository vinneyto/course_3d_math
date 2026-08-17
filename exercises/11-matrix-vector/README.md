# 11. Умножение матрицы на вектор

В отрыве от применения матрицы могут выглядеть как игра с таблицами чисел. Но в 3D-графике они формализуют преобразования векторов и систем координат.

Математически вектор можно представить как матрицу с одним столбцом:

\[
v=\begin{bmatrix}x\\y\\z\end{bmatrix}
\]

Матрица умножается на вектор по правилу «строка на столбец»:

\[
\begin{bmatrix}1&2&0\\0&1&0\\0&0&1\end{bmatrix}
\begin{bmatrix}3\\4\\5\end{bmatrix}
=
\begin{bmatrix}
1\cdot3+2\cdot4+0\cdot5\\
0\cdot3+1\cdot4+0\cdot5\\
0\cdot3+0\cdot4+1\cdot5
\end{bmatrix}
=
\begin{bmatrix}11\\4\\5\end{bmatrix}
\]

В Three.js операция записывается так:

```ts
const result = vector.clone().applyMatrix3(matrix);
```

## Задание

Реализуйте `multiplyMatrixByVector(matrix, vector)`. Верните новый вектор и сохраните аргументы без изменений.
