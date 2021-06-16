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

function toggleMenubar(visible?: boolean) {
    if (visible !== undefined) {
        $("header").toggle(visible);
    } else {
        $("header").toggle();
    }
    const hidden = !$("header").is(":visible");
    $("#page_wrapper").toggleClass("h-100-override", hidden);
    Mouseless.storage.set("menubar_hidden", hidden ? true : undefined);
}

export function load() {
    if (Mouseless.storage.get("menubar_hidden")) {
        toggleMenubar(false);
    }

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

    Mouseless.createAction("toggle_menubar", {
        name: "Toggle Menu Bar",
        icon: "menu_open",
        category: "view",
        click: () => toggleMenubar(),
    });
}
