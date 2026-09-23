# Practical 3D Math

Практический курс по векторам, матрицам и линейным преобразованиям в компьютерной графике.

Основная английская версия: [README.md](../../README.md)

Курс использует TypeScript, Vitest и Three.js, но не является курсом по Three.js. `Vector3`, `Vector4`, `Matrix3` и `Matrix4` нужны здесь как удобные реализации универсальных математических сущностей.

Упражнения 1–13 посвящены векторам, их произведениям и применению к нормалям, освещению и сходству. Упражнения 14–20 разбирают преобразования координат с матрицами `3 × 3`. Вершины треугольника знакомят с точками в упражнении 10; подробнее точки рассматриваются в упражнении 21, а матрицы `4 × 4` — в упражнении 23. В упражнении 9 кратко вводится правый базис; world space пока не рассматривается. Используются термины **local** и **global**.

## Запуск

Требуется Node.js 20 или новее.

```bash
npm install
npm test
```

Запуск одного упражнения:

```bash
npm test -- exercises/01-create-vector
```

Запуск визуальной демки упражнения:

```bash
npm run demo -- exercises/01-create-vector
```

Откроется полноэкранная Three.js-песочница. Камеру можно вращать левой
кнопкой мыши, приближать колёсиком и перемещать правой кнопкой.

Проверка TypeScript:

```bash
npm run typecheck
```

Заготовки намеренно содержат `TODO`, поэтому тесты начинают проходить по мере решения упражнений.

## Оглавление

1. [Создание вектора](exercises/01-create-vector/README.md)
2. [Сложение двух векторов](exercises/02-add-two-vectors/README.md)
3. [Сложение нескольких векторов](exercises/03-sum-vectors/README.md)
4. [Длина вектора](exercises/04-vector-length/README.md)
5. [Нормализация вручную](exercises/05-normalize-manually/README.md)
6. [Нормализация через Three.js](exercises/06-normalize-three/README.md)
7. [Система координат и базисные векторы](exercises/07-basis-vectors/README.md)
8. [Векторное произведение](exercises/08-cross-product/README.md)
9. [Построение ортонормированного базиса](exercises/09-build-orthonormal-basis/README.md)
10. [Нормали треугольника по вершинам](exercises/10-triangle-normals/README.md)
11. [Скалярное произведение](exercises/11-dot-product/README.md)
12. [Диффузное освещение через скалярное произведение](exercises/12-diffuse-lighting/README.md)
13. [Многомерные векторы и сходство](exercises/13-high-dimensional-vectors/README.md)
14. [Вложенные системы координат](exercises/14-local-vector-to-global/README.md)
15. [Вращение локального базиса](exercises/15-rotate-local-basis/README.md)
16. [Запись базиса в Matrix3](exercises/16-basis-matrix/README.md)
17. [Умножение матрицы на вектор](exercises/17-matrix-vector/README.md)
18. [Умножение матриц](exercises/18-matrix-multiplication/README.md)
19. [Некоммутативность матричного умножения](exercises/19-non-commutative/README.md)
20. [Перевод локального вектора через Matrix3](exercises/20-local-to-global-matrix/README.md)
21. [Точки и векторы](exercises/21-points-and-vectors/README.md)
22. [Однородные координаты](exercises/22-homogeneous-coordinates/README.md)
23. [Matrix4: преобразование точек и векторов](exercises/23-transform-points-vectors/README.md)
24. [Длинная цепочка преобразований](exercises/24-matrix-transform-chain/README.md)
