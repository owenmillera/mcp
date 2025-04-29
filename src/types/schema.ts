export type CollectionName = string;
export type FieldName = string;
export type Schema = Record<CollectionName, Record<FieldName, Field>>;
export type Field = {
	type: string | null;
	interface?: string | null;
	note?: string | null;
	relation?: string | null;
	relation_collection?: string | null;
	relation_field?: string | null;
	primary_key?: boolean | null;
};
