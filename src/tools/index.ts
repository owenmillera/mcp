import type { ToolDefinition } from "../types/tool.js";
import collections from "./collections.js";
import {
	readItemsTool,
	createItemTool,
	createItemsTool,
	updateItemTool,
	updateItemsTool,
	deleteItemTool,
	deleteItemsTool,
} from "./items.js";
import usersMe from "./users/me.js";

import {
	readFieldsTool,
	readFieldTool,
	createFieldTool,
	updateFieldTool,
	deleteFieldTool,
} from "./fields.js";

export const getTools = () => {
	const staticTools: ToolDefinition[] = [
		usersMe,
		collections,
		// Items
		readItemsTool,
		createItemTool,
		createItemsTool,
		updateItemTool,
		updateItemsTool,
		deleteItemTool,
		deleteItemsTool,
		// Fields
		readFieldsTool,
		readFieldTool,
		createFieldTool,
		updateFieldTool,
		deleteFieldTool,
	];
	return staticTools;
};
