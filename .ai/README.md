# 🤖 AI Agent Workflow

This repository defines a **role-based AI development system**.  
It enables AI agents (running in VS Code, Cursor, or similar) to act as **specialized collaborators**: Business Analyst, Developer (Planner & Implementer), Code Reviewer, and Git Ops.

The system is **file-driven**: each agent reads the relevant `.ai/workflows/*.md` guide, consumes input artifacts, and produces structured outputs under `.ai/tasks/{JIRA}/`.  
Git Ops then compiles these outputs into a ready-to-review Merge Request.

---

## 🗂️ Folder Structure

.ai/
├── standards/ # Team code standards (tech, core, crud, api-and-mocks, dev-playbook)
├──── tech.md
├──── core.md
├──── crud.md
├──── api-and-mocks.md
├──── dev-playbook.md
├── templates/ # Templates used to write artifacts
├──── ba.md
├──── dev-plan.md
├──── task.md
├──── output.md
├──── mr.md
├── tasks/ # Per-Jira artifacts (ephemeral, per branch)
├──── JIRA-1234/
├────── ba.md
├────── dev-plan.md
├──── dev/
├────── task-01/
├──────── task.md
├──────── output.md
├────── task-02/
└────── ...

## About models
AI is not magic. The spec is the most important aspect of AI usage. To achieve good coding results, the Ticket (jira/clickup/task/etc) MUST be very well specified. Also, In my last workflow iterations, I've been working to enhance project docs and check if the final results get better.


I tested:
- old OpenAI 4.x models: they did not act like agents. I needed to manually add files to context and it did not create steps. I did not test 5.x models yet.
- Gemini 3 Pro: ignored the workflow :) I haven't use since.
- Claude models: I've mainly tested Opus and Sonnet. I did not use Haiku that much, but it might work well for coding. As my objective is not to keep testing different models, I've been using only Claude's models.
- Grok Code Fast: I didn't use to plan. If the tasks are well planned, it's very good and fast to code.

Prioritize reasoning models for the business analysis, tech planning, and tasks creation.
- Claude Opus 4.6 and Opus 4.5
- Claude Sonnet 4.6

Coding:
- Claude Sonnet 4.6
- Claude Haiku 4.5
- Grok Code Fast 1

