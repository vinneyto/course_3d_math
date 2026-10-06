export type Localized = { en: string; ru: string };
export interface ManualStage {
  name: Localized;
  operation: string;
}
const stage = (en: string, ru: string, operation: string): ManualStage => ({
  name: { en, ru },
  operation,
});

/** Names describe the operation, not a percentage of completion. */
export const stageDefinitions: Record<number, readonly ManualStage[]> = {
  1: [
    stage(
      "Start at the original point",
      "Начинаем с исходной точки",
      "P = (2, 1, 0), d = (1, 2, 0)",
    ),
    stage(
      "Move halfway along the vector",
      "Смещаем точку на половину вектора",
      "P′ = P + 0.5d = (2.5, 2, 0)",
    ),
    stage(
      "Reach the translated point",
      "Доходим до смещённой точки",
      "P′ = P + d = (3, 3, 0)",
    ),
  ],
  2: [
    stage(
      "Local and world frames coincide",
      "Локальная и мировая системы совпадают",
      "Rz(0°)",
    ),
    stage(
      "Begin turning the local frame",
      "Начинаем поворачивать локальную систему",
      "Rz(15°)",
    ),
    stage(
      "The point follows the turning frame",
      "Точка следует за поворотом системы",
      "Rz(30°)",
    ),
    stage(
      "Trace the point's circular path",
      "Получаем круговую траекторию точки",
      "Rz(45°)",
    ),
  ],
  3: [
    stage(
      "Shift the centre of rotation",
      "Смещаем центр вращения",
      "O = (1.5, 0.5, 0), Rz(45°)",
    ),
    stage(
      "Rotate about a local origin",
      "Вращаем вокруг локального начала",
      "O = (3, 1, 0), Rz(45°)",
    ),
  ],
  4: [
    stage(
      "Place the basis in matrix columns",
      "Укладываем базис в столбцы матрицы",
      "Matrix4.set(…); columns: X, Y, Z, O",
    ),
    stage(
      "Inspect the three basis vectors",
      "Рассматриваем три вектора базиса",
      "X, Y, Z; O = (3, 1, 0)",
    ),
    stage(
      "90°: move the ones to new rows",
      "90°: единицы переходят в другие строки",
      "Rx(90°); X = (1, 0, 0), Y = (0, 0, 1), Z = (0, −1, 0)",
    ),
    stage(
      "180°: reverse Y and Z",
      "180°: Y и Z меняют направление",
      "Rx(180°); X = (1, 0, 0), Y = (0, −1, 0), Z = (0, 0, −1)",
    ),
    stage(
      "Return to 0° before smaller turns",
      "Возвращаемся к 0° перед малыми поворотами",
      "Rx(0°); X = (1, 0, 0), Y = (0, 1, 0), Z = (0, 0, 1)",
    ),
    stage("Turn Y and Z about X", "Поворачиваем Y и Z вокруг X", "Rx(15°)"),
    stage(
      "The basis carries the point",
      "Повернувшийся базис перемещает точку",
      "Rx(30°), p = (2, 1, 1)",
    ),
    stage(
      "60°: compare fractional components",
      "60°: сравниваем дробные компоненты",
      "Rx(60°); Y = (0, 0.5, √3/2), Z = (0, −√3/2, 0.5)",
    ),
  ],
  5: [
    stage(
      "Substitute the local coordinates",
      "Подставляем локальные координаты",
      "O + 2X + Y; Rz(0°)",
    ),
    stage(
      "Rotate the basis before the sum",
      "Поворачиваем базис перед сложением",
      "O + 2X + Y; Rz(45°)",
    ),
    stage(
      "Obtain the world position",
      "Получаем мировую координату",
      "Rz(90°); Pworld = (2, 3, 0)",
    ),
  ],
  6: [
    stage(
      "Place the point at the origin",
      "Помещаем точку в начало системы",
      "p = (0, 0, 0), Rx(0°)",
    ),
    stage(
      "Turn the frame: its origin stays fixed",
      "Поворачиваем систему: начало неподвижно",
      "p = (0, 0, 0), Rx(45°)",
    ),
    stage(
      "Keep turning around the fixed point",
      "Продолжаем поворот вокруг неподвижной точки",
      "p = (0, 0, 0), Rx(90°)",
    ),
    stage(
      "Place a point on the rotation axis",
      "Помещаем точку на ось вращения",
      "p = (2, 0, 0), Rx(90°)",
    ),
    stage(
      "An axis point also stays fixed",
      "Точка на оси тоже остаётся неподвижной",
      "p = (2, 0, 0), Rx(135°)",
    ),
  ],
  7: [
    stage(
      "A turning frame moves its point",
      "Поворот системы перемещает её точку",
      "Rx(40°)",
    ),
    stage(
      "A new basis gives a new world position",
      "Новый базис даёт новую мировую координату",
      "Rx(80°)",
    ),
  ],
  8: [
    stage(
      "Give eight vertices one frame",
      "Задаём восьми вершинам одну систему",
      "Euler(20°, 25°, 0°), XYZ",
    ),
    stage(
      "Turn all vertices together",
      "Поворачиваем все вершины вместе",
      "Euler(20°, 25°, 15°), XYZ",
    ),
    stage(
      "The vertices form a rotating cube",
      "Вершины образуют вращающийся куб",
      "Euler(20°, 25°, 30°), XYZ",
    ),
  ],
  9: [
    stage(
      "Inspect the model's surface",
      "Рассматриваем поверхность модели",
      "surface",
    ),
    stage(
      "Reveal the connecting edges",
      "Показываем соединяющие рёбра",
      "wireframe",
    ),
    stage(
      "Reveal the individual vertices",
      "Показываем отдельные вершины",
      "vertices",
    ),
    stage(
      "Reassemble the same surface",
      "Собираем ту же поверхность обратно",
      "surface",
    ),
  ],
  10: [
    stage(
      "Start with an orthonormal basis",
      "Начинаем с ортонормального базиса",
      "Δ R[0,1] = 0",
    ),
    stage(
      "Change one matrix component",
      "Меняем одну компоненту матрицы",
      "Δ R[0,1] = 0.3",
    ),
    stage(
      "The change deforms the model",
      "Изменение деформирует модель",
      "Δ R[0,1] = 0.6",
    ),
    stage(
      "Restore a pure rotation",
      "Возвращаем чистое вращение",
      "Δ R[0,1] = 0",
    ),
  ],
  11: [
    stage("Choose the X axis", "Выбираем ось X", "Rx(0°)"),
    stage("Sweep a sector about X", "Заметаем сектор вокруг X", "Rx(30°)"),
    stage("Widen the X sector", "Увеличиваем сектор вокруг X", "Rx(60°)"),
    stage("Choose the Y axis", "Выбираем ось Y", "Ry(0°)"),
    stage("Sweep a sector about Y", "Заметаем сектор вокруг Y", "Ry(30°)"),
    stage("Widen the Y sector", "Увеличиваем сектор вокруг Y", "Ry(60°)"),
    stage("Choose the Z axis", "Выбираем ось Z", "Rz(0°)"),
    stage("Sweep a sector about Z", "Заметаем сектор вокруг Z", "Rz(30°)"),
    stage("Widen the Z sector", "Увеличиваем сектор вокруг Z", "Rz(60°)"),
  ],
  12: [
    stage(
      "Start with the identity rotation",
      "Начинаем с единичного вращения",
      "R = I",
    ),
    stage(
      "Apply the first Euler angle",
      "Применяем первый угол Эйлера",
      "R = Rx(30°)",
    ),
    stage(
      "Add the second Euler angle",
      "Добавляем второй угол Эйлера",
      "R = Rx(30°) · Ry(40°)",
    ),
    stage(
      "Add the third Euler angle",
      "Добавляем третий угол Эйлера",
      "R = Rx(30°) · Ry(40°) · Rz(25°)",
    ),
  ],
  14: [
    stage(
      "Start with three independent axes",
      "Начинаем с трёх независимых осей",
      "x = 0°, y = 0°, z = 0°",
    ),
    stage(
      "Turn Y toward the singularity",
      "Поворачиваем Y к сингулярности",
      "y: 0° → 45°; x = z = 0°",
    ),
    stage(
      "The first and third axes coincide",
      "Первая и третья оси совпали",
      "y = 90°; X₁ = Z₃",
    ),
    stage(
      "Change x and z in opposite directions",
      "Меняем x и z в противоположные стороны",
      "x: 0° → 45°; z: 0° → −45°; x + z = 0°",
    ),
    stage(
      "Angles change, orientation stays fixed",
      "Углы меняются, ориентация сохраняется",
      "x = 90°, y = 90°, z = −90°; x + z = 0°",
    ),
    stage(
      "Move away from the singularity",
      "Отходим от сингулярности",
      "x = 0°, y = 80°, z = 0°",
    ),
    stage(
      "The same changes now turn the model",
      "Те же изменения теперь вращают модель",
      "x = 45°, y = 80°, z = −45°",
    ),
    stage(
      "The rotations no longer cancel",
      "Повороты больше не компенсируются",
      "x = 90°, y = 80°, z = −90°",
    ),
    stage(
      "Return to coinciding axes",
      "Возвращаем совпавшие оси",
      "x = 0°, y = 90°, z = 0°",
    ),
    stage(
      "Change x alone: the model turns",
      "Меняем только x: модель вращается",
      "x: 0° → 30°; y = 90°, z = 0°",
    ),
    stage(
      "Change z: the orientation returns",
      "Меняем z: ориентация возвращается",
      "z: 0° → −30°; x + z = 0°",
    ),
  ],
  15: [
    stage(
      "Start near the angle boundary",
      "Начинаем у границы угла",
      "179° → −179°",
    ),
    stage(
      "Euler takes the long way",
      "Эйлер идёт по длинной дуге",
      "Euler: 89.5°; SLERP: 179.5°",
    ),
    stage(
      "The paths are farthest apart",
      "Траектории максимально расходятся",
      "Euler: 0°; SLERP: 180°",
    ),
    stage(
      "Both paths approach the endpoint",
      "Обе траектории приближаются к цели",
      "Euler: −89.5°; SLERP: 180.5°",
    ),
    stage(
      "Reach the same final orientation",
      "Приходим к одной конечной ориентации",
      "−179° ≡ 181°",
    ),
  ],
  16: [
    stage(
      "Choose a normalized rotation axis",
      "Выбираем нормированную ось вращения",
      "a = normalize(1, 1, 0); θ = 0°",
    ),
    stage(
      "Encode the first turn as a quaternion",
      "Записываем первый поворот кватернионом",
      "θ = 30°; q = (a sin(θ/2), cos(θ/2))",
    ),
    stage(
      "Increase the axis–angle rotation",
      "Увеличиваем поворот вокруг оси",
      "θ = 75°",
    ),
  ],
  17: [
    stage(
      "Convert the quaternion to a basis",
      "Преобразуем кватернион в базис",
      "R(q); θ = 75°",
    ),
    stage(
      "A further turn updates the matrix",
      "Следующий поворот обновляет матрицу",
      "R(q); θ = 90°",
    ),
  ],
  18: [
    stage(
      "Compare two single-axis paths",
      "Сравниваем два одноосевых пути",
      "179° → −179°; t = 0",
    ),
    stage(
      "Separate the long and short arcs",
      "Разводим длинную и короткую дуги",
      "t = 0.25",
    ),
    stage(
      "Compare their middle orientations",
      "Сравниваем промежуточные ориентации",
      "t = 0.5",
    ),
    stage(
      "Approach the single-axis endpoint",
      "Приближаемся к одноосевой цели",
      "t = 0.75",
    ),
    stage(
      "Finish the single-axis comparison",
      "Завершаем одноосевое сравнение",
      "t = 1",
    ),
    stage(
      "Start a compound rotation",
      "Начинаем составное вращение",
      "Euler / SLERP; t = 0",
    ),
    stage(
      "The compound paths diverge",
      "Составные траектории расходятся",
      "t = 0.25",
    ),
    stage(
      "Compare compound middle orientations",
      "Сравниваем середины составных траекторий",
      "t = 0.5",
    ),
    stage(
      "Approach the compound endpoint",
      "Приближаемся к составной цели",
      "t = 0.75",
    ),
    stage(
      "Reach the common compound endpoint",
      "Приходим к общей составной цели",
      "t = 1",
    ),
  ],
  19: [
    stage(
      "Set Object3D through Euler angles",
      "Задаём Object3D углами Эйлера",
      "rotation.set(30°, 40°, 25°, XYZ)",
    ),
    stage(
      "Express the same turn as a quaternion",
      "Выражаем тот же поворот кватернионом",
      "R(q) = R(Euler)",
    ),
    stage(
      "Add a rotated parent frame",
      "Добавляем повёрнутую родительскую систему",
      "matrixWorld = Ry(35°) · matrix",
    ),
  ],
};
