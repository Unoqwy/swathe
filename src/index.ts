import { author, description } from "@package-info";
import { cssSource } from "@bundle";

import { Plugin } from "bb-types";
import { Mouseless } from "./mouseless";

import * as ui from "./ui";

Plugin.register("mouseless", {
    icon: "keyboard",
    title: "Blockbench Mouseless",
    author: author,
    description: description,
    variant: "both",

    onload: () => {
        Mouseless.hook(cssSource);

        ui.load();
    },
    onunload: () => {
        Mouseless.unhook();
    },
});
