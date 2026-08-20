# 14. Перевод локального вектора через Matrix3

Вернёмся к системе координат секундной стрелки. Её базис, выраженный в глобальных координатах, можно записать в столбцы матрицы:

```text
                      [ X.x  Y.x  Z.x ]
localToGlobalMatrix = [ X.y  Y.y  Z.y ]
                      [ X.z  Y.z  Z.z ]
```

Для поворота на 90° по часовой стрелке:

```text
                      [  0  1  0 ]
localToGlobalMatrix = [ -1  0  0 ]
                      [  0  0  1 ]
```

Умножим её на локальный вектор:

```text
globalVector = localToGlobalMatrix * localVector

[  0  1  0 ]   [ 2 ]   [  6 ]
[ -1  0  0 ] * [ 6 ] = [ -2 ]
[  0  0  1 ]   [ 0 ]   [  0 ]
```

Это тот же результат, который давала функция `localVectorToGlobal()` из
упражнения 8. Она выполняла преобразование без матрицы:

```text
globalVector = localVector.x * X
             + localVector.y * Y
             + localVector.z * Z
```

Таким образом, эти две операции эквивалентны:

```text
globalVector = localVectorToGlobal(localVector, X, Y, Z)
globalVector = localToGlobalMatrix * localVector
```

В первом случае базис передаётся как три отдельных вектора, а во втором — как
матрица, в столбцах которой записаны те же векторы `X`, `Y`, `Z`. Умножение
матрицы на вектор не является новой магической операцией. Оно формализует уже
знакомую линейную комбинацию базисных векторов.

## Задание

Реализуйте `localVectorToGlobalWithMatrix(localVector, localToGlobalMatrix)` через `applyMatrix3()`.

Функция должна вернуть новый глобальный вектор и не изменить локальный.
