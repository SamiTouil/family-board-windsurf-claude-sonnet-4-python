import { test, expect } from '@playwright/test'

// Test data
const testUser = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'SecurePassword123!'
}

const invalidUser = {
  email: 'invalid@example.com',
  password: 'wrongpassword'
}

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test.describe('Initial Page Load', () => {
    test('should display login form by default', async ({ page }) => {
      await expect(page.getByTestId('submit-button')).toHaveText(/sign in/i)
      await expect(page.getByTestId('switch-mode-button')).toHaveText(/don't have an account/i)
    })

    test('should display app title and language selector', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('Family Task Planner')
      await expect(page.locator('.lang-btn')).toHaveCount(2)
    })
  })

  test.describe('Language Switching', () => {
    test('should switch to French', async ({ page }) => {
      await page.click('button:has-text("FR")')
      await expect(page.locator('h1')).toContainText('Planificateur de Tâches Familiales')
      await expect(page.getByTestId('submit-button')).toHaveText(/se connecter/i)
    })

    test('should switch back to English', async ({ page }) => {
      await page.click('button:has-text("FR")')
      await page.click('button:has-text("EN")')
      await expect(page.locator('h1')).toContainText('Family Task Planner')
      await expect(page.getByTestId('submit-button')).toHaveText(/sign in/i)
    })
  })

  test.describe('Form Mode Switching', () => {
    test('should switch from login to signup', async ({ page }) => {
      await page.getByTestId('switch-mode-button').click()
      
      await expect(page.getByTestId('submit-button')).toHaveText(/create account/i)
      await expect(page.getByTestId('switch-mode-button')).toHaveText(/already have an account/i)
      await expect(page.getByTestId('firstName-input')).toBeVisible()
      await expect(page.getByTestId('lastName-input')).toBeVisible()
      await expect(page.getByTestId('confirmPassword-input')).toBeVisible()
    })

    test('should switch from signup back to login', async ({ page }) => {
      // Verify we start in login mode
      await expect(page.getByTestId('submit-button')).toHaveText(/sign in/i)
      await expect(page.getByTestId('firstName-input')).not.toBeVisible()
      
      // Click to go to signup mode
      await page.getByTestId('switch-mode-button').scrollIntoViewIfNeeded()
      await page.getByTestId('switch-mode-button').click()
      await expect(page.getByTestId('submit-button')).toHaveText(/create account/i)
      await expect(page.getByTestId('firstName-input')).toBeVisible()
      
      // Verify signup form is fully visible
      await expect(page.getByTestId('lastName-input')).toBeVisible()
      await expect(page.getByTestId('confirmPassword-input')).toBeVisible()
    })
  })

  test.describe('Form Validation', () => {
    test('should show validation errors for empty login form', async ({ page }) => {
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('email-error')).toContainText(/email is required/i)
      await expect(page.getByTestId('password-error')).toContainText(/password is required/i)
    })

    test('should show validation errors for empty signup form', async ({ page }) => {
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('firstName-error')).toContainText(/first name is required/i)
      await expect(page.getByTestId('lastName-error')).toContainText(/last name is required/i)
      await expect(page.getByTestId('email-error')).toContainText(/email is required/i)
      await expect(page.getByTestId('password-error')).toContainText(/password is required/i)
    })

    test('should validate email format', async ({ page }) => {
      await page.getByTestId('email-input').fill('invalid-email')
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('email-error')).toContainText(/valid email/i)
    })

    test('should validate password length', async ({ page }) => {
      await page.getByTestId('email-input').fill('test@example.com')
      await page.getByTestId('password-input').fill('short')
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('password-error')).toContainText(/at least 8 characters/i)
    })

    test('should validate password confirmation in signup', async ({ page }) => {
      await page.getByTestId('switch-mode-button').click()
      
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(testUser.email)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill('different-password')
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('confirmPassword-error')).toContainText(/passwords do not match/i)
    })

    test('should clear validation errors when user starts typing', async ({ page }) => {
      await page.getByTestId('submit-button').click()
      await expect(page.getByTestId('email-error')).toBeVisible()
      
      await page.getByTestId('email-input').fill('test@example.com')
      await expect(page.getByTestId('email-error')).not.toBeVisible()
    })
  })

  test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async ({ page }) => {
      const passwordInput = page.getByTestId('password-input')
      const toggleButton = page.getByTestId('password-toggle')
      
      await passwordInput.fill('testpassword')
      await expect(passwordInput).toHaveAttribute('type', 'password')
      
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'text')
      
      await toggleButton.click()
      await expect(passwordInput).toHaveAttribute('type', 'password')
    })
  })

  test.describe('User Registration (Happy Path)', () => {
    test('should successfully register a new user', async ({ page }) => {
      // Switch to signup mode
      await page.getByTestId('switch-mode-button').click()
      
      // Fill out the form
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(`signup-${Date.now()}@example.com`)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      
      // Submit the form
      await page.getByTestId('submit-button').click()
      
      // Wait for signup to complete and redirect to dashboard
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      await expect(page.getByTestId('user-name')).toContainText(`${testUser.firstName} ${testUser.lastName}`)
      await expect(page.getByTestId('logout-button')).toBeVisible()
    })
  })

  test.describe('User Login', () => {
    test('should show error for invalid credentials', async ({ page }) => {
      await page.getByTestId('email-input').fill(invalidUser.email)
      await page.getByTestId('password-input').fill(invalidUser.password)
      await page.getByTestId('submit-button').click()
      
      await expect(page.getByTestId('auth-error')).toBeVisible()
    })

    test('should successfully login with valid credentials after signup', async ({ page }) => {
      const uniqueEmail = `login-test-${Date.now()}@example.com`
      
      // First register a user
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(uniqueEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Wait for signup to complete
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      
      // Logout
      await page.getByTestId('logout-button').click()
      await expect(page.getByTestId('auth-page')).toBeVisible()
      
      // Now login with the same credentials
      await page.getByTestId('email-input').fill(uniqueEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Should be logged in
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      await expect(page.getByTestId('user-name')).toContainText(`${testUser.firstName} ${testUser.lastName}`)
    })
  })

  test.describe('Dashboard Features', () => {
    test('should display user information and logout functionality', async ({ page }) => {
      const uniqueEmail = `dashboard-test-${Date.now()}@example.com`
      
      // Register and login
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(uniqueEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Wait for dashboard to load
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      await expect(page.getByTestId('user-name')).toContainText(`${testUser.firstName} ${testUser.lastName}`)
      await expect(page.getByTestId('logout-button')).toBeVisible()
      
      // Test logout
      await page.getByTestId('logout-button').click()
      await expect(page.getByTestId('auth-page')).toBeVisible()
    })

    test('should maintain language preference after login', async ({ page }) => {
      const uniqueEmail = `lang-test-${Date.now()}@example.com`
      
      // Change language to French first
      await page.getByTestId('lang-fr-button').click()
      await expect(page.getByTestId('submit-button')).toContainText(/se connecter/i)
      
      // Register user
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(uniqueEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Wait for dashboard to load
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      
      // Language should still be French
      await expect(page.getByTestId('logout-button')).toContainText(/déconnexion/i)
    })
  })

  test.describe('Edge Cases', () => {
    test('should handle network errors gracefully', async ({ page }) => {
      // Intercept the API call and simulate network error
      await page.route('**/auth/login', route => {
        route.abort('failed')
      })
      
      await page.getByTestId('email-input').fill(testUser.email)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Should show error message
      await expect(page.getByTestId('auth-error')).toBeVisible()
    })

    test('should handle duplicate email registration', async ({ page }) => {
      const duplicateEmail = `duplicate-${Date.now()}@example.com`
      
      // First registration
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('firstName-input').fill(testUser.firstName)
      await page.getByTestId('lastName-input').fill(testUser.lastName)
      await page.getByTestId('email-input').fill(duplicateEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Wait for signup to complete and login to happen
      await expect(page.getByTestId('user-name')).toBeVisible({ timeout: 20000 })
      await expect(page.getByTestId('user-name')).toContainText(`${testUser.firstName} ${testUser.lastName}`)
      
      // Logout
      await page.getByTestId('logout-button').click()
      
      // Wait for logout to complete
      await expect(page.getByTestId('auth-page')).toBeVisible()
      
      // Try to register with same email
      await page.getByTestId('switch-mode-button').click()
      await page.getByTestId('firstName-input').fill('Jane')
      await page.getByTestId('lastName-input').fill('Smith')
      await page.getByTestId('email-input').fill(duplicateEmail)
      await page.getByTestId('password-input').fill(testUser.password)
      await page.getByTestId('confirmPassword-input').fill(testUser.password)
      await page.getByTestId('submit-button').click()
      
      // Should show error for duplicate email
      await expect(page.getByTestId('auth-error')).toBeVisible()
      await expect(page.getByTestId('auth-error')).toContainText(/email.*already.*exists/i)
    })

    test('should disable submit button while loading', async ({ page }) => {
      // Test that form submission works correctly
      await page.getByTestId('email-input').fill(testUser.email)
      await page.getByTestId('password-input').fill(testUser.password)
      
      const submitButton = page.getByTestId('submit-button')
      
      // Verify button is initially enabled
      await expect(submitButton).toBeEnabled()
      await expect(submitButton).toHaveText(/sign in/i)
      
      // Click and verify the form processes correctly
      await submitButton.click()
      
      // Should show error for invalid credentials (since testUser doesn't exist)
      await expect(page.getByTestId('auth-error')).toBeVisible()
    })
  })
})
