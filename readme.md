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
				"SYSTEM_PROMPT_ENABLED": "true",
				"SYSTEM_PROMPT": "You're a content editor working at Directus.\nYou're a master at copywriting and creating messaging that resonates with technical audiences.\nYou'll be given details about a Directus instance and the schema within it. You'll be asked to update content and other helpful tasks. **Rules** \n - If you're updating HTML / WYSWIG fields inside the CMS - DO NOT ADD extra styling, classes, or markup outside the standard HTML elements. If you're not 95% sure what values should go into a certain field, stop and ask the user. Before deleting anything, confirm with the user and prompt them for an explicit DELETE confirmation via text.",
				"PROMPTS_COLLECTION_ENABLED": "true",
				"PROMPTS_COLLECTION": "ai_prompts"
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
				"SYSTEM_PROMPT_ENABLED": "true",
				"SYSTEM_PROMPT": "You are an assistant specialized in managing content for our marketing website.",
				"PROMPTS_COLLECTION_ENABLED": "true",
				"PROMPTS_COLLECTION": "ai_prompts"
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

### System

#### system-prompt

Retrieve important information about your role. This should typically be called once before using any other tools.

```json
{}
```

### Users

#### users-me

Retrieve information about the current user.

```json
{
	"fields": ["id", "email", "first_name", "last_name"]
}
```

### Collections

#### read-collections

Retrieve the schema of all collections in the connected Directus instance.

```json
{}
```

### Items

#### read-items

Read items from any collection. You can fetch related fields using dot notation with the `fields` parameter.

Parameters:

- `collection`: (required) The name of the collection to read from
- `query`: Object containing query parameters like:
  - `fields`: Array of field names to return
  - `filter`: Filter conditions
  - `sort`: Fields to sort by
  - `limit`: Maximum number of items to return
  - And many more standard Directus query parameters

Example:

```json
{
	"collection": "articles",
	"query": {
		"fields": ["id", "title", "date_published"],
		"sort": ["-date_published"],
		"limit": 10
	}
}
```

#### create-item

Create a new item in a collection.

Parameters:

- `collection`: (required) The name of the collection to create in
- `item`: (required) The item data to create
- `query`: (optional) Query parameters for returned data

Example:

```json
{
	"collection": "posts",
	"item": {
		"title": "New Blog Post",
		"content": "This is the content of the post",
		"status": "draft"
	}
}
```

#### update-item

Update an existing item in a collection.

Parameters:

- `collection`: (required) The name of the collection to update in
- `id`: (required) The primary key of the item to update
- `data`: (required) The partial item data to update
- `query`: (optional) Query parameters for returned data

Example:

```json
{
	"collection": "posts",
	"id": "123",
	"data": {
		"title": "Updated Title",
		"status": "published"
	}
}
```

### Files

#### read-files

Read file (asset) metadata or retrieve a file's raw content.

Parameters:

- `id`: (optional) The ID of a specific file
- `query`: (optional) Directus query parameters for file metadata
- `raw`: (optional) If true, fetch raw file content (requires 'id')

Example for fetching multiple files:

```json
{
	"query": {
		"limit": 5,
		"sort": ["-uploaded_on"]
	}
}
```

Example for fetching a single file:

```json
{
	"id": "123e4567-e89b-12d3-a456-426614174000"
}
```

#### import-file

Import a file to Directus from a web URL.

Parameters:

- `url`: (required) URL of the file to import
- `data`: (required) Metadata for the file (title, folder, etc.)

Example:

```json
{
	"url": "https://example.com/image.jpg",
	"data": {
		"id": "custom-id",
		"title": "Example Image",
		"folder": "marketing"
	}
}
```

#### update-files

Update the metadata of existing files.

Parameters:

- `data`: (required) Array of objects containing file IDs and fields to update

Example:

```json
{
	"data": [
		{
			"id": "123",
			"title": "Updated Image Title",
			"description": "New description"
		}
	]
}
```

### Fields

#### read-fields

Retrieve field definitions for all collections or a specific collection.

Parameters:

- `collection`: (optional) Name of the collection

Example:

```json
{
	"collection": "posts"
}
```

#### read-field

Retrieve the definition of a specific field within a collection.

Parameters:

- `collection`: (required) The collection the field belongs to
- `field`: (required) The name of the field to retrieve

Example:

```json
{
	"collection": "posts",
	"field": "title"
}
```

#### create-field

Create a new field in a specified collection.

Parameters:

- `collection`: (required) The collection to add the field to
- `data`: (required) The data for the new field

Example:

```json
{
	"collection": "posts",
	"data": {
		"field": "subtitle",
		"type": "string",
		"meta": {
			"interface": "input"
		}
	}
}
```

#### update-field

Update an existing field in a specified collection.

Parameters:

- `collection`: (required) The collection containing the field
- `field`: (required) The name of the field to update
- `data`: (required) The partial data to update the field with

Example:

```json
{
	"collection": "posts",
	"field": "subtitle",
	"data": {
		"meta": {
			"note": "Secondary headline for the post"
		}
	}
}
```

### Flows

#### read-flows

Fetch manually triggerable flows from Directus. Flows allow users to automate tasks inside Directus.

```json
{}
```

#### trigger-flow

Trigger a flow by ID.

Parameters:

- `flowDefinition`: (required) The full flow definition from the read-flows call
- `flowId`: (required) The ID of the flow to trigger
- `collection`: (required) The collection of the items to trigger the flow on
- `keys`: (required) The primary keys of the items to trigger the flow on
- `data`: (optional) The data to pass to the flow

Example:

```json
{
	"flowDefinition": {...},
	"flowId": "123",
	"collection": "posts",
	"keys": ["1", "2", "3"],
	"data": {
		"status": "published"
	}
}
```

### Prompts

#### get-prompts

Retrieve the list of prompts available to the user from the configured prompts collection.

Parameters:

- `query`: (optional) Directus query parameters

Example:

```json
{
	"query": {
		"fields": ["id", "name", "description"]
	}
}
```

### Utilities

#### markdown-tool

Quickly convert content back and forth between markdown and HTML for WYSIWYG fields inside the CMS.

Parameters:

- `html`: (optional) HTML string to convert to Markdown
- `markdown`: (optional) Markdown string to convert to HTML

Example for HTML to Markdown:

```json
{
	"html": "<h1>Hello World</h1><p>This is a paragraph</p>"
}
```

Example for Markdown to HTML:

```json
{
	"markdown": "# Hello World\n\nThis is a paragraph"
}
```

## License

TBD
