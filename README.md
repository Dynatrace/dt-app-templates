# App Toolkit templates

## Structure

Folders directly inside the `templates` directory contain templates for the App Toolkit. The folder names are the identifier of the templates (used by the `--template` parameter when creating a new project).

## Develop the templates

To work directly with the source in the templates directory, follow these steps:

- create a `app.config.json` file with

```json
{
  "environmentUrl": "YOUR_ENVIRONMENT_URL",
  "app": {
    "id": "your.app.id",
    "name": "Your app name",
    "description": "Your very minimal app",
    "version": "0.0.0",
    "scopes": [
      { "name": "storage:logs:read", "comment": "default template" },
      { "name": "storage:buckets:read", "comment": "default template" }
    ]
  }
}
```

- modify `package.json` and replace `"dt-app": "{{version}}"` with the current App Toolkit version. Do not commit this change!
- run `npm install` and `npm start`

## Test your changes locally

```bash
  npx dt-app create --environment-url YOUR_ENVIRONMENT_URL --template-dir=../cli-templates/templates/default
```

## Dependency updates

Dependency versions in the templates are kept up to date by [Renovate](https://docs.renovatebot.com/)
(configured in [`renovate.json`](./renovate.json)). Bumping them manually every sprint is no longer necessary.

Renovate runs weekly (Monday before 6am, Europe/Vienna) and opens one pull request per group:

| Group                    | Contents                                                      |
| ------------------------ | ------------------------------------------------------------- |
| Dynatrace dependencies   | `@dynatrace/*` and `@dynatrace-sdk/*`                         |
| 3rd party dependencies   | all remaining `dependencies`                                  |
| dev dependencies         | all `devDependencies`, plus GitHub Actions used by workflows  |

Notes:

- Version ranges are never pinned. Renovate bumps the version a range points at while keeping the
  range operator, so `^1.1.4` becomes `^1.1.5` and the exact `react-intl` pin stays exact.
- Major updates arrive as their own pull request per group (for example `renovate/major-third-party-dependencies`)
  so that breaking changes are never mixed into a routine patch update.