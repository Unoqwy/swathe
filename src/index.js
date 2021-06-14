Plugin.register("mouseless", {
    title: "Blockbench Mouseless",
    author: "Unoqwy",
    description: "Add shortcuts to fully take advantage of the keyboard",
    variant: "both",
    icon: "keyboard",

    onload() {
        new Action("toggle_left_sidebar", {
            name: "Toggle Left Sidebar",
            category: "view",
            click: () => Interface.toggleSidebar("left"),
        });
        new Action("toggle_right_sidebar", {
            name: "Toggle Right Sidebar",
            category: "view",
            click: () => Interface.toggleSidebar("right"),
        });
    },
});
