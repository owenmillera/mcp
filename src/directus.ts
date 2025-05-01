import type {
	DirectusClient,
	RestClient,
	AuthenticationClient,
} from "@directus/sdk";
import {
	createDirectus as createSdk,
	rest,
	authentication,
} from "@directus/sdk";
import type { Config } from "./config.js";
import type { Schema } from "./types/schema.js";
import { formatErrorResponse, formatResourceResponse, formatSuccessResponse } from "./utils/response.js";

export type Directus = DirectusClient<Schema> &
	RestClient<Schema> &
	AuthenticationClient<Schema>;

/**
 * Create a Directus client.
 * @param config - The configuration.
 * @returns The Directus client.
 */
export const createDirectus = (config: Config) =>
	createSdk(config.DIRECTUS_URL).with(authentication()).with(rest());

/**
 * Authenticate the Directus client.
 * @param directus - The Directus client.
 * @param config - The configuration.
 */
export async function authenticateDirectus(directus: Directus, config: Config) {
	if (!directus || !config) {
		throw new Error("Directus or config is not defined");
	}

	// Token-based authentication
	if (config.DIRECTUS_TOKEN) {
		directus.setToken(config.DIRECTUS_TOKEN);
		return;
	}

	// Credentials-based authentication
	if (config.DIRECTUS_USER_EMAIL && config.DIRECTUS_USER_PASSWORD) {
		try {
			await directus.login(
				config.DIRECTUS_USER_EMAIL,
				config.DIRECTUS_USER_PASSWORD,
			);
			return;
		} catch (error) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			throw new Error(
				`Failed to authenticate with credentials: ${errorMessage}`,
			);
		}
	}

	// No valid authentication method
	throw new Error(
		"No valid authentication method provided (requires either DIRECTUS_TOKEN or both DIRECTUS_USER_EMAIL and DIRECTUS_USER_PASSWORD)",
	);
}
/**
 * Use the Directus SDK to make a request and format the response.
 * @param collection - The collection to make the request to.
 * @param contextSchema - The schema of the context.
 * @param requestFn - The function to make the request.
 * @returns The formatted response.
 */
export async function useDirectus<T>(
	collection: string | null | undefined,
	contextSchema: Schema,
	requestFn: () => Promise<T>,
	options: {
		asResource?: boolean;
	} = {},
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

		return options.asResource
			? // @ts-expect-error - result.id is not always present
				formatResourceResponse(collection, result.id ? result.id : null, result)
			: formatSuccessResponse(result);
	} catch (error: unknown) {
		let actualError = error;
		if (
			typeof error === "object" &&
			error !== null &&
			"errors" in error &&
			Array.isArray(error.errors) &&
			error.errors.length > 0
		) {
			actualError = error.errors[0];
		}
		return formatErrorResponse(actualError);
	}
}
