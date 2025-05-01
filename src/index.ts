#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
	type CallToolRequest,
	CallToolRequestSchema,
	ListToolsRequestSchema,
	ListPromptsRequestSchema,
	GetPromptRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { createConfig } from "./config.js";
import { createDirectus, authenticateDirectus } from "./directus.js";
import { getTools } from "./tools/index.js";
import { toMpcTools } from "./utils/to-mpc-tools.js";
import { fetchSchema } from "./utils/fetch-schema.js";
import { fetchPrompts } from "./prompts/index.js";
import { getAvailablePrompts, handleGetPrompt } from "./prompts/handlers.js";

async function main() {
	const config = createConfig();
	const directus = createDirectus(config);
	await authenticateDirectus(directus, config);
	const schema = await fetchSchema(directus);
	const prompts = await fetchPrompts(directus, config);
	const availableTools = getTools(config);

	const server = new Server(
		{
			name: "Directus MCP Server",
			version: "0.0.1",
		},
		{
			capabilities: {
				tools: {},
				resources: {},
				prompts: {},
			},
		},
	);

	// Manage prompts
	server.setRequestHandler(ListPromptsRequestSchema, async () => {
		return {
			prompts: getAvailablePrompts(prompts),
		};
	});

	// Get specific prompt
	server.setRequestHandler(GetPromptRequestSchema, async (request) => {
		const promptName = request.params.name;
		const args = request.params.arguments || {};

		return await handleGetPrompt(
			directus,
			config,
			promptName,
			args
		);
	});

	// Manage tool requests
	server.setRequestHandler(
		CallToolRequestSchema,
		async (request: CallToolRequest) => {
			try {
				// Find the tool definition among ALL tools
				const tool = availableTools.find((definition) => {
					return definition.name === request.params.name;
				});

				if (!tool) {
					throw new Error(`Unknown tool: ${request.params.name}`);
				}

				// Proceed with execution if permission check passes
				const { inputSchema, handler } = tool;
				const args = inputSchema.parse(request.params.arguments);
				return await handler(directus, args, { schema, baseUrl: config.DIRECTUS_URL });
			} catch (error) {
				console.error("Error executing tool:", error);
				const errorMessage =
					error instanceof Error ? error.message : JSON.stringify(error);

				return {
					content: [
						{
							type: "text",
							text: errorMessage,
						},
					],
					isError: true,
				};
			}
		},
	);

	// Return the pre-filtered list for listing purposes
	server.setRequestHandler(ListToolsRequestSchema, async () => {
		return { tools: toMpcTools(availableTools) };
	});

	const transport = new StdioServerTransport();

	await server.connect(transport);
}

main().catch((error) => {
	console.error("Fatal error in main():", error);
	process.exit(1);
});
