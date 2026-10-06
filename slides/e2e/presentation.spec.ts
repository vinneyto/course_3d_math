import { test, expect } from "@playwright/test";

test("catalogue, all slides, numerical controls and reversible navigation", async ({
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
  await page.getByRole("button", { name: /Previous/ }).click();
  await expect(angle).toHaveValue("70");
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
  await picker.selectOption("0");
  await expect(page.getByRole("button", { name: /Назад/ })).toBeDisabled();
  expect(errors).toEqual([]);
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
  await page.locator("canvas").evaluate((canvas) => {
    const gl = (canvas as HTMLCanvasElement).getContext("webgl2");
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  });
  await expect(page.locator(".context-lost")).toContainText(
    "Graphics context lost",
  );
  await page.getByRole("button", { name: /^Next/ }).click();
  await expect(page.locator("[data-slide]")).toHaveAttribute("data-slide", "5");
});
