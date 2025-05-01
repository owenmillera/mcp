import DOMPurify from "isomorphic-dompurify";
import { marked } from "marked";
import { defineTool } from "../utils/define.js";
import * as z from "zod";
import { formatErrorResponse } from "../utils/response.js";

export function markdownToHtml(markdown: string) {
	return DOMPurify.sanitize(marked.parse(markdown));
}

export function htmlToMarkdown(html: string) {
	return marked.parse(html);
}

export const markdownTool = defineTool("markdown-tool", {
	description:
		`Use this tool when you want to quickly convert content back and forth between markdown and HTML for WYSIWYG fields inside the CMS.`,
	annotations: {
		title: "Markdown Tool",
		readOnlyHint: true,
	},
	inputSchema: z.object({
		html: z.string().optional().describe('HTML string to convert to Markdown'),
		markdown: z.string().optional().describe('Markdown string to convert to HTML')

	}),
	// @ts-expect-error - directus isn't used
	handler: async (_directus, query, {}) => {
		try {
			if (query.html) {
				return {
					content: [{ type: "text", text: htmlToMarkdown(query.html) }],
				};
			}
			if (query.markdown) {
				return {
					content: [{ type: "text", text: markdownToHtml(query.markdown) }],
				};
			}
			return formatErrorResponse(new Error("No input provided"));
		} catch (error) {
			return formatErrorResponse(error);
		}
	},
});
