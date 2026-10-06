import type { Triple } from "./math";

export type GimbalView =
  | "basis"
  | "turn-x"
  | "turn-y"
  | "align"
  | "turn-z"
  | "equivalent"
  | "cancel";
type Localized = { en: string; ru: string };
export interface GimbalExplanation {
  body: Localized;
  takeaway: Localized;
  hint: Localized;
}
interface GimbalStep {
  id: string;
  angles: Triple;
  view: GimbalView;
  name: Localized;
  operation: string;
  explanation: GimbalExplanation;
}
const step = (
  id: string,
  angles: Triple,
  view: GimbalView,
  name: Localized,
  body: Localized,
  takeaway: Localized,
  operation: string,
): GimbalStep => ({
  id,
  angles,
  view,
  name,
  operation,
  explanation: {
    body,
    takeaway,
    hint: {
      en: "Advance one step at a time; orbit the camera to inspect the axes.",
      ru: "Проходите по одному шагу; вращайте камеру, чтобы рассмотреть оси.",
    },
  },
});
/** First explain the cause with an ordinary basis; repeat exactly the same path with rings. */
export const gimbalPass: readonly GimbalStep[] = [
  step(
    "gimbal-start",
    [0, 0, 0],
    "basis",
    { en: "Start with an ordinary basis", ru: "Начинаем с обычного базиса" },
    {
      en: "Use XYZ order. The model's local X, Y and Z basis vectors initially coincide with the world axes. We will apply each turn separately.",
      ru: "Используем порядок XYZ. Локальные векторы базиса X, Y и Z модели пока совпадают с мировыми осями. Каждый поворот будем выполнять отдельно.",
    },
    {
      en: "First understand the axes, then add the rings.",
      ru: "Сначала разберёмся с осями, затем добавим кольца.",
    },
    "R = I; x = y = z = 0°",
  ),
  step(
    "gimbal-remember-x",
    [0, 0, 0],
    "basis",
    {
      en: "Save the original X direction",
      ru: "Запоминаем исходное направление X",
    },
    {
      en: "Save X₀ = (1, 0, 0). The dashed red reference stays fixed as the model's current basis turns. This is the axis of our first rotation.",
      ru: "Сохраняем X₀ = (1, 0, 0). Красный пунктир останется на месте, пока текущий базис модели будет поворачиваться. Это ось нашего первого вращения.",
    },
    {
      en: "X₀ is the remembered direction, not the model's current X.",
      ru: "X₀ — сохранённое направление, а не текущая X модели.",
    },
    "X₀ = (1, 0, 0); R = I",
  ),
  step(
    "gimbal-x30",
    [30, 0, 0],
    "turn-x",
    { en: "Turn about X by +30°", ru: "Поворачиваем вокруг X на +30°" },
    {
      en: "Turn the model and its basis about X by 30°. X stays aligned with X₀; Y and Z turn. The red sector shows this first rotation.",
      ru: "Поворачиваем модель и её базис вокруг X на 30°. X остаётся направлена вдоль X₀, а Y и Z поворачиваются. Красный сектор показывает это первое вращение.",
    },
    {
      en: "Keep this 30° turn in mind: we will undo its contribution later.",
      ru: "Запомним этот поворот на 30°: позже мы отменим его вклад.",
    },
    "R = Rx(30°)",
  ),
  step(
    "gimbal-y45",
    [30, 45, 0],
    "turn-y",
    {
      en: "Turn about the local Y by 45°",
      ru: "Поворачиваем вокруг локальной Y на 45°",
    },
    {
      en: "Keep X = 30° and turn about the Y axis already moved by the first rotation. The green sector follows that local axis. X₀ remains fixed.",
      ru: "Сохраняем X = 30° и поворачиваем вокруг Y, уже повёрнутой первым вращением. Зелёный сектор следует этой локальной оси. X₀ остаётся на месте.",
    },
    {
      en: "The next Euler axis moves with the preceding rotation.",
      ru: "Следующая ось Эйлера поворачивается вместе с предыдущим вращением.",
    },
    "R = Rx(30°) · Ry(45°)",
  ),
  step(
    "gimbal-y90",
    [30, 90, 0],
    "turn-y",
    {
      en: "Continue the local Y turn to 90°",
      ru: "Доворачиваем вокруг локальной Y до 90°",
    },
    {
      en: "Increase Y from 45° to 90°, keeping X = 30°. Watch the blue Z vector approach the remembered red X₀ direction.",
      ru: "Увеличиваем Y с 45° до 90°, сохраняя X = 30°. Синяя Z приближается к сохранённому красному направлению X₀.",
    },
    {
      en: "At Y = +90°, the current Z points along the original X.",
      ru: "При Y = +90° текущая Z направлена вдоль исходной X.",
    },
    "R = Rx(30°) · Ry(90°); Z = (1, 0, 0)",
  ),
  step(
    "gimbal-align",
    [30, 90, 0],
    "align",
    {
      en: "The new Z coincides with the saved X",
      ru: "Новая Z совпала с сохранённой X",
    },
    {
      en: "Compare Z = (1, 0, 0) with X₀ = (1, 0, 0): they point in the same direction. A turn about this Z can therefore oppose the first turn about X₀. The current X and Z basis vectors are still perpendicular.",
      ru: "Сравниваем Z = (1, 0, 0) и X₀ = (1, 0, 0): они направлены одинаково. Поэтому поворот вокруг этой Z может противодействовать первому повороту вокруг X₀. Текущие X и Z базиса по-прежнему перпендикулярны.",
    },
    {
      en: "The first and third Euler rotation axes coincide: Z₃ = X₀.",
      ru: "Совпали оси первого и третьего вращений Эйлера: Z₃ = X₀.",
    },
    "Z₃ = Rx(30°) · Ry(90°) · (0, 0, 1) = X₀ = (1, 0, 0)",
  ),
  step(
    "gimbal-z-ready",
    [30, 90, 0],
    "turn-z",
    {
      en: "Choose Z to undo the first turn",
      ru: "Выбираем Z, чтобы отменить первый поворот",
    },
    {
      en: "Keep X = 30° and Y = 90°. Next we will turn about the current blue Z in the negative direction. For full compensation, its angle must be −30°.",
      ru: "Сохраняем X = 30° и Y = 90°. Теперь будем поворачивать вокруг текущей синей Z в отрицательном направлении. Для полной компенсации нужен угол −30°.",
    },
    {
      en: "Equal magnitudes and opposite signs cancel around the same directed axis.",
      ru: "Одинаковые по величине углы с разными знаками компенсируются вокруг одной направленной оси.",
    },
    "x = 30°, y = 90°, z = 0°",
  ),
  step(
    "gimbal-z-minus15",
    [30, 90, -15],
    "turn-z",
    {
      en: "Z = −15° undoes half the first turn",
      ru: "Z = −15° отменяет половину первого поворота",
    },
    {
      en: "Turn Z by −15°. Its blue sector retraces part of the first X sector. Half of the original 30° contribution remains: X + Z = 15°.",
      ru: "Поворачиваем Z на −15°. Синий сектор проходит часть сектора первого поворота X в обратную сторону. От исходных 30° остаётся половина: X + Z = 15°.",
    },
    {
      en: "Partial compensation still leaves a visible rotation.",
      ru: "Частичная компенсация ещё оставляет заметный поворот.",
    },
    "Rx(30°) · Ry(90°) · Rz(−15°) = Rx(15°) · Ry(90°)",
  ),
  step(
    "gimbal-z-minus30",
    [30, 90, -30],
    "turn-z",
    {
      en: "Z = −30° fully undoes the X turn",
      ru: "Z = −30° полностью отменяет поворот X",
    },
    {
      en: "Continue Z to −30°. The first and third turns now cancel completely. The orientation is the same as a single Y = 90° turn, even though X and Z are nonzero.",
      ru: "Доворачиваем Z до −30°. Первый и третий повороты теперь полностью компенсируются. Ориентация такая же, как после одного поворота Y = 90°, хотя X и Z не равны нулю.",
    },
    {
      en: "Rx(30°) · Ry(90°) · Rz(−30°) = Ry(90°).",
      ru: "Rx(30°) · Ry(90°) · Rz(−30°) = Ry(90°).",
    },
    "Rx(30°) · Ry(90°) · Rz(−30°) = Rx(0°) · Ry(90°) · Rz(0°)",
  ),
  step(
    "gimbal-equivalent",
    [0, 90, 0],
    "equivalent",
    {
      en: "Set X and Z to zero: the orientation stays",
      ru: "Обнуляем X и Z: ориентация сохраняется",
    },
    {
      en: "Replace (30°, 90°, −30°) with (0°, 90°, 0°). The angle values change, but neither the model nor its basis moves. The two sets describe exactly the same orientation.",
      ru: "Заменяем (30°, 90°, −30°) на (0°, 90°, 0°). Значения углов меняются, а модель и её базис остаются неподвижны. Оба набора описывают одну и ту же ориентацию.",
    },
    {
      en: "At Y = 90°, orientation depends on X + Z, not on those angles independently.",
      ru: "При Y = 90° ориентация зависит от суммы X + Z, а не от этих углов по отдельности.",
    },
    "R(30°, 90°, −30°) = R(0°, 90°, 0°)",
  ),
  step(
    "gimbal-cancel-ready",
    [30, 90, -30],
    "cancel",
    {
      en: "Restore the nonzero angles without turning",
      ru: "Возвращаем ненулевые углы без поворота",
    },
    {
      en: "Return X to 30° and Z to −30° together. Their sum stays zero throughout, so the model stays still. There is no swept sector because its orientation does not change.",
      ru: "Одновременно возвращаем X к 30°, а Z к −30°. Их сумма всё время равна нулю, поэтому модель неподвижна. Заметённого сектора нет: ориентация не меняется.",
    },
    {
      en: "The two Euler angles have lost their independence.",
      ru: "Два угла Эйлера потеряли независимость.",
    },
    "y = 90°; x + z = 0°; Δx = −Δz ⇒ ΔR = 0",
  ),
  step(
    "gimbal-cancel45",
    [45, 90, -45],
    "cancel",
    {
      en: "X grows, Z decreases: the model stays still",
      ru: "X растёт, Z убывает: модель неподвижна",
    },
    {
      en: "Increase X to 45° while decreasing Z to −45°. The graphs change together, but the model's orientation stays fixed at every moment.",
      ru: "Увеличиваем X до 45° и одновременно уменьшаем Z до −45°. Графики меняются синхронно, а ориентация модели сохраняется в каждый момент перехода.",
    },
    {
      en: "Opposite angle changes compensate, even when both values are large.",
      ru: "Противоположные изменения углов компенсируются даже при больших значениях.",
    },
    "x: 30° → 45°; z: −30° → −45°; x + z = 0°",
  ),
  step(
    "gimbal-cancel90",
    [90, 90, -90],
    "cancel",
    {
      en: "This loss of independence is gimbal lock",
      ru: "Эта потеря независимости — гимбал-лок",
    },
    {
      en: "Continue to X = 90° and Z = −90° with Y fixed at 90°. Either X or Z can still turn the model alone, but here they act about the same directed axis. We can no longer use them as two independent rotation directions.",
      ru: "Продолжаем до X = 90° и Z = −90°, сохраняя Y = 90°. По отдельности X и Z всё ещё вращают модель, но здесь они действуют вокруг одной направленной оси. Они больше не дают двух независимых направлений вращения.",
    },
    {
      en: "Gimbal lock is the loss of an independent Euler rotation direction.",
      ru: "Гимбал-лок — потеря независимого направления вращения в углах Эйлера.",
    },
    "R(90°, 90°, −90°) = R(0°, 90°, 0°)",
  ),
];
export const gimbalStory = [false, true].flatMap((rings) =>
  gimbalPass.map((item, i) => ({
    ...item,
    id: rings ? item.id.replace("gimbal-", "gimbal-rings-") : item.id,
    rings,
    rememberX: i > 0,
    position: i / (gimbalPass.length - 1),
    name: rings
      ? {
          en: i === 0 ? "Repeat the same turns with rings" : item.name.en,
          ru: i === 0 ? "Повторяем те же повороты с кольцами" : item.name.ru,
        }
      : item.name,
    explanation:
      rings && i === 0
        ? {
            body: {
              en: "Gimbal lock is often shown using rings. Now that the basis made the cause clear, repeat the same angle values and turns with rings. Each ring shows the plane of one successive Euler rotation.",
              ru: "Гимбал-лок часто показывают на кольцах. Теперь, когда причина понятна на обычном базисе, повторим те же углы и повороты с кольцами. Каждое кольцо показывает плоскость одного из последовательных вращений Эйлера.",
            },
            takeaway: {
              en: "The rings illustrate the same rotations; the saved X₀ still explains the coincidence.",
              ru: "Кольца показывают те же вращения; сохранённая X₀ по-прежнему объясняет совпадение.",
            },
            hint: {
              en: "Compare this pass with the preceding basis sequence.",
              ru: "Сравните этот проход с предыдущей последовательностью базиса.",
            },
          }
        : rings && item.view === "cancel"
          ? {
              ...item.explanation,
              hint: {
                en: "Intermediate rings can move while their combined effect leaves the model still.",
                ru: "Промежуточные кольца могут двигаться, пока их суммарное действие оставляет модель неподвижной.",
              },
            }
          : item.explanation,
  })),
);
