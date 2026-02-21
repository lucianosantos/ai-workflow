#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

class JiraMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'jira',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.baseUrl =
            process.env.ATLASSIAN_URL || '';
        this.email = process.env.ATLASSIAN_EMAIL;
        this.apiToken = process.env.ATLASSIAN_API_TOKEN;

        this.setupHandlers();
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'jira_get_issue',
                        description:
                            'Get details of a specific Jira issue by key (e.g., PROJ-123)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                issueKey: {
                                    type: 'string',
                                    description:
                                        'The Jira issue key (e.g., PROJ-123)',
                                },
                            },
                            required: ['issueKey'],
                        },
                    },
                    {
                        name: 'jira_search_issues',
                        description: 'Search for Jira issues using JQL',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                jql: {
                                    type: 'string',
                                    description:
                                        'JQL query string (e.g., "project = PROJ AND status = Open")',
                                },
                                maxResults: {
                                    type: 'number',
                                    description:
                                        'Maximum number of results to return (default: 50)',
                                    default: 50,
                                },
                            },
                            required: ['jql'],
                        },
                    },
                    {
                        name: 'jira_list_projects',
                        description: 'List all accessible Jira projects',
                        inputSchema: {
                            type: 'object',
                            properties: {},
                        },
                    },
                    {
                        name: 'jira_get_project_info',
                        description: 'Get information about a Jira project',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                projectKey: {
                                    type: 'string',
                                    description: 'The project key (e.g., PROJ)',
                                },
                            },
                            required: ['projectKey'],
                        },
                    },
                    {
                        name: 'jira_get_user_issues',
                        description: 'Get issues assigned to a specific user',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                userEmail: {
                                    type: 'string',
                                    description:
                                        'User email address (leave empty for current user)',
                                },
                                status: {
                                    type: 'string',
                                    description:
                                        'Filter by status (e.g., "Open", "In Progress", "Done")',
                                },
                            },
                        },
                    },
                    {
                        name: 'jira_add_comment',
                        description:
                            'Add a comment to a Jira issue. Supports markdown-style links [text](url)',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                issueKey: {
                                    type: 'string',
                                    description:
                                        'The Jira issue key (e.g., PROJ-123)',
                                },
                                body: {
                                    type: 'string',
                                    description:
                                        'The comment body text. Supports markdown-style links: [text](url)',
                                },
                            },
                            required: ['issueKey', 'body'],
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
                        case 'jira_get_issue':
                            return await this.getIssue(args.issueKey);
                        case 'jira_search_issues':
                            return await this.searchIssues(
                                args.jql,
                                args.maxResults || 50
                            );
                        case 'jira_list_projects':
                            return await this.listProjects();
                        case 'jira_get_project_info':
                            return await this.getProjectInfo(args.projectKey);
                        case 'jira_get_user_issues':
                            return await this.getUserIssues(
                                args.userEmail,
                                args.status
                            );
                        case 'jira_add_comment':
                            return await this.addComment(
                                args.issueKey,
                                args.body
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

    async makeJiraRequest(endpoint, options = {}) {
        if (!this.email || !this.apiToken) {
            throw new Error(
                'ATLASSIAN_EMAIL and ATLASSIAN_API_TOKEN environment variables are required'
            );
        }

        const url = `${this.baseUrl}/rest/api/3/${endpoint}`;
        const auth = Buffer.from(`${this.email}:${this.apiToken}`).toString(
            'base64'
        );

        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Basic ${auth}`,
                Accept: 'application/json',
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
                `Jira API error: ${response.status} ${response.statusText}. ${errorText}`
            );
        }

        return await response.json();
    }

    async getIssue(issueKey) {
        try {
            const data = await this.makeJiraRequest(
                `issue/${issueKey}?expand=renderedFields`
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                key: data.key,
                                summary: data.fields.summary,
                                description:
                                    data.renderedFields?.description ||
                                    data.fields.description ||
                                    'No description',
                                status: data.fields.status.name,
                                statusCategory:
                                    data.fields.status.statusCategory.name,
                                assignee: data.fields.assignee
                                    ? {
                                          displayName:
                                              data.fields.assignee.displayName,
                                          emailAddress:
                                              data.fields.assignee.emailAddress,
                                      }
                                    : null,
                                reporter: data.fields.reporter
                                    ? {
                                          displayName:
                                              data.fields.reporter.displayName,
                                          emailAddress:
                                              data.fields.reporter.emailAddress,
                                      }
                                    : null,
                                priority: data.fields.priority?.name || 'None',
                                created: data.fields.created,
                                updated: data.fields.updated,
                                project: {
                                    key: data.fields.project.key,
                                    name: data.fields.project.name,
                                },
                                issueType: data.fields.issuetype.name,
                                url: `${this.baseUrl}/browse/${data.key}`,
                                labels: data.fields.labels || [],
                                components:
                                    data.fields.components?.map(
                                        (c) => c.name
                                    ) || [],
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
                        text: `Failed to fetch issue ${issueKey}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async searchIssues(jql, maxResults) {
        try {
            const data = await this.makeJiraRequest('search', {
                method: 'POST',
                body: JSON.stringify({
                    jql,
                    maxResults,
                    fields: [
                        'summary',
                        'status',
                        'assignee',
                        'priority',
                        'created',
                        'updated',
                        'project',
                        'issuetype',
                    ],
                }),
            });

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.total,
                                maxResults: data.maxResults,
                                startAt: data.startAt,
                                query: jql,
                                issues: data.issues.map((issue) => ({
                                    key: issue.key,
                                    summary: issue.fields.summary,
                                    status: issue.fields.status.name,
                                    assignee:
                                        issue.fields.assignee?.displayName ||
                                        'Unassigned',
                                    priority:
                                        issue.fields.priority?.name || 'None',
                                    project: issue.fields.project.name,
                                    issueType: issue.fields.issuetype.name,
                                    created: issue.fields.created,
                                    updated: issue.fields.updated,
                                    url: `${this.baseUrl}/browse/${issue.key}`,
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
                        text: `Failed to search issues: ${error.message}`,
                    },
                ],
            };
        }
    }

    async listProjects() {
        try {
            const data = await this.makeJiraRequest('project');

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                total: data.length,
                                projects: data.map((project) => ({
                                    key: project.key,
                                    name: project.name,
                                    description:
                                        project.description || 'No description',
                                    projectTypeKey: project.projectTypeKey,
                                    lead: project.lead
                                        ? {
                                              displayName:
                                                  project.lead.displayName,
                                              emailAddress:
                                                  project.lead.emailAddress,
                                          }
                                        : null,
                                    url: `${this.baseUrl}/projects/${project.key}`,
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

    async getProjectInfo(projectKey) {
        try {
            const data = await this.makeJiraRequest(`project/${projectKey}`);

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                key: data.key,
                                name: data.name,
                                description:
                                    data.description || 'No description',
                                lead: data.lead
                                    ? {
                                          displayName: data.lead.displayName,
                                          emailAddress: data.lead.emailAddress,
                                      }
                                    : null,
                                projectTypeKey: data.projectTypeKey,
                                url: data.self,
                                avatarUrls: data.avatarUrls,
                                issueTypes:
                                    data.issueTypes?.map((it) => ({
                                        name: it.name,
                                        description: it.description,
                                        iconUrl: it.iconUrl,
                                    })) || [],
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
                        text: `Failed to fetch project ${projectKey}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async getUserIssues(userEmail, status) {
        try {
            let jql = `assignee = "${userEmail || this.email}"`;

            if (status) {
                jql += ` AND status = "${status}"`;
            }

            jql += ' ORDER BY updated DESC';

            return await this.searchIssues(jql, 50);
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Failed to fetch user issues: ${error.message}`,
                    },
                ],
            };
        }
    }

    async addComment(issueKey, body) {
        try {
            // Parse the body to look for markdown-style links [text](url)
            const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
            let lastIndex = 0;
            let match;

            const paragraphContent = [];

            while ((match = linkRegex.exec(body)) !== null) {
                // Add text before the link
                if (match.index > lastIndex) {
                    const textBefore = body.substring(lastIndex, match.index);
                    if (textBefore) {
                        paragraphContent.push({
                            type: 'text',
                            text: textBefore,
                        });
                    }
                }

                // Add the link
                paragraphContent.push({
                    type: 'text',
                    text: match[1], // link text
                    marks: [
                        {
                            type: 'link',
                            attrs: {
                                href: match[2], // link URL
                            },
                        },
                    ],
                });

                lastIndex = match.index + match[0].length;
            }

            // Add remaining text after the last link
            if (lastIndex < body.length) {
                const textAfter = body.substring(lastIndex);
                if (textAfter) {
                    paragraphContent.push({
                        type: 'text',
                        text: textAfter,
                    });
                }
            }

            // If no links were found, just add the text as is
            if (paragraphContent.length === 0) {
                paragraphContent.push({
                    type: 'text',
                    text: body,
                });
            }

            // The body parameter should be the ADF document structure directly
            const requestBody = {
                body: {
                    version: 1,
                    type: 'doc',
                    content: [
                        {
                            type: 'paragraph',
                            content: paragraphContent,
                        },
                    ],
                },
            };

            console.log(
                'Jira comment payload:',
                JSON.stringify(requestBody, null, 2)
            );

            const data = await this.makeJiraRequest(
                `issue/${issueKey}/comment`,
                {
                    method: 'POST',
                    body: JSON.stringify(requestBody),
                }
            );

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(
                            {
                                success: true,
                                commentId: data.id,
                                issueKey: issueKey,
                                body: body,
                                created: data.created,
                                author: data.author
                                    ? {
                                          displayName: data.author.displayName,
                                          emailAddress:
                                              data.author.emailAddress,
                                      }
                                    : null,
                                message: `Comment successfully added to ${issueKey}`,
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
                        text: `Failed to add comment to ${issueKey}: ${error.message}`,
                    },
                ],
            };
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Jira MCP server running on stdio');
    }
}

const server = new JiraMCPServer();
server.run().catch(console.error);
