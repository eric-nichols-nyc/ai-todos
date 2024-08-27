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
    
    // Get the initial number of tasks
    const initialTaskCount = await page.$$eval('li', (tasks) => tasks.length);
    
    // Add a new task
    await page.fill('input[placeholder="Enter a new task"]', 'New test task');
    await page.click('button', { text: 'Add' });
    
    // Wait for the new task to be added
    await page.waitForSelector(`li:nth-child(${initialTaskCount + 1})`);
    
    // Check if the new task is added
    const newTaskCount = await page.$$eval('li', (tasks) => tasks.length);
    expect(newTaskCount).toBe(initialTaskCount + 1);
  });

  test('should filter tasks by priority', async ({ page }) => {
    await page.goto('/');
    
    // Wait for tasks to load
    await page.waitForSelector('ul');
    
    // Select high priority filter
    await page.selectOption('select', 'high');
    
    // Check if only high priority tasks are displayed
    const highPriorityTasks = await page.$$('li:has-text("High")');
    const allVisibleTasks = await page.$$('li');
    expect(highPriorityTasks.length).toBe(allVisibleTasks.length);
  });
});