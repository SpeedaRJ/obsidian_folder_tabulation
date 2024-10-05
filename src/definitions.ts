export interface FolderTabulationSettings {
	newTab: string;
	hideButtons: boolean;
	nextFileColor: string;
	prevFileColor: string;
}

export interface TabularFileConfiguration {
	path: string;
	buttons: Map<string, HTMLElement>;
}
