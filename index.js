#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ErrorCode,
    ListToolsRequestSchema,
    McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
    throw new Error('PERPLEXITY_API_KEY environment variable is required');
}

class PerplexitySearchServer {
    constructor() {
        this.server = new Server(
            {
                name: 'perplexity-search-mcp-v2',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupToolHandlers();

        // Error handling
        this.server.onerror = (error) => console.error('[MCP Error]', error);
        process.on('SIGINT', async () => {
            await this.server.close();
            process.exit(0);
        });
    }

    setupToolHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'search',
                    description: 'Search the web using Perplexity API',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The search query',
                            },
                            search_recency_filter: {
                                type: 'string',
                                description: 'Filter search results by recency (options: month, week, day, hour)',
                                enum: ['month', 'week', 'day', 'hour'],
                            },
                        },
                        required: ['query'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            if (request.params.name !== 'search') {
                throw new McpError(
                    ErrorCode.MethodNotFound,
                    `Unknown tool: ${request.params.name}`
                );
            }

            const { query, search_recency_filter } = request.params.arguments;

            if (!query || typeof query !== 'string') {
                throw new McpError(
                    ErrorCode.InvalidParams,
                    'Query parameter is required and must be a string'
                );
            }

            try {
                const response = await axios.post(
                    'https://api.perplexity.ai/chat/completions',
                    {
                        model: 'sonar',
                        messages: [
                            {
                                role: 'system',
                                content: 'You are a helpful assistant that searches the web.'
                            },
                            {
                                role: 'user',
                                content: query
                            }
                        ],
                        options: {
                            recency_filter: search_recency_filter || undefined
                        }
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${PERPLEXITY_API_KEY}`
                        }
                    }
                );

                const content = response.data.choices[0].message.content;
                const citations = response.data.choices[0].message.context?.citations || [];

                return {
                    content: [
                        {
                            type: 'text',
                            text: JSON.stringify({ content, citations }, null, 2),
                        },
                    ],
                };
            } catch (error) {
                console.error('Perplexity API error:', error.response?.data || error.message);

                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error searching with Perplexity: ${error.response?.data?.error?.message || error.message}`,
                        },
                    ],
                    isError: true,
                };
            }
        });
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Perplexity Search MCP server running on stdio');
    }
}

const server = new PerplexitySearchServer();
server.run().catch(console.error);
