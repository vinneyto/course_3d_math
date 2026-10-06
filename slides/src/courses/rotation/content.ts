import { snapshots } from "./snapshots";
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
    body: "The local origin moves to O = (3, 1, 0). We turn its basis while O stays fixed. The orbit is now centered on O, not the world origin.",
    takeaway: "The rotation center need not be the world origin.",
    hint: "Watch the frame and point move together between steps.",
  },
  {
    title: "The basis fits into a matrix",
    body: "The three basis vectors X, Y, Z become the first three columns of Matrix4; the origin O becomes the fourth. Each column is expressed in world coordinates. Rotation changes X, Y and Z while O stays fixed.",
    takeaway:
      "Rotation is the 3×3 block; the fourth column carries translation.",
    hint: "First turn by 90° and 180°: the rotation block contains only 0 and ±1. Then compare smaller angles and follow the colored addition chain.",
  },
  {
    title: "Computing the world position",
    body: "Multiply each basis vector by the corresponding local component: X by x, Y by y, Z by z. Add these three vectors and the origin O. applyMatrix4 performs this calculation. For O = (3,1,0), p = (2,1,0) and a 90° turn around Z, the world position is (2,3,0).",
    takeaway: "One matrix maps a local position into world space.",
    hint: "Compare each world position with the matrix expansion.",
  },
  {
    title: "A point on the rotation axis",
    body: "At the local origin, the point stays at O for any rotation with a fixed O. A nonzero point on the rotation axis also stays put. A point has no observable orientation of its own.",
    takeaway: "Rotation leaves points on its axis fixed.",
    hint: "Advance to compare the origin and a point on the axis.",
  },
  {
    title: "Rotation through a local frame",
    body: "We represent the rotation by turning a local frame while keeping the point’s local position fixed. This is a useful representation, not a requirement that every point has its own container.",
    takeaway: "Off-axis points trace circles around the rotation axis.",
    hint: "Compare the local coordinates with the world position.",
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
    body: "Three.js uses intrinsic rotations around successive local axes. For order XYZ and column vectors, R = Rx · Ry · Rz. A product applied directly to a vector acts from right to left; that is not the same wording as successive turns about moving axes.",
    takeaway: "Euler angles include an order and an axis convention.",
    hint: "Advance one composition stage at a time; go back to reverse it.",
  },
  {
    title: "Order changes the result",
    body: "Compare XYZ and YXZ with exactly the same angles. Rotations generally do not commute. A different order can produce a different final orientation.",
    takeaway: "Angles alone do not fully specify an Euler orientation.",
    hint: "Orbit the camera and compare the two models.",
  },
  {
    title: "Gimbal lock: losing independence",
    body: "For XYZ, at y = 90°, the first and third rotation axes coincide. Then increasing x while decreasing z by the same amount leaves the orientation unchanged. Neither control is simply disabled: they have become dependent.",
    takeaway: "Gimbal lock is a singularity of the Euler parameterization.",
    hint: "Advance through the singularity and the separate angle changes.",
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
    body: "Начало локальной системы теперь O = (3, 1, 0). Поворачиваем базис при фиксированном O. Орбита строится вокруг O, а не мирового нуля.",
    takeaway: "Центр вращения не обязан совпадать с мировым нулём.",
    hint: "Следите, как система и точка смещаются вместе между шагами.",
  },
  {
    title: "Базис укладывается в матрицу",
    body: "Три базисных вектора X, Y, Z укладываем в первые три столбца Matrix4, начало O — в четвёртый. Каждый столбец записан в мировых координатах. При вращении меняются X, Y и Z; начало O остаётся на месте.",
    takeaway: "Вращение — блок 3×3; четвёртый столбец хранит смещение.",
    hint: "Сначала повороты на 90° и 180°: в блоке вращения только 0 и ±1. Затем сравните меньшие углы и проследите цепочку цветных слагаемых.",
  },
  {
    title: "Вычисляем мировую координату",
    body: "Умножаем каждый базисный вектор на соответствующую локальную компоненту: X на x, Y на y, Z на z. Складываем эти три вектора и прибавляем начало O. applyMatrix4 выполняет этот расчёт. При O = (3,1,0), p = (2,1,0) и повороте вокруг Z на 90° мировая координата равна (2,3,0).",
    takeaway: "Одна матрица переводит локальное положение в мировое.",
    hint: "Сравнивайте мировое положение с разложением по матрице.",
  },
  {
    title: "Точка на оси вращения",
    body: "В локальном нуле точка остаётся в O при любом повороте с фиксированным O. Ненулевая точка на оси тоже неподвижна. У отдельной точки нет наблюдаемой собственной ориентации.",
    takeaway: "Вращение сохраняет положение точек на оси.",
    hint: "Пройдите дальше, чтобы сравнить начало и точку на оси.",
  },
  {
    title: "Вращение через локальную систему",
    body: "Представляем вращение через поворот локальной системы при постоянных локальных координатах точки. Это удобная модель, а не требование иметь отдельный контейнер для каждой точки.",
    takeaway: "Точки вне оси движутся по окружностям вокруг оси.",
    hint: "Сравните локальные координаты с мировым положением.",
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
    body: "Three.js использует последовательные локальные оси. Для XYZ и векторов-столбцов R = Rx · Ry · Rz. При применении произведения к вектору правый множитель действует первым; это отличается от описания поворотов вокруг движущихся осей.",
    takeaway: "Углы Эйлера включают порядок и соглашение об осях.",
    hint: "Проходите композицию по одному этапу; назад — для обратного движения.",
  },
  {
    title: "Порядок меняет результат",
    body: "Сравните XYZ и YXZ при одинаковых углах. Вращения в общем случае не коммутируют; другой порядок может дать другую ориентацию.",
    takeaway: "Одних углов недостаточно: нужен порядок.",
    hint: "Покрутите камеру и сравните две модели.",
  },
  {
    title: "Гимбал-лок: потеря независимости",
    body: "Для XYZ при y = 90° оси первого и третьего вращений совпадают. Рост x и равное уменьшение z сохраняют ориентацию. Управления не выключаются — они становятся зависимыми.",
    takeaway: "Гимбал-лок — сингулярность параметризации Эйлера.",
    hint: "Пройдите сингулярность и отдельные изменения углов.",
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
export const lessons = {
  en: snapshots.map((step) => ({
    ...en[step.topic],
    title: step.caption?.en ?? en[step.topic].title,
  })),
  ru: snapshots.map((step) => ({
    ...ru[step.topic],
    title: step.caption?.ru ?? ru[step.topic].title,
  })),
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
