The mcp.json file lies in /home/user/.vscode-server/data/User

Besides these custom mcp servers, I recommend context7, to have updated info about libs.

## Setup

The servers use ES modules and depend on `@modelcontextprotocol/sdk` (all three) and `jsdom` (ui-components only). Install dependencies before using them:

```bash
cd mcp
npm install
```

VS Code starts the servers automatically based on the configuration in `mcp.json` — no manual launch needed.

## MCP Servers

### ui-components-server

Connects to a **custom UI component library** served via [Storybook](https://storybook.js.org/). It scrapes the Storybook instance to expose component documentation, usage examples, and design tokens directly to the AI agent — so it can reference the exact component API instead of guessing from memory.

Set the `UI_LIB_BASE_URL` environment variable to your Storybook instance URL (e.g., `https://your-storybook.example.com`).

### jira-server

Connects to an Atlassian Jira instance. Set `ATLASSIAN_URL`, `ATLASSIAN_EMAIL`, and `ATLASSIAN_API_TOKEN` in the environment.

### gitlab-server

Connects to a GitLab instance. Set `GITLAB_URL` and `GITLAB_API_TOKEN` in the environment.
