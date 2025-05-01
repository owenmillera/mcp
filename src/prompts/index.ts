import type { Config } from '../config.js';
import type { Directus } from '../directus.js';
import type { Schema } from '../types/schema.js';
import { readItems } from '@directus/sdk';
import { extractMustacheVariables } from '../utils/prompt-helpers.js';

export interface PromptItem {
	id: string;
	name: string;
	description: string;
	messages: Array<{
		role: 'user' | 'assistant';
		text: string;
	}>;
}

export interface McpPrompt {
	name: string;
	description: string;
	arguments: Array<{
		name: string;
		description: string;
		required: boolean;
	}>;
}

/**
 * Fetches prompts from the Directus collection specified in the config
 * @param directus - The Directus client
 * @param config - The application config
 * @returns A map of prompt name to MCP prompt definition
 */
export async function fetchPrompts(
	directus: Directus,
	config: Config,
	schema: Schema,
): Promise<Record<string, McpPrompt>> {
	// If no prompts collection is configured, return an empty object
	if (!config.PROMPTS_COLLECTION) {
		console.error('No prompts collection configured, skipping prompt fetching');
		return {};
	}

	// If the prompts collection isn't in the schema, then throw an error because there's a permissions issue or it doesn't exist
	if (!schema[config.PROMPTS_COLLECTION]) {
		throw new Error(
			'Prompts collection not found in the schema. Use the read-collections tool first. If you have already used the read-collections tool, then check the permissions of the user you are using to fetch prompts.',
		);
	}

	try {
		type DirectusCollection = any;

		const response = (await directus.request(
			// @ts-expect-error - We're using a dynamic collection name
			readItems(config.PROMPTS_COLLECTION),
		)) as DirectusCollection[];

		const prompts: Record<string, McpPrompt> = {};

		for (const item of response) {
			if (!item.messages || item.messages.length === 0) continue;

			const variables = new Set<string>();

			for (const message of item.messages) {
				for (const variable of extractMustacheVariables(message.text)) variables.add(variable)
				;
			}

			prompts[item.name] = {
				name: item.name,
				description: item.description || `Prompt: ${item.name}`,
				arguments: [...variables].map((name) => ({
					name,
					description: `Value for ${name}`,
					required: false,
				})),
			};
		}

		return prompts;
	}
	catch (error) {
		console.error('Error fetching prompts:', error);
		return {};
	}
}

/**
 * Fetches a specific prompt by name from Directus
 * @param directus - The Directus client
 * @param config - The application config
 * @param promptName - The name of the prompt to fetch
 * @returns The prompt item if found, undefined otherwise
 */
export async function fetchPromptByName(
	directus: Directus,
	config: Config,
	promptName: string,
): Promise<PromptItem | undefined> {
	if (!config.PROMPTS_COLLECTION) return undefined;

	try {
		// Type assertion to any[] for the Directus collection
		type DirectusCollection = any;

		const response = (await directus.request(
			// @ts-expect-error - We're using a dynamic collection name
			readItems(config.PROMPTS_COLLECTION, {
				filter: {
					title: {
						_eq: promptName,
					},
					status: {
						_eq: 'published',
					},
				},
				limit: 1,
			}),
		)) as DirectusCollection[];

		if (!response || response.length === 0) return undefined;

		// Map Directus item to our expected format
		const item = response[0];
		return {
			id: item.id,
			name: item.name,
			description: item.description,
			messages: item.messages,
		};
	}
	catch (error) {
		console.error(`Error fetching prompt ${promptName}:`, error);
		return undefined;
	}
}
