import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import { spawn } from "child_process";


// Remember to rename these classes and interfaces!

interface GnuPlotSettings {
	binary: string;
}

const DEFAULT_SETTINGS: GnuPlotSettings = {
	binary: 'gnuplot'
}

export default class GnuPlotPlugin extends Plugin {
	settings: GnuPlotSettings;

  async onload() {

		console.log("stdout");

    this.registerMarkdownCodeBlockProcessor("plot", (source, el, ctx) => {
			const child = spawn('gnuplot', []);
			child.stdout.pipe(process.stdout);

			child.stdin.write("set term svg enhanced background rgb 'white'\r\n");
			child.stdin.write(source);

			child.stdin.end(); 

			let stdout = "";

			console.log(child)

			if (child.stdout) {
				child.stdout.on("data", (data) => {
					stdout += data;
				});
			}
			
      child.on("close", (code) => {
				console.log(code);
        if (code === 0) {
					el.innerHTML = stdout;
        } else {
					el.innerHTML = "<h1> An error occured </h1>"
        }
      });
    });


	}

	onunload() {

	}
}
