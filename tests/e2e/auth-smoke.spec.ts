import { expect, test } from "@playwright/test";

test("login page and auth links render", async ({ page }) => {
  await page.goto("/login");

  await expect(page.getByRole("heading", { name: "Operator Sign In" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Forgot password?" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Create account" })).toBeVisible();
});

test("forgot-password page renders", async ({ page }) => {
  await page.goto("/forgot-password");

  await expect(page.getByRole("heading", { name: "Forgot Password" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Generate reset link" })).toBeVisible();
});
