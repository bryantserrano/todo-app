import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
});

test('creates tasks, filters completed items, and deletes a task', async ({ page }) => {
  const list = page.getByRole('list', { name: 'Tasks' });
  const titleInput = page.getByRole('textbox', { name: 'New task' });

  await expect(list.getByText('Nothing on your list yet.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Add task' })).toBeDisabled();

  await titleInput.fill('Write project notes');
  await page.getByRole('button', { name: 'Add task' }).click();
  await titleInput.fill('Review API changes');
  await page.getByRole('button', { name: 'Add task' }).click();

  await expect(list.getByText('Write project notes')).toBeVisible();
  await expect(list.getByText('Review API changes')).toBeVisible();
  await expect(page.getByText('2 tasks left')).toBeVisible();

  await page.getByRole('button', { name: 'Complete Write project notes' }).click();
  await page.getByRole('button', { name: /^Completed/ }).click();
  await expect(list.getByText('Write project notes')).toBeVisible();
  await expect(list.getByText('Review API changes')).toHaveCount(0);

  await page.getByRole('button', { name: 'Delete Write project notes' }).click();
  await expect(list.getByText('Write project notes')).toHaveCount(0);
  await expect(list.getByText('No completed tasks yet. Keep going!')).toBeVisible();
});

test('keeps tasks after a page reload', async ({ page }) => {
  await page.getByRole('textbox', { name: 'New task' }).fill('Persist this task');
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.reload();

  await expect(page.getByRole('list', { name: 'Tasks' }).getByText('Persist this task')).toBeVisible();
});
