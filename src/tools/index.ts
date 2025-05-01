import type { ToolDefinition } from "../types/tool.js";
import collectionsTool from "./collections.js";
import {
	readItemsTool,
	createItemTool,
	updateItemTool,
	deleteItemTool,
} from "./items.js";
import usersMeTool from "./users.js";
import type { Config } from "../config.js";

import {
	readFieldsTool,
	readFieldTool,
	createFieldTool,
	updateFieldTool,
} from "./fields.js";

import { markdownTool } from "./markdown.js";

import {
	readFlowsTool,
	triggerFlowTool,
} from "./flows.js";

import { readFilesTool, importFileTool, updateFilesTool } from "./files.js";
import { createSystemPrompt } from "./prompts.js";

export const getTools = (config: Config) => {
	const toolList: ToolDefinition[] = [
		usersMeTool,
		collectionsTool,
		// Items
		readItemsTool,
		createItemTool,
		updateItemTool,
		deleteItemTool,
		// Flows
		readFlowsTool,
		triggerFlowTool,
		// Files
		readFilesTool,
		importFileTool,
		updateFilesTool,
		// Fields
		readFieldsTool,
		readFieldTool,
		createFieldTool,
		updateFieldTool,
		// Markdown
		markdownTool,
	];

	// If system propmt is enabled and exists, add the system prompt tool
	if (config.ENABLE_SYSTEM_PROMPT === "true" && config.SYSTEM_PROMPT) {
		toolList.push(createSystemPrompt(config));
	}
	// Filter the list of available tools based on cof
	const availableTools = toolList.filter(
		(tool) => !config.DISABLE_TOOLS.includes(tool.name),
	);

	return availableTools;
};
