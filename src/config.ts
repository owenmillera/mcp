import dotenv from "dotenv";
import * as z from "zod";
import { nullableString } from "./types/common.js";

const configSchema = z
	.object({
		DIRECTUS_URL: z.string().describe("The URL of the Directus instance."),
		DIRECTUS_TOKEN: nullableString().describe(
			"The user token for the Directus instance.",
		),
		DIRECTUS_USER_EMAIL: nullableString().describe(
			"The email of the user to login with.",
		),
		DIRECTUS_USER_PASSWORD: nullableString().describe(
			"The password of the user to login with.",
		),
		DISABLE_TOOLS: z
			.array(z.string())
			.default(["delete-item"])
			.describe("Disable specific tools by name. Defaults to ['delete-item']"),
		ENABLE_SYSTEM_PROMPT: z
			.string()
			.optional()
			.default("false")
			.describe("Enable a tailored system prompt for the MCP server."),
		SYSTEM_PROMPT: nullableString().describe(
			"Optional tailored prompt for the MCP server. Will load into the context before you use any other Directus tools.",
		),
		PROMPTS_COLLECTION: nullableString().describe(
			"The Directus collection to store LLM prompts in.",
		),
	})
	.refine(
		(data) => {
			return (
				!!data.DIRECTUS_TOKEN ||
				(!!data.DIRECTUS_USER_EMAIL && !!data.DIRECTUS_USER_PASSWORD)
			);
		},
		{
			message:
				"Either DIRECTUS_TOKEN or both DIRECTUS_USER_EMAIL and DIRECTUS_USER_PASSWORD must be provided.",
			path: ["DIRECTUS_TOKEN"],
		},
	);

export const createConfig = () => {
	dotenv.config();

	return configSchema.parse(process.env);
};

export type Config = z.infer<typeof configSchema>;
