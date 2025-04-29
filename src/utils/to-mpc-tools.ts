import { z } from "zod";
import type { ToolDefinition } from "../types/tool.js";

export const toMpcTools = (defs: ToolDefinition[]) => {
	return defs.map((def) => ({
		name: def.name,
		description: def.description,
		inputSchema: z.toJSONSchema(def.inputSchema),
		annotations: def.annotations,
	}));
};
