/**
 * @license
 * Copyright 2022 Dynatrace LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { rmSync } from 'fs';
import { join } from 'path';
import { expect, test } from '@playwright/test';
import { getName, getPort, getTemplateDir, killPort, loadEnv, runCommand, runCommandOutput, setupTemporaryDir, start } from './shared.ts';
import { parse } from 'semver';

const TEMPLATE = 'default';
const { DT_APP_VERSION, DT_APP_ENVIRONMENT_URL } = loadEnv();

const port = await getPort();
let appDir: string;
let temporaryDir: string | undefined;

// Overridable so CI can fan the versions out across one matrix job each.
const typescriptVersionsToTest = process.env.TYPESCRIPT_VERSIONS
  ? process.env.TYPESCRIPT_VERSIONS.split(',').map((version) => version.trim()).filter(Boolean)
  : ['5.6.2', '6.0.3'];
let isAppCreated = false;

typescriptVersionsToTest.forEach((version) => {
  test.describe.serial(`Run all tests for typescript version ${version}`, () => {
    test.afterAll(() => {
      killPort(port);
    });

    test('Test the create command', { tag: '@offline' }, () => {
      if (!isAppCreated) {
        test.setTimeout(2 * 60 * 1000);
        const name = getName(TEMPLATE, DT_APP_VERSION);
        const templateDir = getTemplateDir(TEMPLATE);
        const createdDir = setupTemporaryDir();
        temporaryDir = createdDir;
        appDir = join(createdDir, name);
        expect(
          runCommand(
            `npx --yes dt-app@${DT_APP_VERSION} create ${name}` +
              ' --verbose' +
              ' --no-git' +
              ` --environment-url ${DT_APP_ENVIRONMENT_URL}` +
              ` --template ${TEMPLATE}` +
              ` --template-dir ${templateDir}`,
            createdDir,
          ),
        ).toBe(0);
        isAppCreated = true;
      }
    });

    test(`Install typescript ${version}`, { tag: '@offline' }, () => {
      // Must run after the app exists. The install used to sit in a beforeAll hook, where appDir
      // was still undefined, so runCommand fell back to cwd and installed into this harness
      // instead of the generated app - silently leaving the app on its bundled TypeScript.
      expect(appDir).toBeTruthy();
      const resolved = version === 'latest' ? runCommandOutput('npm view typescript version') : version;
      console.log(`Installing typescript@${resolved} into ${appDir}`);
      expect(runCommand(`npm install typescript@${resolved}`, appDir)).toBe(0);
      expect(runCommandOutput('npm ls typescript --depth=0', appDir)).toContain(resolved);
    });

    test('Create action', { tag: '@offline' }, () => {
      const randomValue = Math.floor(Math.random() * 10000) + 1;
      expect(runCommand(`npm run create:action test${randomValue}`, appDir)).toBe(0);
    });

    test('Test the build command', { tag: '@offline' }, () => {
      expect(runCommand('npm run build', appDir)).toBe(0);
    });

    test('Run lint to ensure no linting errors are shipped', { tag: '@offline' }, () => {
      expect(runCommand('npm run lint', appDir)).toBe(0);
    });

    test('Start dev server', async () => {
      await start(port, appDir);
    });

    test('Header is visible and correct', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui`);
      const header = page.getByText('Welcome To Your Dynatrace App');
      await expect(header).toBeVisible();
    });

    test('Logo is visible', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui`);
      const logo = page.getByRole('img', { name: 'Dynatrace Logo' });
      await expect(logo).toBeVisible();
    });

    test('App name in navbar visible', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui`);
      const version = parse(DT_APP_VERSION);

      await expect(
        page.getByRole('link', { name: `tmpl-tst-default-${version?.major}-${version?.minor}-` }),
      ).toBeVisible();
    });

    test('Panels visible', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui`);
      await expect(page.getByRole('link', { name: 'Explore data Explore data' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Dynatrace Developer Dynatrace' })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Developer Community Developer' })).toBeVisible();
    });

    test('Panel 1 redirects to correct url', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui`);
      await page.getByRole('link', { name: 'Explore data Explore data' }).click();
      await page.waitForURL(`http://localhost:${port}/ui/data`);
    });

    test('Panel 2 redirects to correct url', async ({ page, context }) => {
      await page.goto(`http://localhost:${port}/ui`);
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Dynatrace Developer Dynatrace' }).click();
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      expect(newPage.url()).toBe('https://developer.dynatrace.com/');
    });

    test('Panel 3 redirects to correct url', async ({ page, context }) => {
      await page.goto(`http://localhost:${port}/ui`);
      const pagePromise = context.waitForEvent('page');
      await page.getByRole('link', { name: 'Developer Community Developer' }).click();
      const newPage = await pagePromise;
      await newPage.waitForLoadState();
      expect(newPage.url()).toContain('https://community.dynatrace.com/t5/Developer');
    });

    test('Data explorer looks correct', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui/data`);

      // Header is visible and correct
      const heading = page.getByText('Explore the data in your environment by using the Dynatrace Query Language');
      await expect(heading).toBeVisible();

      // Logo is visible
      const logo = page.getByRole('img', { name: 'Dynatrace Logo' });
      await expect(logo).toBeVisible();
    });

    test('Data explorer query button visible (and works)', async ({ page }) => {
      await page.goto(`http://localhost:${port}/ui/data`);
      const button = page.getByRole('button').filter({ hasText: 'Run query' });
      await expect(button).toBeVisible();

      // Const requestPromise = page.waitForRequest(`http://localhost:${port}/platform/storage/query/v1/query:execute`);
      // await button.click();
      // await requestPromise;
    });
  });
});

// Declared at file scope so it runs once, after every version's describe block has finished.
test.afterAll(() => {
  if (!temporaryDir || process.env.KEEP_TEST_APPS) {
    return;
  }
  // The generated app carries its own node_modules, so each run leaves ~800 MB behind otherwise.
  console.log(`Removing temporary directory ${temporaryDir}`);
  rmSync(temporaryDir, { recursive: true, force: true });
});
