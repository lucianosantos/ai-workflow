#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
    ListResourcesRequestSchema,
    ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { JSDOM } from 'jsdom';

class UIComponentsMCPServer {
    constructor() {
        this.server = new Server(
            {
                name: 'ui-components',
                version: '0.1.0',
            },
            {
                capabilities: {
                    tools: {},
                    resources: {},
                },
            }
        );

        this.baseUrl =
            process.env.UI_LIB_BASE_URL || '';
        this.componentCache = new Map();

        this.setupHandlers();
    }

    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: [
                    {
                        name: 'ui_get_component',
                        description:
                            'Get information about a specific UI component',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description:
                                        'The name of the component to retrieve',
                                },
                            },
                            required: ['componentName'],
                        },
                    },
                    {
                        name: 'ui_search_components',
                        description:
                            'Search for components by name or description',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                query: {
                                    type: 'string',
                                    description: 'Search query for components',
                                },
                            },
                            required: ['query'],
                        },
                    },
                    {
                        name: 'ui_get_component_examples',
                        description: 'Get usage examples for a component',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                componentName: {
                                    type: 'string',
                                    description: 'The name of the component',
                                },
                            },
                            required: ['componentName'],
                        },
                    },
                    {
                        name: 'ui_get_design_tokens',
                        description:
                            'Get design tokens (colors, spacing, typography) from the UI library',
                        inputSchema: {
                            type: 'object',
                            properties: {
                                category: {
                                    type: 'string',
                                    description:
                                        'Token category (colors, spacing, typography, etc.)',
                                    enum: [
                                        'colors',
                                        'spacing',
                                        'typography',
                                        'all',
                                    ],
                                },
                            },
                            required: ['category'],
                        },
                    },
                ],
            };
        });

        this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
            return {
                resources: [
                    {
                        uri: 'ui-lib://components',
                        name: 'Component Library',
                        description:
                            'Complete list of available UI components',
                        mimeType: 'application/json',
                    },
                    {
                        uri: 'ui-lib://design-tokens',
                        name: 'Design Tokens',
                        description:
                            'Design system tokens (colors, spacing, typography)',
                        mimeType: 'application/json',
                    },
                ],
            };
        });

        this.server.setRequestHandler(
            ReadResourceRequestSchema,
            async (request) => {
                const uri = request.params.uri;

                if (uri === 'ui-lib://components') {
                    const components = await this.getAllComponents();
                    return {
                        contents: [
                            {
                                uri: uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(components, null, 2),
                            },
                        ],
                    };
                }

                if (uri === 'ui-lib://design-tokens') {
                    const tokens = await this.getDesignTokens('all');
                    return {
                        contents: [
                            {
                                uri: uri,
                                mimeType: 'application/json',
                                text: JSON.stringify(tokens, null, 2),
                            },
                        ],
                    };
                }

                throw new Error(`Unknown resource: ${uri}`);
            }
        );

        this.server.setRequestHandler(
            CallToolRequestSchema,
            async (request) => {
                const { name, arguments: args } = request.params;

                try {
                    switch (name) {
                        case 'ui_get_component':
                            return await this.getComponent(args.componentName);
                        case 'ui_search_components':
                            return await this.searchComponents(args.query);
                        case 'ui_get_component_examples':
                            return await this.getComponentExamples(
                                args.componentName
                            );
                        case 'ui_get_design_tokens':
                            return await this.getDesignTokens(args.category);
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

    async fetchUILibraryPage(path = '') {
        const url = `${this.baseUrl}${path}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const html = await response.text();
            return new JSDOM(html).window.document;
        } catch (error) {
            throw new Error(`Failed to fetch UI library: ${error.message}`);
        }
    }

    async getAllComponents() {
        try {
            // Fetch Storybook index.json for component data
            const response = await fetch(`${this.baseUrl}/index.json`);
            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`
                );
            }

            const data = await response.json();
            const components = new Set();

            // Extract unique components from Storybook entries
            Object.values(data.entries || {}).forEach((entry) => {
                if (entry.type === 'story' && entry.title) {
                    // Extract component name from title
                    const titleParts = entry.title.split('/');
                    if (titleParts.length >= 2) {
                        const componentName = titleParts[titleParts.length - 1];
                        const category = titleParts.slice(0, -1).join('/');

                        components.add({
                            name: componentName,
                            title: entry.title,
                            category: category,
                            storyName: entry.name,
                            componentPath: entry.componentPath,
                            url: `${this.baseUrl}/?path=/docs/${
                                entry.id.split('--')[0]
                            }--docs`,
                            storyUrl: `${this.baseUrl}/?path=/story/${entry.id}`,
                        });
                    }
                }
            });

            // Convert Set to Array and group by component name
            const componentMap = new Map();
            Array.from(components).forEach((comp) => {
                if (!componentMap.has(comp.name)) {
                    componentMap.set(comp.name, {
                        name: comp.name,
                        title: comp.title,
                        category: comp.category,
                        componentPath: comp.componentPath,
                        url: comp.url,
                        stories: [],
                    });
                }
                componentMap.get(comp.name).stories.push({
                    name: comp.storyName,
                    url: comp.storyUrl,
                });
            });

            return Array.from(componentMap.values());
        } catch (error) {
            console.error('Error fetching components:', error);
            return [];
        }
    }
    extractComponentDescription(element) {
        // Try to find description near the component link
        const parent = element.closest('.component-item, .card, .section');
        const description = parent
            ?.querySelector('.description, .summary, p')
            ?.textContent?.trim();
        return description || 'No description available';
    }

    async getComponent(componentName) {
        try {
            // Get all components first to find the one we want
            const allComponents = await this.getAllComponents();
            const component = allComponents.find(
                (c) => c.name.toLowerCase() === componentName.toLowerCase()
            );

            if (!component) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Component '${componentName}' not found in the UI library.`,
                        },
                    ],
                };
            }

            // Try to fetch additional component details from the docs page
            let additionalInfo = {};
            try {
                const docsResponse = await fetch(component.url);
                if (docsResponse.ok) {
                    const docsHtml = await docsResponse.text();
                    const dom = new JSDOM(docsHtml);
                    const doc = dom.window.document;

                    // Extract any available documentation
                    const description =
                        doc
                            .querySelector('.sbdocs-content p')
                            ?.textContent?.trim() || '';
                    const codeBlocks = doc.querySelectorAll('pre code');
                    const examples = Array.from(codeBlocks).map(
                        (block, index) => ({
                            title: `Example ${index + 1}`,
                            code: block.textContent?.trim(),
                            language: this.detectCodeLanguage(block),
                        })
                    );

                    additionalInfo = { description, examples };
                }
            } catch (err) {
                console.error('Error fetching component docs:', err);
            }

            const componentInfo = {
                name: component.name,
                title: component.title,
                category: component.category,
                description:
                    additionalInfo.description ||
                    `${component.name} component from the UI library`,
                componentPath: component.componentPath,
                url: component.url,
                stories: component.stories,
                examples: additionalInfo.examples || [],
                storybook: {
                    baseUrl: this.baseUrl,
                    docsUrl: component.url,
                    storiesCount: component.stories.length,
                },
            };

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(componentInfo, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error retrieving component '${componentName}': ${error.message}`,
                    },
                ],
            };
        }
    }
    extractComponentInfo(doc, selector) {
        const element = doc.querySelector(
            `.${selector}, #${selector}, [data-${selector}]`
        );
        return element?.textContent?.trim() || 'Not available';
    }

    extractComponentProps(doc) {
        const propsTable = doc.querySelector(
            'table.props, .api-table, [data-props]'
        );
        if (!propsTable) return [];

        const rows = propsTable.querySelectorAll('tbody tr');
        const props = [];

        rows.forEach((row) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 3) {
                props.push({
                    name: cells[0]?.textContent?.trim(),
                    type: cells[1]?.textContent?.trim(),
                    description: cells[2]?.textContent?.trim(),
                    required: cells[3]?.textContent?.trim() === 'true',
                });
            }
        });

        return props;
    }

    extractComponentExamples(doc) {
        const examples = [];
        const codeBlocks = doc.querySelectorAll(
            'pre code, .example-code, .code-example'
        );

        codeBlocks.forEach((block, index) => {
            examples.push({
                title: `Example ${index + 1}`,
                code: block.textContent?.trim(),
                language: this.detectCodeLanguage(block),
            });
        });

        return examples;
    }

    extractApiReference(doc) {
        const apiSection = doc.querySelector(
            '.api-reference, .component-api, [data-api]'
        );
        return apiSection?.textContent?.trim() || 'No API reference available';
    }

    detectCodeLanguage(codeElement) {
        const className = codeElement.className;
        if (className.includes('vue')) return 'vue';
        if (className.includes('javascript') || className.includes('js'))
            return 'javascript';
        if (className.includes('typescript') || className.includes('ts'))
            return 'typescript';
        if (className.includes('html')) return 'html';
        return 'text';
    }

    async searchComponents(query) {
        const allComponents = await this.getAllComponents();
        const filteredComponents = allComponents.filter(
            (component) =>
                component.name.toLowerCase().includes(query.toLowerCase()) ||
                component.description
                    .toLowerCase()
                    .includes(query.toLowerCase())
        );

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            query,
                            totalResults: filteredComponents.length,
                            components: filteredComponents,
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }

    async getComponentExamples(componentName) {
        const component = await this.getComponent(componentName);
        const componentData = JSON.parse(component.content[0].text);

        return {
            content: [
                {
                    type: 'text',
                    text: JSON.stringify(
                        {
                            component: componentName,
                            examples: componentData.examples || [],
                        },
                        null,
                        2
                    ),
                },
            ],
        };
    }

    async getDesignTokens(category) {
        try {
            const doc = await this.fetchUILibraryPage('/design-tokens');

            let tokens = {};

            if (category === 'all' || category === 'colors') {
                tokens.colors = this.extractColorTokens(doc);
            }

            if (category === 'all' || category === 'spacing') {
                tokens.spacing = this.extractSpacingTokens(doc);
            }

            if (category === 'all' || category === 'typography') {
                tokens.typography = this.extractTypographyTokens(doc);
            }

            return {
                content: [
                    {
                        type: 'text',
                        text: JSON.stringify(tokens, null, 2),
                    },
                ],
            };
        } catch (error) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `Error retrieving design tokens: ${error.message}`,
                    },
                ],
            };
        }
    }

    extractColorTokens(doc) {
        const colorSection = doc.querySelector(
            '.colors, [data-colors], #colors'
        );
        if (!colorSection) return {};

        const colors = {};
        const colorItems = colorSection.querySelectorAll(
            '.color-item, .swatch, [data-color]'
        );

        colorItems.forEach((item) => {
            const name = item
                .querySelector('.color-name, .name')
                ?.textContent?.trim();
            const value =
                item
                    .querySelector('.color-value, .value')
                    ?.textContent?.trim() ||
                item.style.backgroundColor ||
                item.getAttribute('data-color');

            if (name && value) {
                colors[name] = value;
            }
        });

        return colors;
    }

    extractSpacingTokens(doc) {
        const spacingSection = doc.querySelector(
            '.spacing, [data-spacing], #spacing'
        );
        if (!spacingSection) return {};

        const spacing = {};
        const spacingItems = spacingSection.querySelectorAll(
            '.spacing-item, [data-spacing-value]'
        );

        spacingItems.forEach((item) => {
            const name = item
                .querySelector('.spacing-name, .name')
                ?.textContent?.trim();
            const value = item
                .querySelector('.spacing-value, .value')
                ?.textContent?.trim();

            if (name && value) {
                spacing[name] = value;
            }
        });

        return spacing;
    }

    extractTypographyTokens(doc) {
        const typographySection = doc.querySelector(
            '.typography, [data-typography], #typography'
        );
        if (!typographySection) return {};

        const typography = {};
        const typographyItems = typographySection.querySelectorAll(
            '.typography-item, [data-typography]'
        );

        typographyItems.forEach((item) => {
            const name = item
                .querySelector('.typography-name, .name')
                ?.textContent?.trim();
            const fontSize =
                item.style.fontSize ||
                item.querySelector('.font-size')?.textContent?.trim();
            const fontWeight =
                item.style.fontWeight ||
                item.querySelector('.font-weight')?.textContent?.trim();

            if (name) {
                typography[name] = {
                    fontSize,
                    fontWeight,
                };
            }
        });

        return typography;
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('UI Components MCP server running on stdio');
    }
}

const server = new UIComponentsMCPServer();
server.run().catch(console.error);
