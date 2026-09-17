# Template end-to-end tests

These tests validate that the templates in [`../templates`](../templates) still work with a released
`dt-app` version. For every TypeScript version under test they generate an app from the template and
then run through the full developer flow: `create`, `create:action`, `build`, `lint`, start the dev
server, and assert the rendered UI with Playwright.

They were migrated here from the internal `appfw/dt-app-templates` Bitbucket repository so that
template changes are covered by the same suite that gates a release.

## Running locally

1. `cp .example.env .env` and fill in the values (see the file for what each one does).
2. `npm run init` - installs dependencies and the Playwright browser.
3. `npm test`

`npm test` resolves the newest released `dt-app` version automatically. To pin one, either set
`DT_APP_VERSION` in `.env` or pass it inline:

```bash
DT_APP_VERSION=1.18.0 npm test
```

A full run covers every TypeScript version in the matrix and takes a while, because each one
reinstalls and rebuilds the generated app. While iterating, narrow it down:

```bash
TYPESCRIPT_VERSIONS=6.0.3 npm test
```

Use `npm run test:ui` or `npm run test:debug` to step through the browser assertions.

## Supported TypeScript versions

The default matrix is `5.6.2, 6.0.3`. That is the range the templates actually support, and both
ends are load-bearing:

- **Below 5.0** fails for two stacked reasons, in this order. First `create:action` fails, because
  `eslint-plugin-n@18` declares `peer typescript >=5.0.0` and npm refuses to resolve the tree.
  Remove that constraint and `build` fails instead: `ui/tsconfig.json` sets
  `"moduleResolution": "bundler"`, which only exists from TypeScript 5.0, so every subpath import
  errors with `TS2792`. The `actions/tsconfig.*.json` files that `dt-app` generates use `bundler`
  too, so the second one cannot be worked around from this repository alone.
- **7.0 and above** is blocked three times over: `dt-app` itself declares
  `peer typescript >=4.9.5 <7`, `typescript-eslint@8` declares `>=4.8.4 <6.1.0`, and the
  `ts-jest@29` that `dt-app action create` scaffolds declares `>=4.3 <7`. TypeScript 7 is already
  the `latest` tag on npm, so `create:action` is broken today for anyone on it.

An earlier version of the matrix included `4.9.5`, but that leg never actually installed the
TypeScript version it claimed - the install ran in the harness directory instead of the generated
app, so it silently reported the template's own TypeScript as a pass. See the note in
`default.spec.ts`.

## Credentials

`dt-app dev` authenticates against the environment before it will serve anything, so
`DT_APP_ENVIRONMENT_URL` plus an OAuth client are required for the full suite.

`create`, `create:action`, `build` and `lint` need no credentials at all. Those tests are tagged
`@offline` and can be run on their own against a placeholder URL - this is what CI uses for pull
requests, so that template changes are validated without exposing secrets:

```bash
DT_APP_VERSION=1.18.0 \
DT_APP_ENVIRONMENT_URL=https://placeholder.apps.dynatrace.com \
  npx playwright test --grep @offline
```

Without valid credentials the CLI falls back to the interactive browser login and waits
indefinitely rather than failing, so a full run that appears to hang is usually a credentials
problem.

## Helper scripts

- `npm run version:latest` - prints the newest released `dt-app` version.
- `npm run version:tag <version>` - prints the matching template tag (`1.18.7` gives `1.18.0`).
  That tag is what `dt-app create` fetches templates from, so it is what a release must publish.

## The template tag

`dt-app create` does not bundle templates - it downloads them from this repository at run time,
from the tag matching its own minor version:

```text
dt-app@1.18.7  ->  strips the patch  ->  downloads tag 1.18.0
```

If that tag is missing the CLI does not fail; it silently falls back to `main.zip`. So a missing
or stale tag quietly serves unvalidated templates to every user of that CLI minor.

The `tag` job publishes it, and only on a release:

1. wave publishes `dt-app@1.18.7` to npm.
2. wave sends a `repository_dispatch` to this repository with that version.
3. `resolve-version` takes the version from the payload, `e2e` validates the templates against it.
4. If `e2e` passes, `tag` force-moves `1.18.0` onto the tested commit.

A failing run therefore leaves the previous tag in place, so users keep the last validated
templates rather than getting broken ones.

Pushes to `main` deliberately do **not** publish a tag. The Jenkins job this replaced appeared to
have a second path for that, gated on `changeset "templates/**/*"`, but `templates/` was never
tracked in that repository - the same commit that added the condition also gitignored the
directory - so it could never match, and no tag was ever published from a template change.

### Triggering a release run by hand

```bash
gh api repos/Dynatrace/dt-app-templates/dispatches \
  -f event_type=dt-app-released \
  -F client_payload[dt_app_version]=1.18.7
```

Tags are protected, so only this workflow can publish them - a `git push origin 1.18.0` from a
developer machine is rejected.
