import { z } from "zod"

export const aggregateSchema = z.object({
  avg: z.array(z.string()).optional(),
  avgDistinct: z.array(z.string()).optional(),
  count: z.array(z.string()).optional(),
  countDistinct: z.array(z.string()).optional(),
  sum: z.array(z.string()).optional(),
  sumDistinct: z.array(z.string()).optional(),
  min: z.array(z.string()).optional(),
  max: z.array(z.string()).optional()
})

export const fieldFilterOperatorSchema = z.object({
  _eq: z
    .union([z.string(), z.number(), z.boolean()])
    .optional()
    .nullable(),
  _neq: z
    .union([z.string(), z.number(), z.boolean()])
    .optional()
    .nullable(),
  _lt: z.union([z.string(), z.number()]).optional(),
  _lte: z.union([z.string(), z.number()]).optional(),
  _gt: z.union([z.string(), z.number()]).optional(),
  _gte: z.union([z.string(), z.number()]).optional(),
  _in: z.array(z.union([z.string(), z.number()])).optional(),
  _nin: z.array(z.union([z.string(), z.number()])).optional(),
  _null: z.boolean().optional(),
  _nnull: z.boolean().optional(),
  _contains: z.string().optional(),
  _ncontains: z.string().optional(),
  _icontains: z.string().optional(),
  _starts_with: z.string().optional(),
  _nstarts_with: z.string().optional(),
  _istarts_with: z.string().optional(),
  _nistarts_with: z.string().optional(),
  _ends_with: z.string().optional(),
  _nends_with: z.string().optional(),
  _iends_with: z.string().optional(),
  _niends_with: z.string().optional(),
  _between: z.array(z.union([z.string(), z.number()])).optional(),
  _nbetween: z.array(z.union([z.string(), z.number()])).optional(),
  _empty: z.boolean().optional(),
  _nempty: z.boolean().optional(),
  _intersects: z.string().optional(),
  _nintersects: z.string().optional(),
  _intersects_bbox: z.string().optional(),
  _nintersects_bbox: z.string().optional()
}).partial()

export const fieldValidationOperatorSchema = z.object({
  _submitted: z.boolean().optional(),
  _regex: z.string().optional()
}).partial()

export type FieldFilterOperator = z.infer<typeof fieldFilterOperatorSchema>
export type FieldValidationOperator = z.infer<typeof fieldValidationOperatorSchema>
export type FieldFilter = { [field: string]: FieldFilterOperator | FieldValidationOperator }

export interface LogicalFilterOR {
  _or: Filter[]
}

export interface LogicalFilterAND {
  _and: Filter[]
}

export type LogicalFilter = LogicalFilterOR | LogicalFilterAND
export type Filter = LogicalFilter | FieldFilter

export const fieldFilterSchema = z.record(
  z.string(),
  z.union([fieldFilterOperatorSchema, fieldValidationOperatorSchema])
);

export const filterSchema = z.union([
  z.interface({
    get _or() {
      return z.array(filterSchema)
    }
  }),

  z.interface({
    get _and() {
      return z.array(filterSchema)
    }
  }),

  fieldFilterSchema
]);

export const deepQuerySchema = z.object({
  _fields: z.array(z.string()).optional().nullable(),
  _sort: z.array(z.string()).optional().nullable(),
  _filter: filterSchema.optional().nullable(),
  _limit: z.number().optional().nullable(),
  _offset: z.number().optional().nullable(),
  _page: z.number().optional().nullable(),
  _search: z.string().optional().nullable(),
  _group: z.array(z.string()).optional().nullable(),
  _aggregate: aggregateSchema.optional().nullable()
})

export const nestedDeepQuerySchema = z.record(z.string(), deepQuerySchema)

export const fieldParamSchema = z.array(z.string()).optional().nullable().describe("Specify fields to return. Also supports dot notation to request nested relational fields, and wildcards (*) to include all fields at a specific depth.")

export const sortParamSchema = z.array(z.string()).optional().nullable().describe("Fields to sort by (prefix with - for descending order)")

export const filterParamSchema = filterSchema.optional().nullable().describe("Filter conditions for the query. Respects all of standard Directus filter syntax.")

export const limitParamSchema = z.number().optional().nullable().describe("Maximum number of items to return.")

export const offsetParamSchema = z.number().optional().nullable().describe("Number of items to skip.")

export const pageParamSchema = z.number().optional().nullable().describe("Page number for pagination.")

export const searchParamSchema = z.string().optional().nullable().describe("Global search term. Searches through all root level text fields.")

export const versionParamSchema = z.string().optional().nullable().describe("Content version to retrieve.")

export const versionRawParamSchema = z.boolean().optional().nullable().describe("Whether to return raw version data.")

export const exportParamSchema = z.union([z.literal("json"), z.literal("csv"), z.literal("xml"), z.literal("yaml")]).optional().nullable().describe("Format to export the data.")

export const groupByParamSchema = z.array(z.string()).optional().nullable().describe("Fields to group results by.")

export const aggregateParamSchema = aggregateSchema.optional().nullable().describe("Aggregation operations to perform.")

export const aliasParamSchema = z.record(z.string(), z.string()).optional().nullable().describe("Field aliases for the response.")

export const metaParamSchema = z.union([z.literal('total_count'), z.literal('filter_count')]).optional().nullable().describe("Include meta information in the response. total_count returns the total number of items that match the filter. filter_count returns the number of items that match the filter.")

export const itemQuerySchema = z.object({
  fields: fieldParamSchema,
  sort: sortParamSchema,
  filter: filterParamSchema,
  limit: limitParamSchema,
  offset: offsetParamSchema,
  page: pageParamSchema,
  search: searchParamSchema,
  version: versionParamSchema,
  versionRaw: versionRawParamSchema,
  export: exportParamSchema,
  groupBy: groupByParamSchema,
  aggregate: aggregateParamSchema,
  deep: nestedDeepQuerySchema,
  alias: aliasParamSchema,
  meta: metaParamSchema
})
