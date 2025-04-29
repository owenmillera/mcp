import * as z from "zod";
import {
	readFields,
	readFieldsByCollection,
	readField,
	createField,
	updateField,
	deleteField,
} from "@directus/sdk";
import { defineTool } from "../utils/define-tool.js";
import { useDirectus, formatErrorResponse } from "../directus.js";
import {
	CreateFieldDataSchema,
	UpdateFieldDataSchema,
} from "../types/fields.js";
import type { Schema } from "../types/schema.js";

export const readFieldsTool = defineTool("read-fields", {
	description:
		"Retrieve the field definitions for all collections or a specific collection.",
	inputSchema: z.object({
		collection: z
			.string()
			.optional()
			.describe(
				"Optional: The name (ID) of the collection to retrieve fields for. If omitted, fields for all collections are returned.",
			),
		// TODO: Add query parameters like limit, sort if needed based on API spec
	}),
	handler: async (directus, { collection }, { schema }) => {
		const requestFn = () =>
			collection
				? directus.request(readFieldsByCollection(collection))
				: directus.request(readFields());
		return useDirectus(collection, schema, requestFn);
	},
});

export const readFieldTool = defineTool("read-field", {
	description: "Retrieve the definition of a specific field within a collection.",
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name (ID) of the collection the field belongs to."),
		field: z.string().describe("The name (ID) of the field to retrieve."),
	}),
	handler: async (directus, { collection, field }, { schema }) => {
		const requestFn = () => directus.request(readField(collection, field));
		return useDirectus(collection, schema, requestFn);
	},
});

export const createFieldTool = defineTool("create-field", {
	description: "Create a new field in a specified collection.",
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name (ID) of the collection to add the field to."),
		data: CreateFieldDataSchema.describe(
			"The data for the new field (field name, type, optional schema/meta).",
		),
	}),
	handler: async (directus, { collection, data }, { schema }) => {
		const requestFn = () => directus.request(createField(collection, data));
		return useDirectus(collection, schema, requestFn);
	},
});

export const updateFieldTool = defineTool("update-field", {
	description: "Update an existing field in a specified collection.",
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name (ID) of the collection containing the field."),
		field: z.string().describe("The name (ID) of the field to update."),
		data: UpdateFieldDataSchema.describe(
			"The partial data to update the field with (type, schema, meta).",
		),
	}),
	handler: async (directus, { collection, field, data }, { schema }) => {
		const requestFn = () =>
			directus.request(updateField(collection, field, data));
		return useDirectus(collection, schema, requestFn);
	},
});

export const deleteFieldTool = defineTool("delete-field", {
	description: "Delete an existing field from a specified collection.",
	inputSchema: z.object({
		collection: z
			.string()
			.describe("The name (ID) of the collection containing the field."),
		field: z.string().describe("The name (ID) of the field to delete."),
	}),
	handler: async (
		directus,
		{ collection, field },
		{ schema }: { schema: Schema },
	) => {
		if (!schema[collection]) {
			return formatErrorResponse(
				new Error(
					`Collection "${collection}" not found. Use read-collections tool first.`,
				),
			);
		}

		try {
			await directus.request(deleteField(collection, field));
			return {
				content: [
					{
						type: "text" as const,
						text: JSON.stringify({
							success: true,
							message: `Field '${field}' deleted successfully from collection '${collection}'.`,
						}),
					},
				],
			};
		} catch (error: unknown) {
			// Use the imported error formatter
			return formatErrorResponse(error);
		}
	},
});
