# App Toolkit templates

## Structure

## some header

Folders directly inside the `templates` directory contain templates for the App Toolkit. The folder names are the identifier of the templates (used by the `--template` parameter when creating a new project).

## Develop the templates

To work directly with the source in the templates directory, follow these steps:

- create a `app.config.ts` file with

```typescript
import type { CliOptions } from "dt-app";

const config: CliOptions = {
  environmentUrl: "YOUR_ENVIRONMENT_URL",
  oauthUrl: "https://sso-dev.dynatracelabs.com",
};

module.exports = config;
```

- modify `package.json` and replace `"dt-app": "{{version}}"` with the current App Toolkit version. Do not commit this change!
- run `npm install` and `npm start`

## Test your changes locally

```bash
  npx dt-app create --environment-url YOUR_ENVIRONMENT_URL --template-dir=../cli-templates/templates/empty
```
