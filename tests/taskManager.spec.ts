import { test, expect } from '@playwright/test';

test.describe('TaskManager', () => {
  test('should load and display tasks', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the task list to be visible
    await page.waitForSelector('ul');
    
    // Check if tasks are loaded
    const tasks = await page.$$('li');
    expect(tasks.length).toBeGreaterThan(0);
  });

  test('should add a new task', async ({ page }) => {
    await page.goto('/');
    
    // Wait for the task list items to be rendered
    await page.waitForSelector('li');
    
    // Get the initial number of tasks
    const initialTaskCount = await page.$$eval('li', (tasks) => tasks.length);
    
    // Add a new task
    await page.fill('input[placeholder="Enter a new task"]', 'New test task');
    const button = page.locator('button', { hasText: 'Add' });
    await button.click();    
        
    // Wait for the new task to be added
    await page.waitForSelector(`li:nth-child(${initialTaskCount + 1})`);
    
    // Check if the new task is added
    const newTaskCount = await page.$$eval('li', (tasks) => tasks.length);
    expect(newTaskCount).toBe(initialTaskCount + 1);
  });

  test('should load the three default tasks', async ({ page }) => {
    await page.goto('/');

    // Wait for the task list to be visible
    await page.waitForSelector('ul');

    // Check if exactly three tasks are loaded
    const tasks = await page.$$('li');
    expect(tasks.length).toBe(3);

    // Check the content of each default task
    const defaultTasks = [
      'Complete project proposal',
      'Schedule team meeting',
      'Review quarterly report'
    ];

    for (let i = 0; i < defaultTasks.length; i++) {
      const taskText = await tasks[i].textContent();
      expect(taskText).toContain(defaultTasks[i]);
    }
  });
});