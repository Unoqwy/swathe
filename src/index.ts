import { author, description } from "@package-info";
import { Plugin } from "bb-types";

function removeFromArray<T>(elt: T, array: T[]): boolean {
    const eltIndex = array.indexOf(elt);
    if (eltIndex != -1) {
        array.splice(eltIndex, 1);
        return true;
    }
    return false;
}

function removeAction(action: Action) {
    if (removeFromArray(action, Keybinds.actions)) {
        const category = (action as any).category;
        const structCategoryActions = Keybinds.structure[category].actions;
        removeFromArray(action, structCategoryActions);
        if (structCategoryActions.length == 0) {
            delete Keybinds.structure[category];
        }
    }
}

/**
 * Keep track of injected actions to remove them on unload.
 */
namespace InjectionStore {
    const actions: Action[] = [];

    export function registerAction(action: Action) {
        actions.push(action);
    }

    export function unhook() {
        actions.forEach(removeAction);
    }
}

function sidebarAction(id: string, sides: string[], changeState: boolean | "toggle", opts: Partial<ActionOptions>) {
    InjectionStore.registerAction(
        new Action(id, {
            ...opts,
            category: "view",
            click: () => {
                sides
                    .map(side => `show_${side}_bar`)
                    .forEach(side => {
                        Prop[side] = changeState == "toggle" ? !Prop[side] : changeState;
                    });
                resizeWindow();
            },
        } as ActionOptions)
    );
}

Plugin.register("mouseless", {
    icon: "keyboard",
    title: "Blockbench Mouseless",
    author: author,
    description: description,
    variant: "both",

    onload: () => {
        sidebarAction("toggle_left_sidebar", ["left"], "toggle", {
            name: "Toggle Left Sidebar",
            icon: "chevron-left",
        });
        sidebarAction("toggle_right_sidebar", ["right"], "toggle", {
            name: "Toggle Right Sidebar",
            icon: "chevron-right",
        });
        sidebarAction("hide_sidebars", ["left", "right"], false, {
            name: "Hide both sidebars",
            icon: "expand-arrows",
        });
        sidebarAction("show_sidebars", ["left", "right"], true, {
            name: "Show both sidebars",
            icon: "compress-arrows",
        });
    },
    onunload: () => {
        InjectionStore.unhook();
    },
});
