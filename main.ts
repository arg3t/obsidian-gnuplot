import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { spawn } from "child_process";


// Remember to rename these classes and interfaces!

interface GnuPlotSettings {
	binary: string;
	initscript: string;
}

const DEFAULT_SETTINGS: GnuPlotSettings = {
	binary: 'gnuplot',
	initscript: 'set term svg'
}

export default class GnuPlotPlugin extends Plugin {
	settings: GnuPlotSettings;

  async onload() {
		await this.loadSettings();

		let plot = (source, el, ctx) => {
			const child = spawn(this.settings.binary, []);
			child.stdout.pipe(process.stdout);

			child.stdin.write(`${this.settings.initscript}\r\n`);
			child.stdin.write(source);

			child.stdin.end(); 

			let stdout = "";

			if (child.stdout) {
				child.stdout.on("data", (data) => {
					stdout += data;
				});
			}
			
      child.on("close", (code) => {
        if (code === 0) {
					el.innerHTML = stdout;
        } else {
					el.innerHTML = "<h1> An error occured </h1>"
        }
      });
	}

    this.registerMarkdownCodeBlockProcessor("plot", plot);
    this.registerMarkdownCodeBlockProcessor("plotinteractive", plot);

		this.addSettingTab(new SettingsTab(this.app, this));
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SettingsTab extends PluginSettingTab {
	plugin: GnuPlotPlugin;

	constructor(app: App, plugin: GnuPlotPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();

		containerEl.createEl('h2', {text: 'Settings for Gnuplot'});

		new Setting(containerEl)
			.setName('Binary to run')
			.setDesc('The binary associated with gnuplot')
			.addText(text => text
				.setPlaceholder('gnuplot')
				.setValue(this.plugin.settings.binary)
				.onChange(async (value) => {
					this.plugin.settings.binary = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Binary to run')
			.setDesc('The binary associated with gnuplot')
			.addTextArea(text => text
				.setPlaceholder('set term svg')
				.setValue(this.plugin.settings.initscript)
				.onChange(async (value) => {
					this.plugin.settings.initscript = value;
					await this.plugin.saveSettings();
				}));
	}
}
