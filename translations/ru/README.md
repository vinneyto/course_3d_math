# Practical 3D Math

Практический курс по векторам, матрицам и линейным преобразованиям в компьютерной графике.

Основная английская версия: [README.md](../../README.md)

Курс использует TypeScript, Vitest и Three.js, но не является курсом по Three.js. `Vector3`, `Vector4`, `Matrix3` и `Matrix4` нужны здесь как удобные реализации универсальных математических сущностей.

В упражнениях 1–14 мы работаем только с векторами и матрицами `3 × 3`. Начиная с упражнения 15 курс также вводит понятие точки, а в упражнении 17 — матрицу `4 × 4`. World space и handedness пока не рассматриваются в упражнениях. Интерактивная презентация о вращении дополнительно вводит локальную/мировую системы и правый базис вращения.

## Запуск

Требуется Node.js 20.19 или новее (в CI используется Node.js 24).

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

## Монорепозиторий и презентации

Три npm workspace находятся в корне: `exercises` — упражнения, `sandbox` — Vite-песочница и общие компоненты визуализации, `slides` — приложение Next.js. Существующие пути и команды упражнений сохранены.

```bash
npm run dev
```

Откройте http://localhost:3000. В каталоге доступна презентация «Вращение в 3D»: 22 интерактивных слайда, английский язык по умолчанию и переключение на русский. На десктопе сцена и объяснение расположены рядом, на мобильном — друг под другом. Используется классический WebGLRenderer.

```bash
npm run test:slides
npm run build
npx playwright install chromium
npm run test:e2e
```

Страница курса создаёт `useCourseController` и выбирает React-компонент слайда и его пропсы через `switch`. Переход сразу устанавливает нужный номер. `CourseControls` рисует общую навигацию; состояние и очистка эффектов принадлежат React. Независимые примеры получают свой `key` и сбрасывают камеру и параметры. Пары «базис → матрица» (5–6) и «кватернион → матрица» (18–19) используют общий ключ: панель меняется пропсом, а параметры и камера сохраняются.

Браузерные проверки мобильного размера не заменяют проверку на настоящем телефоне. Деплой выполняется отдельно. Подробности: [slides/README.md](../../slides/README.md).

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
15. [Точки и векторы](exercises/15-points-and-vectors/README.md)
16. [Однородные координаты](exercises/16-homogeneous-coordinates/README.md)
17. [Matrix4: преобразование точек и векторов](exercises/17-transform-points-vectors/README.md)
18. [Длинная цепочка преобразований](exercises/18-matrix-transform-chain/README.md)
