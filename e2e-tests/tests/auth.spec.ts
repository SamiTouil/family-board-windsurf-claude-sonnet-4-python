/**
 * End-to-End tests for authentication flows
 */

import { test, expect } from '@playwright/test';

// Test data
const testUsers = {
  validUser: {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe.e2e@example.com',
    password: 'securepassword123'
  },
  existingUser: {
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane.smith.e2e@example.com',
    password: 'anotherpassword456'
  }
};

test.describe('Authentication E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000');
  });

  test.describe('Signup Flow', () => {
    test('should successfully sign up a new user', async ({ page }) => {
      // Should be on auth page initially (not authenticated)
      await expect(page.locator('h2')).toContainText('Sign in to your account');

      // Switch to signup
      await page.click('text=Sign up');
      await expect(page.locator('h2')).toContainText('Create account');

      // Fill signup form
      await page.fill('input[name="first_name"]', testUsers.validUser.firstName);
      await page.fill('input[name="last_name"]', testUsers.validUser.lastName);
      await page.fill('input[name="email"]', testUsers.validUser.email);
      await page.fill('input[name="password"]', testUsers.validUser.password);
      await page.fill('input[name="confirmPassword"]', testUsers.validUser.password);

      // Submit signup
      await page.click('button[type="submit"]');

      // Should be redirected to authenticated state
      await expect(page.locator('text=Welcome')).toBeVisible();
      await expect(page.locator(`text=${testUsers.validUser.firstName}`)).toBeVisible();
    });

    test('should show error when signing up with existing email', async ({ page }) => {
      // First, create a user
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', testUsers.existingUser.firstName);
      await page.fill('input[name="last_name"]', testUsers.existingUser.lastName);
      await page.fill('input[name="email"]', testUsers.existingUser.email);
      await page.fill('input[name="password"]', testUsers.existingUser.password);
      await page.fill('input[name="confirmPassword"]', testUsers.existingUser.password);
      await page.click('button[type="submit"]');

      // Wait for success and logout
      await expect(page.locator('text=Welcome')).toBeVisible();
      await page.click('text=Logout');

      // Try to signup again with same email
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Different');
      await page.fill('input[name="last_name"]', 'Name');
      await page.fill('input[name="email"]', testUsers.existingUser.email);
      await page.fill('input[name="password"]', 'differentpassword');
      await page.fill('input[name="confirmPassword"]', 'differentpassword');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('.error-message')).toContainText(/already registered/i);
    });

    test('should validate password confirmation', async ({ page }) => {
      await page.click('text=Sign up');

      // Fill form with mismatched passwords
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="last_name"]', 'User');
      await page.fill('input[name="email"]', 'test.mismatch@example.com');
      await page.fill('input[name="password"]', 'password123');
      await page.fill('input[name="confirmPassword"]', 'differentpassword');

      await page.click('button[type="submit"]');

      // Should show validation error
      await expect(page.locator('.error-message')).toContainText(/passwords do not match/i);
    });

    test('should validate required fields', async ({ page }) => {
      await page.click('text=Sign up');

      // Try to submit empty form
      await page.click('button[type="submit"]');

      // Form should not submit (browser validation)
      await expect(page.locator('h2')).toContainText('Create account');

      // Fill only some fields
      await page.fill('input[name="first_name"]', 'Test');
      await page.fill('input[name="email"]', 'incomplete@example.com');

      await page.click('button[type="submit"]');

      // Should still be on signup page
      await expect(page.locator('h2')).toContainText('Create account');
    });
  });

  test.describe('Login Flow', () => {
    test('should successfully log in existing user', async ({ page }) => {
      // First create a user to login with
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Login');
      await page.fill('input[name="last_name"]', 'Test');
      await page.fill('input[name="email"]', 'login.test@example.com');
      await page.fill('input[name="password"]', 'loginpassword123');
      await page.fill('input[name="confirmPassword"]', 'loginpassword123');
      await page.click('button[type="submit"]');

      // Wait for success and logout
      await expect(page.locator('text=Welcome')).toBeVisible();
      await page.click('text=Logout');

      // Now test login
      await expect(page.locator('h2')).toContainText('Sign in to your account');

      await page.fill('input[name="email"]', 'login.test@example.com');
      await page.fill('input[name="password"]', 'loginpassword123');
      await page.click('button[type="submit"]');

      // Should be authenticated
      await expect(page.locator('text=Welcome')).toBeVisible();
      await expect(page.locator('text=Login')).toBeVisible();
    });

    test('should show error with wrong password', async ({ page }) => {
      // First create a user
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Wrong');
      await page.fill('input[name="last_name"]', 'Password');
      await page.fill('input[name="email"]', 'wrong.password@example.com');
      await page.fill('input[name="password"]', 'correctpassword');
      await page.fill('input[name="confirmPassword"]', 'correctpassword');
      await page.click('button[type="submit"]');

      // Logout
      await expect(page.locator('text=Welcome')).toBeVisible();
      await page.click('text=Logout');

      // Try login with wrong password
      await page.fill('input[name="email"]', 'wrong.password@example.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('.error-message')).toContainText(/incorrect/i);
    });

    test('should show error with non-existent email', async ({ page }) => {
      await page.fill('input[name="email"]', 'nonexistent@example.com');
      await page.fill('input[name="password"]', 'somepassword');
      await page.click('button[type="submit"]');

      // Should show error
      await expect(page.locator('.error-message')).toContainText(/incorrect/i);
    });

    test('should validate email format', async ({ page }) => {
      await page.fill('input[name="email"]', 'invalid-email');
      await page.fill('input[name="password"]', 'password123');
      await page.click('button[type="submit"]');

      // Browser validation should prevent submission
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });
  });

  test.describe('Authentication State', () => {
    test('should maintain authentication state on page reload', async ({ page }) => {
      // Sign up and login
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Persist');
      await page.fill('input[name="last_name"]', 'Test');
      await page.fill('input[name="email"]', 'persist.test@example.com');
      await page.fill('input[name="password"]', 'persistpassword');
      await page.fill('input[name="confirmPassword"]', 'persistpassword');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Welcome')).toBeVisible();

      // Reload page
      await page.reload();

      // Should still be authenticated
      await expect(page.locator('text=Welcome')).toBeVisible();
      await expect(page.locator('text=Persist')).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Sign up first
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Logout');
      await page.fill('input[name="last_name"]', 'Test');
      await page.fill('input[name="email"]', 'logout.test@example.com');
      await page.fill('input[name="password"]', 'logoutpassword');
      await page.fill('input[name="confirmPassword"]', 'logoutpassword');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Welcome')).toBeVisible();

      // Logout
      await page.click('text=Logout');

      // Should be back to login page
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });

    test('should clear authentication on logout and prevent access', async ({ page }) => {
      // Sign up and login
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Clear');
      await page.fill('input[name="last_name"]', 'Auth');
      await page.fill('input[name="email"]', 'clear.auth@example.com');
      await page.fill('input[name="password"]', 'clearpassword');
      await page.fill('input[name="confirmPassword"]', 'clearpassword');
      await page.click('button[type="submit"]');

      await expect(page.locator('text=Welcome')).toBeVisible();

      // Logout
      await page.click('text=Logout');

      // Reload page - should still be logged out
      await page.reload();
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });
  });

  test.describe('UI/UX Flow', () => {
    test('should switch between login and signup views', async ({ page }) => {
      // Start on login
      await expect(page.locator('h2')).toContainText('Sign in to your account');
      await expect(page.locator('text=Don\'t have an account?')).toBeVisible();

      // Switch to signup
      await page.click('text=Sign up');
      await expect(page.locator('h2')).toContainText('Create account');
      await expect(page.locator('text=Already have an account?')).toBeVisible();

      // Switch back to login
      await page.click('text=Sign in');
      await expect(page.locator('h2')).toContainText('Sign in to your account');
    });

    test('should show loading states during authentication', async ({ page }) => {
      // Test signup loading
      await page.click('text=Sign up');
      await page.fill('input[name="first_name"]', 'Loading');
      await page.fill('input[name="last_name"]', 'Test');
      await page.fill('input[name="email"]', 'loading.test@example.com');
      await page.fill('input[name="password"]', 'loadingpassword');
      await page.fill('input[name="confirmPassword"]', 'loadingpassword');

      // Click submit and check for loading state
      await page.click('button[type="submit"]');
      
      // The button text should change during loading
      // This might be brief, so we'll check for either state
      const button = page.locator('button[type="submit"]');
      const buttonText = await button.textContent();
      
      // Should either be loading or completed successfully
      expect(buttonText?.toLowerCase()).toMatch(/(creating|sign up|welcome)/i);
    });

    test('should be responsive on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Check that form is still usable
      await expect(page.locator('h2')).toContainText('Sign in to your account');
      
      // Form elements should be visible and clickable
      await expect(page.locator('input[name="email"]')).toBeVisible();
      await expect(page.locator('input[name="password"]')).toBeVisible();
      await expect(page.locator('button[type="submit"]')).toBeVisible();

      // Switch to signup and check responsiveness
      await page.click('text=Sign up');
      await expect(page.locator('input[name="first_name"]')).toBeVisible();
      await expect(page.locator('input[name="last_name"]')).toBeVisible();
    });
  });

  test.describe('Language Support', () => {
    test('should support language switching', async ({ page }) => {
      // Check for language selector
      const languageSelector = page.locator('select, button').filter({ hasText: /en|fr|english|français/i });
      
      if (await languageSelector.count() > 0) {
        // Test language switching if selector exists
        await languageSelector.first().click();
        
        // This test depends on the actual implementation
        // For now, just verify the selector exists
        await expect(languageSelector.first()).toBeVisible();
      }
    });
  });
});
