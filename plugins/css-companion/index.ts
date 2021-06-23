import { existsSync, readFile } from "fs";
import { FSWatcher, watch as fsWatch } from "chokidar";

import { SwathePlugin } from "../../core/plugin";

namespace CSSCompanion {
    export var watching = false;
    export var watchFile: string | undefined;
}

var settingsDialog: Dialog;
var watcher: FSWatcher;

const plugin = new SwathePlugin(
    "css_companion",
    {
        icon: "style",
        title: "CSS Companion",
        author: "Unoqwy",
        description: "Write custom CSS using your editor of choice",
        variant: "desktop",

        onload: () => {
            updateState(plugin.storage.get("watching") === true, plugin.storage.get("watch_file"), "init");

            settingsDialog = new Dialog({
                id: "css_companion_settings",
                title: "CSS Companion",
                form: {
                    watching: {
                        label: "Watching",
                        description:
                            "Whether the CSS is currently being watched and" +
                            "synced with with current theme in realtime",
                        type: "checkbox",
                        value: CSSCompanion.watching,
                        condition: (form: any) => form.file !== undefined,
                    },
                    file: {
                        label: "Watch file",
                        description:
                            "The file to watch. It must be a .css file, if you wish to use " +
                            "a preprocessor make sure it automatically transpiles to css",
                        type: "file",
                        extensions: ["css"],
                        filetype: "CSS Stylesheet",
                        value: CSSCompanion.watchFile,
                    },
                },
                buttons: ["Close"],
                onFormChange: (form: any) => {
                    updateState(form.watching, form.file, "dialog");
                },
                onCancel: () => {
                    settingsDialog.hide();
                },
            } as any);

            const openAction = plugin.createAction("css_companion_window", {
                name: "CSS Companion...",
                icon: "link",
                click: () => settingsDialog.show(),
            });
            MenuBar.addAction(openAction, "file.preferences");
        },
        onunload: () => {
            if (watcher !== undefined) {
                watcher.close();
                watcher = undefined;
            }

            MenuBar.removeAction("file.preferences.css_companion_window");
            (settingsDialog.hide() as any).delete();
        },
    },
    {
        storage: true,
    }
);
plugin.register();

function fileUpdate(filePath: string) {
    if (filePath !== CSSCompanion.watchFile) {
        return;
    }

    if (existsSync(filePath)) {
        readFile(filePath, "utf-8", (err, data) => {
            if (err) {
                return console.error(err);
            }
            CustomTheme.data.css = data.toString();
        });
    }
}

function updateState(watching: boolean, watchFile: string, from: "init" | "dialog") {
    if (watchFile?.length === 0) {
        watchFile = undefined;
    }

    const previousWatchingState = CSSCompanion.watching;
    const previousFile = CSSCompanion.watchFile;

    CSSCompanion.watching = watching;
    CSSCompanion.watchFile = watchFile;
    if (from !== "init") {
        plugin.storage.set("watching", watching ? true : undefined);
        plugin.storage.set("watch_file", watchFile);
    }
    if (from === "dialog" && settingsDialog !== undefined) {
        (settingsDialog as any).form.watching.value = watching;
        (settingsDialog as any).form.file.value = watchFile;
    }

    if (previousWatchingState !== watching || previousFile !== watchFile) {
        if (watcher !== undefined) {
            watcher.close();
            watcher = undefined;
            console.log("CSS Companion has stopped watching for changes.");
        }
        if (watching && watchFile !== undefined) {
            watcher = fsWatch(CSSCompanion.watchFile);
            watcher.on("add", fileUpdate).on("change", fileUpdate).on("unlink", fileUpdate);
            console.log("CSS Companion is watching file for changes..");
        }
    }
}
