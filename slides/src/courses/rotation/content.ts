import { snapshots, sequenceKey, type RotationSnapshot } from "./snapshots";
export type Language = "en" | "ru";
export interface LessonText {
  title: string;
  body: string;
  takeaway: string;
  hint: string;
}
const en: LessonText[] = [
  {
    title: "A point in space",
    body: "A point has a position. Its coordinates describe that position relative to a coordinate system. Start in the XY plane.",
    takeaway: "Coordinates need a reference frame.",
    hint: "Orbit the camera and hover over the point to inspect coordinates.",
  },
  {
    title: "Moving along a vector",
    body: "Translation is addition: move the point by d = (1, 2, 0). Its coordinates update all along the path.",
    takeaway: "p′ = p + d",
    hint: "Advance one step to move along the vector; go back to retrace it.",
  },
  {
    title: "What rotates — and around what?",
    body: "The local frame initially matches the world frame. Turn the local frame around Z, keeping the world axes fixed. The point keeps its local coordinates.",
    takeaway: "Fixed local coordinates can produce changing world coordinates.",
    hint: "Follow the local axes and arc as you advance.",
  },
  {
    title: "An origin of its own",
    body: "The local origin moves to T = (3, 1, 0). We turn its basis while T stays fixed. The orbit is now centered on T, not the world origin.",
    takeaway: "The rotation center need not be the world origin.",
    hint: "Watch the frame and point move together between steps.",
  },
  {
    title: "The basis fits into a matrix",
    body: "The three basis vectors X, Y, Z become the first three columns of Matrix4; the translation vector T becomes the fourth and locates the local origin. Each column is expressed in world coordinates. Rotation changes X, Y and Z while T stays fixed.",
    takeaway:
      "Rotation is the 3×3 block; the fourth column carries translation.",
    hint: "First turn by 90° and 180°: the rotation block contains only 0 and ±1. Then compare smaller angles and follow the colored addition chain.",
  },
  {
    title: "Computing the world position",
    body: "Multiply each basis vector by the corresponding local component: X by x, Y by y, Z by z. Add these three vectors and the origin T. applyMatrix4 performs this calculation. For T = (3,1,0), p = (2,1,0) and a 90° turn around Z, the world position is (2,3,0).",
    takeaway: "One matrix maps a local position into world space.",
    hint: "Compare each world position with the matrix expansion.",
  },
  {
    title: "A point on the rotation axis",
    body: "At the local origin, the point stays at T for any rotation with a fixed T. A nonzero point on the rotation axis also stays put. A point has no observable orientation of its own.",
    takeaway: "Rotation leaves points on its axis fixed.",
    hint: "Advance to compare the origin and a point on the axis.",
  },
  {
    title: "Rotation through a local frame",
    body: "First move the point off the X axis, from (2,0,0) to (2,1,1), keeping the frame at 135°. Only then turn the frame while keeping these local coordinates fixed. The off-axis point now moves around the axis.",
    takeaway: "Off-axis points trace circles around the rotation axis.",
    hint: "First change only the point’s local coordinates; next change only the frame’s rotation.",
  },
  {
    title: "Eight points become a cube",
    body: "All eight vertices share one frame and one transformation. Their local coordinates stay fixed. The same rotation preserves every distance between them.",
    takeaway: "A rigid transform preserves the shape.",
    hint: "Hover over a vertex to inspect its local and world coordinates.",
  },
  {
    title: "The same rule, many more vertices",
    body: "A torus knot is just a more complex collection of vertices. Each gets the same transform. The renderer computes transformed positions without rewriting the original geometry.",
    takeaway: "One common rotation makes a whole model turn.",
    hint: "Advance to inspect the surface, wireframe and vertices.",
  },
  {
    title: "Nine numbers, with constraints",
    body: "For a pure rotation the basis vectors stay unit-length, mutually perpendicular, and right-handed. Arbitrary edits can stretch or shear the model.",
    takeaway: "RᵀR = I and det(R) = +1",
    hint: "Advance to see deformation, then restoration of the rotation basis.",
  },
  {
    title: "One angle around one axis",
    body: "A single axis rotation comes from sin and cos. For Rx, X stays fixed while Y and Z turn in the YZ plane. The UI uses degrees; Three.js uses radians.",
    takeaway: "An angle is an easier input than nine constrained entries.",
    hint: "Advance through X, Y and Z rotations.",
  },
  {
    title: "Three angles: Euler rotation",
    body: "Three.js uses rotations around successive local axes. For XYZ: turn around X, then the Y axis already turned by X, then the Z axis turned by both previous rotations. Think of nested frames: the frame produced by each rotation acts as the parent for the next.",
    takeaway: "Euler angles include an order and an axis convention.",
    hint: "For XYZ, R = Rx · Ry · Rz. A matrix product applied to a column vector acts from right to left; the local-axis sequence above describes rotations of the frame.",
  },
  {
    title: "Order changes the result",
    body: "We have turned this model in XYZ order. Return it to the starting orientation, then apply the same angles in YXZ order: Y = 40°, X = 30°, Z = 25°. Watch each turn and compare the final orientation with the preceding group.",
    takeaway: "Angles alone do not fully specify an Euler orientation.",
    hint: "Step backward and forward between the XYZ and YXZ sequences.",
  },
  {
    title: "Gimbal lock: losing independence",
    body: "For XYZ, at Y = 90°, the X and Z rotation axes and planes coincide. Either angle still turns the model on its own. Increasing X while decreasing Z by the same amount cancels their effects: the angles change, but the model stays still.",
    takeaway:
      "At Y = 90°, X and Z no longer provide independent rotation directions.",
    hint: "First turn X alone, then undo it with Z. Finally change both angles together.",
  },
  {
    title: "Interpolation can take the long way",
    body: "Interpolating directly from +179° to −179° goes through 0°: almost a whole turn. Crossing 180° is just a 2° path. This boundary problem is separate from gimbal lock.",
    takeaway:
      "Linear interpolation of angle values is not necessarily the shortest rotation.",
    hint: "Follow both paths one frame at a time.",
  },
  {
    title: "Axis–angle becomes a quaternion",
    body: "A unit quaternion has four components (x,y,z,w). It encodes an axis a and an angle θ using the half-angle: the axis and angle are not stored directly.",
    takeaway: "qxyz = a sin(θ/2), qw = cos(θ/2)",
    hint: "Advance to see the angle encoded in four components.",
  },
  {
    title: "Quaternion to rotation matrix",
    body: "The quaternion gives us the same rotated basis as a matrix. Its columns are still X, Y and Z. Add an origin to obtain a full rigid Matrix4.",
    takeaway:
      "A quaternion can produce a matrix — or rotate a vector directly.",
    hint: "Compare the quaternion, matrix and axes across the next frames.",
  },
  {
    title: "A smooth path with SLERP",
    body: "Spherical interpolation follows a shortest orientation path. With linear time, it has constant angular speed. At exactly 180° the shortest path is ambiguous; intentional full turns need extra keys or a specified path.",
    takeaway: "Use quaternion SLERP between orientations.",
    hint: "Advance through the single-axis and compound examples.",
  },
  {
    title: "Inside Object3D",
    body: "rotation (Euler) and quaternion are synchronized views of the same local orientation. matrix combines local position, orientation and scale; matrixWorld also includes the parents. Update the matrices before reading them manually.",
    takeaway: "Input angles → quaternion → transform matrix → world vertices.",
    hint: "Advance from Euler to quaternion and then to a rotated parent.",
  },
  {
    title: "From parameters to positions",
    body: "A rotation matrix describes a rotated orthonormal basis. Euler angles are intuitive inputs but need an order and have singularities. Unit quaternions support composition and smooth interpolation. One transform applies to every vertex.",
    takeaway: "Parameters → orientation → matrix → world positions.",
    hint: "Orbit the camera or return to any earlier step.",
  },
];
const ru: LessonText[] = [
  {
    title: "Точка в пространстве",
    body: "У точки есть положение. Координаты описывают его относительно выбранной системы. Начнём в плоскости XY.",
    takeaway: "Координатам нужна система отсчёта.",
    hint: "Покрутите камеру и наведите на точку, чтобы увидеть координаты.",
  },
  {
    title: "Смещение на вектор",
    body: "Перенос — это сложение: смещаем точку на d = (1, 2, 0). Координаты обновляются на всём пути.",
    takeaway: "p′ = p + d",
    hint: "Перейдите дальше для смещения; назад — чтобы пройти путь в обратную сторону.",
  },
  {
    title: "Что вращаем и вокруг чего?",
    body: "Локальная система сначала совпадает с мировой. Поворачиваем локальную вокруг Z; мировые оси неподвижны. Локальные координаты точки сохраняются.",
    takeaway:
      "Постоянные локальные координаты могут давать меняющиеся мировые.",
    hint: "Следите за локальными осями и дугой при переходах.",
  },
  {
    title: "Собственное начало координат",
    body: "Начало локальной системы теперь T = (3, 1, 0). Поворачиваем базис при фиксированном T. Орбита строится вокруг T, а не мирового нуля.",
    takeaway: "Центр вращения не обязан совпадать с мировым нулём.",
    hint: "Следите, как система и точка смещаются вместе между шагами.",
  },
  {
    title: "Базис укладывается в матрицу",
    body: "Три базисных вектора X, Y, Z укладываем в первые три столбца Matrix4, вектор смещения T — в четвёртый: он задаёт положение локального начала. Каждый столбец записан в мировых координатах. При вращении меняются X, Y и Z; начало T остаётся на месте.",
    takeaway: "Вращение — блок 3×3; четвёртый столбец хранит смещение.",
    hint: "Сначала повороты на 90° и 180°: в блоке вращения только 0 и ±1. Затем сравните меньшие углы и проследите цепочку цветных слагаемых.",
  },
  {
    title: "Вычисляем мировую координату",
    body: "Умножаем каждый базисный вектор на соответствующую локальную компоненту: X на x, Y на y, Z на z. Складываем эти три вектора и прибавляем начало T. applyMatrix4 выполняет этот расчёт. При T = (3,1,0), p = (2,1,0) и повороте вокруг Z на 90° мировая координата равна (2,3,0).",
    takeaway: "Одна матрица переводит локальное положение в мировое.",
    hint: "Сравнивайте мировое положение с разложением по матрице.",
  },
  {
    title: "Точка на оси вращения",
    body: "В локальном нуле точка остаётся в T при любом повороте с фиксированным T. Ненулевая точка на оси тоже неподвижна. У отдельной точки нет наблюдаемой собственной ориентации.",
    takeaway: "Вращение сохраняет положение точек на оси.",
    hint: "Пройдите дальше, чтобы сравнить начало и точку на оси.",
  },
  {
    title: "Вращение через локальную систему",
    body: "Сначала смещаем точку с оси X: из (2,0,0) в (2,1,1), сохраняя поворот системы 135°. Только затем поворачиваем систему, оставляя эти локальные координаты постоянными. Теперь точка вне оси движется вокруг неё.",
    takeaway: "Точки вне оси движутся по окружностям вокруг оси.",
    hint: "На первом шаге меняются только локальные координаты точки, на следующем — только поворот системы.",
  },
  {
    title: "Восемь точек образуют куб",
    body: "Все восемь вершин имеют общую систему и одно преобразование. Локальные координаты постоянны. Одинаковое вращение сохраняет расстояния между вершинами.",
    takeaway: "Жёсткое преобразование сохраняет форму.",
    hint: "Наведите на вершину и сравните её локальные и мировые координаты.",
  },
  {
    title: "То же правило, больше вершин",
    body: "Тороидальный узел — более сложный набор вершин. Каждая получает одно преобразование. Рендерер вычисляет положения без перезаписи исходной геометрии.",
    takeaway: "Общее вращение поворачивает всю модель.",
    hint: "Пройдите шаги с поверхностью, каркасом и вершинами.",
  },
  {
    title: "Девять чисел с ограничениями",
    body: "При чистом вращении базис остаётся единичным, взаимно перпендикулярным и правым. Произвольные изменения могут растянуть или скосить модель.",
    takeaway: "RᵀR = I и det(R) = +1",
    hint: "Пройдите к деформации, затем к восстановленному базису вращения.",
  },
  {
    title: "Один угол вокруг одной оси",
    body: "Осевой поворот вычисляется через sin и cos. При Rx ось X неподвижна, Y и Z поворачиваются в YZ. В интерфейсе градусы, в Three.js радианы.",
    takeaway: "Угол удобнее девяти связанных элементов.",
    hint: "Пройдите повороты вокруг X, Y и Z.",
  },
  {
    title: "Три угла: вращение Эйлера",
    body: "Three.js использует последовательные локальные оси. Для XYZ: поворот вокруг X, затем вокруг уже повёрнутой оси Y, затем вокруг оси Z, повёрнутой первыми двумя вращениями. Можно представить вложенные системы: результат каждого поворота служит родительской системой для следующего.",
    takeaway: "Углы Эйлера включают порядок и соглашение об осях.",
    hint: "Для XYZ: R = Rx · Ry · Rz. На вектор-столбец матричное произведение действует справа налево; описанная выше последовательность относится к поворотам локальной системы.",
  },
  {
    title: "Порядок меняет результат",
    body: "Мы уже повернули эту модель в порядке XYZ. Вернём её к началу и применим те же углы в порядке YXZ: Y = 40°, X = 30°, Z = 25°. Проследите каждый поворот и сравните конечную ориентацию с предыдущей группой.",
    takeaway: "Одних углов недостаточно: нужен порядок.",
    hint: "Пройдите назад и вперёд через последовательности XYZ и YXZ.",
  },
  {
    title: "Гимбал-лок: потеря независимости",
    body: "Для XYZ при Y = 90° оси и плоскости вращения X и Z совпадают. По отдельности оба угла поворачивают модель. Если увеличивать X и на столько же уменьшать Z, повороты компенсируются: углы меняются, а модель неподвижна.",
    takeaway:
      "При Y = 90° углы X и Z больше не дают независимых направлений вращения.",
    hint: "Сначала поверните X, затем отмените поворот через Z. После этого меняйте оба угла вместе.",
  },
  {
    title: "Интерполяция может выбрать длинный путь",
    body: "Прямой переход от +179° к −179° проходит через 0°: почти полный оборот. Через границу 180° путь составляет 2°. Это отдельная проблема, не гимбал-лок.",
    takeaway: "Линейная интерполяция чисел не гарантирует кратчайшее вращение.",
    hint: "Следите за обоими путями кадр за кадром.",
  },
  {
    title: "Ось–угол превращается в кватернион",
    body: "Единичный кватернион имеет четыре компоненты (x,y,z,w). Он кодирует ось a и угол θ через половину угла: ось и угол не хранятся напрямую.",
    takeaway: "qxyz = a sin(θ/2), qw = cos(θ/2)",
    hint: "Перейдите дальше и наблюдайте кодирование угла четырьмя компонентами.",
  },
  {
    title: "Из кватерниона в матрицу",
    body: "Кватернион даёт тот же повёрнутый базис. Столбцы матрицы — X, Y и Z. Добавив начало, получим жёсткое преобразование Matrix4.",
    takeaway:
      "Кватернион может дать матрицу или непосредственно повернуть вектор.",
    hint: "Сравните кватернион, матрицу и оси на следующих кадрах.",
  },
  {
    title: "Плавный путь через SLERP",
    body: "Сферическая интерполяция идёт по кратчайшему пути ориентации с постоянной угловой скоростью при линейном времени. При ровно 180° путь неоднозначен. Полные обороты требуют дополнительных ключей или траектории.",
    takeaway: "Между ориентациями используем quaternion SLERP.",
    hint: "Пройдите одноосевой и составной примеры.",
  },
  {
    title: "Внутри Object3D",
    body: "rotation (Euler) и quaternion синхронизированы и задают одну локальную ориентацию. matrix объединяет положение, ориентацию и масштаб; matrixWorld учитывает родителей. Перед ручным чтением обновляем матрицы.",
    takeaway: "Углы → кватернион → матрица → мировые вершины.",
    hint: "Пройдите от Euler к кватерниону, затем к повёрнутому родителю.",
  },
  {
    title: "От параметров к положениям",
    body: "Матрица вращения описывает повёрнутый ортонормированный базис. Углы Эйлера понятны, но требуют порядка и имеют сингулярности. Кватернионы удобны для композиции и интерполяции. Все вершины получают одно преобразование.",
    takeaway: "Параметры → ориентация → матрица → мировые координаты.",
    hint: "Покрутите камеру или вернитесь к любому предыдущему шагу.",
  },
];
export const topics = { en, ru };
const sequenceTitles: Record<string, { en: string; ru: string }> = {
  "topic-2": { en: "Local rotation", ru: "Локальное вращение" },
  "topic-3": { en: "Rotation centre", ru: "Центр вращения" },
  "topic-4": { en: "Basis and matrix", ru: "Базис и матрица" },
  "topic-5": { en: "World position", ru: "Мировая координата" },
  "topic-6": { en: "Fixed points", ru: "Неподвижные точки" },
  "topic-7": { en: "Off-axis point", ru: "Точка вне оси" },
  "topic-8": { en: "Cube rotation", ru: "Вращение куба" },
  "topic-9": { en: "Model vertices", ru: "Вершины модели" },
  "topic-10": { en: "Rotation basis", ru: "Базис вращения" },
  "topic-11": { en: "Single-axis rotation", ru: "Поворот вокруг оси" },
  "topic-12": { en: "Euler angles · XYZ", ru: "Углы Эйлера · XYZ" },
  "topic-13": { en: "Rotation order · YXZ", ru: "Порядок поворотов · YXZ" },
  "euler-limits": {
    en: "Euler angle limitations",
    ru: "Недостатки углов Эйлера",
  },
  "gimbal-basis": { en: "Gimbal lock", ru: "Гимбал лок" },
  "gimbal-rings": { en: "Gimbal lock with rings", ru: "Гимбал лок с кольцами" },
  "topic-15": { en: "Angle interpolation", ru: "Интерполяция углов" },
  "topic-16": { en: "Quaternion", ru: "Кватернион" },
  "topic-17": { en: "Quaternion matrix", ru: "Матрица кватерниона" },
  "topic-18": { en: "SLERP", ru: "SLERP" },
  "topic-19": { en: "Object3D", ru: "Object3D" },
  "topic-20": { en: "Summary", ru: "Итоги" },
};
export function topicTitle(step: RotationSnapshot, language: Language): string {
  const name = sequenceTitles[sequenceKey(step)];
  if (!name) throw new Error(`Missing topic title for ${step.id}`);
  return name[language];
}
export function stepLabel(step: RotationSnapshot, language: Language): string {
  const description =
    step.caption?.[language] ?? topics[language][step.topic].title;
  return `${topicTitle(step, language)}: ${description}`;
}
function localizedLessons(language: Language) {
  return snapshots.map((step) => ({
    ...topics[language][step.topic],
    topicTitle: topicTitle(step, language),
    navigationTitle: stepLabel(step, language),
    title: step.caption?.[language] ?? topics[language][step.topic].title,
    body: step.explanation?.body[language] ?? topics[language][step.topic].body,
    takeaway:
      step.explanation?.takeaway[language] ??
      topics[language][step.topic].takeaway,
    hint: step.explanation?.hint[language] ?? topics[language][step.topic].hint,
  }));
}
export const lessons = {
  en: localizedLessons("en"),
  ru: localizedLessons("ru"),
};
export const chapters = {
  en: [
    "Point & frame",
    "Basis & matrix",
    "A whole model",
    "Euler angles",
    "Quaternions",
  ],
  ru: [
    "Точка и система",
    "Базис и матрица",
    "Целая модель",
    "Углы Эйлера",
    "Кватернионы",
  ],
};
export const chapterIndex = (index: number): number =>
  snapshots[index].topic < 4
    ? 0
    : snapshots[index].topic < 8
      ? 1
      : snapshots[index].topic < 11
        ? 2
        : snapshots[index].topic < 16
          ? 3
          : 4;
