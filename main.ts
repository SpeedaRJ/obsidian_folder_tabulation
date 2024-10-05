import { FileView, TextFileView, WorkspaceLeaf } from "obsidian";

import {
	FolderTabulationSettings,
	TabularFileConfiguration,
} from "./src/definitions";
import FolderTabulationHelper from "./src/helper";
import FolderTabulationSettingsTab from "./src/settings";

const DEFAULT_SETTINGS: FolderTabulationSettings = {
	newTab: "same",
	hideButtons: false,
	nextFileColor: "#b3b3b3",
	prevFileColor: "#b3b3b3",
};

export default class FolderTabulation extends FolderTabulationHelper {
	settings: FolderTabulationSettings;

	openViews = new Map<WorkspaceLeaf, TabularFileConfiguration>();

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "move-to-next-file-in-folder",
			name: "Move to next file in folder",
			callback: () => {
				this.processTabulation(true, this.openViews, this.settings);
			},
		});

		this.addCommand({
			id: "move-to-prev-file-in-folder",
			name: "Move to previous file in folder",
			callback: () => {
				this.processTabulation(false, this.openViews, this.settings);
			},
		});

		this.addSettingTab(new FolderTabulationSettingsTab(this.app, this));

		this.registerEvent(
			this.app.workspace.on("active-leaf-change", () => {
				const activeLeaf =
					this.app.workspace.getActiveViewOfType(FileView);
				if (!activeLeaf) return;

				const leaf: WorkspaceLeaf = this.app.workspace.getLeaf(false);
				if (!(leaf.view instanceof FileView)) return;

				const [currentFileName, _parentFolderPath, currentFilePath]: [
					string,
					string,
					string
				] = this.getRelevantFileInformation();

				if (!this.openViews.has(leaf)) {
					const buttonNext = (leaf.view as FileView).addAction(
						"arrow-right-to-line",
						"Tab to next file",
						() => {
							(this.app as any).commands.executeCommandById(
								"folder-tabulation:move-to-next-file-in-folder"
							);
						}
					);
					buttonNext.addClasses([
						"folder-tabular-button",
						"button-visible",
					]);

					const buttonPrev = (leaf.view as FileView).addAction(
						"arrow-left-to-line",
						"Tab to previous file",
						() => {
							(this.app as any).commands.executeCommandById(
								"folder-tabulation:move-to-prev-file-in-folder"
							);
						}
					);
					buttonPrev.addClasses([
						"folder-tabular-button",
						"button-visible",
					]);

					this.openViews.set(leaf, {
						path: currentFilePath,
						buttons: new Map([
							["button-next", buttonNext],
							["button-prev", buttonPrev],
						]),
					});
					
					const unloadedViews = [...this.openViews.keys()].filter(
						(leaf) => leaf.getViewState().type === "empty"
					);
					for (const view of unloadedViews) {
						this.openViews.delete(view);
					}
				}
				const buttons = this.getButtons(leaf, this.openViews);
				if (buttons) {
					const buttonNext: HTMLElement | undefined =
						buttons.get("button-next");
					const buttonPrev: HTMLElement | undefined =
						buttons.get("button-prev");
					if (buttonNext !== undefined && buttonPrev !== undefined) {
						this.setButtonDisplay(
							currentFileName,
							buttonNext,
							buttonPrev,
							this.settings
						);
						this.colorButtons(
							buttonNext,
							buttonPrev,
							this.settings
						);
					}
				}
			})
		);
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
		this.setSettings(this.settings, this.openViews);
	}
}
