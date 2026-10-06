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
    hint: "Drag the point, or change its x and y below.",
  },
  {
    title: "Moving along a vector",
    body: "Translation is addition: move the point by d = (1, 2, 0). Its coordinates update all along the path.",
    takeaway: "p′ = p + d",
    hint: "Play the movement, then scrub through it.",
  },
  {
    title: "What rotates — and around what?",
    body: "The local frame initially matches the world frame. Turn the local frame around Z, keeping the world axes fixed. The point keeps its local coordinates.",
    takeaway: "Fixed local coordinates can produce changing world coordinates.",
    hint: "Change the angle. Watch the two coordinate readouts and the arc.",
  },
  {
    title: "An origin of its own",
    body: "The local origin moves to O = (3, 1, 0). We turn its basis while O stays fixed. The orbit is now centered on O, not the world origin.",
    takeaway: "The rotation center need not be the world origin.",
    hint: "Rotate the local frame or change its origin.",
  },
  {
    title: "A frame is an origin and a basis",
    body: "In 3D a frame has three basis vectors X, Y, Z and an origin O. Build a world position by adding the three weighted basis vectors to the origin.",
    takeaway: "pworld = O + xX + yY + zZ",
    hint: "Orbit the camera. Follow the colored addition chain.",
  },
  {
    title: "The same idea in Matrix4",
    body: "The first three columns hold the basis. The fourth holds the origin. For this rigid transform, the upper-left 3×3 block is the rotation.",
    takeaway: "Rotation is 3×3; the 4×4 matrix also carries translation.",
    hint: "Turn around X. Notice which columns change.",
  },
  {
    title: "Computing the world position",
    body: "Apply the local-to-world matrix to a copy of the local point. The original stays unchanged. For O = (3,1,0), p = (2,1,0), and a 90° turn around Z, the result is (2,3,0).",
    takeaway: "One matrix maps a local position into world space.",
    hint: "Change the angle and follow the numerical expansion.",
  },
  {
    title: "A point on the rotation axis",
    body: "At the local origin, the point stays at O for any rotation with a fixed O. A nonzero point on the rotation axis also stays put. A point has no observable orientation of its own.",
    takeaway: "Rotation leaves points on its axis fixed.",
    hint: "Compare the local origin with a point on X. Rotate around X.",
  },
  {
    title: "Rotation through a local frame",
    body: "We represent the rotation by turning a local frame while keeping the point’s local position fixed. This is a useful representation, not a requirement that every point has its own container.",
    takeaway: "Off-axis points trace circles around the rotation axis.",
    hint: "Try a complete turn and compare local and world coordinates.",
  },
  {
    title: "Eight points become a cube",
    body: "All eight vertices share one frame and one transformation. Their local coordinates stay fixed. The same rotation preserves every distance between them.",
    takeaway: "A rigid transform preserves the shape.",
    hint: "Click a vertex to inspect it, then rotate the cube.",
  },
  {
    title: "The same rule, many more vertices",
    body: "A torus knot is just a more complex collection of vertices. Each gets the same transform. The renderer computes transformed positions without rewriting the original geometry.",
    takeaway: "One common rotation makes a whole model turn.",
    hint: "Switch between surface, wireframe and vertices.",
  },
  {
    title: "Nine numbers, with constraints",
    body: "For a pure rotation the basis vectors stay unit-length, mutually perpendicular, and right-handed. Arbitrary edits can stretch or shear the model.",
    takeaway: "RᵀR = I and det(R) = +1",
    hint: "Change one matrix entry. Compare the basis lengths and dot products.",
  },
  {
    title: "One angle around one axis",
    body: "A single axis rotation comes from sin and cos. For Rx, X stays fixed while Y and Z turn in the YZ plane. The UI uses degrees; Three.js uses radians.",
    takeaway: "An angle is an easier input than nine constrained entries.",
    hint: "Select X, Y or Z and vary the angle.",
  },
  {
    title: "Three angles: Euler rotation",
    body: "Three.js uses intrinsic rotations around successive local axes. For order XYZ and column vectors, R = Rx · Ry · Rz. A product applied directly to a vector acts from right to left; that is not the same wording as successive turns about moving axes.",
    takeaway: "Euler angles include an order and an axis convention.",
    hint: "Scrub the stages to see the local axes turn one at a time.",
  },
  {
    title: "Order changes the result",
    body: "Compare XYZ and YXZ with exactly the same angles. Rotations generally do not commute. A different order can produce a different final orientation.",
    takeaway: "Angles alone do not fully specify an Euler orientation.",
    hint: "Change all three angles and compare the two models.",
  },
  {
    title: "Gimbal lock: losing independence",
    body: "For XYZ, at y = 90°, the first and third rotation axes coincide. Then increasing x while decreasing z by the same amount leaves the orientation unchanged. Neither control is simply disabled: they have become dependent.",
    takeaway: "Gimbal lock is a singularity of the Euler parameterization.",
    hint: "Play to reach 90°, then watch x and z cancel. Compare with y = 80°.",
  },
  {
    title: "Interpolation can take the long way",
    body: "Interpolating directly from +179° to −179° goes through 0°: almost a whole turn. Crossing 180° is just a 2° path. This boundary problem is separate from gimbal lock.",
    takeaway:
      "Linear interpolation of angle values is not necessarily the shortest rotation.",
    hint: "Compare the orange Euler path and mint quaternion path.",
  },
  {
    title: "Axis–angle becomes a quaternion",
    body: "A unit quaternion has four components (x,y,z,w). It encodes an axis a and an angle θ using the half-angle: the axis and angle are not stored directly.",
    takeaway: "qxyz = a sin(θ/2), qw = cos(θ/2)",
    hint: "Change the axis and angle. q and −q describe the same rotation.",
  },
  {
    title: "Quaternion to rotation matrix",
    body: "The quaternion gives us the same rotated basis as a matrix. Its columns are still X, Y and Z. Add an origin to obtain a full rigid Matrix4.",
    takeaway:
      "A quaternion can produce a matrix — or rotate a vector directly.",
    hint: "Watch the components, matrix values and colored axes update together.",
  },
  {
    title: "A smooth path with SLERP",
    body: "Spherical interpolation follows a shortest orientation path. With linear time, it has constant angular speed. At exactly 180° the shortest path is ambiguous; intentional full turns need extra keys or a specified path.",
    takeaway: "Use quaternion SLERP between orientations.",
    hint: "Try the single-axis boundary case and a compound rotation.",
  },
  {
    title: "Inside Object3D",
    body: "rotation (Euler) and quaternion are synchronized views of the same local orientation. matrix combines local position, orientation and scale; matrixWorld also includes the parents. Update the matrices before reading them manually.",
    takeaway: "Input angles → quaternion → transform matrix → world vertices.",
    hint: "Switch input representations and add a rotated parent frame.",
  },
  {
    title: "From parameters to positions",
    body: "A rotation matrix describes a rotated orthonormal basis. Euler angles are intuitive inputs but need an order and have singularities. Unit quaternions support composition and smooth interpolation. One transform applies to every vertex.",
    takeaway: "Parameters → orientation → matrix → world positions.",
    hint: "Explore the model, or return to any earlier demonstration.",
  },
];
const ru: LessonText[] = [
  {
    title: "Точка в пространстве",
    body: "У точки есть положение. Координаты описывают его относительно выбранной системы. Начнём в плоскости XY.",
    takeaway: "Координатам нужна система отсчёта.",
    hint: "Перетащите точку или измените x и y.",
  },
  {
    title: "Смещение на вектор",
    body: "Перенос — это сложение: смещаем точку на d = (1, 2, 0). Координаты обновляются на всём пути.",
    takeaway: "p′ = p + d",
    hint: "Запустите движение, затем перемотайте его ползунком.",
  },
  {
    title: "Что вращаем и вокруг чего?",
    body: "Локальная система сначала совпадает с мировой. Поворачиваем локальную вокруг Z; мировые оси неподвижны. Локальные координаты точки сохраняются.",
    takeaway:
      "Постоянные локальные координаты могут давать меняющиеся мировые.",
    hint: "Меняйте угол. Следите за двумя наборами координат и дугой.",
  },
  {
    title: "Собственное начало координат",
    body: "Начало локальной системы теперь O = (3, 1, 0). Поворачиваем базис при фиксированном O. Орбита строится вокруг O, а не мирового нуля.",
    takeaway: "Центр вращения не обязан совпадать с мировым нулём.",
    hint: "Поверните систему или измените её начало.",
  },
  {
    title: "Система — это начало и базис",
    body: "В 3D система содержит три базисных вектора X, Y, Z и начало O. Складываем взвешенные базисные векторы и добавляем начало.",
    takeaway: "pworld = O + xX + yY + zZ",
    hint: "Покрутите камеру. Проследите цепочку цветных слагаемых.",
  },
  {
    title: "Тот же смысл в Matrix4",
    body: "Первые три столбца хранят базис, четвёртый — начало. Для этого жёсткого преобразования верхний левый блок 3×3 задаёт вращение.",
    takeaway: "Вращение — 3×3; матрица 4×4 добавляет смещение.",
    hint: "Поверните вокруг X. Какие столбцы меняются?",
  },
  {
    title: "Вычисляем мировую координату",
    body: "Применяем матрицу к копии локальной точки, сохраняя оригинал. При O = (3,1,0), p = (2,1,0) и повороте на 90° вокруг Z получаем (2,3,0).",
    takeaway: "Одна матрица переводит локальное положение в мировое.",
    hint: "Меняйте угол и следите за численным разложением.",
  },
  {
    title: "Точка на оси вращения",
    body: "В локальном нуле точка остаётся в O при любом повороте с фиксированным O. Ненулевая точка на оси тоже неподвижна. У отдельной точки нет наблюдаемой собственной ориентации.",
    takeaway: "Вращение сохраняет положение точек на оси.",
    hint: "Сравните локальный ноль и точку на X. Вращайте вокруг X.",
  },
  {
    title: "Вращение через локальную систему",
    body: "Представляем вращение через поворот локальной системы при постоянных локальных координатах точки. Это удобная модель, а не требование иметь отдельный контейнер для каждой точки.",
    takeaway: "Точки вне оси движутся по окружностям вокруг оси.",
    hint: "Попробуйте полный оборот и сравните координаты.",
  },
  {
    title: "Восемь точек образуют куб",
    body: "Все восемь вершин имеют общую систему и одно преобразование. Локальные координаты постоянны. Одинаковое вращение сохраняет расстояния между вершинами.",
    takeaway: "Жёсткое преобразование сохраняет форму.",
    hint: "Выберите вершину и покрутите куб.",
  },
  {
    title: "То же правило, больше вершин",
    body: "Тороидальный узел — более сложный набор вершин. Каждая получает одно преобразование. Рендерер вычисляет положения без перезаписи исходной геометрии.",
    takeaway: "Общее вращение поворачивает всю модель.",
    hint: "Переключайте поверхность, каркас и вершины.",
  },
  {
    title: "Девять чисел с ограничениями",
    body: "При чистом вращении базис остаётся единичным, взаимно перпендикулярным и правым. Произвольные изменения могут растянуть или скосить модель.",
    takeaway: "RᵀR = I и det(R) = +1",
    hint: "Измените один элемент матрицы. Сравните длины осей и скалярные произведения.",
  },
  {
    title: "Один угол вокруг одной оси",
    body: "Осевой поворот вычисляется через sin и cos. При Rx ось X неподвижна, Y и Z поворачиваются в YZ. В интерфейсе градусы, в Three.js радианы.",
    takeaway: "Угол удобнее девяти связанных элементов.",
    hint: "Выберите X, Y или Z и измените угол.",
  },
  {
    title: "Три угла: вращение Эйлера",
    body: "Three.js использует последовательные локальные оси. Для XYZ и векторов-столбцов R = Rx · Ry · Rz. При применении произведения к вектору правый множитель действует первым; это отличается от описания поворотов вокруг движущихся осей.",
    takeaway: "Углы Эйлера включают порядок и соглашение об осях.",
    hint: "Перемотайте этапы, чтобы увидеть поворот локальных осей.",
  },
  {
    title: "Порядок меняет результат",
    body: "Сравните XYZ и YXZ при одинаковых углах. Вращения в общем случае не коммутируют; другой порядок может дать другую ориентацию.",
    takeaway: "Одних углов недостаточно: нужен порядок.",
    hint: "Измените три угла и сравните модели.",
  },
  {
    title: "Гимбал-лок: потеря независимости",
    body: "Для XYZ при y = 90° оси первого и третьего вращений совпадают. Рост x и равное уменьшение z сохраняют ориентацию. Управления не выключаются — они становятся зависимыми.",
    takeaway: "Гимбал-лок — сингулярность параметризации Эйлера.",
    hint: "Дойдите до 90°, затем наблюдайте компенсацию x и z. Сравните с 80°.",
  },
  {
    title: "Интерполяция может выбрать длинный путь",
    body: "Прямой переход от +179° к −179° проходит через 0°: почти полный оборот. Через границу 180° путь составляет 2°. Это отдельная проблема, не гимбал-лок.",
    takeaway: "Линейная интерполяция чисел не гарантирует кратчайшее вращение.",
    hint: "Сравните оранжевый путь Эйлера и мятный путь кватерниона.",
  },
  {
    title: "Ось–угол превращается в кватернион",
    body: "Единичный кватернион имеет четыре компоненты (x,y,z,w). Он кодирует ось a и угол θ через половину угла: ось и угол не хранятся напрямую.",
    takeaway: "qxyz = a sin(θ/2), qw = cos(θ/2)",
    hint: "Меняйте ось и угол. q и −q задают одинаковое вращение.",
  },
  {
    title: "Из кватерниона в матрицу",
    body: "Кватернион даёт тот же повёрнутый базис. Столбцы матрицы — X, Y и Z. Добавив начало, получим жёсткое преобразование Matrix4.",
    takeaway:
      "Кватернион может дать матрицу или непосредственно повернуть вектор.",
    hint: "Следите за компонентами, матрицей и цветными осями.",
  },
  {
    title: "Плавный путь через SLERP",
    body: "Сферическая интерполяция идёт по кратчайшему пути ориентации с постоянной угловой скоростью при линейном времени. При ровно 180° путь неоднозначен. Полные обороты требуют дополнительных ключей или траектории.",
    takeaway: "Между ориентациями используем quaternion SLERP.",
    hint: "Сравните одноосевой переход и составное вращение.",
  },
  {
    title: "Внутри Object3D",
    body: "rotation (Euler) и quaternion синхронизированы и задают одну локальную ориентацию. matrix объединяет положение, ориентацию и масштаб; matrixWorld учитывает родителей. Перед ручным чтением обновляем матрицы.",
    takeaway: "Углы → кватернион → матрица → мировые вершины.",
    hint: "Переключите представление и добавьте повёрнутого родителя.",
  },
  {
    title: "От параметров к положениям",
    body: "Матрица вращения описывает повёрнутый ортонормированный базис. Углы Эйлера понятны, но требуют порядка и имеют сингулярности. Кватернионы удобны для композиции и интерполяции. Все вершины получают одно преобразование.",
    takeaway: "Параметры → ориентация → матрица → мировые координаты.",
    hint: "Исследуйте модель или вернитесь к любой демонстрации.",
  },
];
export const lessons = { en, ru };
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
  index < 4 ? 0 : index < 9 ? 1 : index < 12 ? 2 : index < 17 ? 3 : 4;
