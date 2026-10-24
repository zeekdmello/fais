import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
  const origin = 'http://127.0.0.1:5173';
  const base = origin + '/api/v1';
  let csrf = (await (await page.request.get(base + '/auth/csrf')).json()).csrfToken;
  async function mutate(path, method, data) {
    const response = await page.request.fetch(base + path, {
      method,
      data,
      headers: { Origin: origin, 'X-CSRF-Token': csrf },
    });
    assert.ok(response.ok(), await response.text());
    const result = await response.json();
    if (result.csrfToken) csrf = result.csrfToken;
    return result;
  }
  await mutate('/auth/register', 'POST', {
    name: 'Calendar QA',
    email: `calendar-${Date.now()}@test.local`,
    password: 'CalendarCheck2026!',
  });
  const { task } = await mutate('/tasks', 'POST', {
    title: 'Calendar undated check',
    priority: 'High',
    clientKey: crypto.randomUUID(),
  });
  await page.goto(origin + '/app');
  await page.getByRole('button', { name: 'Complete Calendar undated check', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Complete Calendar undated check', exact: true }),
  ).toHaveCount(0);
  await page.goto(origin + '/app/calendar');
  const today = page.locator('.calendar-grid button.today');
  await expect(today).toHaveAttribute('aria-label', /0 of 0 routines, 1 tasks completed/);
  await expect(page.locator('.date-detail')).toContainText('Calendar undated check');
  await expect(page.locator('.date-detail')).toContainText('Completed');
  const saved = (await (await page.request.get(base + '/tasks')).json()).tasks[0];
  await mutate('/tasks/' + task._id, 'PATCH', { status: 'Pending', __v: saved.__v });
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(today).toHaveAttribute('aria-label', /0 tasks completed/);
  await expect(page.locator('.date-detail')).not.toContainText('Calendar undated check');
  const reopened = (await (await page.request.get(base + '/tasks')).json()).tasks[0];
  await mutate('/tasks/' + task._id, 'PATCH', { status: 'Completed', __v: reopened.__v });
  await expect(today).toHaveAttribute('aria-label', /1 tasks completed/, { timeout: 35000 });
  await expect(page.locator('.date-detail')).toContainText('Calendar undated check');
  const date = (await today.getAttribute('aria-label')).slice(0, 10);
  const { task: scheduled } = await mutate('/tasks', 'POST', {
    title: 'Pending scheduled task',
    scheduledDate: date,
    dueDate: date,
    clientKey: crypto.randomUUID(),
  });
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(today.locator('.calendar-task-indicator')).toContainText('T 1/2');
  await expect(today.locator('.calendar-task-track > span')).toHaveAttribute(
    'style',
    'width: 50%;',
  );
  await mutate('/tasks/' + scheduled._id, 'PATCH', { status: 'Completed', __v: scheduled.__v });
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect(today.locator('.calendar-task-indicator')).toContainText('T 2/2');
  await expect(today.locator('.calendar-task-track > span')).toHaveAttribute(
    'style',
    'width: 100%;',
  );
  for (const width of [320, 375, 390, 768, 1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 950 });
    assert.ok(
      await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      `Overflow at ${width}`,
    );
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload();
  await expect(page.locator('.calendar-task-indicator').filter({ hasText: 'T 2/2' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'docs/screenshots/calendar-mobile.png', fullPage: true });
  console.log(
    'PASS: Today task completion appears on calendar, undated completed details, reopen/focus refresh, 30-second refresh, blue task bar at 50% and 100% (scheduled/due deduplicated), seven responsive widths. Isolated calendar QA account used.',
  );
} finally {
  await browser.close();
}
