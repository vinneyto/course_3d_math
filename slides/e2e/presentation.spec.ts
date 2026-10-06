import { test, expect, type Page } from "@playwright/test";
import { snapshots } from "../src/courses/rotation/snapshots";

const pane = (page: Page) => page.locator(".sidebar-active");
async function go(page: Page, id: string, settle = true) {
  const index = snapshots.findIndex((step) => step.id === id);
  if (index < 0) throw new Error(`Unknown snapshot: ${id}`);
  await page
    .getByRole("combobox", { name: "Choose step" })
    .selectOption(String(index));
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    id,
  );
  if (settle)
    await expect(page.locator(".player-main")).toHaveAttribute(
      "data-transitioning",
      "false",
    );
}

test("manual catalogue and all atomic snapshots fit desktop and mobile", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".card-badge")).toContainText(
    `${snapshots.length} steps`,
  );
  await page.screenshot({
    path: `test-results/${test.info().project.name}-catalogue.png`,
  });
  await page.getByRole("link", { name: /Rotation in 3D/ }).click();
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-webgl-ready",
    "true",
  );
  for (const step of snapshots) {
    await go(page, step.id);
    await expect(pane(page).locator("h1")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await go(page, "compute-90");
  await expect(pane(page).locator(".readouts")).toContainText(
    "(2.00, 3.00, 0.00)",
  );
  await expect(
    page.getByRole("table", { name: "Matrix4.set row order" }),
  ).toBeVisible();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-matrix.png`,
    fullPage: true,
  });
  await go(page, "gimbal-90-0.75");
  await expect(pane(page).locator(".lock")).toContainText("coincide");
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(pane(page).locator("h1")).toContainText("Гимбал-лок");
  await expect(
    pane(page).getByRole("meter", { name: "Время", exact: true }),
  ).toHaveAttribute("aria-valuenow", "0.75");
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-gimbal.png`,
    fullPage: true,
  });
  await go(page, "point");
  await expect(page.getByRole("button", { name: /Назад/ })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("sidebar is read-only and revisiting a snapshot restores exactly its authored values", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  await go(page, "compute-90");
  const expected = await pane(page).innerText();
  await go(page, "quaternion-75");
  await expect(
    pane(page).getByRole("meter", { name: "θ", exact: true }),
  ).toHaveAttribute("aria-valuenow", "75");
  await go(page, "summary");
  await expect(page.getByRole("link", { name: /Finish/ })).toBeVisible();
  await go(page, "compute-90");
  await expect(pane(page)).toHaveText(expected, { useInnerText: true });
  await expect(
    page.locator(
      ".lesson input, .lesson select, .lesson button, .lesson details",
    ),
  ).toHaveCount(0);
  await expect(page.getByRole("slider")).toHaveCount(0);
  await go(page, "gimbal-90-0.75");
  const frozen = await pane(page).innerText();
  await pane(page).getByRole("img", { name: "x angle over time" }).click();
  // Charts are observations, never a separate way to seek lesson time.
  await page.waitForTimeout(250);
  await expect(pane(page)).toHaveText(frozen, { useInnerText: true });
  await expect(
    pane(page).getByRole("meter", { name: "Time", exact: true }),
  ).toHaveAttribute("aria-valuenow", "0.75");
});

test("scene and entire sidebar animate together without replacing the renderer", async ({
  page,
}) => {
  test.setTimeout(60_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/presentations/rotation");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-webgl-ready", "true");
  const original = await canvas.elementHandle();
  await go(page, "translation-0");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator(".player-main")).toHaveAttribute(
    "data-transitioning",
    "true",
  );
  await expect(page.locator(".sidebar-outgoing")).toHaveCount(1);
  const meter = pane(page).getByRole("meter", { name: "Time", exact: true });
  await expect
    .poll(async () => Number(await meter.getAttribute("aria-valuenow")))
    .toBeGreaterThan(0);
  expect(Number(await meter.getAttribute("aria-valuenow"))).toBeLessThan(0.5);
  const intermediate = await pane(page).locator(".readouts").innerText();
  expect(intermediate).not.toContain(
    "(2.00, 1.00, 0.00)\nWorld P\n(2.00, 1.00, 0.00)",
  );
  expect(intermediate).not.toContain("(2.50, 2.00, 0.00)");
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(page.locator(".player-main")).toHaveAttribute(
    "data-transitioning",
    "false",
  );
  await expect(meter).toHaveAttribute("aria-valuenow", "0");
  for (const id of [
    "local-z-45",
    "origin-1",
    "basis-30",
    "cube-30",
    "model-1",
    "model-2",
    "gimbal-90-0.75",
    "boundary-0.5",
    "quaternion-75",
    "slerp-compound-0.5",
    "object-parent",
    "summary",
    "point",
  ]) {
    await go(page, id);
    expect(await canvas.evaluate((node, old) => node === old, original)).toBe(
      true,
    );
    await expect(page.locator(".scene-loading")).toHaveCount(0);
  }
  await go(page, "quaternion-75", false);
  await page.locator(".back-link").click();
  await page.getByRole("link", { name: /Rotation in 3D/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "point",
  );
  await expect(pane(page).locator(".readouts")).toContainText(
    "(2.00, 1.00, 0.00)",
  );
  expect(errors).toEqual([]);
});

test("camera and hover inspect a frame without changing its mathematical values", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  const canvas = page.locator("canvas");
  await expect(canvas).toHaveAttribute("data-webgl-ready", "true");
  const original = await pane(page).innerText();
  const pointTooltip = page
    .locator(".point-tooltip")
    .filter({ hasText: /^P/ })
    .first();
  await expect(pointTooltip).not.toBeVisible();
  await expect(pointTooltip).toHaveAttribute("data-anchor-x", /[0-9]/);
  const bounds = (await canvas.boundingBox())!;
  const anchor = await pointTooltip.evaluate((node) => ({
    x: Number((node as HTMLElement).dataset.anchorX),
    y: Number((node as HTMLElement).dataset.anchorY),
  }));
  await page.mouse.move(bounds.x + anchor.x, bounds.y + anchor.y);
  await expect(pointTooltip).toBeVisible();
  await expect(pointTooltip).toContainText("world (2.00, 1.00, 0.00)");
  const tooltipBounds = (await pointTooltip.boundingBox())!;
  expect(tooltipBounds.x).toBeGreaterThanOrEqual(bounds.x);
  expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(
    bounds.x + bounds.width,
  );
  await page.mouse.move(bounds.x + 30, bounds.y + 60);
  await expect(pointTooltip).not.toBeVisible();
  await page.mouse.move(
    bounds.x + bounds.width * 0.7,
    bounds.y + bounds.height * 0.6,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.55,
    bounds.y + bounds.height * 0.7,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(pane(page)).toHaveText(original, { useInnerText: true });
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "point",
  );
});

test("keyboard navigation and graphics failure keep the snapshot manual usable", async ({
  page,
}) => {
  await page.goto("/presentations/rotation");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-webgl-ready",
    "true",
  );
  await pane(page).locator("h1").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "translation-0",
  );
  await page.locator("canvas").evaluate((canvas) => {
    const loss = (canvas as HTMLCanvasElement)
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!loss) throw new Error("Context-loss extension is unavailable");
    loss.loseContext();
  });
  await expect(page.locator(".context-lost")).toContainText(
    "Graphics context lost",
  );
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "translation-0.5",
  );
});
