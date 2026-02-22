# AI Workflow

An AI-assisted development workflow for VS Code (Copilot / agent mode) and Cursor. It takes a Jira ticket from requirements all the way to a reviewed MR — with structured phases, enforced gates, and MCP-powered tool access at each step.

> For the concepts behind this (prompting, context engineering, MCP, guardrails, testing), see [WORKFLOW.md](WORKFLOW.md).

---

## The loop

```
BA: <JIRA-ID>          →  BizSpec (acceptance criteria, open questions)
PLAN: <JIRA-ID>        →  Tech Plan + task breakdowns
DO: <JIRA-ID> task<n>  →  Implementation + Vitest specs + how-to-test
GIT: <JIRA-ID>         →  PR title/description preview → MR creation
```

Each phase has **gates** — the agent won't advance if the current phase has blockers. This keeps the pipeline honest.

---

## Quick Start

### Prerequisites

-   **Editor**: VS Code (with Copilot / agent mode) or Cursor.
-   **Node.js** ≥ 18 (for MCP servers).
-   **Accounts & tokens** (for the MCP servers you plan to use):
    -   **Jira**: Atlassian URL, email, and [API token](https://id.atlassian.com/manage-profile/security/api-tokens).
    -   **GitLab**: instance URL and [personal access token](https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html).
    -   **UI Components (Storybook)**: URL of your running Storybook instance.

### 1. Copy `.ai` and `.cursorrules` into your project root

```
your-project/
├── .ai/
│   ├── standards/       # Your team's code standards (tech, core, crud, api-and-mocks, dev-playbook)
│   ├── templates/       # Templates for bizspec, techplan, techtask, output, and MR description
│   └── tasks/           # Created at runtime — one subfolder per Jira ticket
├── .cursorrules         # Agent router: modes, triggers, gates, and safety rails
└── src/
```

Copy `.ai/` and `.cursorrules` from this repo into **your project's root**. Then customize:

-   **`.ai/standards/`** — update to reflect your team's stack, patterns, and conventions.
-   **`.ai/templates/`** — adjust if your PR format, test tooling, or task structure differs.
-   **`.cursorrules`** — adapt branch naming, commit format, and gate rules to your workflow.

### 2. Install MCP server dependencies

```bash
cd mcp
npm install
```

### 3. Place MCP server files where your editor can find them

Copy the `.js` files from `mcp/` to a stable path on your machine:

| OS      | Suggested path                                          |
| ------- | ------------------------------------------------------- |
| Linux   | `~/.vscode-server/data/User/mcp-servers/`               |
| macOS   | `~/Library/Application Support/Code/User/mcp-servers/` |
| Windows | `%APPDATA%\Code\User\mcp-servers\`                      |

```bash
# Example (Linux/macOS):
mkdir -p ~/.vscode-server/data/User/mcp-servers
cp mcp/*.js ~/.vscode-server/data/User/mcp-servers/
```

### 4. Register MCP servers in your editor

Create or edit your editor's `mcp.json` (same directory as above). Use `mcp/mcp.json` as the template and fill in real values:

```jsonc
{
  "servers": {
    "jira": {
      "command": "node",
      "args": ["<path-to>/mcp-servers/jira-server.js"],
      "env": {
        "ATLASSIAN_URL": "https://your-org.atlassian.net",
        "ATLASSIAN_EMAIL": "you@company.com",
        "ATLASSIAN_API_TOKEN": "your-jira-token"
      }
    },
    "gitlab": {
      "command": "node",
      "args": ["<path-to>/mcp-servers/gitlab-server.js"],
      "env": {
        "GITLAB_URL": "https://gitlab.your-org.com",
        "GITLAB_API_TOKEN": "your-gitlab-token"
      }
    },
    "ui-components": {
      "command": "node",
      "args": ["<path-to>/mcp-servers/ui-components-server.js"],
      "env": {
        "UI_LIB_BASE_URL": "https://your-storybook.example.com"
      }
    }
  }
}
```

> **Cursor** users: add these entries in Cursor's MCP settings (Settings → MCP).

**Optional but recommended**: add [Context7 MCP](https://github.com/upstash/context7) for up-to-date library documentation lookups.

### 5. Verify it works

Restart your editor, open your project, and run a smoke test:

1. Open a **new chat** with the agent.
2. Type `BA: PROJ-123` (replace with a real Jira key).
3. The agent should fetch the issue via MCP and begin drafting a BizSpec.

If the agent can't reach Jira, check:
-   MCP server paths in `mcp.json` point to the actual `.js` files.
-   Environment variables (URL, email, token) are correct.
-   Node.js ≥ 18 is on your system PATH.

---

## Day-to-day usage

| Command | Mode | What it does | Output |
| --- | --- | --- | --- |
| `BA: <JIRA-ID>` | Business Analysis | Reads Jira, writes acceptance criteria + open questions | `.ai/tasks/<JIRA_ID>/01-bizspec.md` |
| `PLAN: <JIRA-ID>` | Dev Planner | Creates tech plan, splits into INVEST tasks with test mappings | `.ai/tasks/<JIRA_ID>/02-techplan.md` + `.ai/tasks/<JIRA_ID>/task-<n>/task.md` |
| `DO: <JIRA-ID> task<n>` | Dev Implementer | Implements one task, writes tests, documents how to verify | `.ai/tasks/<JIRA_ID>/task-<n>/output.md` + code |
| `GIT: <JIRA-ID>` | Git Ops | Assembles PR from outputs, previews title + description, creates MR on approval | MR + Jira comment |
| `REVIEW: <PR-ID>` | Code Review | Triages a PR against Jira ACs and test coverage | Review comments (preview only) |

> **Tip**: start a **new chat for each command/task**. Long chats degrade agent quality. Bring only the minimal context (Jira ID, relevant file paths).

