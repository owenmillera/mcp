import {
	readItems,
	createItem,
	createItems,
	updateItem,
	updateItems,
	deleteItem,
	deleteItems,
} from "@directus/sdk";

import * as z from "zod";
import { defineTool } from "../utils/define-tool.js";
import { itemQuerySchema } from "./schemas.js";
import { useDirectus } from "../directus.js";

export const readItemsTool = defineTool("read-items", {
	description: "Read items from any collection. ",
	annotations: {
		title: "Read Items",
		readOnlyHint: true,
	},
	inputSchema: z.object({
		collection: z.string().describe("The name of the collection to read from"),
		query: itemQuerySchema.describe(
			"Directus query parameters (filter, sort, fields, limit, deep, etc. You can use the read-collections tool to get the schema of the collection first.)",
		),
	}),
	handler: async (directus, query, { schema: contextSchema }) => {
		const { collection, query: queryParams } = query;
		return useDirectus(
			collection,
			contextSchema,
			// @ts-ignore
			async () => await directus.request(readItems(collection, queryParams)),
		);
	},
});

export const createItemTool = defineTool("create-item", {
	description: "Create a single item in a collection.",
	annotations: {
		title: "Create Item",
	},
	inputSchema: z.object({
		collection: z.string().describe("The name of the collection to create in"),
		item: z.record(z.string(), z.unknown()).describe("The item data to create"),
		query: itemQuerySchema
			// Pick only the fields and meta parameters
			.pick({ fields: true, meta: true })
			.optional()
			.describe(
				"Optional query parameters for the created item (e.g., fields)",
			),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, item, query } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () => await directus.request(createItem(collection, item, query)),
		);
	},
});

export const createItemsTool = defineTool("create-items", {
	description: "Create multiple items in a collection.",
	annotations: {
		title: "Create Items",
	},
	inputSchema: z.object({
		collection: z.string().describe("The name of the collection to create in"),
		items: z
			.array(
				z.record(z.string(), z.unknown()).describe("An item data to create"),
			)
			.describe("An array of item data to create"),
		query: itemQuerySchema
			.optional()
			.describe(
				"Optional query parameters for the created items (e.g., fields)",
			),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, items, query } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () =>
				await directus.request(createItems(collection, items, query)),
		);
	},
});

export const updateItemTool = defineTool("update-item", {
	description: "Update a single item in a collection.",
	annotations: {
		title: "Update Item",
		destructiveHint: true,
	},
	inputSchema: z.object({
		collection: z.string().describe("The name of the collection to update in"),
		id: z
			.union([z.string(), z.number()])
			.describe("The primary key of the item to update"),
		data: z
			.record(z.string(), z.unknown())
			.describe("The partial item data to update"),
		query: itemQuerySchema
			.pick({ fields: true, meta: true })
			.optional()
			.describe(
				"Optional query parameters for the updated item (e.g., fields)",
			),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, id, data, query } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () =>
				await directus.request(updateItem(collection, id, data, query)),
		);
	},
});

export const updateItemsTool = defineTool("update-items", {
	description: "Update multiple items in a collection.",
	annotations: {
		title: "Update Items",
		destructiveHint: true,
	},
	inputSchema: z.object({
		collection: z.string().describe("The name of the collection to update in"),
		ids: z
			.array(z.union([z.string(), z.number()]))
			.describe("The primary keys of the items to update"),
		data: z
			.record(z.string(), z.unknown())
			.describe("The partial item data to apply to all items"),
		query: itemQuerySchema
			.pick({ fields: true, meta: true })
			.optional()
			.describe(
				"Optional query parameters for the updated items (e.g., fields)",
			),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, ids, data, query } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () =>
				await directus.request(updateItems(collection, ids, data, query)),
		);
	},
});

export const deleteItemTool = defineTool("delete-item", {
	description: "Delete a single item from a collection. Please confirm with the user before deleting.",
	annotations: {
		title: "Delete Item",
		destructiveHint: true,
	},
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name of the collection to delete from"),
		id: z
			.union([z.string(), z.number()])
			.describe("The primary key of the item to delete"),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, id } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () => await directus.request(deleteItem(collection, id)),
		);
	},
});

export const deleteItemsTool = defineTool("delete-items", {
	description: "Delete multiple items from a collection. Please confirm with the user before deleting.",
	annotations: {
		title: "Delete Items",
		destructiveHint: true,
	},
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name of the collection to delete from"),
		ids: z
			.array(z.union([z.string(), z.number()]))
			.describe("The primary keys of the items to delete"),
	}),
	handler: async (directus, input, { schema: contextSchema }) => {
		const { collection, ids } = input;
		return useDirectus(
			collection,
			contextSchema,
			async () => await directus.request(deleteItems(collection, ids)),
		);
	},
});
