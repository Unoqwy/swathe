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
            if (plugin.storage.get("watching")) {
                toggleWatch(true);
            }
            CSSCompanion.watchFile = plugin.storage.get("watch_file");

            settingsDialog = new Dialog({
                id: "css_companion_settings",
                title: "CSS Companion",
                form: {
                    watching: {
                        label: "Watching",
                        description: "Whether the CSS is currently being watched and replicated in realtime",
                        type: "checkbox",
                        value: CSSCompanion.watching,
                        condition: (form: any) => form.file !== undefined,
                    },
                    file: {
                        label: "Watch file",
                        description: "The file to watch. It must be a .css file, if you wish to use a preprocessor make sure it automatically transpiles to css.",
                        type: "file",
                        extensions: ["css"],
                        filetype: "CSS Stylesheet",
                        value: CSSCompanion.watchFile,
                    },
                },
                buttons: ["Close"],
                onFormChange: (form: any) => {
                    toggleWatch(form.watching, CSSCompanion.watchFile !== form.file);
                    CSSCompanion.watchFile = form.file;
                    plugin.storage.set(
                        "watch_file",
                        CSSCompanion.watchFile?.length > 0 ? CSSCompanion.watchFile : undefined
                    );
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
            MenuBar.removeAction("file.preferences.css_companion_window");
            (settingsDialog.hide() as any).delete();
        },
    },
    {
        storage: true,
    }
);
plugin.register();

function fileUpdate(filePath) {
    console.log(filePath, CSSCompanion.watchFile);
//     if (filePath !== CSSCompanion.watchFile) {
// 
//     }
}

function toggleWatch(watch?: boolean, force?: boolean) {
    const previousState = CSSCompanion.watching;
    const watching = (CSSCompanion.watching = watch ?? !CSSCompanion.watching);
    if (settingsDialog !== undefined) {
        (settingsDialog as any).form.watching.value = watching;
    }
    plugin.storage.set("watching", watching ? true : undefined);

    if (previousState !== watching || force) {
        if (watcher !== undefined) {
            watcher.close();
            watcher = undefined;
        }
        if (watching && CSSCompanion.watchFile !== undefined) {
            watcher = fsWatch(CSSCompanion.watchFile);
            watcher.on("add", fileUpdate).on("change", fileUpdate).on("unlink", fileUpdate);
        }
    }
}
