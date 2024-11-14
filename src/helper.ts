import {
	FileView,
	normalizePath,
	PaneType,
	Plugin,
	TAbstractFile,
	TFile,
	TFolder,
	WorkspaceLeaf,
} from "obsidian";

import {
	FolderTabulationSettings,
	TabularFileConfiguration,
} from "./definitions";

export default class FolderTabulationHelper extends Plugin {
	processTabulation(
		next: boolean,
		openViews: Map<WorkspaceLeaf, TabularFileConfiguration>,
		settings: FolderTabulationSettings
	): void {
		const [currentFileName, parentFolderPath, currentFilePath]: [
			string,
			string,
			String
		] = this.getRelevantFileInformation();
		if (currentFilePath === "") {
			return;
		}

		const folder: TFolder | null =
			this.app.vault.getFolderByPath(parentFolderPath);
		if (folder) {
			const files: TAbstractFile[] = folder.children.filter(
				(file) => file instanceof TFile
			);
			if (!(files.every((file) => file instanceof TFile))) {
				return;
			}
			if (files.length) {
				const nextFile: TAbstractFile | null = this.getNextFile(
					files,
					currentFileName,
					next
				);

				if (nextFile === null) {
					return;
				}

				const findSameView: WorkspaceLeaf = [
					...openViews.keys(),
				].filter(
					(leaf) =>
						(leaf.view as FileView).file?.path == nextFile.path
				)[0];
				if (findSameView) {
					this.app.workspace.setActiveLeaf(findSameView);
				} else {
					this.openFile(nextFile as TFile, settings);
				}
			}
		}
	}

	getRelevantFileInformation(): [string, string, string] {
		const currentFile: TFile | null = this.app.workspace.getActiveFile();
		if (currentFile === null) {
			return ["", "", ""];
		}
		const currentFileName: string = currentFile.name;
		const parentFolderPath: string | null = currentFile.parent
			? normalizePath(currentFile.parent.path)
			: null;
		if (parentFolderPath === null) {
			return ["", "", ""];
		}
		return [
			currentFileName,
			parentFolderPath,
			normalizePath(`${parentFolderPath}${currentFileName}`),
		];
	}

	getNextFile(files: TAbstractFile[], currentFileName: string, next: boolean): TFile | null {
		const currentDirFiles: Array<string> = files.map(
			(file: TFile) => file.path
		);
		const currentFileIndex: number = currentDirFiles.findIndex(
			(fileName: string) => fileName.includes(currentFileName)
		);
		let nextIndex: number = next
			? (currentFileIndex + 1) % currentDirFiles.length
			: (currentFileIndex - 1) % currentDirFiles.length;
		if (nextIndex < 0) {
			nextIndex = currentDirFiles.length - 1;
		}
		const nextFilePath: string = normalizePath(currentDirFiles[nextIndex]);
		const nextFile: TAbstractFile | null = this.app.vault.getAbstractFileByPath(nextFilePath);
		if (nextFile === null ||  !(nextFile instanceof TFile)) {
			return null;
		}
		return nextFile;
	}

	openFile(nextFile: TFile, settings: FolderTabulationSettings): void {
		if (settings.newTab === "same") {
			this.app.workspace.openLinkText(nextFile.basename, nextFile.path);
		} else if (settings.newTab === "tab") {
			this.app.workspace.openLinkText(
				nextFile.basename,
				nextFile.path,
				"tab" as PaneType
			);
		} else if (settings.newTab === "window") {
			this.app.workspace.openLinkText(
				nextFile.basename,
				nextFile.path,
				"window" as PaneType
			);
		} else if (settings.newTab === "pane") {
			this.app.workspace.openLinkText(
				nextFile.basename,
				nextFile.path,
				"split" as PaneType
			);
		} else {
			return;
		}
	}

	getButtons(
		view: WorkspaceLeaf,
		openViews: Map<WorkspaceLeaf, TabularFileConfiguration>
	): Map<string, HTMLElement> {
		if (openViews.has(view)) {
			let buttons: Map<string, HTMLElement> | undefined;
			if (
				openViews.get(view)?.buttons.get("button-next") !== undefined &&
				openViews.get(view)?.buttons.get("button-prev") !== undefined
			) {
				buttons = openViews.get(view)?.buttons;
				if (buttons) return buttons;
				else return new Map();
			}
		}
		return new Map();
	}

	setButtonDisplay(
		currentFileName: string,
		buttonNext: HTMLElement,
		buttonPrev: HTMLElement,
		settings: FolderTabulationSettings
	): void {
		if (settings.hideButtons || currentFileName === "") {
			buttonNext.removeClass("button-visible");
			buttonNext.addClass("button-hidden");
			buttonPrev.removeClass("button-visible");
			buttonPrev.addClass("button-hidden");
		} else {
			buttonNext.addClass("button-visible");
			buttonNext.removeClass("button-hidden");
			buttonPrev.addClass("button-visible");
			buttonPrev.removeClass("button-hidden");
		}
	}

	setSettings(
		settings: FolderTabulationSettings,
		openViews: Map<WorkspaceLeaf, TabularFileConfiguration>
	): void {
		const leaf: WorkspaceLeaf = this.app.workspace.getLeaf(false);
		const buttons = this.getButtons(leaf, openViews);
		const [currentFileName, _parentFolderPath, _currentFilePath]: [
			string,
			string,
			String
		] = this.getRelevantFileInformation();
		if (buttons) {
			const buttonNext = buttons.get("button-next");
			const buttonPrev = buttons.get("button-prev");
			if (buttonNext !== undefined && buttonPrev !== undefined) {
				this.setButtonDisplay(
					currentFileName,
					buttonNext,
					buttonPrev,
					settings
				);
			}
		}
	}
}
