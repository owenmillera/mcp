# Directus Model Context Protocol (MCP) Server

MCP server for use with Directus. Allows your AI tools to connect to and use your Directus API on your behalf.

This started as an experiment by the dude, the legend, the (@rijkvanzanten) 🙌

## Installation

This MCP server is built to work with NodeJS v22.12 or newer.

### Using npx (No Installation Required)

You can use `npx` to run the package without installing it globally:

```json
{
	"mcpServers": {
		"directus": {
			"command": "npx",
			"args": ["@directus-labs/content-mcp"],
			"env": {
				"DIRECTUS_URL": "<your Directus instance URL>",
				"DIRECTUS_TOKEN": "<your Directus user token>"
			}
		}
	}
}
```

### Local / Dev Installation

1. Clone the repo
2. `pnpm install && pnpm build` to build the server
3. Configure Claude AI like above, but pointing it to the `dist` file instead:

```json
{
	"mcpServers": {
		"directus": {
			"command": "node",
			"args": ["/path/to/directus-mcp-server/dist/index.js"]
		}
	}
}
```

Sample Claude Desktop Config Local Dev

```json
{
	"mcpServers": {
		"directus": {
			"command": "node",
			"args": [
				"REPLACE_PATH_HERE/directus-mcp-server/dist/index.js"
			],
			"env": {
				"DIRECTUS_URL": "DIRECTUS_URL",
				"DIRECTUS_TOKEN": "DIRECTUS_TOKEN",
				"MCP_SYSTEM_PROMPT_ENABLED": "true",
				"MCP_SYSTEM_PROMPT": "You're a content editor working at Directus.\nYou're a master at copywriting and creating messaging that resonates with technical audiences.\nYou'll be given details about a Directus instance and the schema within it. You'll be asked to update content and other helpful tasks. **Rules** \n - If you're updating HTML / WYSWIG fields inside the CMS - DO NOT ADD extra styling, classes, or markup outside the standard HTML elements. If you're not 95% sure what values should go into a certain field, stop and ask the user. Before deleting anything, confirm with the user and prompt them for an explicit DELETE confirmation via text.",
				"DIRECTUS_PROMPTS_COLLECTION_ENABLED": "true",
				"DIRECTUS_PROMPTS_COLLECTION": "ai_prompts"
			}
		}
	}
}
```

### Example Configurations

#### Basic Configuration with Token

```json
{
	"mcpServers": {
		"directus": {
			"command": "npx",
			"args": ["@directus-labs/content-mcp"],
			"env": {
				"DIRECTUS_URL": "https://your-directus-instance.com",
				"DIRECTUS_TOKEN": "your_directus_token"
			}
		}
	}
}
```

#### Configuration with Email/Password Authentication

```json
{
	"mcpServers": {
		"directus": {
			"command": "npx",
			"args": ["@directus-labs/content-mcp"],
			"env": {
				"DIRECTUS_URL": "https://your-directus-instance.com",
				"DIRECTUS_USER_EMAIL": "user@example.com",
				"DIRECTUS_USER_PASSWORD": "your_password"
			}
		}
	}
}
```

#### Advanced Configuration with Custom System Prompt and Tool Restrictions

```json
{
	"mcpServers": {
		"directus": {
			"command": "npx",
			"args": ["@directus-labs/content-mcp"],
			"env": {
				"DIRECTUS_URL": "https://your-directus-instance.com",
				"DIRECTUS_TOKEN": "your_directus_token",
				"DISABLE_TOOLS": ["delete-item", "update-field"],
				"MCP_SYSTEM_PROMPT_ENABLED": "true",
				"MCP_SYSTEM_PROMPT": "You are an assistant specialized in managing content for our marketing website.",
				"DIRECTUS_PROMPTS_COLLECTION_ENABLED": "true",
				"DIRECTUS_PROMPTS_COLLECTION": "ai_prompts",
				"DIRECTUS_PROMPTS_NAME_FIELD": "name",
				"DIRECTUS_PROMPTS_DESCRIPTION_FIELD": "description",
				"DIRECTUS_PROMPTS_SYSTEM_PROMPT_FIELD": "system_prompt",
				"DIRECTUS_PROMPTS_MESSAGES_FIELD": "messages"
			}
		}
	}
}
```

## Development

For standard development:

```bash
pnpm dev:basic
```

## Tools

The MCP Server provides the following tools to interact with your Directus instance:

| Tool                 | Description                                      | Use Cases                                                      |
| -------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| **system-prompt**    | Provides context about your role as an assistant | Start of a session to understand the system context            |
| **users-me**         | Get current user information                     | Understanding permissions, personalizing responses             |
| **read-collections** | Retrieve the schema of all collections           | Exploring database structure, understanding relationships      |
| **read-items**       | Fetch items from any collection                  | Retrieving content, searching for data, displaying information |
| **create-item**      | Create new items in collections                  | Adding new content, records, or entries                        |
| **update-item**      | Modify existing items                            | Editing content, updating statuses, correcting information     |
| **delete-item**      | Remove items from collections                    | Cleaning up outdated content                                   |
| **read-files**       | Access file metadata or raw content              | Finding images, documents, or media assets                     |
| **import-file**      | Import files from URLs                           | Adding external media to your Directus instance                |
| **update-files**     | Update file metadata                             | Organizing media, adding descriptions, tagging                 |
| **read-fields**      | Get field definitions for collections            | Understanding data structure, field types and validation       |
| **read-field**       | Get specific field information                   | Detailed field configuration                                   |
| **create-field**     | Add new fields to collections                    | Extending data models                                          |
| **update-field**     | Modify existing fields                           | Changing field configuration, interface options                |
| **read-flows**       | List available automation flows                  | Finding automation opportunities                               |
| **trigger-flow**     | Execute automation flows                         | Bulk operations, publishing, status changes                    |
| **read-comments**    | View comments on items                           | Retrieving feedback, viewing discussion threads                |
| **upsert-comment**   | Add or update comments                           | Providing feedback, documenting decisions                      |
| **markdown-tool**    | Convert between markdown and HTML                | Content formatting for WYSIWYG fields                          |
| **get-prompts**      | List available prompts                           | Discovering pre-configured prompt templates                    |
| **get-prompt**       | Execute a stored prompt                          | Using prompt templates for consistent AI interactions          |

For detailed parameters and examples for each tool, please refer to the [API documentation](#).

### Prompt Configuration

The MCP server supports dynamic prompts stored in a Directus collection. You can configure the following:

- `DIRECTUS_PROMPTS_COLLECTION_ENABLED`: Set to "true" to enable prompt functionality
- `DIRECTUS_PROMPTS_COLLECTION`: The name of the collection containing prompts
- `DIRECTUS_PROMPTS_NAME_FIELD`: Field name for the prompt name (default: "name")
- `DIRECTUS_PROMPTS_DESCRIPTION_FIELD`: Field name for the prompt description (default: "description")
- `DIRECTUS_PROMPTS_SYSTEM_PROMPT_FIELD`: Field name for the system prompt text (default: "system_prompt")
- `DIRECTUS_PROMPTS_MESSAGES_FIELD`: Field name for the messages array (default: "messages")

### Mustache Templating

Both system prompts and message content support mustache templating using the `{{ variable_name }}` syntax:

1. Define variables in your prompts using double curly braces: `Hello, {{ name }}!`
2. When calling a prompt, provide values for the variables in the `arguments` parameter
3. The MCP server will automatically replace all variables with their provided values

## License

TBD
