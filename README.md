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
"scopes": [{ "name": "storage:logs:read", "comment": "default template" }, { "name": "storage:buckets:read", "comment": "default template" }]
  }
}
```

- modify `package.json` and replace `"dt-app": "{{version}}"` with the current App Toolkit version. Do not commit this change!
- run `npm install` and `npm start`

## Test your changes locally

```bash
  npx dt-app create --environment-url YOUR_ENVIRONMENT_URL --template-dir=../cli-templates/templates/empty
```
