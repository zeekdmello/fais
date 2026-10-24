import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
const browser = await chromium.launch({ channel: 'chrome' });
const page = await browser.newPage({ viewport: { width: 1366, height: 1000 } });
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));
const health = await page.request.get('http://127.0.0.1:4000/api/v1/health');
assert.equal(health.status(), 200);
await page.goto('http://127.0.0.1:4000/login');
await page.getByLabel('Email address').fill('demo@fais.local');
await page.getByLabel('Password', { exact: true }).fill('FaisDemo2026!');
await page.getByRole('button', { name: 'Let’s get into it' }).click();
await page.getByRole('heading', { name: /A good day starts here/ }).waitFor();
await page.goto('http://127.0.0.1:4000/app/statistics');
await page.getByRole('button', { name: 'This week', exact: true }).click();
await page.getByRole('button', { name: 'Previous month', exact: true }).click();
assert.equal(await page.locator('.tabs .active').textContent(), 'Selected month');
await page.goto('http://127.0.0.1:4000/app/settings');
await page.getByLabel('Your timezone').selectOption('Europe/London');
await page.getByText('Saved', { exact: true }).waitFor();
await page.reload();
assert.equal(await page.getByLabel('Your timezone').inputValue(), 'Europe/London');
await page.getByLabel('Your timezone').selectOption('Asia/Kolkata');
await page.getByText('Saved', { exact: true }).waitFor();
assert.deepEqual(errors, []);
await browser.close();
console.log(
  'Built frontend, API health, session login, month navigation, timezone persistence and restoration passed.',
);
