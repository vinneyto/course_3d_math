# Practical 3D Math

Практический курс по векторам, матрицам и линейным преобразованиям в компьютерной графике.

Курс использует TypeScript, Vitest и Three.js, но не является курсом по Three.js. `Vector3` и `Matrix3` нужны здесь как удобные реализации универсальных математических сущностей.

В первой части мы работаем только с векторами и матрицами `3 × 3`. Понятия точки, смещения, `Matrix4`, world space и handedness пока не вводятся. Используются термины **local** и **global**.

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
8. [Вложенные системы координат](exercises/08-local-vector-to-global/README.md)
9. [Вращение локального базиса](exercises/09-rotate-local-basis/README.md)
10. [Запись базиса в Matrix3](exercises/10-basis-matrix/README.md)
11. [Умножение матрицы на вектор](exercises/11-matrix-vector/README.md)
12. [Умножение матриц](exercises/12-matrix-multiplication/README.md)
13. [Некоммутативность матричного умножения](exercises/13-non-commutative/README.md)
14. [Перевод локального вектора через Matrix3](exercises/14-local-to-global-matrix/README.md)
