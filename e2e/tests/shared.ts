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
import { spawn, spawnSync } from 'child_process';
import {
    existsSync,
    mkdtempSync,
    writeFileSync
} from 'fs';
import { dirname, join, sep } from 'path';
import { fileURLToPath } from 'url';
import { tmpdir } from 'os';
import { test } from '@playwright/test';
import dotenv from 'dotenv';
import { parse } from 'semver';
import { createServer } from 'net';

dotenv.config();

/** Repository root, resolved from this file's location (`<root>/e2e/tests/shared.ts`). */
const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/** Returns a short app name derived from template and version. */
export function getName(template: string, version: string) {
    return `tmpl-tst-${template.slice(0, 7)}-${version.split('-')[0].replaceAll('.', '-')}`;
}

/** Returns the absolute path to a template directory, throwing if it does not exist. */
export function getTemplateDir(template: string) {
    const templateDir = process.env.TEMPLATES_DIR
        ? join(process.env.TEMPLATES_DIR, template)
        : join(repoRoot, 'templates', template);
    if (!existsSync(templateDir)) {
        throw new Error(`No such template: ${templateDir}`);
    }
    console.log(`Using template ${templateDir}`);
    return templateDir;
}

/** Reads and validates the required environment variables for test runs. */
export function loadEnv() {
    const DT_APP_VERSION = process.env.DT_APP_VERSION;
    const DT_APP_ENVIRONMENT_URL = process.env.DT_APP_ENVIRONMENT_URL;
    console.log(`Using version: ${DT_APP_VERSION}\nUsing url: ${DT_APP_ENVIRONMENT_URL}`);
    if (!DT_APP_VERSION || !DT_APP_ENVIRONMENT_URL) {
        throw new Error('DT_APP_VERSION and DT_APP_ENVIRONMENT_URL must be passed as environment variables!');
    }
    // A dist-tag such as "latest" would silently break the app-name assertions, which derive the
    // expected name from the major/minor of this value. Fail loudly instead.
    if (!parse(DT_APP_VERSION)) {
        throw new Error(
            `DT_APP_VERSION must be an exact version (for example 1.18.0), but was "${DT_APP_VERSION}". `
            + 'Run `npm run version:latest` to resolve the newest released version.',
        );
    }
    return { DT_APP_VERSION, DT_APP_ENVIRONMENT_URL };
}

/** Runs a shell command synchronously and logs its output, returning the exit status. */
export function runCommand(command: string, cwd: string = process.cwd()) {
    console.log(`Executing command "${command}"...`);
    const [ cmd, ...args ] = command.split(' ');
    const { stdout, stderr, status } = spawnSync(cmd, args, { cwd });
    console.log(stdout.toString());
    console.log(stderr.toString());
    return status;
}

/** Runs a shell command synchronously and returns its trimmed stdout, throwing if it fails. */
export function runCommandOutput(command: string, cwd: string = process.cwd()) {
    console.log(`Executing command "${command}"...`);
    const [ cmd, ...args ] = command.split(' ');
    const { stdout, stderr, status } = spawnSync(cmd, args, { cwd });
    if (status !== 0) {
        throw new Error(`Command "${command}" failed with status ${status}: ${stderr.toString()}`);
    }
    return stdout.toString().trim();
}

/** Creates a temporary directory with a minimal package.json to host a generated app. */
export function setupTemporaryDir() {
    const temporaryDir = mkdtempSync(`${tmpdir()}${sep}`);
    console.log(`Using temporary directory ${temporaryDir}`);

    // Stops npm from walking up out of the temporary directory when resolving config.
    // The registry is deliberately left to the ambient npm configuration: every package the
    // templates need is published to the public registry.
    writeFileSync(join(temporaryDir, 'package.json'), '{}');

    return temporaryDir;
}

/** Starts the app dev server on the given port and resolves when it is ready. */
export function start(port: number, cwd: string): Promise<void> {
    test.setTimeout(2 * 60 * 1000);
    const child = spawn('npm' , `run start -- --port ${port}`.split(' '), { cwd });
    return new Promise((resolve) => {
        child.stdout.on('data', (data) => {
            const output = data.toString();
            console.log(output);
            if (output.includes('Development server started successfully.')) {
                resolve();
            }
        });
    });
}

/** Kills the process listening on the given port. */
export function killPort(portId: number) {
    if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', portId.toString(), '/f', '/t']);
    } else {
        spawn('sh', ['-c', 'kill -INT -' + portId]);
    }
}

/** Returns a free port in the range starting at a random offset from 3000. */
export async function getPort() {
    const port = await findPortInRange(
      'localhost',
      Math.floor(Math.random() * (60000 + 1) + 3000),
    );
    if (!port) {
      throw new Error('Could not find any free port!');
    }
    return port;
}

/** Scans ports starting at startPort until a free one is found or endPort is exceeded. */
export async function findPortInRange(host: string, startPort: number, endPort?: number): Promise<number | undefined> {
    let port = startPort;
    while (endPort ? port <= endPort : true) {
        if (!(await isUsed(host, port))) {
            return port;
        } else {
            port++;
            if (endPort && port > endPort) {
                throw new Error('All ports are taken!');
            }
        }
    }
}

/** Returns true if the given host/port is already in use. */
export async function isUsed(host: string, port: number): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const server = createServer();

        server.once('error', () => resolve(true));
        server.once('listening', function () {
            server.close(() => {
                resolve(false);
            });
        });

        server.listen(port, host);
    });
}
