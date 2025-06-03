import { test, expect } from '@playwright/test'

test.describe('Family Task Planner App', () => {
  test('should display the app title', async ({ page }) => {
    await page.goto('/')
    
    // Check if the app title is visible
    await expect(page.getByRole('heading', { name: 'Family Task Planner' })).toBeVisible()
  })

  test('should have language selector', async ({ page }) => {
    await page.goto('/')
    
    // Check if language buttons are present
    await expect(page.getByRole('button', { name: 'EN' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'FR' })).toBeVisible()
  })

  test('should switch language to French', async ({ page }) => {
    await page.goto('/')
    
    // Click French language button
    await page.getByRole('button', { name: 'FR' }).click()
    
    // Check if the title changed to French
    await expect(page.getByRole('heading', { name: 'Planificateur de Tâches Familiales' })).toBeVisible()
  })

  test('should switch language back to English', async ({ page }) => {
    await page.goto('/')
    
    // Switch to French first
    await page.getByRole('button', { name: 'FR' }).click()
    await expect(page.getByRole('heading', { name: 'Planificateur de Tâches Familiales' })).toBeVisible()
    
    // Switch back to English
    await page.getByRole('button', { name: 'EN' }).click()
    await expect(page.getByRole('heading', { name: 'Family Task Planner' })).toBeVisible()
  })

  test('should display welcome message', async ({ page }) => {
    await page.goto('/')
    
    // Check if auth page is visible (since we now show auth page when not authenticated)
    await expect(page.getByText('Welcome back')).toBeVisible()
    await expect(page.getByTestId('submit-button')).toBeVisible()
  })
})
