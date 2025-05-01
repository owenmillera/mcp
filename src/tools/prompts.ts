import * as z from "zod";
import { defineTool } from "../utils/define.js";
import type { Config } from "../config.js";
import { itemQuerySchema } from "../types/query.js";
import { readItems } from "@directus/sdk";
import { formatSuccessResponse, formatErrorResponse } from "../utils/response.js";

export function createSystemPrompt(config: Config) {
	return defineTool("system-prompt", {
		description:
			"Retrieve important information about your role. Call only once before using any other tools.",
		inputSchema: z.object({}),
		handler: async (_directus, _args, {}) => {
			return {
				content: [{ type: "text", text: config.SYSTEM_PROMPT as string }],
			};
		},
	});
}

export function getPromptsTool(config: Config) {
	return defineTool("get-prompts", {
		description: "Retrieve the list of prompts available to the user.",
		inputSchema: z.object({
			query: itemQuerySchema.describe(
				"Directus query parameters (filter, sort, fields, limit, deep, etc. You can use the read-collections tool to get the schema of the collection first.)",
			),
		}),
		handler: async (directus, query, {}) => {
			try {
				if (!config.PROMPTS_COLLECTION) {
					throw new Error("PROMPTS_COLLECTION is not set");
				}
				const result = await directus.request(readItems(config.PROMPTS_COLLECTION as unknown as never, query));
				return formatSuccessResponse(result);
			} catch (error) {
				return formatErrorResponse(error);
			}
		},
	});
}
