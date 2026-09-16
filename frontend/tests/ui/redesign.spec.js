import { test, expect } from '@playwright/test';

// Fixtures exist only in browser tests; production screens always use their APIs.
const year = new Date().getFullYear();
const user = {
  id: 1,
  name: 'Arjun Kumar',
  email: 'arjun@example.test',
  phone: '9876543210',
  role: 'admin',
  authority: 'Administrator',
  avatar_url: '',
  is_active: true,
};
const expense = {
  id: 1,
  description: 'Festival stage decoration',
  category: 'Decoration',
  vendor: 'Sri Decorations',
  amount: '12500.00',
  spent_on: `${year}-09-10`,
  status: 'pending',
  created_by: 2,
  created_by_name: 'Ravi Kumar',
  receipt_reference: 'GY-001',
  notes: 'Stage and entrance flowers',
  evidence_url: '',
};
const payment = {
  id: 1,
  donor_name: 'Ravi Kumar',
  reference: 'GY-2026-001',
  method: 'UPI',
  amount: '10000.00',
  paid_on: `${year}-09-10T12:00:00Z`,
  status: 'confirmed',
  created_by: 2,
  created_by_name: 'Ravi Kumar',
  transaction_reference: 'UPI-001',
  evidence_url: '',
};
const member = {
  id: 1,
  name: 'Ravi Kumar',
  email: 'ravi@example.test',
  phone: '9876543211',
  position: 'Treasurer',
  authority: 'Festival finance',
  active: true,
};
const plan = {
  id: 1,
  title: 'Decoration & festival setup',
  category: 'Decoration',
  budget: '25000.00',
  spent: '12500.00',
  target_date: `${year}-09-14`,
  status: 'In progress',
};
const audit = {
  id: 1,
  created_at: `${year}-09-10T12:00:00Z`,
  actor_name: 'Arjun Kumar',
  action: 'create',
  resource: 'expense',
  object_id: 1,
  summary: 'Festival stage decoration submitted for review',
  before: {},
  after: { amount: '12500.00' },
};
const dashboard = {
  collected: '124500.00',
  spent: '82350.00',
  cash_balance: '42150.00',
  budget: '150000.00',
  remaining_budget: '67650.00',
  members: 48,
  pending_expenses: 3,
  pending_collections: 5,
  missing_receipts: 2,
  legacy_payments: 0,
  monthly_spend: [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ].map((month, index) => ({
    month,
    amount: [0, 0, 1500, 0, 2500, 5000, 7000, 24000, 42350, 0, 0, 0][index],
  })),
  recent_expenses: [
    expense,
    {
      ...expense,
      id: 2,
      description: 'Annadanam food supplies',
      category: 'Food & prasadam',
      amount: '24000.00',
      status: 'approved',
    },
  ],
  expenses_by_category: [
    { category: 'Decoration', amount: '25000.00' },
    { category: 'Food & prasadam', amount: '34350.00' },
    { category: 'Pooja & rituals', amount: '15000.00' },
    { category: 'Sound & lighting', amount: '8000.00' },
  ],
};

async function setup(
  page,
  { theme = 'light', role = 'admin', authenticated = true, empty = false } = {},
) {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(
    ({ theme, authenticated }) => {
      if (!localStorage.getItem('gy_theme')) localStorage.setItem('gy_theme', theme);
      if (authenticated)
        sessionStorage.setItem(
          'gy_session',
          JSON.stringify({ access: 'ui-test-access', refresh: 'ui-test-refresh' }),
        );
    },
    { theme, authenticated },
  );
  const records = {
    expenses: [expense],
    payments: [payment],
    members: [member],
    plans: [plan],
    audit: [audit],
    users: [
      user,
      {
        ...user,
        id: 2,
        name: 'Ravi Kumar',
        email: 'ravi@example.test',
        role: 'treasurer',
        authority: 'Treasurer',
      },
    ],
  };
  await page.route('http://127.0.0.1:8011/api/**', async (route) => {
    const url = new URL(route.request().url());
    const resource = url.pathname.replace('/api/', '').split('/')[0];
    const method = route.request().method();
    const json = (value, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(value) });
    if (resource === 'me') return json({ user: { ...user, role } });
    if (resource === 'login')
      return json({ user, access: 'ui-test-access', refresh: 'ui-test-refresh' });
    if (resource === 'logout') return json({});
    if (resource === 'dashboard')
      return json(
        empty
          ? {
              ...dashboard,
              collected: 0,
              spent: 0,
              cash_balance: 0,
              budget: 0,
              remaining_budget: 0,
              members: 0,
              recent_expenses: [],
              expenses_by_category: [],
              monthly_spend: [],
              pending_expenses: 0,
              pending_collections: 0,
              missing_receipts: 0,
            }
          : dashboard,
      );
    if (resource === 'profiles')
      return json({ user: { ...user, ...route.request().postDataJSON() } });
    if (resource === 'export')
      return route.fulfill({
        contentType: 'text/csv',
        body: 'description,amount\nFestival stage decoration,12500',
      });
    if (resource === 'signup')
      return json({ user: { id: 3, ...route.request().postDataJSON() } }, 201);
    if (records[resource]) {
      if (method === 'POST' && url.pathname.endsWith('/review/'))
        return json({ ...expense, status: 'approved' });
      if (method === 'POST') {
        const created = { id: 99, ...route.request().postDataJSON(), status: 'pending' };
        records[resource].push(created);
        return json(created, 201);
      }
      if (method === 'PATCH') return json({ id: 1, ...route.request().postDataJSON() });
      const result = empty ? [] : records[resource];
      return json({ results: result, count: result.length, next: null, previous: null });
    }
    return json({ detail: `Unhandled test route: ${url.pathname}` }, 404);
  });
  return errors;
}

for (const theme of ['light', 'dark', 'system']) {
  test(`${theme}: every page renders at desktop and mobile sizes`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    const errors = await setup(page, { theme });
    for (const width of [1440, 768, 390]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const path of [
        'home',
        'members',
        'collections',
        'expenses',
        'planning',
        'audit',
        'users',
        'profile',
      ]) {
        await page.goto(`/${path}`);
        await expect(page.locator('#main-content h1')).toBeVisible();
        await expect(page.locator('.skeleton-layout, .metrics[role="status"]')).toHaveCount(0);
        await expect(page.locator('html')).toHaveAttribute(
          'data-theme',
          theme === 'light' ? 'light' : 'dark',
        );
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          `${path} overflows at ${width}px`,
        ).toBe(true);
        if (path === 'home')
          expect(
            await page
              .locator('.metric > strong')
              .evaluateAll((values) =>
                values.every((value) => value.scrollWidth <= value.clientWidth),
              ),
          ).toBe(true);
        if (
          path === 'home' ||
          (theme === 'dark' && path === 'members') ||
          (theme === 'light' && ['planning', 'profile'].includes(path))
        )
          await page.screenshot({
            path: `test-results/${path}-${theme}-${width}.png`,
            fullPage: true,
          });
        if (width === 390 && path === 'members') {
          await expect(page.locator('.mobile-records')).toBeVisible();
          await expect(page.locator('.records-table')).toBeHidden();
        }
      }
    }
    expect(errors).toEqual([]);
  });
}

test('appearance follows the OS, persists, supports keyboard, and works on sign in', async ({
  page,
}) => {
  await setup(page, { authenticated: false, theme: 'system' });
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/signin');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.getByRole('button', { name: 'Choose appearance' }).click();
  await expect(page.getByRole('button', { name: 'System', exact: true })).toBeFocused();
  await page.keyboard.press('Home');
  await page.keyboard.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('gy_theme'))).toBe('light');
  await page.screenshot({ path: 'test-results/signin-light.png', fullPage: true });
  await page.getByRole('button', { name: 'Choose appearance' }).click();
  await page.getByRole('button', { name: 'Dark', exact: true }).click();
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.screenshot({ path: 'test-results/signin-dark.png', fullPage: true });
  await page.getByLabel('Email, mobile number or username').fill('arjun@example.test');
  await page.getByLabel('Password', { exact: true }).fill('TestPassword!234');
  await page.getByRole('button', { name: 'Show password' }).click();
  await expect(page.getByLabel('Password', { exact: true })).toHaveAttribute('type', 'text');
  const request = page.waitForRequest('**/api/login/');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  expect((await request).postDataJSON()).toEqual({
    identifier: 'arjun@example.test',
    password: 'TestPassword!234',
  });
  await expect(page.getByRole('heading', { name: 'Festival overview.' })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('mobile drawer traps focus, closes with Escape, and navigates', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page);
  await page.goto('/home');
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await expect(page.getByRole('button', { name: 'Close navigation', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Sign out' }).focus();
  await page.keyboard.press('Tab');
  await expect(page.locator('.sidebar-brand')).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open navigation' })).toBeFocused();
  await page.getByRole('button', { name: 'Open navigation' }).click();
  await page.getByRole('link', { name: 'Collections', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Collections.' })).toBeVisible();
  await expect(page.locator('.sidebar')).toBeHidden();
  await expect(page.locator('.main-shell')).not.toHaveAttribute('inert');
});

test('member form, review, export, and failed submission preserve request contracts', async ({
  page,
}) => {
  const errors = await setup(page, { theme: 'dark' });
  await page.goto('/members');
  await page.getByRole('button', { name: 'Add member', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Full name').fill('UI Test Member');
  await dialog.getByLabel('Email address').fill('new@example.test');
  const request = page.waitForRequest(
    (request) => request.url().endsWith('/api/members/') && request.method() === 'POST',
  );
  await dialog.getByRole('button', { name: 'Save record', exact: true }).click();
  const saved = await request;
  expect(saved.postDataJSON()).toMatchObject({
    name: 'UI Test Member',
    email: 'new@example.test',
    position: 'Volunteer',
    active: true,
  });
  expect(saved.headers()['idempotency-key']).toBeTruthy();
  await expect(dialog).toBeHidden();
  await expect(page.getByRole('status')).toContainText('Record saved successfully.');
  await page.goto('/expenses');
  await page
    .getByRole('button', { name: 'View / review' })
    .filter({ visible: true })
    .first()
    .click();
  await dialog.getByLabel('Review reason').fill('Verified receipt');
  const review = page.waitForRequest('**/api/expenses/1/review/?year=*');
  await dialog.getByRole('button', { name: 'Save review decision' }).click();
  expect((await review).postDataJSON()).toEqual({ action: 'approve', note: 'Verified receipt' });
  await expect(dialog).toBeHidden();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'CSV', exact: true }).click();
  expect((await download).suggestedFilename()).toBe(`ganesh-expenses-${year}.csv`);
  await page.goto('/collections');
  await page.getByRole('button', { name: 'Add collection', exact: true }).click();
  await dialog.getByLabel('Contributor name').fill('Failure test');
  await dialog.getByLabel('Amount (₹)').fill('100');
  await page.route('**/api/payments/', (route) =>
    route.request().method() === 'POST' ? route.abort() : route.fallback(),
  );
  await dialog.getByRole('button', { name: 'Submit for review' }).click();
  await expect(dialog.getByRole('alert')).toContainText('Cannot reach the server');
  await expect(dialog).toBeVisible();
  await expect(page.getByText('Record saved successfully.')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/collection-error-dark.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('empty states, server retry, year filters, and role restrictions remain functional', async ({
  page,
}) => {
  await setup(page, { empty: true });
  await page.goto('/home');
  await expect(page.getByText('No approved spending', { exact: true })).toBeVisible();
  await page.getByLabel('Festival year', { exact: true }).selectOption(String(year - 1));
  await expect(page.getByText('Your ledger starts here')).toBeVisible();
  await page.goto('/members');
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
  await page.route('**/api/members/?*', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'SQL internal exception' }),
    }),
  );
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('temporarily unavailable');
  await expect(page.getByText('SQL internal exception')).toHaveCount(0);
  await page.unroute('**/api/members/?*');
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('heading', { name: 'No matching records' })).toBeVisible();
});

test('member role has only permitted navigation and protected routes', async ({ page }) => {
  await setup(page, { role: 'member' });
  await page.goto('/users');
  await expect(page.getByRole('heading', { name: 'Festival overview.' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Access management', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Collections', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Open my profile' }).click();
  await expect(page.getByRole('heading', { name: 'Appearance', exact: true })).toBeVisible();
});
