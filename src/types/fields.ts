import { z } from 'zod';

// Simplified Schema for Database-level Field Info (relevant parts for create/update)
// We don't need to validate *everything* the API might return, just what we send/expect.
export const FieldSchemaInfoSchema = z.object({
  name: z.string().optional().describe("The name of the field (often inferred)."),
  table: z.string().optional().describe("The collection of the field (often inferred)."),
  data_type: z.string().optional().describe("Database specific data type for the field."),
  default_value: z.any().nullable().optional().describe("The default value of the field."),
  max_length: z.number().int().nullable().optional().describe("The max length of the field."),
  is_nullable: z.boolean().optional().describe("If the field is nullable."),
  is_primary_key: z.boolean().optional().describe("If the field is primary key."),
  has_auto_increment: z.boolean().optional().describe("If the field has auto increment."),
  foreign_key_table: z.string().nullable().optional().describe("Related table from the foreign key constraint."),
  foreign_key_column: z.string().nullable().optional().describe("Related column from the foreign key constraint."),
  comment: z.string().nullable().optional().describe("Comment as saved in the database."),
  // Add other relevant schema properties based on Directus docs if needed
}).partial().describe("Database level schema information for a field (subset for creation/update).");

// Simplified Schema for Directus-specific Field Metadata (relevant parts for create/update)
export const FieldMetaSchema = z.object({
  collection: z.string().optional().describe("Collection name (often inferred)."),
  field: z.string().optional().describe("Field name (often inferred)."),
  interface: z.string().nullable().optional().describe("What interface is used."),
  options: z.record(z.string(), z.any()).describe("Options for the interface.").nullable().optional(),
  display: z.string().nullable().optional().describe("What display is used."),
  display_options: z.record(z.string(), z.any()).describe("Options for the display.").nullable().optional(),
  readonly: z.boolean().optional().describe("If the field is read-only."),
  hidden: z.boolean().optional().describe("If the field should be hidden."),
  sort: z.number().int().nullable().optional().describe("Sort order."),
  width: z.enum(["half", "half-left", "half-right", "full", "fill"]).nullable().optional().describe("Width of the field."),
  translations: z.record(z.string(), z.any()).describe("Translations for the field's name.").nullable().optional(),
  note: z.string().nullable().optional().describe("A note for the field."),
  required: z.boolean().optional().describe("If the field is required."),
  group: z.string().nullable().optional().describe("Field group (references another field name)."),
  validation: z.record(z.string(), z.any()).describe("Validation rule object.").nullable().optional(),
  validation_message: z.string().nullable().optional().describe("Validation error message."),
  conditions: z.array(z.record(z.string(), z.any())).describe("Conditions to display the field.").nullable().optional(),
  // Add other relevant meta properties based on Directus docs if needed
}).partial().describe("Directus specific metadata and configuration for a field (subset for creation/update).");

// Schema for the data payload when creating a field
export const CreateFieldDataSchema = z.object({
    field: z.string().describe("Unique name of the field. Required."),
    type: z.string().describe("Directus specific data type. Required."),
    schema: FieldSchemaInfoSchema.optional().describe("Optional: Database schema details."),
    meta: FieldMetaSchema.optional().describe("Optional: Directus metadata and configuration."),
}).describe("Data payload for creating a new field.");

// Schema for the data payload when updating a field
// Note: All fields are optional in an update.
export const UpdateFieldDataSchema = z.object({
    type: z.string().optional().describe("Optional: New Directus data type."),
    schema: FieldSchemaInfoSchema.optional().describe("Optional: Database schema details to update."),
    meta: FieldMetaSchema.optional().describe("Optional: Directus metadata and configuration to update."),
}).describe("Data payload for updating an existing field. All properties are optional.");

// Schema representing a field as returned by the API (useful for typing responses)
export const FieldSchema = z.object({
  collection: z.string(),
  field: z.string(),
  type: z.string().nullable(), // Type might be null for certain field types
  schema: FieldSchemaInfoSchema.nullable(), // Schema can be null
  meta: FieldMetaSchema.extend({ // Extend the partial meta with potentially known fields from response
    id: z.number().int().optional(),
    interface: z.string().nullable().optional(),
    display: z.string().nullable().optional(),
    readonly: z.boolean().optional(),
    hidden: z.boolean().optional(),
    sort: z.number().int().nullable().optional(),
    width: z.enum(["half", "half-left", "half-right", "full", "fill"]).nullable().optional(),
    // Ensure fields potentially always present in meta responses are included non-optionally if necessary
  }).nullable(), // Meta can be null
}).describe("Represents a Directus Field as typically returned by the API.");

// Type helper for Directus SDK Field object (approximated)
export type DirectusField = z.infer<typeof FieldSchema>;
export type DirectusCreateFieldData = z.infer<typeof CreateFieldDataSchema>;
export type DirectusUpdateFieldData = z.infer<typeof UpdateFieldDataSchema>;
