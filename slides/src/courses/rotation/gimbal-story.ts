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
/** The basis and rings each follow these six independent operations. */
export const gimbalPass: readonly GimbalStep[] = [
  step(
    "gimbal-start",
    [0, 0, 0],
    "basis",
    {
      en: "Start with a basis and save X₀",
      ru: "Начинаем с базиса и сохраняем X₀",
    },
    {
      en: "Start with XYZ order and an ordinary basis. Save X₀ = (1, 0, 0) as a fixed dashed red reference. It will stay put while the model and its current basis turn.",
      ru: "Начинаем с порядка XYZ и обычного базиса. Сохраняем X₀ = (1, 0, 0) красным пунктиром: это направление останется на месте, пока модель и её текущий базис поворачиваются.",
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
    "gimbal-y90",
    [30, 90, 0],
    "align",
    {
      en: "Turn local Y by 90°: Z coincides with X₀",
      ru: "Поворачиваем локальную Y на 90°: Z совпала с X₀",
    },
    {
      en: "Keep X = 30° and turn about the local Y by 90°. The green sector follows Y after the first turn. At the endpoint, Z₃ = (1, 0, 0) coincides with the saved X₀. The current X and Z basis vectors remain perpendicular.",
      ru: "Сохраняем X = 30° и поворачиваем вокруг локальной Y на 90°. Зелёный сектор следует Y после первого поворота. В конце Z₃ = (1, 0, 0) совпадает с сохранённой X₀. Текущие X и Z базиса остаются перпендикулярны.",
    },
    {
      en: "The first and third Euler rotation axes coincide: Z₃ = X₀.",
      ru: "Совпали оси первого и третьего вращений Эйлера: Z₃ = X₀.",
    },
    "Z₃ = Rx(30°) · Ry(90°) · (0, 0, 1) = X₀ = (1, 0, 0)",
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
      en: "Keep X = 30° and Y = 90°. Turn Z by −30°: the blue sector retraces the first X sector in reverse. The two turns cancel completely, leaving the same orientation as Y = 90° alone.",
      ru: "Сохраняем X = 30° и Y = 90°. Поворачиваем Z на −30°: синий сектор проходит сектор первого поворота X в обратную сторону. Два поворота полностью компенсируются; ориентация совпадает с одним поворотом Y = 90°.",
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
    "gimbal-cancel90",
    [90, 90, -90],
    "cancel",
    {
      en: "X increases, Z decreases: the model stays still",
      ru: "X растёт, Z убывает: модель неподвижна",
    },
    {
      en: "With Y fixed at 90°, increase X from 0° to 90° while decreasing Z from 0° to −90°. Their sum remains zero. The angle graphs change together while the model stays still throughout. Either angle can rotate it alone, but they no longer give independent directions.",
      ru: "При Y = 90° увеличиваем X с 0° до 90° и одновременно уменьшаем Z с 0° до −90°. Их сумма остаётся нулевой. Графики меняются вместе, а модель неподвижна весь переход. По отдельности каждый угол вращает её, но независимых направлений они больше не дают.",
    },
    {
      en: "Gimbal lock is the loss of an independent Euler rotation direction.",
      ru: "Гимбал-лок — потеря независимого направления вращения в углах Эйлера.",
    },
    "y = 90°; x: 0° → 90°; z: 0° → −90°; x + z = 0°",
  ),
];

const sourceSteps = [
  [55, 56],
  [57],
  [58, 59, 60],
  [61, 62, 63],
  [64, 65],
  [66, 67],
];
export const gimbalStory = [false, true].flatMap((rings) =>
  gimbalPass.map((item, i) => ({
    ...item,
    id: rings ? item.id.replace("gimbal-", "gimbal-rings-") : item.id,
    sourceSteps: sourceSteps[i].map((n) => n + (rings ? 13 : 0)),
    rings,
    position: i / (gimbalPass.length - 1),
    name:
      rings && i === 0
        ? {
            en: "Repeat with rings and the saved X₀",
            ru: "Повторяем с кольцами и сохранённой X₀",
          }
        : item.name,
    explanation:
      rings && i === 0
        ? {
            ...item.explanation,
            body: {
              en: "Repeat the same six operations with rings. Each ring illustrates a successive Euler rotation plane. Start from the ordinary basis and keep the saved X₀ = (1, 0, 0) as a fixed reference.",
              ru: "Повторим те же шесть операций с кольцами. Каждое кольцо показывает плоскость последовательного вращения Эйлера. Начинаем с обычного базиса и сохраняем X₀ = (1, 0, 0) как неподвижный ориентир.",
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
