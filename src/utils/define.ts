import type { ToolDefinition } from "../types/tool.js";
import type { PromptDefinition } from "../types/prompt.js";

export const defineTool = (
	name: string,
	tool: Omit<ToolDefinition, "name">,
) => ({ name, ...tool });

export const definePrompt = (
	name: string,
	prompt: Omit<PromptDefinition, "name">,
) => ({ name, ...prompt });
