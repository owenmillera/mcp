import type { GetPromptResult } from "@modelcontextprotocol/sdk/types.js";

type MessageRole = "user" | "assistant";

interface PromptMessage {
  role: MessageRole;
  text: string;
}

/**
 * Extracts mustache variables ({{ variable_name }}) from a string
 * @param text - The text to extract variables from
 * @returns An array of unique variable names
 */
export function extractMustacheVariables(text: string): string[] {
  const regex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
  const variables = new Set<string>();
  let match;

  while ((match = regex.exec(text)) !== null) {
    if (match[1]) {
      variables.add(match[1]);
    }
  }

  return Array.from(variables);
}

/**
 * Process a prompt message by replacing mustache variables with values
 * @param message - The message object with role and text
 * @param args - The arguments map with values for variables
 * @returns The processed message with variables replaced
 */
export function processPromptMessage(
  message: PromptMessage,
  args: Record<string, any>
): { role: MessageRole; content: { type: "text"; text: string } } {
  let processedText = message.text;

  // Replace all mustache variables
  for (const [key, value] of Object.entries(args)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    processedText = processedText.replace(regex, String(value));
  }

  return {
    role: message.role,
    content: {
      type: "text",
      text: processedText
    }
  };
}

/**
 * Creates a GetPromptResult by processing all messages in a prompt
 * @param messages - Array of message objects with role and text
 * @param args - Arguments to apply to the prompt templates
 * @returns A formatted GetPromptResult for the MCP server
 */
export function createPromptResult(
  messages: PromptMessage[],
  args: Record<string, any>
): GetPromptResult {
  return {
    messages: messages.map(message => processPromptMessage(message, args))
  };
}
