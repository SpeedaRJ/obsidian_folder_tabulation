export interface FolderTabulationSettings {
	newTab: string;
	hideButtons: boolean;
}

export interface TabularFileConfiguration {
	path: string;
	buttons: Map<string, HTMLElement>;
}
