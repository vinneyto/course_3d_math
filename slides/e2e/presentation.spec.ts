import { test, expect, type Page } from "@playwright/test";
import { lessons } from "../src/courses/rotation/content";
import { gimbalPass } from "../src/courses/rotation/gimbal-story";
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
    const index = snapshots.findIndex((item) => item.id === step.id);
    const lesson = lessons.en[index];
    await expect(pane(page).locator(".topic-name")).toHaveText(
      lesson.topicTitle,
    );
    await expect(page.locator(".scene-chip")).toContainText(lesson.topicTitle);
    await expect(
      page
        .getByRole("combobox", { name: "Choose step" })
        .locator(`option[value="${index}"]`),
    ).toHaveText(
      `${String(index + 1).padStart(2, "0")} · ${lesson.navigationTitle}`,
    );
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
  await go(page, "basis-0");
  const matrixCode = pane(page).locator(".matrix-code");
  await expect(matrixCode.locator(":scope > code").first()).toHaveText(
    "const matrixLocalToWorld =\n  new Matrix4().set(",
  );
  await expect(matrixCode.getByRole("row").first()).toHaveText(
    "1.00,0.00,0.00,3.00,",
  );
  await expect(pane(page).locator(".snapshot-values dt")).toContainText([
    "Translation T",
  ]);
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
  if (test.info().project.name === "desktop") {
    const table = (await matrixCode.getByRole("table").boundingBox())!;
    const scene = (await page.locator("canvas").boundingBox())!;
    expect(table.y + table.height).toBeLessThan(scene.y + scene.height);
  }
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
  await go(page, "basis-90");
  await expect(pane(page).locator(".readouts")).toContainText(
    "(5.00, 0.00, 1.00)",
  );
  await expect(
    page.getByRole("table", { name: "Matrix4.set row order" }),
  ).toBeVisible();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-matrix.png`,
    fullPage: true,
  });
  await go(page, "gimbal-cancel90");
  await expect(pane(page).locator(".lock")).toContainText("coincide");
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(pane(page).locator("h1")).toHaveText(
    snapshots.find((step) => step.id === "gimbal-cancel90")!.caption!.ru,
  );
  await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
    "data-timeline-position",
    String(
      snapshots.find((step) => step.id === "gimbal-cancel90")!.scene.timeline!
        .position,
    ),
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-gimbal.png`,
    fullPage: true,
  });
  await go(page, "local-z-0");
  await expect(page.getByRole("button", { name: /Назад/ })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("sidebar is read-only and revisiting a snapshot restores exactly its authored values", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  await go(page, "basis-90");
  const expected = await pane(page).innerText();
  await go(page, "q-matrix-75");
  await expect(
    pane(page).getByRole("meter", { name: "θ", exact: true }),
  ).toHaveAttribute("aria-valuenow", "75");
  await go(page, "summary");
  await expect(page.getByRole("link", { name: /Finish/ })).toBeVisible();
  await go(page, "basis-90");
  await expect(pane(page)).toHaveText(expected, { useInnerText: true });
  await expect(
    page.locator(
      ".lesson input, .lesson select, .lesson button, .lesson details",
    ),
  ).toHaveCount(0);
  await expect(page.getByRole("slider")).toHaveCount(0);
  await go(page, "gimbal-cancel90");
  const frozen = await pane(page).innerText();
  await pane(page).getByRole("img", { name: "x angle over time" }).click();
  // Charts are observations, never a separate way to seek lesson time.
  await page.waitForTimeout(250);
  await expect(pane(page)).toHaveText(frozen, { useInnerText: true });
  await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
    "data-timeline-position",
    String(
      snapshots.find((step) => step.id === "gimbal-cancel90")!.scene.timeline!
        .position,
    ),
  );
  await go(page, "axis-point-135");
  const localPosition = pane(page)
    .locator(".readouts")
    .first()
    .locator("span:first-child b");
  const xAngle = pane(page).getByRole("meter", {
    name: "x angle",
    exact: true,
  });
  await expect(localPosition).toHaveText("(2.00, 0.00, 0.00)");
  await expect(xAngle).toHaveAttribute("aria-valuenow", "135");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "local-recap-offset",
  );
  await expect(localPosition).toHaveText("(2.00, 1.00, 1.00)");
  await expect(xAngle).toHaveAttribute("aria-valuenow", "135");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-orbit-start-135.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "local-recap-80",
  );
  await expect(localPosition).toHaveText("(2.00, 1.00, 1.00)");
  await expect(xAngle).toHaveAttribute("aria-valuenow", "80");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-orbit-from-135.png`,
    fullPage: true,
  });
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
  await go(page, "local-z-0");
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
          ?.getAttribute("data-snapshot") !== "local-z-45"
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
  expect(sample.world).not.toBe("(0.71, 2.12, 0.00)");
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
    "basis-45",
    "cube-30",
    "model-vertices",
    "conditions-0",
    "conditions-3",
    "axis-X-0",
    "conditions-3",
    "gimbal-cancel90",
    "boundary-0.5",
    "q-matrix-75",
    "slerp-compound-0.5",
    "object-parent",
    "summary",
    "local-z-0",
  ]) {
    await go(page, id);
    expect(await canvas.evaluate((node, old) => node === old, original)).toBe(
      true,
    );
    await expect(page.locator(".scene-loading")).toHaveCount(0);
    if (id === "conditions-3") {
      await canvas.scrollIntoViewIfNeeded();
      await page.screenshot({
        path: `test-results/${test.info().project.name}-restored-sectors.png`,
      });
    }
  }
  await go(page, "q-matrix-75", false);
  await page.locator(".back-link").click();
  await page.getByRole("link", { name: /Rotation in 3D/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "local-z-0",
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
  // The point's coordinates remain visible without hover on the initial point/rotation-centre steps.
  for (const step of snapshots.filter((step) => step.scene.pointTooltip)) {
    await go(page, step.id);
    await expect(pointTooltip).toBeVisible();
    await expect(pointTooltip).toContainText("local (2.00, 1.00, 0.00)");
    await expect(pointTooltip).toContainText(
      await pane(page).locator(".readouts span:nth-child(2) b").innerText(),
    );
  }
  await go(page, "basis-0");
  await expect(pointTooltip).not.toBeVisible();
  // Later steps still use hover to inspect the point.
  await expect(pointTooltip).toHaveAttribute("data-anchor-x", /[0-9]/);
  const bounds = (await canvas.boundingBox())!;
  const anchor = await pointTooltip.evaluate((node) => ({
    x: Number((node as HTMLElement).dataset.anchorX),
    y: Number((node as HTMLElement).dataset.anchorY),
  }));
  await page.mouse.move(bounds.x + anchor.x, bounds.y + anchor.y);
  await expect(pointTooltip).toBeVisible();
  await expect(pointTooltip).toContainText("world (5.00, 2.00, 1.00)");
  const tooltipBounds = (await pointTooltip.boundingBox())!;
  expect(tooltipBounds.x).toBeGreaterThanOrEqual(bounds.x);
  expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(
    bounds.x + bounds.width,
  );
  await page.mouse.move(bounds.x + 30, bounds.y + 60);
  await expect(pointTooltip).not.toBeVisible();
  await go(page, "local-z-0");
  await expect(pointTooltip).toBeVisible();
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
    "local-z-0",
  );
});

test("changing timeline groups resets sidebar scroll while steps within a group preserve it", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  const panel = page.locator(".lesson");
  const scrollDown = async () =>
    panel.evaluate((node) => {
      if (getComputedStyle(node).overflowY !== "visible") {
        node.scrollTop = 80;
      } else {
        const header = document.querySelector(".player-header")!;
        const top =
          node.getBoundingClientRect().top +
          scrollY -
          header.getBoundingClientRect().height;
        window.scrollTo({ top: top + 80, behavior: "instant" });
      }
    });
  const offset = async () =>
    panel.evaluate((node) => {
      if (getComputedStyle(node).overflowY !== "visible") return node.scrollTop;
      const header = document.querySelector(".player-header")!;
      return (
        header.getBoundingClientRect().height - node.getBoundingClientRect().top
      );
    });
  await go(page, "basis-0");
  await scrollDown();
  expect(await offset()).toBeGreaterThan(50);
  await go(page, "basis-90");
  expect(await offset()).toBeCloseTo(80, 0);
  await go(page, "axis-point-0");
  expect(await offset()).toBeCloseTo(0, 0);
  // The two gimbal passes are different timelines despite sharing a topic.
  await go(page, "gimbal-cancel90");
  await scrollDown();
  await go(page, "gimbal-rings-start");
  expect(await offset()).toBeCloseTo(0, 0);
  await scrollDown();
  await go(page, "gimbal-cancel90");
  expect(await offset()).toBeCloseTo(0, 0);
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
    "local-z-45",
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
    "origin-1",
  );
});

test("operation timelines explain stages without changing the selected snapshot", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/presentations/rotation");
  await go(page, "order-3");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "gimbal-intro",
  );
  await expect(pane(page).locator(".topic-name")).toHaveText(
    "Euler angle limitations",
  );
  await expect(
    pane(page).getByRole("table", { name: "Euler angle limitations" }),
  ).toContainText("Gimbal lock");
  await expect(pane(page).locator(".stage-timeline")).toHaveCount(0);
  await page.screenshot({
    path: `test-results/${test.info().project.name}-gimbal-intro.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "gimbal-start",
  );
  await expect(pane(page).locator(".topic-name")).toHaveText("Gimbal lock");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-gimbal-topic-start.png`,
    fullPage: true,
  });
  await go(page, "gimbal-x30");
  const timeline = pane(page).locator(".stage-timeline");
  await expect(timeline.locator("li")).toHaveCount(gimbalPass.length);
  const heading = await pane(page).locator("h1").innerText();
  await expect(timeline.locator(".stage-timeline-title")).toHaveText(
    `Gimbal lock: ${heading}`,
  );
  const marker = timeline.locator('[data-timeline-stage="gimbal-y90"]');
  await marker.hover();
  expect(await marker.evaluate((node) => getComputedStyle(node).cursor)).toBe(
    "default",
  );
  const tooltip = timeline.getByRole("tooltip");
  await expect(tooltip).toContainText(
    "Turn local Y by 90°: Z coincides with X₀",
  );
  await expect(tooltip).toContainText("Gimbal lock:");
  await expect(tooltip).toContainText("Ry(90°)");
  const panelBounds = (await pane(page).boundingBox())!;
  const tooltipBounds = (await tooltip.boundingBox())!;
  expect(tooltipBounds.x).toBeGreaterThanOrEqual(panelBounds.x);
  expect(tooltipBounds.x + tooltipBounds.width).toBeLessThanOrEqual(
    panelBounds.x + panelBounds.width,
  );
  await marker.click();
  await expect(page.locator("[data-snapshot]")).toHaveAttribute(
    "data-snapshot",
    "gimbal-x30",
  );
  await expect(pane(page).locator("h1")).toHaveText(heading);
  await marker.focus();
  await expect(tooltip).toBeVisible();
  await timeline.screenshot({
    path: `test-results/${test.info().project.name}-timeline.png`,
  });
  await go(page, "gimbal-z-minus30");
  await expect(timeline).toHaveAttribute(
    "data-timeline-position",
    String(
      snapshots.find((step) => step.id === "gimbal-z-minus30")!.scene.timeline!
        .position,
    ),
  );
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

test("separate X/Z turns move the model but simultaneous compensation leaves the rendered scene still", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.goto("/presentations/rotation");
  const canvas = page.locator("canvas");
  // The footer's course-progress rail can overlap the canvas's bottom pixel.
  // Compare the scene interior, excluding that navigation UI.
  const sceneImage = async () => {
    await canvas.scrollIntoViewIfNeeded();
    const bounds = (await canvas.boundingBox())!;
    return page.screenshot({ clip: { ...bounds, height: bounds.height - 2 } });
  };
  await expect(canvas).toHaveAttribute("data-webgl-ready", "true");
  await go(page, "order-0");
  const orderStart = await sceneImage();
  await go(page, "order-1");
  expect(orderStart.equals(await sceneImage())).toBe(false);
  await go(page, "order-3");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-yxz.png`,
    fullPage: true,
  });
  await go(page, "gimbal-y90");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-saved-axis.png`,
    fullPage: true,
  });
  await go(page, "gimbal-start");
  const beforeX = await sceneImage();
  await go(page, "gimbal-x30");
  expect(beforeX.equals(await sceneImage())).toBe(false);
  await expect(pane(page).locator(".gimbal-basis-readouts")).toContainText(
    "X₀ = (1.00, 0.00, 0.00)",
  );
  await go(page, "gimbal-y90");
  await expect(pane(page).locator(".gimbal-basis-readouts")).toContainText(
    "Z = (1.00, 0.00, 0.00)",
  );
  await go(page, "gimbal-z-minus30");
  await expect(
    pane(page).getByRole("meter", { name: "z angle", exact: true }),
  ).toHaveAttribute("aria-valuenow", "-30");
  await go(page, "gimbal-equivalent");
  const beforeCancel = await sceneImage();
  const angleTrace = await page.evaluateHandle(() => {
    const trace = {
      changedWhileAnimating: false,
      stop: () => observer.disconnect(),
    };
    const observer = new MutationObserver(() => {
      const angle = Number(
        document
          .querySelector('[aria-label="x angle"]')
          ?.getAttribute("aria-valuenow"),
      );
      trace.changedWhileAnimating ||=
        document
          .querySelector(".player-main")
          ?.getAttribute("data-transitioning") === "true" &&
        angle > 0.01 &&
        angle < 89.99;
    });
    observer.observe(document.querySelector(".player-main")!, {
      subtree: true,
      attributes: true,
    });
    return trace;
  });
  await go(page, "gimbal-cancel90");
  expect(
    await angleTrace.evaluate((trace) => {
      trace.stop();
      return trace.changedWhileAnimating;
    }),
  ).toBe(true);
  await angleTrace.dispose();
  expect(beforeCancel.equals(await sceneImage())).toBe(true);
  await expect(
    pane(page).getByRole("meter", { name: "x angle", exact: true }),
  ).toHaveAttribute("aria-valuenow", "90");
  await expect(
    pane(page).getByRole("meter", { name: "z angle", exact: true }),
  ).toHaveAttribute("aria-valuenow", "-90");
  expect(beforeCancel.equals(await sceneImage())).toBe(true);
  await pane(page)
    .locator(".angle-charts")
    .screenshot({
      path: `test-results/${test.info().project.name}-compensation-graphs.png`,
    });
  const renderer = await canvas.elementHandle();
  await go(page, "gimbal-rings-start");
  await expect(pane(page).locator(".stage-timeline")).toHaveAttribute(
    "data-timeline-position",
    "0",
  );
  await expect(pane(page).locator(".stage-timeline li")).toHaveCount(
    gimbalPass.length,
  );
  await expect(pane(page).locator(".stage-timeline")).not.toContainText(
    "Start with an ordinary basis",
  );
  await go(page, "gimbal-rings-y90");
  await expect(pane(page).locator(".gimbal-basis-readouts")).toContainText(
    "Z = (1.00, 0.00, 0.00)",
  );
  await page.screenshot({
    path: `test-results/${test.info().project.name}-rings-aligned.png`,
    fullPage: true,
  });
  await go(page, "gimbal-rings-equivalent");
  expect(beforeCancel.equals(await sceneImage())).toBe(false);
  expect(
    await canvas.evaluate((node, previous) => node === previous, renderer),
  ).toBe(true);
  await expect(pane(page).locator(".snapshot-values")).toContainText(
    "basis and rings",
  );
});
