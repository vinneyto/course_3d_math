import { access } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { createServer } from "vite";

const sandboxDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectDirectory = path.resolve(sandboxDirectory, "..");
const requestedExercise = process.argv[2];

if (!requestedExercise) {
  console.error("Usage: npm run demo -- exercises/<exercise-name>");
  process.exit(1);
}

const exerciseDirectory = path.resolve(projectDirectory, requestedExercise);
const relativeExerciseDirectory = path.relative(projectDirectory, exerciseDirectory);

if (
  relativeExerciseDirectory.startsWith("..") ||
  path.isAbsolute(relativeExerciseDirectory)
) {
  console.error("The demo directory must be inside this project");
  process.exit(1);
}

const demoFile = path.join(exerciseDirectory, "demo.ts");

try {
  await access(demoFile);
} catch {
  console.error(`Demo file was not found: ${path.relative(projectDirectory, demoFile)}`);
  process.exit(1);
}

const demoEntry = `../${path.relative(projectDirectory, demoFile).split(path.sep).join("/")}`;
const server = await createServer({
  root: projectDirectory,
  define: {
    __DEMO_ENTRY__: JSON.stringify(demoEntry),
  },
  server: {
    open: "/sandbox/index.html",
  },
});

await server.listen();
server.printUrls();
