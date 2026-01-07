# AI Coding Agent Instructions

## Project Overview
This repository contains a **Dynatrace App** built with the Dynatrace App Toolkit "dt-app", running on **Dynatrace AppEngine**. Use the **App Toolkit** during development and CI (`dt-app dev`, `dt-app build`, `dt-app deploy`, `dt-app publish`).

## Core Concepts
### Dynatrace Apps  
- UI is **TypeScript/React** using **Strato Design System** components for consistent Dynatrace UX.  
- Backend logic runs inside the **Dynatrace JavaScript runtime**. Let the app execute backend code, primarily to call external URLs (e.g., third‑party APIs) that shouldn’t be invoked directly from the browser.
- Apps can use **Intents** for cross-app communication
- Apps can provide **Actions** and **Widgets** to extend Dynatrace. 

### Grail
- **Grail** stores observability data (logs, metrics, events, traces, business events).
- **DQL** is used to query Grail.

### DQL (Dynatrace Query Language)
DQL is a **pipeline-style query language** for Grail: you start with a data source (e.g., `fetch logs` or `timeseries` for metrics), then add pipe‑separated commands like `filter`, `summarize`, `sort`, and `makeTimeseries` to transform and aggregate results. Typical patterns include counting events, building time series, and grouping by dimensions (e.g., host or status).

### Platform Services
A set of services are available to Dynatrace Apps to read and write data. Every service provides a typescript **client sdk** to interact with it. Common services include:
- **Grail Query Service**: Query Dynatrace Grail data using DQL. Prefer using the `useDql` React hook from `@dynatrace-sdk/react-hooks` in UI code, but the low‑level client `@dynatrace-sdk/client-query` is also available.
- **Document Service**: Store and retrieve json files. Used e.g. for dashboards, can be shared with other users. Use `@dynatrace-sdk/client-document` to interact with it.
- **(User) App State Service**: Store and retrieve user‑specific or app‑specific key/value data. Used for caching or user preferences. Use `@dynatrace-sdk/client-state` to interact with it.

## Strato Design System
The **Strato Design System** is Dynatrace's official design system and component library. It provides React components, design tokens (colors, borders, shadows), and icons to build consistent UIs that align with Dynatrace's look and feel.

Available packages:
- `@dynatrace/strato-components` — Stable react components. Components here include: Button, ProgressBar, ProgressCircle, Skeleton, SkeletonText, AppRoot, Container, Divider, Flex, Grid, Surface, Heading, Link, List, Paragraph, Strikethrough, Strong, Text, TextEllipsis
- `@dynatrace/strato-components-preview` — Most components are here, including Charts (TimeseriesChart, HistogramChart, HoneycombChart, SingleValue, PieChart, ...), Content (Accordion, Chip, HealthIndicator, MessageContainer, ...), Editors (CodeEditor, DQLEditor), Filters (FilterBar, FilterField, SegmentSelector, TimeframeSelector), Forms (Checkbox, Radio, Select, Switch, TextInput, ...), Layouts (AppHeader, HelpMenu, InputGroup, Page, TitleBar), Navigation (AppLink, Breadcrumbs, Menu, Tabs), Overlays (Modal, Overlay, Sheet, Tooltip), Tables (DataTable, SimpleTable)
- `@dynatrace/strato-design-tokens` — design tokens (colors, spacing, typography) for consistent styling.
- `@dynatrace/strato-geo` — map visualization primitives.
- `@dynatrace/strato-icons` — Strato icon library.

### Working with Table components
When using table components from Strato, prefer `DataTable` from `@dynatrace/strato-components-preview/tables` for advanced features like sorting, filtering, pagination, and selection. Use `SimpleTable` for basic tabular data without interactivity, mostly used for Markdown rendering.

Table API:
- Tables require the `data` and `columns` props
- Column definitions must include `id`, `header`, and `accessor` (string path or function)

### Importing Strato Components
When importing Strato components, follow these guidelines to ensure optimal bundle size and performance:
1. **Never** import from `@dynatrace/strato-components` or `@dynatrace/strato-components-preview` package root
2. **Always** import from the specific category subdirectory (e.g., `/layouts`, `/typography`, `/tables`)
3. **Wrong**: `import { Flex, Heading } from "@dynatrace/strato-components";`
4. **Correct**: 
   ```typescript
   import { Flex } from "@dynatrace/strato-components/layouts";
   import { Heading } from "@dynatrace/strato-components/typography";
   ```

**TypeScript Definitions**: All Strato packages have TypeScript definitions located directly in the package root under each component folder. For example:
- `node_modules/@dynatrace/strato-components-preview/forms/select/Select.d.ts` - Main Select component
- `node_modules/@dynatrace/strato-components-preview/forms/select/SelectOption.d.ts` - Select.Option component
- Pattern: `node_modules/@dynatrace/strato-components[-preview]/<category>/<component>/<Component>.d.ts`

**Important**: Always check the `.d.ts` files directly in `node_modules/@dynatrace/strato-components[-preview]/` to understand component APIs. Do NOT look for a separate `types/` subdirectory.

## Client SDKs
Dynatrace provides TypeScript client SDKs to interact with platform services. Each service has its own package, for example: `@dynatrace-sdk/client-query`, `@dynatrace-sdk/client-document`, `@dynatrace-sdk/client-state`. Those packages are autogenerated from the service OpenAPI specs and have the following characteristics:
- Exported clients to call service endpoints, eg. `queryClient` or `documentClient`.
- Example: 
```typescript 
const result = await queryClient.queryExecute({ body: { query: 'fetch logs | count' }});
```

**Important**: Prefer using the higher‑level React hooks from `@dynatrace-sdk/react-hooks` in UI code, as they encapsulate state management, polling, and error handling.

## Other SDKs
- React hooks — `@dynatrace-sdk/react-hooks`: React hooks for DQL (useDql), documents, app state, settings and other platform services.  Prefer using these in UI code. Request and response types match the low‑level client SDKs. Example:
  ```typescript 
  const { data, error, isLoading } = useDocument({ id: documentId });
  ```
-- Common React Hooks:
--- `useDql(query: string)` - Execute DQL queries
--- `useDocument({ id: string })` - Fetch a single document
--- `useListDocuments(params)` - List all documents (requires `document:documents:read` scope)
--- `useAppState({ key: string })` and `useUserAppState({ key: string })` - Read app (user) state
--- `useSetAppState()` and `useSetUserAppState()` - Write app (user) state. Returns an execute function.
--- `useAppFunction({ name: string, data: any })` - Call backend functions
-- All update/set/POST hooks return an execute function that you can call to perform the action.
- Units & formatting — `@dynatrace-sdk/units`: Convert values to human‑readable strings (e.g., bytes → KiB/MB) and ensure consistent unit formatting across UI and functions.
- App Environment — `@dynatrace-sdk/app-environment`: Read app/environment context (IDs, URLs, current user) directly in the app
- User Preferences — `@dynatrace-sdk/user-preferences`: Retrieve the logged‑in user’s theme, language, regional format, and timezone to adapt UI/formatting. Can not be used to store custom user settings. Use the App State service for that. 

## Development Workflow

### Commands (via `dt-app` CLI)
- **Dev Server**: `npm run start` - runs with hot reload, auto-opens browser
- **Build**: `npm run build` - outputs to `dist/` folder
- **Deploy**: `npm run deploy` - deploys to environment in `app.config.json`

### Configuration
- **App Metadata**: `app.config.json` defines app name, ID, version, and required scopes
- **Environment URL**: Set `environmentUrl` in `app.config.json` to target Dynatrace environment
- **Scopes**: Add required permissions to `app.config.json` `scopes` array (e.g., `storage:logs:read`, `document:documents:read`, `document:documents:write`, `state:app-states:read`, `state:app-states:write`)

## Key Dependencies
- `@dynatrace/strato-components` and `-preview`: UI component library
- `@dynatrace/strato-design-tokens`: Design tokens (colors, borders, shadows)
- `@dynatrace-sdk/react-hooks`: Hooks for Dynatrace APIs (`useDql`, etc.)
- `@dynatrace-sdk/client-*`: Query API clients, every service has its own client package

## Common Tasks
- **Add Route**: Update `Routes` in [ui/app/App.tsx](ui/app/App.tsx) and add nav item to [ui/app/components/Header.tsx](ui/app/components/Header.tsx)
- **Query Data**: Use `useDql` hook with DQL query string (Dynatrace Query Language)
- **Style Components**: Import from `@dynatrace/strato-design-tokens/{colors,borders,box-shadows}` for design tokens
