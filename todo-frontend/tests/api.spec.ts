import { expect, test } from '@playwright/test';

const apiURL = process.env.PLAYWRIGHT_API_URL ?? 'http://127.0.0.1:8000';

test('API health check responds', async ({ request }) => {
  const response = await request.get(`${apiURL}/`);

  expect(response.ok()).toBeTruthy();
  await expect(response).toBeOK();
  await expect(response.json()).resolves.toEqual({ message: 'Todo API is running' });
});

test('API supports the task create, read, update, and delete lifecycle', async ({ request }) => {
  const title = `Playwright API ${crypto.randomUUID()}`;
  const createResponse = await request.post(`${apiURL}/tasks`, {
    data: { title, description: 'Created by the Playwright API smoke test', completed: false },
  });

  expect(createResponse.ok()).toBeTruthy();
  const { id } = await createResponse.json() as { id: string };
  expect(id).toBeTruthy();

  try {
    const listResponse = await request.get(`${apiURL}/tasks`);
    expect(listResponse.ok()).toBeTruthy();
    const tasks = await listResponse.json() as Array<{ _id: string; title: string }>;
    expect(tasks.some(task => task._id === id && task.title === title)).toBeTruthy();

    const readResponse = await request.get(`${apiURL}/tasks/${id}`);
    expect(readResponse.ok()).toBeTruthy();
    expect(await readResponse.json()).toMatchObject({ _id: id, title, completed: false });

    const updateResponse = await request.put(`${apiURL}/tasks/${id}`, {
      data: { title, description: 'Updated by the Playwright API smoke test', completed: true },
    });
    expect(updateResponse.ok()).toBeTruthy();
    expect(await updateResponse.json()).toMatchObject({ updated: 1 });

    const updatedResponse = await request.get(`${apiURL}/tasks/${id}`);
    expect(await updatedResponse.json()).toMatchObject({ _id: id, title, completed: true });
  } finally {
    const deleteResponse = await request.delete(`${apiURL}/tasks/${id}`);
    expect(deleteResponse.ok()).toBeTruthy();
  }
});
