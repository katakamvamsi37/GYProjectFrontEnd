import { test, expect } from '@playwright/test';

async function signIn(page, identifier = 'admin', password = 'BrowserTest!234') {
  await page.goto('/signin');
  await page.getByLabel('Email, mobile number or username').fill(identifier);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Festival overview.' })).toBeVisible();
}

for (const role of ['member', 'admin']) {
  test(`administrator resets a ${role} password; email and mobile require the new password`, async ({
    page,
  }) => {
    await signIn(page);
    await page.getByRole('link', { name: 'Access management', exact: true }).click();
    await page.getByRole('button', { name: 'Create account', exact: true }).click();
    const dialog = page.getByRole('dialog');
    const name = `Password reset ${role}`;
    const email = `reset-${role}@example.test`;
    const phone = role === 'admin' ? '9876543211' : '9876543210';
    await dialog.getByLabel('Full name').fill(name);
    await dialog.getByLabel('Email', { exact: true }).fill(email);
    await dialog.getByLabel('Mobile number (optional)').fill(phone);
    await dialog.getByLabel('Initial password').fill('OriginalFestival!456');
    await dialog.getByRole('combobox', { name: 'Role', exact: true }).selectOption(role);
    await dialog.getByRole('button', { name: 'Save account', exact: true }).click();
    await expect(dialog).not.toBeVisible();
    await page
      .getByRole('row')
      .filter({ hasText: email })
      .getByRole('button', { name: 'Reset password' })
      .click();
    await dialog.getByLabel(/^New password/).fill('ChangedFestival!789');
    await dialog.getByLabel('Confirm new password').fill('DifferentFestival!789');
    await dialog.getByRole('button', { name: 'Update password', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('passwords do not match');
    await dialog.getByLabel('Confirm new password').fill('ChangedFestival!789');
    await dialog.getByRole('button', { name: 'Update password', exact: true }).click();
    await expect(page.getByRole('status')).toContainText(`Password updated for ${name}`);
    await page.getByRole('button', { name: 'Sign out' }).click();
    await page.getByLabel('Email, mobile number or username').fill(phone);
    await page.getByLabel('Password', { exact: true }).fill('OriginalFestival!456');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('Invalid credentials');
    await signIn(page, phone, 'ChangedFestival!789');
    await page.getByRole('button', { name: 'Sign out' }).click();
    await signIn(page, email, 'ChangedFestival!789');
  });
}

test('profile photo uploads from the device, survives reload, and rejects invalid files', async ({
  page,
}) => {
  await signIn(page, 'member');
  await page.getByRole('link', { name: 'Open my profile' }).click();
  const input = page.getByLabel('Profile photo');
  await input.setInputFiles({
    name: 'invalid.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not an image'),
  });
  await expect(page.getByRole('alert')).toContainText('Choose a JPEG, PNG or WebP');
  const png = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAIAAABLbSncAAAAFElEQVR4nGNckOLGgA0wYRUdtBIABq0BWrs8RV0AAAAASUVORK5CYII=',
    'base64',
  );
  await input.setInputFiles({ name: 'profile.png', mimeType: 'image/png', buffer: png });
  await expect(
    page.getByText('Preview selected. Save profile to upload this photo.'),
  ).toBeVisible();
  const uploadResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/api/profiles/') && response.request().method() === 'PATCH',
  );
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  expect((await uploadResponse).status()).toBe(200);
  await expect(page.getByRole('status')).toContainText('Profile updated.');
  await page.reload();
  const profileImage = page.locator('.profile-summary img');
  await expect(profileImage).toBeVisible();
  await expect(profileImage).toHaveAttribute('src', /\/api\/profiles\/\d+\/avatar\//);
  await expect
    .poll(() => profileImage.evaluate((img) => img.complete && img.naturalWidth > 0))
    .toBe(true);
  await expect(page.locator('.sidebar-account img')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Access management', exact: true })).toHaveCount(0);
});
