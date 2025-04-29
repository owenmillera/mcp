import type {
	DirectusClient,
	RestClient,
	StaticTokenClient,
} from "@directus/sdk";
import { createDirectus as createSdk, rest, staticToken } from "@directus/sdk";
import type { Config } from "./config.js";
import type { Schema } from "./types/schema.js";

export const createDirectus = (config: Config) =>
	createSdk(config.DIRECTUS_URL)
		.with(staticToken(config.DIRECTUS_TOKEN))
		.with(rest());

export type Directus = DirectusClient<Schema> &
	StaticTokenClient<Schema> &
	RestClient<Schema>;

const formatSuccessResponse = (data: unknown) => {
	return { content: [{ type: "text" as const, text: JSON.stringify(data) }] };
};

// Export this function for reuse
export const formatErrorResponse = (error: unknown) => {
	let errorMessage = "An unknown error occurred";
	if (typeof error === "object" && error !== null && "data" in error) {
		const errorData = (error as { data?: unknown }).data;
		if (
			typeof errorData === "object" &&
			errorData !== null &&
			"message" in errorData
		) {
			errorMessage = (errorData as { message?: unknown }).message as string;
		}
	} else if (error instanceof Error) {
		errorMessage = error.message;
	}
	return {
		content: [
			{
				type: "text" as const,
				text: JSON.stringify({ error: `Error: ${errorMessage}` }),
			},
		],
	};
};

// Helper to wrap Directus SDK calls
export async function useDirectus<T>(
	collection: string | null | undefined,
	contextSchema: Schema,
	requestFn: () => Promise<T>,
): Promise<{ content: { type: "text"; text: string }[] }> {
	if (collection && !contextSchema[collection]) {
		return formatErrorResponse(
			new Error(
				`Collection "${collection}" not found. Use read-collections tool first.`,
			),
		);
	}
	try {
		const result = await requestFn();
		const responseData = (typeof result === 'object' && result !== null && 'data' in result) ? result.data : result;
		return formatSuccessResponse(responseData);
	} catch (error: unknown) {
		let actualError = error;
		if (typeof error === 'object' && error !== null && 'errors' in error && Array.isArray(error.errors) && error.errors.length > 0) {
			actualError = error.errors[0];
		}
		return formatErrorResponse(actualError);
	}
}
