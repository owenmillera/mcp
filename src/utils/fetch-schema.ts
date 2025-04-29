import type { Field as DirectusField } from "@directus/types";
import { readFields } from "@directus/sdk";

import type { Directus } from "../directus.js";
import type { Schema, Field } from "../types/schema.js";


export async function fetchSchema(directus: Directus): Promise<Schema> {
  const fields = await directus.request(readFields());
  const schema: Schema = {};

  for (const field of fields as unknown as DirectusField[]) {
    // Skip system collections
    if (field.meta?.system === true) continue;

    // Skip UI-only fields
    if (field.type === "alias" &&
        (field.meta?.special?.includes("no-data") ||
         field.field.startsWith("meta_"))) continue;

    // Create collection if it doesn't exist
    if (!schema[field.collection]) {
      schema[field.collection] = {};
    }

    // Extract the essential field information
    const schemaField: Field = {
      type: field.type
    };

    // Add primary key flag
    if (field.schema?.is_primary_key) {
      schemaField.primary_key = true;
    }

    // Process relationships
    if (field.meta?.special) {
      // Handle file relationships
      if (field.meta.special.includes("file")) {
        schemaField.type = "file";
      } else if (field.meta.special.includes("files")) {
        schemaField.type = "files";
      }

      // Handle relational fields
      if (field.meta.special.includes("m2o")) {
        schemaField.relation = "m2o";
        if (field.schema?.foreign_key_table) {
          schemaField.relation_collection = field.schema.foreign_key_table;
        }
      } else if (field.meta.special.includes("o2m")) {
        schemaField.relation = "o2m";
      } else if (field.meta.special.includes("m2m")) {
        schemaField.relation = "m2m";
      } else if (field.meta.special.includes("m2a")) {
        schemaField.relation = "m2a";
      }
    }

    // Add foreign key relationship if exists
    if (field.schema?.foreign_key_table && !schemaField.relation) {
      schemaField.relation = "m2o"; // Assume m2o by default for FK
      schemaField.relation_collection = field.schema.foreign_key_table;
    }

    // Add the field to the schema
    schema[field.collection]![field.field] = schemaField;
  }

  return schema;
}
