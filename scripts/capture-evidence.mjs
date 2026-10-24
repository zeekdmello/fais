import { chromium } from '@playwright/test';
const b = await chromium.launch({ channel: 'chrome' });
const p = await b.newPage({ viewport: { width: 768, height: 1000 }, reducedMotion: 'reduce' });
await p.goto('http://127.0.0.1:5173/login');
await p.getByLabel('Email address').fill('demo@fais.local');
await p.getByLabel('Password', { exact: true }).fill('FaisDemo2026!');
await p.getByRole('button', { name: 'Let’s get into it' }).click();
await p.getByRole('heading', { name: /A good day starts here/ }).waitFor();
await p.setViewportSize({ width: 1366, height: 1000 });
for (const route of ['', 'tasks', 'routines', 'calendar', 'statistics', 'activity', 'settings']) {
  await p.goto('http://127.0.0.1:5173/app' + (route ? '/' + route : ''));
  await p.locator('h1').waitFor();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `docs/screenshots/${route || 'today'}-desktop.png`, fullPage: true });
}
await p.setViewportSize({ width: 390, height: 900 });
for (const route of ['', 'tasks', 'routines']) {
  await p.goto('http://127.0.0.1:5173/app' + (route ? '/' + route : ''));
  await p.locator('h1').waitFor();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `docs/screenshots/${route || 'today'}-mobile.png`, fullPage: true });
}
await p.setViewportSize({ width: 768, height: 1000 });
await p.goto('http://127.0.0.1:5173/app/tasks');
await p.getByLabel('Search tasks').fill('project proposal');
await p.getByRole('button', { name: 'Edit Finish the project proposal', exact: true }).waitFor();
await p.locator('.task-panel').screenshot({ path: 'docs/screenshots/task-detail-evidence.png' });
await p.getByRole('button', { name: 'Edit Finish the project proposal', exact: true }).click();
await p.locator('.modal').screenshot({ path: 'docs/screenshots/task-editor-evidence.png' });
await p.getByRole('button', { name: 'Done', exact: true }).click();
await p.goto('http://127.0.0.1:5173/app/routines');
await p.getByRole('button', { name: 'Undo A slow morning', exact: true }).waitFor();
await p.locator('.board').screenshot({ path: 'docs/screenshots/routine-board-evidence.png' });
await b.close();
