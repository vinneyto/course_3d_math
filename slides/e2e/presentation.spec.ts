import { test, expect } from "@playwright/test";

test("catalogue, all slide components, numerical controls and direct navigation", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page.screenshot({
    path: `test-results/${test.info().project.name}-catalogue.png`,
  });
  await page.getByRole("link", { name: /Rotation in 3D/ }).click();
  await expect(page.locator("canvas")).toBeVisible();
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "1");
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  await picker.selectOption("6");
  await expect(
    page.getByRole("heading", { name: "Computing the world position" }),
  ).toBeVisible();
  await expect(page.locator(".readouts")).toContainText("(2.00, 3.00, 0.00)");
  const tooltip = page.locator(".point-tooltip");
  await expect(tooltip).toBeVisible();
  const tooltipBounds = await tooltip.boundingBox();
  const sceneBounds = await page.locator("canvas").boundingBox();
  expect(tooltipBounds!.x).toBeGreaterThanOrEqual(sceneBounds!.x);
  expect(tooltipBounds!.x + tooltipBounds!.width).toBeLessThanOrEqual(
    sceneBounds!.x + sceneBounds!.width,
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-matrix.png`,
    fullPage: true,
  });
  for (let i = 0; i < 22; i++) {
    await picker.selectOption(String(i));
    await expect(page.locator("[data-slide]")).toHaveAttribute(
      "data-slide",
      String(i + 1),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await picker.selectOption("2");
  const angle = page.getByRole("slider", { name: "z angle" });
  await angle.fill("70");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "4");
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(angle).toHaveValue("45");
  await picker.selectOption("15");
  await page.getByRole("slider", { name: "Time", exact: true }).fill("0.8");
  await expect(page.locator(".lock")).toContainText("coincide");
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: `test-results/${test.info().project.name}-gimbal.png`,
    fullPage: true,
  });
  await page.getByRole("button", { name: "Change language" }).click();
  await expect(
    page.getByRole("heading", { name: "Гимбал-лок: потеря независимости" }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Время", exact: true }),
  ).toHaveValue("0.8");
  await picker.selectOption("0");
  await expect(page.getByRole("button", { name: /Назад/ })).toBeDisabled();
  expect(errors).toEqual([]);
});

test("React resets independent steps, preserves shared components and stops playback", async ({
  page,
}) => {
  await page.goto("/presentations/rotation");
  const picker = page.getByRole("combobox", { name: "Choose slide" });
  await picker.selectOption("15");
  const time = page.getByRole("slider", { name: "Time", exact: true });
  await time.fill("0.6");
  await page.getByRole("button", { name: "▶ Play", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Ⅱ Pause", exact: true }),
  ).toBeVisible();
  await expect.poll(() => time.inputValue()).not.toBe("0.6");
  await picker.selectOption("1");
  await expect(time).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "▶ Play", exact: true }),
  ).toBeVisible();
  // An old RAF must not advance the freshly mounted translation component.
  await page.waitForTimeout(200);
  await expect(time).toHaveValue("0");
  await picker.selectOption("15");
  await expect(time).toHaveValue("0");

  await picker.selectOption("17");
  await expect(page.locator("[data-slide]")).toHaveAttribute(
    "data-slide-key",
    "quaternion",
  );
  const angle = page.getByRole("slider", { name: "θ", exact: true });
  await angle.fill("140");
  await expect(
    page.locator(".range").filter({ has: angle }).locator("output"),
  ).toHaveText("140°");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(
    page.getByRole("heading", { name: "Quaternion to rotation matrix" }),
  ).toBeVisible();
  await expect(angle).toHaveValue("140");
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(
    page.getByRole("heading", { name: "Axis–angle becomes a quaternion" }),
  ).toBeVisible();
  await expect(angle).toHaveValue("140");

  await picker.selectOption("4");
  const basisAngle = page.getByRole("slider", { name: "x angle", exact: true });
  await basisAngle.fill("65");
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(
    page.getByRole("heading", { name: "The same idea in Matrix4" }),
  ).toBeVisible();
  await expect(basisAngle).toHaveValue("65");

  await picker.selectOption("11");
  await page.getByRole("slider", { name: "Δ R[0,1]", exact: true }).fill("0.9");
  await picker.selectOption("21");
  await expect(page.getByRole("link", { name: /Finish/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Next/ })).toHaveCount(0);
  await picker.selectOption("11");
  await expect(
    page.getByRole("slider", { name: "Δ R[0,1]", exact: true }),
  ).toHaveValue("0");
});

test("range keyboard does not navigate, and graphics failure keeps the lesson usable", async ({
  page,
}) => {
  await page.goto("/presentations/rotation");
  await page.getByRole("combobox", { name: "Choose slide" }).selectOption("2");
  const angle = page.getByRole("slider", { name: "z angle" });
  await angle.focus();
  await angle.press("ArrowRight");
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "3");
  await page.locator("h1").click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "4");
  await expect(page.locator("canvas")).toHaveAttribute(
    "data-webgl-ready",
    "true",
  );
  await page.locator("canvas").evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2");
    const loss = gl?.getExtension("WEBGL_lose_context");
    if (!loss) throw new Error("Context-loss extension is unavailable");
    loss.loseContext();
  });
  await expect(page.locator(".context-lost")).toContainText(
    "Graphics context lost",
  );
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "5");
});
