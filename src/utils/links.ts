export const itemLink = (baseUrl?: string, collection?: string, id?: string ) => {
	if (!baseUrl || !collection || !id) {
		return undefined;
	}
	return `${baseUrl}/admin/content/${collection}/${id}`;
};

export const collectionLink = (baseUrl?: string, collection?: string) => {
	if (!baseUrl || !collection) {
		return undefined;
	}
	return `${baseUrl}/admin/content/${collection}`;
};

export const fileLink = (baseUrl?: string, file?: string) => {
	if (!baseUrl || !file) {
		return undefined;
	}
	return `${baseUrl}/admin/content/files/${file}`;
};

export const userLink = (baseUrl?: string, user?: string) => {
	if (!baseUrl || !user) {
		return undefined;
	}
	return `${baseUrl}/admin/content/users/${user}`;
};

export const visualEditorLink = (baseUrl?: string, url?: string) => {
	if (!baseUrl || !url) {
		return undefined;
	}
	// Ensure url is a valid URL and not a relative path
	const urlObj = new URL(url);

	// Set visual-editing=true in query params while keeping other params
	urlObj.searchParams.set("visual-editing", "true");

	return `${baseUrl}/admin/visual/${urlObj.toString()}`;
};
