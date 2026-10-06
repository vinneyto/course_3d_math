# Rotation manual: step consolidation

The 104-step course is consolidated into 58 snapshots. Values between destinations remain visible during forward and reverse scene transitions. A change in an independent operation (especially Euler X, Y and Z turns) remains a separate destination.

The matrix and coordinate demonstrations now share X rotations, local P = (2, 1, 1), and T = (3, 1, 0). Their original X/Z examples are normalized to this common geometry. Origin and axis points are shown together; model edges and vertices are shown together. The duplicate single-axis interpolation pass is included in the first Euler/SLERP comparison. Quaternion values and their matrix are shown together.

Original numbers refer to the course before this change. Each original step occurs exactly once below.

| New step | Snapshot                                                | Original steps | Original snapshot IDs                                                      |
| -------- | ------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- |
| 1        | Локальная и мировая системы совпадают                   | 1              | `local-z-0`                                                                |
| 2        | Получаем круговую траекторию точки                      | 2, 3, 4        | `local-z-15`, `local-z-30`, `local-z-45`                                   |
| 3        | Смещаем локальный центр вращения                        | 5, 6           | `origin-0.5`, `origin-1`                                                   |
| 4        | Укладываем базис в матрицу и применяем её               | 7, 8, 15       | `basis-symbolic`, `basis-0`, `compute-0`                                   |
| 5        | 90°: единицы переходят в другие строки                  | 9, 17          | `basis-90`, `compute-90`                                                   |
| 6        | 180°: Y и Z меняют направление                          | 10             | `basis-180`                                                                |
| 7        | Возвращаемся к 0° перед малыми поворотами               | 11             | `basis-reset`                                                              |
| 8        | 45°: сравниваем матрицу и мировую координату            | 12, 13, 14, 16 | `basis-15`, `basis-30`, `basis-60`, `compute-45`                           |
| 9        | Помещаем точки в начало и на X                          | 18, 21         | `zero-0`, `axis-point-90`                                                  |
| 10       | Поворачиваем систему: обе точки неподвижны              | 19, 20, 22     | `zero-45`, `zero-90`, `axis-point-135`                                     |
| 11       | Смещаем точку с оси без поворота                        | 23             | `local-recap-offset`                                                       |
| 12       | Поворачиваем систему: точка вне оси движется            | 24, 25         | `local-recap-40`, `local-recap-80`                                         |
| 13       | Задаём восьми вершинам одну систему                     | 26             | `cube-0`                                                                   |
| 14       | Вершины образуют вращающийся куб                        | 27, 28         | `cube-15`, `cube-30`                                                       |
| 15       | Рассматриваем поверхность модели                        | 29             | `model-0`                                                                  |
| 16       | Показываем рёбра и вершины вместе                       | 30, 31         | `model-1`, `model-2`                                                       |
| 17       | Возвращаем поверхность и проверяем базис вращения       | 32, 33         | `model-3`, `conditions-0`                                                  |
| 18       | Изменение деформирует модель                            | 34, 35         | `conditions-1`, `conditions-2`                                             |
| 19       | Возвращаем чистое вращение                              | 36             | `conditions-3`                                                             |
| 20       | Выбираем ось X                                          | 37             | `axis-X-0`                                                                 |
| 21       | Увеличиваем сектор вокруг X                             | 38, 39         | `axis-X-30`, `axis-X-60`                                                   |
| 22       | Выбираем ось Y                                          | 40             | `axis-Y-0`                                                                 |
| 23       | Увеличиваем сектор вокруг Y                             | 41, 42         | `axis-Y-30`, `axis-Y-60`                                                   |
| 24       | Выбираем ось Z                                          | 43             | `axis-Z-0`                                                                 |
| 25       | Увеличиваем сектор вокруг Z                             | 44, 45         | `axis-Z-30`, `axis-Z-60`                                                   |
| 26       | Начинаем с единичного вращения                          | 46             | `euler-0`                                                                  |
| 27       | Применяем первый угол Эйлера                            | 47             | `euler-1`                                                                  |
| 28       | Добавляем второй угол Эйлера                            | 48             | `euler-2`                                                                  |
| 29       | Добавляем третий угол Эйлера                            | 49             | `euler-3`                                                                  |
| 30       | Возвращаем ту же модель к началу для YXZ                | 50             | `order-0`                                                                  |
| 31       | YXZ: сначала поворачиваем вокруг Y                      | 51             | `order-1`                                                                  |
| 32       | YXZ: затем вокруг повёрнутой X                          | 52             | `order-2`                                                                  |
| 33       | YXZ: добавляем Z и сравниваем результат                 | 53             | `order-3`                                                                  |
| 34       | У углов Эйлера есть недостатки                          | 54             | `gimbal-intro`                                                             |
| 35       | Начинаем с базиса и сохраняем X₀                        | 55, 56         | `gimbal-start`, `gimbal-remember-x`                                        |
| 36       | Поворачиваем вокруг X на +30°                           | 57             | `gimbal-x30`                                                               |
| 37       | Поворачиваем локальную Y на 90°: Z совпала с X₀         | 58, 59, 60     | `gimbal-y45`, `gimbal-y90`, `gimbal-align`                                 |
| 38       | Z = −30° полностью отменяет поворот X                   | 61, 62, 63     | `gimbal-z-ready`, `gimbal-z-minus15`, `gimbal-z-minus30`                   |
| 39       | Обнуляем X и Z: ориентация сохраняется                  | 64, 65         | `gimbal-equivalent`, `gimbal-cancel-ready`                                 |
| 40       | X растёт, Z убывает: модель неподвижна                  | 66, 67         | `gimbal-cancel45`, `gimbal-cancel90`                                       |
| 41       | Повторяем с кольцами и сохранённой X₀                   | 68, 69         | `gimbal-rings-start`, `gimbal-rings-remember-x`                            |
| 42       | Поворачиваем вокруг X на +30°                           | 70             | `gimbal-rings-x30`                                                         |
| 43       | Поворачиваем локальную Y на 90°: Z совпала с X₀         | 71, 72, 73     | `gimbal-rings-y45`, `gimbal-rings-y90`, `gimbal-rings-align`               |
| 44       | Z = −30° полностью отменяет поворот X                   | 74, 75, 76     | `gimbal-rings-z-ready`, `gimbal-rings-z-minus15`, `gimbal-rings-z-minus30` |
| 45       | Обнуляем X и Z: ориентация сохраняется                  | 77, 78         | `gimbal-rings-equivalent`, `gimbal-rings-cancel-ready`                     |
| 46       | X растёт, Z убывает: модель неподвижна                  | 79, 80         | `gimbal-rings-cancel45`, `gimbal-rings-cancel90`                           |
| 47       | Сравниваем смешивание углов и короткую дугу кватерниона | 81, 91         | `boundary-0`, `slerp-axis-0`                                               |
| 48       | Длинная и короткая дуги расходятся                      | 82, 83, 92, 93 | `boundary-0.25`, `boundary-0.5`, `slerp-axis-0.25`, `slerp-axis-0.5`       |
| 49       | Приходим к одной конечной ориентации                    | 84, 85, 94, 95 | `boundary-0.75`, `boundary-1`, `slerp-axis-0.75`, `slerp-axis-1`           |
| 50       | Выбираем нормированную ось вращения                     | 86             | `quaternion-0`                                                             |
| 51       | Поворачиваем кватернионом и получаем его матрицу        | 87, 88, 89     | `quaternion-30`, `quaternion-75`, `q-matrix-75`                            |
| 52       | Следующий поворот обновляет матрицу                     | 90             | `q-matrix-90`                                                              |
| 53       | Начинаем составное вращение                             | 96             | `slerp-compound-0`                                                         |
| 54       | Сравниваем середины составных траекторий                | 97, 98         | `slerp-compound-0.25`, `slerp-compound-0.5`                                |
| 55       | Приходим к общей составной цели                         | 99, 100        | `slerp-compound-0.75`, `slerp-compound-1`                                  |
| 56       | Рассматриваем rotation и quaternion вместе              | 101, 102       | `object-euler`, `object-quaternion`                                        |
| 57       | Добавляем повёрнутую родительскую систему               | 103            | `object-parent`                                                            |
| 58       | От параметров к положениям                              | 104            | `summary`                                                                  |
