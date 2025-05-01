import { readItems } from "@directus/sdk";
import type { Directus } from "../directus.js";
import type { Config } from "../config.js";
import { extractMustacheVariables } from "../utils/prompt-helpers.js";

// Interface for prompt data from Directus
export interface PromptItem {
  id: string;
  title: string;
  description: string;
  messages: Array<{
    role: "user" | "assistant";
    text: string;
  }>;
  status?: string;
}

// Interface for MCP prompts
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
export async function fetchPrompts(directus: Directus, config: Config): Promise<Record<string, McpPrompt>> {
  // If no prompts collection is configured, return an empty object
  if (!config.PROMPTS_COLLECTION) {
    console.error("No prompts collection configured, skipping prompt fetching");
    return {};
  }

  try {
    // Type assertion to any[] for the Directus collection
    type DirectusCollection = any;

    // Fetch prompts from the configured collection
    const response = await directus.request(
      // @ts-ignore - Need to ignore this as we're using a dynamic collection name
      readItems(config.PROMPTS_COLLECTION, {
        filter: {
          status: {
            _eq: "published"
          }
        }
      })
    ) as DirectusCollection[];

    const prompts: Record<string, McpPrompt> = {};

    // Process each prompt
    for (const item of response) {
      // Skip prompts without messages
      if (!item.messages || item.messages.length === 0) continue;

      // Extract variables from all messages
      const variables = new Set<string>();
      for (const message of item.messages) {
        extractMustacheVariables(message.text).forEach(variable => variables.add(variable));
      }

      // Create the MCP prompt definition
      prompts[item.title] = {
        name: item.title,
        description: item.description || `Prompt: ${item.title}`,
        arguments: Array.from(variables).map(name => ({
          name,
          description: `Value for ${name}`,
          required: false
        }))
      };
    }

    return prompts;
  } catch (error) {
    console.error("Error fetching prompts:", error);
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
  promptName: string
): Promise<PromptItem | undefined> {
  if (!config.PROMPTS_COLLECTION) return undefined;

  try {
    // Type assertion to any[] for the Directus collection
    type DirectusCollection = any;

    const response = await directus.request(
      // @ts-ignore - Need to ignore this as we're using a dynamic collection name
      readItems(config.PROMPTS_COLLECTION, {
        filter: {
          title: {
            _eq: promptName
          },
          status: {
            _eq: "published"
          }
        },
        limit: 1
      })
    ) as DirectusCollection[];

    if (!response || response.length === 0) return undefined;

    // Map Directus item to our expected format
    const item = response[0];
    return {
      id: item.id,
      title: item.title,
      description: item.description,
      messages: item.messages
    };
  } catch (error) {
    console.error(`Error fetching prompt ${promptName}:`, error);
    return undefined;
  }
}
