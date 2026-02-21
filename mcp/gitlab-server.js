#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class GitLabMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'gitlab',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.baseUrl = process.env.GITLAB_URL || 'https://gitlab.com';
        this.apiToken = process.env.GITLAB_API_TOKEN;

        this.setupHandlers();
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'gitlab_get_project',
                        description:
                            'Get details of a specific GitLab project by ID or path',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description:
                                        'Project ID or path (e.g., "12345" or "group/project-name")',
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_list_projects',
                        description:
                            'List GitLab projects accessible to the user',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                visibility: {
                                    type: 'string',
                                    description:
                                        'Filter by visibility (private, internal, public)',
                                },
                                owned: {
                                    type: 'boolean',
                                    description: 'Only show owned projects',
                                    default: false,
                                },
                                starred: {
                                    type: 'boolean',
                                    description: 'Only show starred projects',
                                    default: false,
                                },
                                search: {
                                    type: 'string',
                                    description: 'Search projects by name',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                        },
                    },
                    {
                        name: 'gitlab_get_merge_requests',
                        description: 'Get merge requests for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                state: {
                                    type: 'string',
                                    description:
                                        'Filter by state (opened, closed, merged, all)',
                                    default: 'opened',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_get_merge_request',
                        description: 'Get details of a specific merge request',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                mergeRequestIid: {
                                    type: 'number',
                                    description: 'Merge request internal ID',
                                },
                            },
                            required: ['projectId', 'mergeRequestIid'],
                        },
                    },
                    {
                        name: 'gitlab_get_issues',
                        description: 'Get issues for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                state: {
                                    type: 'string',
                                    description:
                                        'Filter by state (opened, closed, all)',
                                    default: 'opened',
                                },
                                assignee: {
                                    type: 'string',
                                    description: 'Filter by assignee username',
                                },
                                labels: {
                                    type: 'string',
                                    description:
                                        'Filter by labels (comma-separated)',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_get_issue',
                        description: 'Get details of a specific issue',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                issueIid: {
                                    type: 'number',
                                    description: 'Issue internal ID',
                                },
                            },
                            required: ['projectId', 'issueIid'],
                        },
                    },
                    {
                        name: 'gitlab_get_pipelines',
                        description: 'Get CI/CD pipelines for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                status: {
                                    type: 'string',
                                    description:
                                        'Filter by status (running, pending, success, failed, canceled, skipped)',
                                },
                                ref: {
                                    type: 'string',
                                    description: 'Filter by branch or tag',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_get_branches',
                        description: 'Get branches for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                search: {
                                    type: 'string',
                                    description: 'Search branches by name',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_get_commits',
                        description: 'Get commits for a project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                refName: {
                                    type: 'string',
                                    description: 'Branch or tag name',
                                },
                                since: {
                                    type: 'string',
                                    description:
                                        'Only commits after or on this date (ISO 8601)',
                                },
                                until: {
                                    type: 'string',
                                    description:
                                        'Only commits before or on this date (ISO 8601)',
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                            required: ['projectId'],
                        },
                    },
                    {
                        name: 'gitlab_get_users',
                        description:
                            'Get GitLab users (for reviewer assignment)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                username: {
                                    type: 'string',
                                    description: 'Filter by username',
                                },
                                search: {
                                    type: 'string',
                                    description:
                                        'Search users by name or username',
                                },
                                active: {
                                    type: 'boolean',
                                    description: 'Filter by active users only',
                                    default: true,
                                },
                                perPage: {
                                    type: 'number',
                                    description:
                                        'Number of results per page (max 100)',
                                    default: 20,
                                },
                            },
                        },
                    },
                    {
                        name: 'gitlab_get_user',
                        description:
                            'Get a specific GitLab user by ID or username',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userId: {
                                    type: 'string',
                                    description: 'User ID or username',
                                },
                            },
                            required: ['userId'],
                        },
                    },
                    {
                        name: 'gitlab_create_merge_request',
                        description: 'Create a new merge request',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectId: {
                                    type: 'string',
                                    description: 'Project ID or path',
                                },
                                title: {
                                    type: 'string',
                                    description: 'Title of the merge request',
                                },
                                description: {
                                    type: 'string',
                                    description:
                                        'Description of the merge request',
                                },
                                sourceBranch: {
                                    type: 'string',
                                    description: 'Source branch name',
                                },
                                targetBranch: {
                                    type: 'string',
                                    description: 'Target branch name',
                                },
                                assigneeId: {
                                    type: 'number',
                                    description:
                                        'User ID to assign the merge request to',
                                },
                                reviewerIds: {
                                    type: 'array',
                                    items: {
                                        type: 'number',
                                    },
                                    description:
                                        'Array of user IDs to assign as reviewers',
                                },
                                removeSourceBranch: {
                                    type: 'boolean',
                                    description:
                                        'Remove source branch when merge request is accepted',
                                    default: false,
                                },
                                squash: {
                                    type: 'boolean',
                                    description:
                                        'Squash commits when merge request is accepted',
                                    default: false,
                                },
                            },
                            required: [
                                'projectId',
                                'title',
                                'sourceBranch',
                                'targetBranch',
                            ],
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params;

                try {
                    switch (name) {
                        case 'gitlab_get_project':
                            return await this.getProject(args.projectId);
                        case 'gitlab_list_projects':
                            return await this.listProjects(args);
                        case 'gitlab_get_merge_requests':
                            return await this.getMergeRequests(
                                args.projectId,
                                args
                            );
                        case 'gitlab_get_merge_request':
                            return await this.getMergeRequest(
                                args.projectId,
                                args.mergeRequestIid
                            );
                        case 'gitlab_get_issues':
                            return await this.getIssues(args.projectId, args);
                        case 'gitlab_get_issue':
                            return await this.getIssue(
                                args.projectId,
                                args.issueIid
                            );
                        case 'gitlab_get_pipelines':
                            return await this.getPipelines(
                                args.projectId,
                                args
                            );
                        case 'gitlab_get_branches':
                            return await this.getBranches(args.projectId, args);
                        case 'gitlab_get_commits':
                            return await this.getCommits(args.projectId, args);
                        case 'gitlab_get_users':
                            return await this.getUsers(args);
                        case 'gitlab_get_user':
                            return await this.getUser(args.userId);
                        case 'gitlab_create_merge_request':
                            return await this.createMergeRequest(
                                args.projectId,
                                args
                            );
                        default:
                            throw new Error(`Unknown tool: ${name}`);
                    }
                } catch (error) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${error.message}`,
                            },
                        ],
                    };
                }
            }
        );
    }

    async makeGitLabRequest(endpoint, options = {}) {
        if (!this.apiToken) {
            throw new Error(
                'GITLAB_API_TOKEN environment variable is required'
            );
        }

        const url = `${this.baseUrl}/api/v4/${endpoint}`;

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${this.apiToken}`,
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            let errorText;
            try {
                const errorData = await response.json();
                errorText = JSON.stringify(errorData, null, 2);
            } catch {
                errorText = await response.text();
            }
            throw new Error(
                `GitLab API error: ${response.status} ${response.statusText}. ${errorText}`
            );
        }

        return await response.json();
    }

    async getProject(projectId) {
        try {
            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(projectId)}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                id: data.id,
                                name: data.name,
                                path: data.path,
                                pathWithNamespace: data.path_with_namespace,
                                description:
                                    data.description || 'No description',
                                webUrl: data.web_url,
                                sshUrlToRepo: data.ssh_url_to_repo,
                                httpUrlToRepo: data.http_url_to_repo,
                                visibility: data.visibility,
                                defaultBranch: data.default_branch,
                                createdAt: data.created_at,
                                lastActivityAt: data.last_activity_at,
                                forksCount: data.forks_count,
                                starsCount: data.star_count,
                                issuesEnabled: data.issues_enabled,
                                mergeRequestsEnabled:
                                    data.merge_requests_enabled,
                                wikiEnabled: data.wiki_enabled,
                                namespace: {
                                    name: data.namespace?.name,
                                    path: data.namespace?.path,
                                    kind: data.namespace?.kind,
                                },
                                topics: data.topics || [],
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async listProjects(options = {}) {
        try {
            const params = new URLSearchParams();

            if (options.visibility)
                params.append('visibility', options.visibility);
            if (options.owned) params.append('owned', 'true');
            if (options.starred) params.append('starred', 'true');
            if (options.search) params.append('search', options.search);
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(`projects?${params}`);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                projects: data.map((project) => ({
                                    id: project.id,
                                    name: project.name,
                                    path: project.path,
                                    pathWithNamespace:
                                        project.path_with_namespace,
                                    description:
                                        project.description || 'No description',
                                    webUrl: project.web_url,
                                    visibility: project.visibility,
                                    defaultBranch: project.default_branch,
                                    lastActivityAt: project.last_activity_at,
                                    namespace: project.namespace?.name,
                                    topics: project.topics || [],
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to list projects: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getMergeRequests(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            params.append('state', options.state || 'opened');
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(
                    projectId
                )}/merge_requests?${params}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                mergeRequests: data.map((mr) => ({
                                    id: mr.id,
                                    iid: mr.iid,
                                    title: mr.title,
                                    description: mr.description,
                                    state: mr.state,
                                    createdAt: mr.created_at,
                                    updatedAt: mr.updated_at,
                                    webUrl: mr.web_url,
                                    sourceBranch: mr.source_branch,
                                    targetBranch: mr.target_branch,
                                    author: {
                                        name: mr.author?.name,
                                        username: mr.author?.username,
                                    },
                                    assignee: mr.assignee
                                        ? {
                                              name: mr.assignee.name,
                                              username: mr.assignee.username,
                                          }
                                        : null,
                                    labels: mr.labels || [],
                                    workInProgress: mr.work_in_progress,
                                    mergeStatus: mr.merge_status,
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch merge requests for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getMergeRequest(projectId, mergeRequestIid) {
        try {
            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(
                    projectId
                )}/merge_requests/${mergeRequestIid}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                id: data.id,
                                iid: data.iid,
                                title: data.title,
                                description: data.description,
                                state: data.state,
                                createdAt: data.created_at,
                                updatedAt: data.updated_at,
                                webUrl: data.web_url,
                                sourceBranch: data.source_branch,
                                targetBranch: data.target_branch,
                                author: {
                                    name: data.author?.name,
                                    username: data.author?.username,
                                    email: data.author?.email,
                                },
                                assignee: data.assignee
                                    ? {
                                          name: data.assignee.name,
                                          username: data.assignee.username,
                                          email: data.assignee.email,
                                      }
                                    : null,
                                labels: data.labels || [],
                                workInProgress: data.work_in_progress,
                                mergeStatus: data.merge_status,
                                userNotesCount: data.user_notes_count,
                                upvotes: data.upvotes,
                                downvotes: data.downvotes,
                                hasConflicts: data.has_conflicts,
                                sha: data.sha,
                                mergeCommitSha: data.merge_commit_sha,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch merge request ${mergeRequestIid} for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getIssues(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            params.append('state', options.state || 'opened');
            if (options.assignee)
                params.append('assignee_username', options.assignee);
            if (options.labels) params.append('labels', options.labels);
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(projectId)}/issues?${params}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                issues: data.map((issue) => ({
                                    id: issue.id,
                                    iid: issue.iid,
                                    title: issue.title,
                                    description: issue.description,
                                    state: issue.state,
                                    createdAt: issue.created_at,
                                    updatedAt: issue.updated_at,
                                    webUrl: issue.web_url,
                                    author: {
                                        name: issue.author?.name,
                                        username: issue.author?.username,
                                    },
                                    assignees:
                                        issue.assignees?.map((assignee) => ({
                                            name: assignee.name,
                                            username: assignee.username,
                                        })) || [],
                                    labels: issue.labels || [],
                                    milestone: issue.milestone?.title || null,
                                    userNotesCount: issue.user_notes_count,
                                    upvotes: issue.upvotes,
                                    downvotes: issue.downvotes,
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch issues for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getIssue(projectId, issueIid) {
        try {
            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(projectId)}/issues/${issueIid}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                id: data.id,
                                iid: data.iid,
                                title: data.title,
                                description: data.description,
                                state: data.state,
                                createdAt: data.created_at,
                                updatedAt: data.updated_at,
                                webUrl: data.web_url,
                                author: {
                                    name: data.author?.name,
                                    username: data.author?.username,
                                    email: data.author?.email,
                                },
                                assignees:
                                    data.assignees?.map((assignee) => ({
                                        name: assignee.name,
                                        username: assignee.username,
                                        email: assignee.email,
                                    })) || [],
                                labels: data.labels || [],
                                milestone: data.milestone
                                    ? {
                                          title: data.milestone.title,
                                          description:
                                              data.milestone.description,
                                          state: data.milestone.state,
                                          dueDate: data.milestone.due_date,
                                      }
                                    : null,
                                userNotesCount: data.user_notes_count,
                                upvotes: data.upvotes,
                                downvotes: data.downvotes,
                                dueDate: data.due_date,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch issue ${issueIid} for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getPipelines(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.status) params.append('status', options.status);
            if (options.ref) params.append('ref', options.ref);
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(projectId)}/pipelines?${params}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                pipelines: data.map((pipeline) => ({
                                    id: pipeline.id,
                                    sha: pipeline.sha,
                                    ref: pipeline.ref,
                                    status: pipeline.status,
                                    createdAt: pipeline.created_at,
                                    updatedAt: pipeline.updated_at,
                                    webUrl: pipeline.web_url,
                                    user: pipeline.user
                                        ? {
                                              name: pipeline.user.name,
                                              username: pipeline.user.username,
                                          }
                                        : null,
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch pipelines for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getBranches(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.search) params.append('search', options.search);
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(
                    projectId
                )}/repository/branches?${params}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                branches: data.map((branch) => ({
                                    name: branch.name,
                                    merged: branch.merged,
                                    protected: branch.protected,
                                    default: branch.default,
                                    canPush: branch.can_push,
                                    webUrl: branch.web_url,
                                    commit: {
                                        id: branch.commit?.id,
                                        shortId: branch.commit?.short_id,
                                        title: branch.commit?.title,
                                        authorName: branch.commit?.author_name,
                                        authorEmail:
                                            branch.commit?.author_email,
                                        authoredDate:
                                            branch.commit?.authored_date,
                                        committerName:
                                            branch.commit?.committer_name,
                                        committerEmail:
                                            branch.commit?.committer_email,
                                        committedDate:
                                            branch.commit?.committed_date,
                                    },
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch branches for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getCommits(projectId, options = {}) {
        try {
            const params = new URLSearchParams();
            if (options.refName) params.append('ref_name', options.refName);
            if (options.since) params.append('since', options.since);
            if (options.until) params.append('until', options.until);
            params.append('per_page', (options.perPage || 20).toString());

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(
                    projectId
                )}/repository/commits?${params}`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                commits: data.map((commit) => ({
                                    id: commit.id,
                                    shortId: commit.short_id,
                                    title: commit.title,
                                    message: commit.message,
                                    authorName: commit.author_name,
                                    authorEmail: commit.author_email,
                                    authoredDate: commit.authored_date,
                                    committerName: commit.committer_name,
                                    committerEmail: commit.committer_email,
                                    committedDate: commit.committed_date,
                                    webUrl: commit.web_url,
                                    parentIds: commit.parent_ids || [],
                                })),
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch commits for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getUsers(options = {}) {
        try {
            const params = new URLSearchParams();

            if (options.username) {
                params.append('username', options.username);
            }

            if (options.search) {
                params.append('search', options.search);
            }

            if (options.active !== undefined) {
                params.append('active', options.active);
            }

            if (options.perPage) {
                params.append('per_page', options.perPage);
            }

            const queryString = params.toString();
            const endpoint = `users${queryString ? `?${queryString}` : ''}`;

            const data = await this.makeGitLabRequest(endpoint);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            data.map((user) => ({
                                id: user.id,
                                username: user.username,
                                name: user.name,
                                email: user.email,
                                state: user.state,
                                avatarUrl: user.avatar_url,
                            })),
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error fetching users: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getUser(userId) {
        try {
            const endpoint = `users/${encodeURIComponent(userId)}`;
            const data = await this.makeGitLabRequest(endpoint);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                id: data.id,
                                username: data.username,
                                name: data.name,
                                email: data.email,
                                state: data.state,
                                avatarUrl: data.avatar_url,
                                bio: data.bio,
                                location: data.location,
                                skype: data.skype,
                                linkedin: data.linkedin,
                                twitter: data.twitter,
                                websiteUrl: data.website_url,
                                organization: data.organization,
                                createdAt: data.created_at,
                                lastSignInAt: data.last_sign_in_at,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error fetching user: ${error.message}`,
                    },
                ],
            };
        }
    }

    async createMergeRequest(projectId, options) {
        try {
            const payload = {
                title: options.title,
                source_branch: options.sourceBranch,
                target_branch: options.targetBranch,
            };

            if (options.description) {
                payload.description = options.description;
            }

            if (options.assigneeId) {
                payload.assignee_id = options.assigneeId;
            }

            if (options.reviewerIds && options.reviewerIds.length > 0) {
                payload.reviewer_ids = options.reviewerIds;
            }

            if (options.removeSourceBranch !== undefined) {
                payload.remove_source_branch = options.removeSourceBranch;
            }

            if (options.squash !== undefined) {
                payload.squash = options.squash;
            }

            const data = await this.makeGitLabRequest(
                `projects/${encodeURIComponent(projectId)}/merge_requests`,
                {
                    method: 'POST',
                    body: JSON.stringify(payload),
                }
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                id: data.id,
                                iid: data.iid,
                                title: data.title,
                                description: data.description,
                                state: data.state,
                                createdAt: data.created_at,
                                updatedAt: data.updated_at,
                                webUrl: data.web_url,
                                sourceBranch: data.source_branch,
                                targetBranch: data.target_branch,
                                author: {
                                    name: data.author?.name,
                                    username: data.author?.username,
                                    email: data.author?.email,
                                },
                                assignee: data.assignee
                                    ? {
                                          name: data.assignee.name,
                                          username: data.assignee.username,
                                          email: data.assignee.email,
                                      }
                                    : null,
                                labels: data.labels || [],
                                workInProgress: data.work_in_progress,
                                mergeStatus: data.merge_status,
                                sha: data.sha,
                            },
                            null,
                            2
                        ),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to create merge request for project ${projectId}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('GitLab MCP server running on stdio');
    }
}

const server = new GitLabMCPServer();
server.run().catch(console.error);
