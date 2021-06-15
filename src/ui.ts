import { Mouseless } from "./mouseless";

function sidebarAction(id: string, sides: string[], changeState: boolean | "toggle", opts: Partial<ActionOptions>) {
    Mouseless.createAction(id, {
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
    } as ActionOptions);
}

export function load() {
    sidebarAction("toggle_left_sidebar", ["left"], "toggle", {
        name: "Toggle Left Sidebar",
        icon: "chevron_left",
    });
    sidebarAction("toggle_right_sidebar", ["right"], "toggle", {
        name: "Toggle Right Sidebar",
        icon: "chevron_right",
    });
    sidebarAction("hide_sidebars", ["left", "right"], false, {
        name: "Hide both sidebars",
        icon: "unfold_more",
    });
    sidebarAction("show_sidebars", ["left", "right"], true, {
        name: "Show both sidebars",
        icon: "unfold_less",
    });
}
