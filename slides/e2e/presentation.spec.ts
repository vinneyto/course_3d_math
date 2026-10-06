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
    await expect(pane(page).locator("h1")).not.toContainText("%");
    if (step.scene.timeline) {
      await expect(pane(page).locator('[aria-current="step"]')).toHaveAttribute(
        "data-timeline-stage",
        step.id,
      );
      await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
        "data-timeline-position",
        String(step.scene.timeline.position),
      );
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await go(page, "basis-symbolic");
  const matrixCode = pane(page).locator(".matrix-code");
  await expect(matrixCode.locator(":scope > code").first()).toHaveText(
    "const matrixLocalToWorld =\n  new Matrix4().set(",
  );
  await expect(matrixCode.getByRole("row").first()).toHaveText(
    "X.x,Y.x,Z.x,O.x,",
  );
  await expect(matrixCode.locator(":scope > code").nth(1)).toHaveText(");");
  await expect(matrixCode.locator(".matrix-application")).toContainText(
    "positionLocal.clone()\n  .applyMatrix4(matrixLocalToWorld);",
  );
  await go(page, "basis-90");
  await expect(matrixCode.getByRole("row").nth(1)).toHaveText(
    "0.00,0.00,-1.00,1.00,",
  );
  await expect(matrixCode.getByRole("row").nth(2)).toHaveText(
    "0.00,1.00,0.00,0.00,",
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-basis-matrix.png`,
    fullPage: true,
  });
  await go(page, "basis-180");
  await expect(matrixCode.getByRole("row").nth(1)).toHaveText(
    "0.00,-1.00,0.00,1.00,",
  );
  await go(page, "basis-reset");
  await expect(matrixCode.getByRole("row").nth(1)).toHaveText(
    "0.00,1.00,0.00,1.00,",
  );
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
  await expect(pane(page).locator("h1")).toHaveText(
    snapshots.find((step) => step.id === "gimbal-90-0.75")!.caption!.ru,
  );
  await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
    "data-timeline-position",
    "0.3",
  );
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
  await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
    "data-timeline-position",
    "0.3",
  );
});

test("scene animates with synchronized readouts and an immediate sidebar", async ({
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
  // Observe whole React commits: slow mobile rendering can finish between two
  // Playwright reads, and formatted coordinates round before the endpoint.
  const sidebarTrace = await page.evaluateHandle(() => {
    const trace = {
      panelMotionSeen: false,
      transitioningSeen: false,
      samples: [] as { position: number; world: string }[],
      stop: () => observer.disconnect(),
    };
    const observer = new MutationObserver(() => {
      const panel = document.querySelector(".sidebar-active")!;
      trace.panelMotionSeen ||=
        Boolean(document.querySelector(".sidebar-outgoing")) ||
        panel.getAnimations().length > 0 ||
        getComputedStyle(panel).transform !== "none";
      trace.transitioningSeen ||=
        document
          .querySelector(".player-main")
          ?.getAttribute("data-transitioning") === "true";
      if (
        document
          .querySelector("[data-snapshot]")
          ?.getAttribute("data-snapshot") !== "translation-0.5"
      )
        return;
      const active = document.querySelector(".sidebar-active")!;
      const position = Number(
        active
          .querySelector(".stage-timeline")
          ?.getAttribute("data-timeline-position"),
      );
      if (position > 0.05 && position < 0.45 && trace.samples.length < 128) {
        trace.samples.push({
          position,
          world: active.querySelector(".readouts span:nth-child(2) b")!
            .textContent!,
        });
      }
    });
    observer.observe(document.querySelector(".player-main")!, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });
    return trace;
  });
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect
    .poll(() =>
      sidebarTrace.evaluate(
        (trace) => trace.transitioningSeen && trace.samples.length > 0,
      ),
    )
    .toBe(true);
  const sample = await sidebarTrace.evaluate((trace) => {
    trace.stop();
    return { ...trace.samples[0], panelMotionSeen: trace.panelMotionSeen };
  });
  await sidebarTrace.dispose();
  expect(sample.panelMotionSeen).toBe(false);
  expect(sample.position).toBeGreaterThan(0);
  expect(sample.position).toBeLessThan(0.5);
  expect(sample.world).not.toBe("(2.00, 1.00, 0.00)");
  expect(sample.world).not.toBe("(2.50, 2.00, 0.00)");
  const timeline = pane(page).locator(".stage-timeline");
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(page.locator(".player-main")).toHaveAttribute(
    "data-transitioning",
    "false",
  );
  await expect(timeline).toHaveAttribute("data-timeline-position", "0");
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

test("operation timelines explain stages without changing the selected snapshot", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  await go(page, "gimbal-90-0.25");
  const timeline = pane(page).locator(".stage-timeline");
  await expect(timeline.locator("li")).toHaveCount(11);
  const heading = await pane(page).locator("h1").innerText();
  await expect(timeline.locator(".stage-timeline-title")).toHaveText(heading);
  const marker = timeline.locator('[data-timeline-stage="gimbal-90-0.5"]');
  await marker.hover();
  expect(await marker.evaluate((node) => getComputedStyle(node).cursor)).toBe(
    "default",
  );
  const tooltip = timeline.getByRole("tooltip");
  await expect(tooltip).toContainText("first and third axes coincide");
  await expect(tooltip).toContainText("y = 90°");
  const panelBounds = (await pane(page).boundingBox())!;
  const tooltipBounds = (await tooltip.boundingBox())!;
  expect(tooltipBounds.x).toBeGreaterThanOrEqual(panelBounds.x);
  expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(
    panelBounds.x + panelBounds.width,
  );
  await marker.click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "gimbal-90-0.25",
  );
  await expect(pane(page).locator("h1")).toHaveText(heading);
  await marker.focus();
  await expect(tooltip).toBeVisible();
  await timeline.screenshot({
    path: `test-results/${test.info().project.name}-timeline.png`,
  });
  await go(page, "gimbal-80-0.5");
  await expect(timeline).toHaveAttribute("data-timeline-position", "0.5");
  await go(page, "euler-0");
  for (const axis of ["x", "y", "z"])
    await expect(
      pane(page).getByRole("meter", { name: `${axis} angle`, exact: true }),
    ).toHaveAttribute("aria-valuenow", "0");
  await go(page, "euler-1");
  await expect(
    pane(page).getByRole("meter", { name: "x angle", exact: true }),
  ).toHaveAttribute("aria-valuenow", "30");
  await expect(
    pane(page).getByRole("meter", { name: "y angle", exact: true }),
  ).toHaveAttribute("aria-valuenow", "0");
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-euler-sectors.png`,
    fullPage: true,
  });
});
