import type { Triple } from "./math";

export type GimbalView = "turn-y" | "planes" | "turn-x" | "turn-z" | "cancel";
interface GimbalStep {
  id: string;
  angles: Triple;
  view: GimbalView;
  name: { en: string; ru: string };
  operation: string;
}
/** Shared authored path for snapshots, stage names and angle graphs. */
export const gimbalStory: readonly GimbalStep[] = [
  {
    id: "gimbal-start",
    angles: [0, 0, 0],
    view: "turn-y",
    name: { en: "Start with zero angles", ru: "Начинаем с нулевых углов" },
    operation: "XYZ; x = y = z = 0°",
  },
  {
    id: "gimbal-y45",
    angles: [0, 45, 0],
    view: "turn-y",
    name: { en: "Turn about Y by 45°", ru: "Поворачиваем вокруг Y на 45°" },
    operation: "y: 0° → 45°; x = z = 0°",
  },
  {
    id: "gimbal-y90",
    angles: [0, 90, 0],
    view: "turn-y",
    name: {
      en: "Continue the Y turn to 90°",
      ru: "Доворачиваем вокруг Y до 90°",
    },
    operation: "y: 45° → 90°; x = z = 0°",
  },
  {
    id: "gimbal-planes",
    angles: [0, 90, 0],
    view: "planes",
    name: {
      en: "X and Z now rotate in the same plane",
      ru: "Плоскости вращения X и Z совпали",
    },
    operation: "y = 90°; X₁ = Z₃; plane(X₁) = plane(Z₃)",
  },
  {
    id: "gimbal-x-ready",
    angles: [0, 90, 0],
    view: "turn-x",
    name: {
      en: "Hide the planes and choose X",
      ru: "Убираем плоскости и выбираем X",
    },
    operation: "x = 0°, y = 90°, z = 0°",
  },
  {
    id: "gimbal-x30",
    angles: [30, 90, 0],
    view: "turn-x",
    name: { en: "Turn about X by +30°", ru: "Поворачиваем вокруг X на +30°" },
    operation: "x: 0° → 30°; y = 90°, z = 0°",
  },
  {
    id: "gimbal-z-ready",
    angles: [30, 90, 0],
    view: "turn-z",
    name: {
      en: "Keep X at 30° and choose Z",
      ru: "Сохраняем X = 30° и выбираем Z",
    },
    operation: "x = 30°, y = 90°, z = 0°",
  },
  {
    id: "gimbal-z-minus30",
    angles: [30, 90, -30],
    view: "turn-z",
    name: {
      en: "Turn Z by −30°: undo the X turn",
      ru: "Поворотом Z на −30° отменяем поворот X",
    },
    operation: "z: 0° → −30°; x + z: 30° → 0°",
  },
  {
    id: "gimbal-cancel-ready",
    angles: [30, 90, -30],
    view: "cancel",
    name: {
      en: "Now change X and Z together",
      ru: "Теперь меняем X и Z одновременно",
    },
    operation: "y = 90°; x + z = 0°; Δx = −Δz ⇒ ΔR = 0",
  },
  {
    id: "gimbal-cancel45",
    angles: [45, 90, -45],
    view: "cancel",
    name: {
      en: "X grows, Z decreases: the model stays still",
      ru: "X растёт, Z убывает: модель неподвижна",
    },
    operation: "x: 30° → 45°; z: −30° → −45°; x + z = 0°",
  },
  {
    id: "gimbal-cancel60",
    angles: [60, 90, -60],
    view: "cancel",
    name: {
      en: "Continue both angles without turning the model",
      ru: "Продолжаем менять углы без поворота модели",
    },
    operation: "x: 45° → 60°; z: −45° → −60°; x + z = 0°",
  },
  {
    id: "gimbal-cancel90",
    angles: [90, 90, -90],
    view: "cancel",
    name: {
      en: "Two changing angles cancel throughout the motion",
      ru: "Два меняющихся угла всё время компенсируются",
    },
    operation: "R(90°, 90°, −90°) = R(0°, 90°, 0°)",
  },
];
