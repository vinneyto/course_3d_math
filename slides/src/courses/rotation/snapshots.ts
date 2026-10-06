import { gimbalStory } from "./gimbal-story";
import { initialState, type RotationState } from "./state";

export type StepKind =
  | "point"
  | "model"
  | "gimbal"
  | "interpolation"
  | "quaternion"
  | "object";
export interface RotationSnapshot {
  id: string;
  /** Original 104-step course positions covered by this snapshot. */
  sourceSteps: readonly number[];
  sequence?: string;
  explanation?: import("./gimbal-story").GimbalExplanation;
  topic: number;
  kind: StepKind;
  scene: RotationState;
  caption?: { en: string; ru: string };
  operation?: string;
}
const model: Partial<RotationState> = {
  dimension: 3,
  local: true,
  mode: "model",
  panel: "basis",
  point: [-1, -1, -1],
  angles: [20, 25, 15],
  cameraPosition: [6, 4, 8],
  cameraTarget: [0, 0, 0],
};
function frame(
  id: string,
  topic: number,
  kind: StepKind,
  scene: Partial<RotationState>,
  sourceSteps: readonly number[],
  caption: { en: string; ru: string },
  operation: string,
  explanation?: RotationSnapshot["explanation"],
  sequence?: string,
): RotationSnapshot {
  const complete = {
    ...initialState,
    ...(kind === "point" ? {} : model),
    ...scene,
  };
  // Authored frames are immutable; viewer state is kept outside this data.
  for (const value of Object.values(complete))
    if (Array.isArray(value)) Object.freeze(value);
  Object.freeze(complete);
  return Object.freeze({
    id,
    sourceSteps: Object.freeze(sourceSteps),
    caption: Object.freeze(caption),
    operation,
    explanation:
      explanation &&
      Object.freeze({
        body: Object.freeze(explanation.body),
        takeaway: Object.freeze(explanation.takeaway),
        hint: Object.freeze(explanation.hint),
      }),
    sequence,
    topic,
    kind,
    scene: complete,
  });
}
/** Consolidated destinations; removed intermediate values remain visible during transitions. */
const authored: readonly RotationSnapshot[] = [
  frame(
    "local-z-0",
    2,
    "point",
    { pointTooltip: true, local: true, arc: true },
    [1],
    {
      en: "Local and world frames coincide",
      ru: "Локальная и мировая системы совпадают",
    },
    "Rz(0°)",
  ),
  frame(
    "local-z-45",
    2,
    "point",
    { pointTooltip: true, angles: [0, 0, 45], local: true, arc: true },
    [2, 3, 4],
    {
      en: "Trace the point's circular path",
      ru: "Получаем круговую траекторию точки",
    },
    "Rz(45°)",
  ),
  frame(
    "origin-1",
    3,
    "point",
    {
      origin: [3, 1, 0],
      pointTooltip: true,
      angles: [0, 0, 45],
      local: true,
      arc: true,
    },
    [5, 6],
    {
      en: "Move the local rotation centre",
      ru: "Смещаем локальный центр вращения",
    },
    "T = (3, 1, 0), Rz(45°)",
  ),
  frame(
    "basis-0",
    4,
    "point",
    {
      panel: "compute",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      local: true,
      arc: true,
      cameraPosition: [8, 6, 11],
    },
    [7, 8, 15],
    {
      en: "Place the basis in the matrix and apply it",
      ru: "Укладываем базис в матрицу и применяем её",
    },
    "Rx(0°); columns: X, Y, Z, T; Pworld = T + 2X + Y + Z",
    {
      body: {
        en: "X, Y and Z form the first three matrix columns; T locates the local origin. Multiply each basis vector by the corresponding component of positionLocal, then add T. The code, colored matrix and world-position readout show the same calculation.",
        ru: "X, Y и Z образуют первые три столбца матрицы; T задаёт локальное начало. Умножаем каждый базисный вектор на соответствующую компоненту positionLocal и прибавляем T. Код, цветная матрица и мировая координата показывают одно вычисление.",
      },
      takeaway: {
        en: "The 3×3 block rotates the basis; the fourth column translates its origin.",
        ru: "Блок 3×3 поворачивает базис; четвёртый столбец смещает начало.",
      },
      hint: {
        en: "Compare 0°, 90° and 180°, then reset before the smaller 45° turn.",
        ru: "Сравните 0°, 90° и 180°, затем вернитесь к нулю перед поворотом на 45°.",
      },
    },
    undefined,
  ),
  frame(
    "basis-90",
    4,
    "point",
    {
      panel: "compute",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [90, 0, 0],
      local: true,
      arc: true,
      cameraPosition: [8, 6, 11],
    },
    [9, 17],
    {
      en: "90°: move the ones to new rows",
      ru: "90°: единицы переходят в другие строки",
    },
    "Rx(90°); X = (1, 0, 0), Y = (0, 0, 1), Z = (0, −1, 0)",
    {
      body: {
        en: "X, Y and Z form the first three matrix columns; T locates the local origin. Multiply each basis vector by the corresponding component of positionLocal, then add T. The code, colored matrix and world-position readout show the same calculation.",
        ru: "X, Y и Z образуют первые три столбца матрицы; T задаёт локальное начало. Умножаем каждый базисный вектор на соответствующую компоненту positionLocal и прибавляем T. Код, цветная матрица и мировая координата показывают одно вычисление.",
      },
      takeaway: {
        en: "The 3×3 block rotates the basis; the fourth column translates its origin.",
        ru: "Блок 3×3 поворачивает базис; четвёртый столбец смещает начало.",
      },
      hint: {
        en: "Compare 0°, 90° and 180°, then reset before the smaller 45° turn.",
        ru: "Сравните 0°, 90° и 180°, затем вернитесь к нулю перед поворотом на 45°.",
      },
    },
    undefined,
  ),
  frame(
    "basis-180",
    4,
    "point",
    {
      panel: "compute",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [180, 0, 0],
      local: true,
      arc: true,
      cameraPosition: [8, 6, 11],
    },
    [10],
    { en: "180°: reverse Y and Z", ru: "180°: Y и Z меняют направление" },
    "Rx(180°); X = (1, 0, 0), Y = (0, −1, 0), Z = (0, 0, −1)",
    {
      body: {
        en: "X, Y and Z form the first three matrix columns; T locates the local origin. Multiply each basis vector by the corresponding component of positionLocal, then add T. The code, colored matrix and world-position readout show the same calculation.",
        ru: "X, Y и Z образуют первые три столбца матрицы; T задаёт локальное начало. Умножаем каждый базисный вектор на соответствующую компоненту positionLocal и прибавляем T. Код, цветная матрица и мировая координата показывают одно вычисление.",
      },
      takeaway: {
        en: "The 3×3 block rotates the basis; the fourth column translates its origin.",
        ru: "Блок 3×3 поворачивает базис; четвёртый столбец смещает начало.",
      },
      hint: {
        en: "Compare 0°, 90° and 180°, then reset before the smaller 45° turn.",
        ru: "Сравните 0°, 90° и 180°, затем вернитесь к нулю перед поворотом на 45°.",
      },
    },
    undefined,
  ),
  frame(
    "basis-reset",
    4,
    "point",
    {
      panel: "compute",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      local: true,
      arc: true,
      cameraPosition: [8, 6, 11],
    },
    [11],
    {
      en: "Return to 0° before smaller turns",
      ru: "Возвращаемся к 0° перед малыми поворотами",
    },
    "Rx(0°); X = (1, 0, 0), Y = (0, 1, 0), Z = (0, 0, 1)",
    {
      body: {
        en: "X, Y and Z form the first three matrix columns; T locates the local origin. Multiply each basis vector by the corresponding component of positionLocal, then add T. The code, colored matrix and world-position readout show the same calculation.",
        ru: "X, Y и Z образуют первые три столбца матрицы; T задаёт локальное начало. Умножаем каждый базисный вектор на соответствующую компоненту positionLocal и прибавляем T. Код, цветная матрица и мировая координата показывают одно вычисление.",
      },
      takeaway: {
        en: "The 3×3 block rotates the basis; the fourth column translates its origin.",
        ru: "Блок 3×3 поворачивает базис; четвёртый столбец смещает начало.",
      },
      hint: {
        en: "Compare 0°, 90° and 180°, then reset before the smaller 45° turn.",
        ru: "Сравните 0°, 90° и 180°, затем вернитесь к нулю перед поворотом на 45°.",
      },
    },
    undefined,
  ),
  frame(
    "basis-45",
    4,
    "point",
    {
      panel: "compute",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [45, 0, 0],
      local: true,
      arc: true,
      cameraPosition: [8, 6, 11],
    },
    [12, 13, 14, 16],
    {
      en: "45°: compare the matrix and world position",
      ru: "45°: сравниваем матрицу и мировую координату",
    },
    "Rx(45°); Pworld = T + 2X + Y + Z",
    {
      body: {
        en: "X, Y and Z form the first three matrix columns; T locates the local origin. Multiply each basis vector by the corresponding component of positionLocal, then add T. The code, colored matrix and world-position readout show the same calculation.",
        ru: "X, Y и Z образуют первые три столбца матрицы; T задаёт локальное начало. Умножаем каждый базисный вектор на соответствующую компоненту positionLocal и прибавляем T. Код, цветная матрица и мировая координата показывают одно вычисление.",
      },
      takeaway: {
        en: "The 3×3 block rotates the basis; the fourth column translates its origin.",
        ru: "Блок 3×3 поворачивает базис; четвёртый столбец смещает начало.",
      },
      hint: {
        en: "Compare 0°, 90° and 180°, then reset before the smaller 45° turn.",
        ru: "Сравните 0°, 90° и 180°, затем вернитесь к нулю перед поворотом на 45°.",
      },
    },
    undefined,
  ),
  frame(
    "axis-point-0",
    6,
    "point",
    {
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      local: true,
      arc: true,
      zero: true,
      axisPoint: true,
      cameraPosition: [8, 6, 11],
      fixedPoints: true,
    },
    [18, 21],
    {
      en: "Place points at the origin and on X",
      ru: "Помещаем точки в начало и на X",
    },
    "P₀ = (0, 0, 0); P = (2, 0, 0); Rx(0°)",
  ),
  frame(
    "axis-point-135",
    6,
    "point",
    {
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [135, 0, 0],
      local: true,
      arc: true,
      zero: true,
      axisPoint: true,
      cameraPosition: [8, 6, 11],
      fixedPoints: true,
    },
    [19, 20, 22],
    {
      en: "Turn the frame: both points stay fixed",
      ru: "Поворачиваем систему: обе точки неподвижны",
    },
    "P₀ = (0, 0, 0); P = (2, 0, 0); Rx(135°)",
  ),
  frame(
    "local-recap-offset",
    7,
    "point",
    {
      panel: "basis",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [135, 0, 0],
      local: true,
      arcStartAngles: [135, 0, 0],
      cameraPosition: [8, 6, 11],
    },
    [23],
    {
      en: "Move the point off the axis without turning",
      ru: "Смещаем точку с оси без поворота",
    },
    "p: (2, 0, 0) → (2, 1, 1); Rx(135°) stays fixed",
  ),
  frame(
    "local-recap-80",
    7,
    "point",
    {
      panel: "basis",
      dimension: 3,
      origin: [3, 1, 0],
      point: [2, 1, 1],
      angles: [80, 0, 0],
      local: true,
      arc: true,
      arcStartAngles: [135, 0, 0],
      cameraPosition: [8, 6, 11],
    },
    [24, 25],
    {
      en: "Turn the frame: the off-axis point moves",
      ru: "Поворачиваем систему: точка вне оси движется",
    },
    "Rx(80°)",
  ),
  frame(
    "cube-0",
    8,
    "model",
    { mode: "cube", angles: [20, 25, 0] },
    [26],
    {
      en: "Give eight vertices one frame",
      ru: "Задаём восьми вершинам одну систему",
    },
    "Euler(20°, 25°, 0°), XYZ",
  ),
  frame(
    "cube-30",
    8,
    "model",
    { mode: "cube", angles: [20, 25, 30] },
    [27, 28],
    {
      en: "The vertices form a rotating cube",
      ru: "Вершины образуют вращающийся куб",
    },
    "Euler(20°, 25°, 30°), XYZ",
  ),
  frame(
    "model-0",
    9,
    "model",
    { angles: [20, 25, 30] },
    [29],
    {
      en: "Inspect the model's surface",
      ru: "Рассматриваем поверхность модели",
    },
    "surface",
  ),
  frame(
    "model-vertices",
    9,
    "model",
    { angles: [20, 25, 30], surface: "wireframe-vertices" },
    [30, 31],
    {
      en: "Reveal edges and vertices together",
      ru: "Показываем рёбра и вершины вместе",
    },
    "wireframe + vertices",
  ),
  frame(
    "conditions-0",
    10,
    "model",
    { panel: "conditions", angles: [20, 25, 30] },
    [32, 33],
    {
      en: "Restore the surface and inspect its rotation basis",
      ru: "Возвращаем поверхность и проверяем базис вращения",
    },
    "Δ R[0,1] = 0",
  ),
  frame(
    "conditions-2",
    10,
    "model",
    { panel: "conditions", angles: [20, 25, 30], shear: 0.6 },
    [34, 35],
    { en: "The change deforms the model", ru: "Изменение деформирует модель" },
    "Δ R[0,1] = 0.6",
  ),
  frame(
    "conditions-3",
    10,
    "model",
    { panel: "conditions", angles: [20, 25, 30], eulerSectors: false },
    [36],
    { en: "Restore a pure rotation", ru: "Возвращаем чистое вращение" },
    "Δ R[0,1] = 0",
  ),
  frame(
    "axis-X-0",
    11,
    "model",
    { panel: "axis", angles: [0, 0, 0], eulerSectors: false },
    [37],
    { en: "Choose the X axis", ru: "Выбираем ось X" },
    "Rx(0°)",
  ),
  frame(
    "axis-X-60",
    11,
    "model",
    { panel: "axis", angles: [60, 0, 0] },
    [38, 39],
    { en: "Widen the X sector", ru: "Увеличиваем сектор вокруг X" },
    "Rx(60°)",
  ),
  frame(
    "axis-Y-0",
    11,
    "model",
    { panel: "axis", angles: [0, 0, 0], singleAxis: "Y" },
    [40],
    { en: "Choose the Y axis", ru: "Выбираем ось Y" },
    "Ry(0°)",
  ),
  frame(
    "axis-Y-60",
    11,
    "model",
    { panel: "axis", angles: [0, 60, 0], singleAxis: "Y" },
    [41, 42],
    { en: "Widen the Y sector", ru: "Увеличиваем сектор вокруг Y" },
    "Ry(60°)",
  ),
  frame(
    "axis-Z-0",
    11,
    "model",
    { panel: "axis", angles: [0, 0, 0], singleAxis: "Z" },
    [43],
    { en: "Choose the Z axis", ru: "Выбираем ось Z" },
    "Rz(0°)",
  ),
  frame(
    "axis-Z-60",
    11,
    "model",
    { panel: "axis", angles: [0, 0, 60], singleAxis: "Z" },
    [44, 45],
    { en: "Widen the Z sector", ru: "Увеличиваем сектор вокруг Z" },
    "Rz(60°)",
  ),
  frame(
    "euler-0",
    12,
    "model",
    { panel: "euler", angles: [30, 40, 25], stage: 0 },
    [46],
    {
      en: "Start with the identity rotation",
      ru: "Начинаем с единичного вращения",
    },
    "R = I",
  ),
  frame(
    "euler-1",
    12,
    "model",
    { panel: "euler", angles: [30, 40, 25], stage: 0.3333333333333333 },
    [47],
    { en: "Apply the first Euler angle", ru: "Применяем первый угол Эйлера" },
    "R = Rx(30°)",
  ),
  frame(
    "euler-2",
    12,
    "model",
    { panel: "euler", angles: [30, 40, 25], stage: 0.6666666666666666 },
    [48],
    { en: "Add the second Euler angle", ru: "Добавляем второй угол Эйлера" },
    "R = Rx(30°) · Ry(40°)",
  ),
  frame(
    "euler-3",
    12,
    "model",
    { panel: "euler", angles: [30, 40, 25] },
    [49],
    { en: "Add the third Euler angle", ru: "Добавляем третий угол Эйлера" },
    "R = Rx(30°) · Ry(40°) · Rz(25°)",
  ),
  frame(
    "order-0",
    13,
    "model",
    { panel: "order", angles: [0, 0, 0], order: "YXZ" },
    [50],
    {
      en: "Reset the same model for YXZ",
      ru: "Возвращаем ту же модель к началу для YXZ",
    },
    "R = I; same target angles: x = 30°, y = 40°, z = 25°",
  ),
  frame(
    "order-1",
    13,
    "model",
    { panel: "order", angles: [0, 40, 0], order: "YXZ" },
    [51],
    { en: "YXZ: first turn about Y", ru: "YXZ: сначала поворачиваем вокруг Y" },
    "R = Ry(40°)",
  ),
  frame(
    "order-2",
    13,
    "model",
    { panel: "order", angles: [30, 40, 0], order: "YXZ" },
    [52],
    {
      en: "YXZ: then turn about the rotated X",
      ru: "YXZ: затем вокруг повёрнутой X",
    },
    "R = Ry(40°) · Rx(30°)",
  ),
  frame(
    "order-3",
    13,
    "model",
    { panel: "order", angles: [30, 40, 25], order: "YXZ" },
    [53],
    {
      en: "YXZ: add Z and compare the result",
      ru: "YXZ: добавляем Z и сравниваем результат",
    },
    "R = Ry(40°) · Rx(30°) · Rz(25°) ≠ Rx(30°) · Ry(40°) · Rz(25°)",
  ),
  frame(
    "gimbal-intro",
    14,
    "model",
    { panel: "euler-limits", angles: [30, 40, 25], order: "YXZ" },
    [54],
    {
      en: "Euler angles have limitations",
      ru: "У углов Эйлера есть недостатки",
    },
    "Euler → Quaternion → Matrix → World vertices",
    {
      body: {
        en: "Euler angles are easy to specify, but their rotation directions are not always independent. In certain orientations, two successive axes coincide: this is called gimbal lock. We will examine it step by step in XYZ order.",
        ru: "Углы Эйлера удобно задавать, но направления поворотов не всегда независимы. В некоторых положениях две последовательные оси поворота совпадают. Это называется гимбал лок. Далее разберём его по шагам в порядке XYZ.",
      },
      takeaway: {
        en: "At gimbal lock, three angle parameters provide only two independent rotation directions.",
        ru: "При гимбал локе три угла дают только два независимых направления поворота.",
      },
      hint: {
        en: "Next, start with an ordinary basis and follow how the first X axis and the third Z axis align.",
        ru: "На следующем шаге начнём с обычного базиса и проследим, как первая ось X и третья ось Z совпадают.",
      },
    },
    "euler-limits",
  ),
  ...gimbalStory.map((step) =>
    frame(
      step.id,
      14,
      "gimbal",
      {
        panel: "gimbal",
        cameraPosition: [6, 4, 11],
        t: step.position,
        angles: step.angles,
        gimbalView: step.view,
        gimbalRememberX: true,
        gimbalReferenceX: [1, 0, 0],
        gimbalRings: step.rings,
      },
      step.sourceSteps,
      step.name,
      step.operation,
      step.explanation,
      step.rings ? "gimbal-rings" : "gimbal-basis",
    ),
  ),

  frame(
    "boundary-0",
    15,
    "interpolation",
    { panel: "interpolation", cameraPosition: [3, 2, 13] },
    [81, 91],
    {
      en: "Compare angle blending with the shortest quaternion arc",
      ru: "Сравниваем смешивание углов и короткую дугу кватерниона",
    },
    "179° → −179°",
    {
      body: {
        en: "Both methods start at 179° and end at −179°. Directly blending those numbers takes a 358° path; quaternion SLERP takes the 2° shortest arc. The next topic explains the quaternion representation.",
        ru: "Оба способа начинают с 179° и заканчивают на −179°. Прямое смешивание этих чисел даёт путь в 358°; SLERP кватернионов выбирает короткую дугу в 2°. В следующей теме разберём представление кватерниона.",
      },
      takeaway: {
        en: "Equivalent endpoint orientations can be connected by different paths.",
        ru: "Одинаковые конечные ориентации можно соединить разными путями.",
      },
      hint: {
        en: "Watch the two models through the transition, then compare their common endpoint.",
        ru: "Проследите за двумя моделями во время перехода, затем сравните их общую конечную ориентацию.",
      },
    },
    undefined,
  ),
  frame(
    "boundary-0.5",
    15,
    "interpolation",
    { panel: "interpolation", t: 0.5, cameraPosition: [3, 2, 13] },
    [82, 83, 92, 93],
    {
      en: "The long and short arcs diverge",
      ru: "Длинная и короткая дуги расходятся",
    },
    "Euler: 0°; SLERP: 180°",
    {
      body: {
        en: "Both methods start at 179° and end at −179°. Directly blending those numbers takes a 358° path; quaternion SLERP takes the 2° shortest arc. The next topic explains the quaternion representation.",
        ru: "Оба способа начинают с 179° и заканчивают на −179°. Прямое смешивание этих чисел даёт путь в 358°; SLERP кватернионов выбирает короткую дугу в 2°. В следующей теме разберём представление кватерниона.",
      },
      takeaway: {
        en: "Equivalent endpoint orientations can be connected by different paths.",
        ru: "Одинаковые конечные ориентации можно соединить разными путями.",
      },
      hint: {
        en: "Watch the two models through the transition, then compare their common endpoint.",
        ru: "Проследите за двумя моделями во время перехода, затем сравните их общую конечную ориентацию.",
      },
    },
    undefined,
  ),
  frame(
    "boundary-1",
    15,
    "interpolation",
    { panel: "interpolation", t: 1, cameraPosition: [3, 2, 13] },
    [84, 85, 94, 95],
    {
      en: "Reach the same final orientation",
      ru: "Приходим к одной конечной ориентации",
    },
    "−179° ≡ 181°",
    {
      body: {
        en: "Both methods start at 179° and end at −179°. Directly blending those numbers takes a 358° path; quaternion SLERP takes the 2° shortest arc. The next topic explains the quaternion representation.",
        ru: "Оба способа начинают с 179° и заканчивают на −179°. Прямое смешивание этих чисел даёт путь в 358°; SLERP кватернионов выбирает короткую дугу в 2°. В следующей теме разберём представление кватерниона.",
      },
      takeaway: {
        en: "Equivalent endpoint orientations can be connected by different paths.",
        ru: "Одинаковые конечные ориентации можно соединить разными путями.",
      },
      hint: {
        en: "Watch the two models through the transition, then compare their common endpoint.",
        ru: "Проследите за двумя моделями во время перехода, затем сравните их общую конечную ориентацию.",
      },
    },
    undefined,
  ),
  frame(
    "quaternion-0",
    16,
    "quaternion",
    { panel: "quaternion", axis: [1, 1, 0], angle: 0 },
    [86],
    {
      en: "Choose a normalized rotation axis",
      ru: "Выбираем нормированную ось вращения",
    },
    "a = normalize(1, 1, 0); θ = 0°",
  ),
  frame(
    "q-matrix-75",
    16,
    "quaternion",
    { panel: "q-matrix", axis: [1, 1, 0], angle: 75 },
    [87, 88, 89],
    {
      en: "Rotate with a quaternion and derive its matrix",
      ru: "Поворачиваем кватернионом и получаем его матрицу",
    },
    "θ = 75°; q = (a sin(θ/2), cos(θ/2)); R(q)",
  ),
  frame(
    "q-matrix-90",
    16,
    "quaternion",
    { panel: "q-matrix", axis: [1, 1, 0], angle: 90 },
    [90],
    {
      en: "A further turn updates the matrix",
      ru: "Следующий поворот обновляет матрицу",
    },
    "R(q); θ = 90°",
  ),
  frame(
    "slerp-compound-0",
    18,
    "interpolation",
    { panel: "interpolation", compound: true, cameraPosition: [3, 2, 13] },
    [96],
    { en: "Start a compound rotation", ru: "Начинаем составное вращение" },
    "Euler / SLERP; t = 0",
  ),
  frame(
    "slerp-compound-0.5",
    18,
    "interpolation",
    {
      panel: "interpolation",
      t: 0.5,
      compound: true,
      cameraPosition: [3, 2, 13],
    },
    [97, 98],
    {
      en: "Compare compound middle orientations",
      ru: "Сравниваем середины составных траекторий",
    },
    "t = 0.5",
  ),
  frame(
    "slerp-compound-1",
    18,
    "interpolation",
    {
      panel: "interpolation",
      t: 1,
      compound: true,
      cameraPosition: [3, 2, 13],
    },
    [99, 100],
    {
      en: "Reach the common compound endpoint",
      ru: "Приходим к общей составной цели",
    },
    "t = 1",
  ),
  frame(
    "object-euler",
    19,
    "object",
    {
      panel: "object",
      angles: [30, 40, 25],
      axis: [0.6199935615771801, 0.5416190918949224, 0.5676766182411982],
      angle: 59.7766362348991,
    },
    [101, 102],
    {
      en: "Inspect rotation and quaternion together",
      ru: "Рассматриваем rotation и quaternion вместе",
    },
    "object.rotation ↔ object.quaternion; R(q) = R(Euler)",
  ),
  frame(
    "object-parent",
    19,
    "object",
    {
      panel: "object",
      angles: [30, 40, 25],
      axis: [0.6199935615771801, 0.5416190918949224, 0.5676766182411982],
      angle: 59.7766362348991,
      input: "quaternion",
      parent: true,
    },
    [103],
    {
      en: "Add a rotated parent frame",
      ru: "Добавляем повёрнутую родительскую систему",
    },
    "matrixWorld = Ry(35°) · matrix",
  ),
  frame(
    "summary",
    20,
    "object",
    { panel: "summary", angles: [30, 40, 25] },
    [104],
    { en: "From parameters to positions", ru: "От параметров к положениям" },
    "Euler → Quaternion → Matrix → World vertices",
  ),
];
export const snapshots: readonly RotationSnapshot[] = Object.freeze(
  authored.map((snapshot, index) => {
    const group = authored.filter(
      (step) => sequenceKey(step) === sequenceKey(snapshot),
    );
    if (group.length === 1) return snapshot;
    const position = group.findIndex((step) => step.id === snapshot.id);
    const stage = { name: snapshot.caption!, operation: snapshot.operation! };
    if (!stage) throw new Error(`Missing stage for ${snapshot.id}`);
    return Object.freeze({
      ...snapshot,
      caption: Object.freeze(stage.name),
      explanation:
        snapshot.explanation &&
        Object.freeze({
          body: Object.freeze(snapshot.explanation.body),
          takeaway: Object.freeze(snapshot.explanation.takeaway),
          hint: Object.freeze(snapshot.explanation.hint),
        }),
      operation: stage.operation,
      scene: Object.freeze({
        ...snapshot.scene,
        timeline: Object.freeze({
          group: snapshot.scene.gimbalRings ? 114 : snapshot.topic,
          position: position / (group.length - 1),
        }),
      }),
    });
  }),
);

export function sequenceFor(index: number) {
  const step = snapshots[index];
  return snapshots.filter(
    (snapshot) => sequenceKey(snapshot) === sequenceKey(step),
  );
}

/** Timeline boundaries also define the visible topics of the manual. */
export function sequenceKey(step: RotationSnapshot): string {
  return step.sequence ?? `topic-${step.topic}`;
}
