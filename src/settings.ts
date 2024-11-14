import {
	App,
	PluginSettingTab,
	Setting,
} from "obsidian";

import FolderTabulation from "../main";

export default class FolderTabulationSettingsTab extends PluginSettingTab {
	plugin: FolderTabulation;

	constructor(app: App, plugin: FolderTabulation) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		new Setting(containerEl)
			.setName("Set the behavior for opening of files")
			.setDesc(
				"Supported options are: in the same tab, in a new tab, in a new window (popup), in a new pane (split)"
			)
			.addDropdown((dropdown) => {
				dropdown
					.addOptions({
						same: "Same tab",
						tab: "New tab",
						window: "New window / popup",
						pane: "New pane / split",
					})
					.setValue(this.plugin.settings.newTab)
					.onChange((value) => {
						this.plugin.settings.newTab = value;
						this.plugin.saveSettings();
					});
			});

		new Setting(containerEl)
			.setName("Hide the buttons from the UI")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.hideButtons)
					.onChange((value) => {
						this.plugin.settings.hideButtons = value;
						this.plugin.saveSettings();
					});
			});
	}
}
