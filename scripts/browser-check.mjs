import { chromium } from '@playwright/test';
import fs from 'node:fs/promises';
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const context = await browser.newContext({
  viewport: { width: 1366, height: 1000 },
  reducedMotion: 'reduce',
});
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
const results = [];
const runId = Date.now(),
  taskTitle = 'Browser verification task ' + runId,
  updatedTitle = 'Browser verification updated ' + runId,
  routineTitle = 'Browser verification ritual ' + runId;
async function expect(condition, message) {
  if (!condition) throw new Error(message);
  results.push(message);
}
try {
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('h1').waitFor();
  await page.screenshot({ path: 'docs/screenshots/landing-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Log in', exact: true }).click();
  await page.getByLabel('Email address').fill('demo@fais.local');
  await page.getByLabel('Password', { exact: true }).fill('FaisDemo2026!');
  await page.getByRole('button', { name: 'Let’s get into it' }).click();
  await page.getByRole('heading', { name: /A good day starts here/ }).waitFor();
  await page.getByText('Finish the project proposal', { exact: true }).waitFor();
  await page.screenshot({ path: 'docs/screenshots/today-desktop.png', fullPage: true });
  for (const route of ['tasks', 'routines', 'calendar', 'statistics', 'activity', 'settings']) {
    await page.goto('http://127.0.0.1:5173/app/' + route);
    await page.locator('h1').waitFor();
    await page.waitForTimeout(250);
    await page.screenshot({ path: `docs/screenshots/${route}-desktop.png`, fullPage: true });
  }
  for (const width of [320, 375, 390, 768, 1024, 1366, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/app',
      '/app/tasks',
      '/app/routines',
      '/app/calendar',
      '/app/statistics',
      '/app/activity',
      '/app/settings',
    ]) {
      await page.goto('http://127.0.0.1:5173' + route);
      await page.locator('h1').waitFor();
      await page.waitForTimeout(100);
      const dims = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        width: innerWidth,
      }));
      await expect(
        dims.scroll <= dims.width,
        `No overflow: ${route} at ${width}px (${dims.scroll})`,
      );
      if (width === 390 && ['/app', '/app/tasks', '/app/routines'].includes(route))
        await page.screenshot({
          path: `docs/screenshots/${route === '/app' ? 'today' : route.split('/').at(-1)}-mobile.png`,
          fullPage: true,
        });
    }
  }
  await page.setViewportSize({ width: 1366, height: 1000 });
  await page.goto('http://127.0.0.1:5173/app/tasks');
  await page.getByRole('button', { name: 'New task', exact: true }).click();
  await page.getByLabel('Task title').fill(taskTitle);
  await page
    .getByLabel('Notes', { exact: true })
    .fill('Checking create, autosave, filters and persistence.');
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByRole('button', { name: taskTitle }).first().waitFor();
  await page.getByRole('button', { name: 'Edit ' + taskTitle, exact: true }).click();
  await page.getByLabel('Task title').fill(updatedTitle);
  await page.getByText('Saved', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Edit ' + updatedTitle, exact: true }).waitFor();
  results.push('Task creation and autosave persist across refresh');
  await page.getByLabel('Search tasks').fill(updatedTitle);
  await page.getByRole('button', { name: 'Complete ' + updatedTitle, exact: true }).click();
  await page.getByRole('button', { name: 'Reopen ' + updatedTitle, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Reopen ' + updatedTitle, exact: true }).click();
  await page.getByRole('button', { name: 'Complete ' + updatedTitle, exact: true }).waitFor();
  results.push('Search, completion and reopen work');
  await page.getByRole('button', { name: 'Edit ' + updatedTitle, exact: true }).click();
  await page.route('**/api/v1/tasks/*', (route) =>
    route.request().method() === 'PATCH' ? route.abort() : route.continue(),
  );
  await page.getByLabel('Notes', { exact: true }).fill('Preserved even when the network fails.');
  await page.getByText('Could not save — Retry', { exact: true }).waitFor();
  await expect(
    (await page.getByLabel('Notes', { exact: true }).inputValue()) ===
      'Preserved even when the network fails.',
    'Failed autosave preserves text in browser',
  );
  await page.unroute('**/api/v1/tasks/*');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await page.getByText('Saved', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete ' + updatedTitle, exact: true }).click();
  await page.getByRole('heading', { name: 'A clear page. A fresh start.' }).waitFor();
  results.push('Autosave retry and task deletion work');
  await page.goto('http://127.0.0.1:5173/app/routines');
  await page.getByRole('button', { name: 'New routine' }).click();
  await page.getByLabel('Routine name').fill(routineTitle);
  await page.getByRole('button', { name: /^Add routine/ }).click();
  await page.getByRole('button', { name: 'Complete ' + routineTitle, exact: true }).click();
  await page.getByRole('button', { name: 'Undo ' + routineTitle, exact: true }).waitFor();
  await page.reload();
  await page.getByRole('button', { name: 'Undo ' + routineTitle, exact: true }).click();
  await page.getByRole('button', { name: 'Complete ' + routineTitle, exact: true }).waitFor();
  await page.getByRole('button', { name: 'Edit ' + routineTitle, exact: true }).click();
  await page.getByLabel('Archive this routine').check();
  await page.getByText('Saved', { exact: true }).waitFor();
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  results.push('Routine create, date completion, persistence, undo and archive work');
  await page.getByRole('button', { name: 'Log out', exact: true }).click();
  await page.getByRole('heading', { name: 'Welcome back.' }).waitFor();
  await page.getByRole('link', { name: 'Make yourself at home' }).click();
  await page.getByLabel('Your name').fill('Browser QA');
  await page.getByLabel('Email address').fill(`browser-${Date.now()}@test.local`);
  await page.getByLabel('Password', { exact: true }).fill('BrowserPass123!');
  await page.getByRole('button', { name: 'Create my account' }).click();
  await page.getByRole('heading', { name: /A good day starts here/ }).waitFor();
  await expect(
    (await page.getByText('Finish the project proposal', { exact: true }).count()) === 0,
    'New account has no seeded or other-user data',
  );
  await page.reload();
  await page.getByRole('heading', { name: /A good day starts here/ }).waitFor();
  results.push('Registration, logout and session restoration work');
  await expect(errors.length === 0, 'No browser JavaScript errors');
  await fs.writeFile(
    'docs/browser-results.json',
    JSON.stringify({ checkedAt: new Date().toISOString(), results, errors }, null, 2),
  );
  await browser.close();
  console.log(`${results.length} browser checks passed.`);
} catch (error) {
  await page.screenshot({ path: 'docs/screenshots/browser-failure.png', fullPage: true });
  await fs.writeFile(
    'docs/browser-partial-results.json',
    JSON.stringify({ results, error: error.message }, null, 2),
  );
  await browser.close();
  throw error;
}
