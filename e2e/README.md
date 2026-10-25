# E2E Testing - Noto PATI

End-to-end testing menggunakan Playwright untuk memastikan user flows dan integrasi berjalan dengan baik.

## Setup

1. Install dependencies (sudah terinstall di project):
```bash
npm install
```

2. Install Playwright browsers (pertama kali):
```bash
npx playwright install
```

## Running Tests

### Run all tests
```bash
npm run test:e2e
```

### Run specific test file
```bash
npx playwright test e2e/landing-page.spec.ts
```

### Run with UI mode (interactive)
```bash
npx playwright test --ui
```

### Run in headed mode (see browser)
```bash
npx playwright test --headed
```

### Run specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

### Debug mode
```bash
npx playwright test --debug
```

## Test Structure

```
e2e/
├── auth-flow.spec.ts          # Authentication & authorization flows
├── landing-page.spec.ts       # Landing page elements & content
├── navigation.spec.ts         # Public navigation & routing
└── helpers/
    └── auth.ts                # Authentication utilities
```

## Test Coverage

### ✅ Landing Page (`landing-page.spec.ts`)
- Hero section display
- "How to Report" 5-step guide
- Status badges showcase
- Featured reports with "Data Simulasi" badge
- Footer with disclaimers
- Accessible navigation

### ✅ Public Navigation (`navigation.spec.ts`)
- Guest user navigation (/, /map, /budget)
- Guest user auth CTAs
- Authenticated user navigation
- Admin user dashboard access
- Mobile responsive menu

### ✅ Authentication Flow (`auth-flow.spec.ts`)
- Login page display and validation
- Register page display
- Login/register navigation
- Redirect preservation (?next parameter)
- Unauthorized access handling

## Writing New Tests

### Example: Test a new page

```typescript
import { test, expect } from '@playwright/test';

test.describe('Budget Page', () => {
  test('should display APBD data', async ({ page }) => {
    await page.goto('/budget');
    
    await expect(page.getByRole('heading', { name: /APBD/i })).toBeVisible();
  });
});
```

### Example: Test with authentication

```typescript
import { test, expect } from '@playwright/test';
import { loginUser } from './helpers/auth';

test.describe('Protected Page', () => {
  test('should allow authenticated user', async ({ page }) => {
    // Login first
    await loginUser(page, 'test@example.com', 'password123');
    
    // Then navigate to protected page
    await page.goto('/report/new');
    await expect(page).toHaveURL('/report/new');
  });
});
```

## Environment Variables

Untuk test authentication, set environment variables:

```bash
# .env.test
TEST_USER_EMAIL=test@example.com
TEST_USER_PASSWORD=testpassword123
TEST_ADMIN_EMAIL=admin@example.com
TEST_ADMIN_PASSWORD=adminpassword123
```

## CI/CD Integration

Tests berjalan otomatis di CI dengan konfigurasi:
- Retry: 2x pada CI
- Worker: 1 (sequential) pada CI
- Reporter: HTML (saved as artifact)

## Troubleshooting

### Test timeout
Increase timeout in playwright.config.ts:
```typescript
use: {
  actionTimeout: 10000,
  navigationTimeout: 30000,
}
```

### Authentication issues
Pastikan Supabase test database terisi dengan test users, atau gunakan mock authentication.

### Flaky tests
- Add explicit waits: `await page.waitForSelector()`
- Use `waitForLoadState`: `await page.waitForLoadState('networkidle')`
- Increase retries untuk specific tests

## Best Practices

1. **Use accessible selectors**: `getByRole`, `getByLabel`, `getByText`
2. **Avoid hard-coded waits**: Use `waitFor*` methods instead of `page.waitForTimeout()`
3. **Test user perspective**: Test what users see, not implementation details
4. **Keep tests independent**: Each test should setup and cleanup its own state
5. **Use page object pattern**: For complex pages with many interactions

## References

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Tests](https://playwright.dev/docs/debug)
