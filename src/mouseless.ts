import { removeFromArray } from "./utils";

export namespace Mouseless {
    type StorageData = { [key: string]: any };

    /*
     * Key-Value storage with keys being strings.
     * The data is then stored into localStorage as one json value.
     */
    export class Storage {
        // Storage name, used as the key in localStorage;
        name: string;
        #data: StorageData;

        constructor(name: string, data?: StorageData) {
            this.name = name;
            this.#data = data ?? {};
        }

        get(key: string): any {
            return this.#data[key];
        }

        set(key: string, value: any) {
            if (value === undefined) {
                this.remove(key);
            } else if (this.#data[key] !== value) {
                this.#data[key] = value;
                this.persist();
            }
        }

        remove(key: string) {
            if (delete this.#data[key]) {
                this.persist();
            }
        }

        private persist() {
            localStorage.setItem(this.name, JSON.stringify(this.#data));
        }

        static load(name: string): Storage {
            const jsonData = localStorage.getItem(name);
            return new Storage(name, jsonData !== undefined ? JSON.parse(jsonData) : {});
        }
    }

    var styleElement: HTMLStyleElement;

    // keep track of added actions to remove them on unload
    const actions: Action[] = [];
    export const storage: Storage = Storage.load("mouseless");

    export function createAction(id: string, opts: ActionOptions) {
        actions.push(new Action(id, opts));
    }

    export function hook(cssSource?: string) {
        if (cssSource !== undefined) {
            styleElement = document.createElement("style");
            styleElement.id = "mouseless-css";
            styleElement.innerHTML = cssSource;
            document.getElementsByTagName("head")[0].appendChild(styleElement);
        }
    }

    export function postInit() {
        Object.values(Toolbars).forEach(toolbar => {
            if ((toolbar as any).postload) {
                toolbar.update();
            }
        });
    }

    export function unhook() {
        styleElement.remove();
        actions.forEach(unloadAction);
    }
}

/**
 * Unload an action but avoid calling save to keep it in storage.
 * This allows for plugin reloading and updating by preventing leftovers from previous state
 * yet keeping the user's toolbars as they are.
 */
function unloadAction(action: any) {
    delete BarItems[action.id];

    for (const toolbar of action.toolbars) {
        let idx = 0;
        while (idx < toolbar.children.length) {
            const item = toolbar.children[idx];
            if (item === action || item.id === action) {
                toolbar.children.splice(idx, 1);
                if (removeFromArray(item.toolbars, toolbar)) {
                    const position = parseInt(
                        Object.entries(toolbar.positionLookup).find(([_, item]) => item === action)[0]
                    );
                    if (position !== undefined) {
                        if (toolbar.postload === undefined) {
                            toolbar.postload = [];
                        }
                        toolbar.postload.push([action.id, position]);
                    }
                }
            } else {
                idx++;
            }
        }
        toolbar.update();
    }

    if (removeFromArray(Keybinds.actions, action)) {
        const category = action.category;
        const structCategoryActions = Keybinds.structure[category].actions;
        removeFromArray(structCategoryActions, action);
        if (structCategoryActions.length == 0) {
            delete Keybinds.structure[category];
        }
    }

    Object.keys(action).forEach(prop => delete action[prop]);
    action.id = "DISABLED";
}
