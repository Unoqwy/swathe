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
    // eslint-disable-next-line @typescript-eslint/naming-convention
    min_version: "3.9",
    variant: "both",

    onload: () => {
        Mouseless.hook(cssSource);

        ui.load();

        Mouseless.postInit();
    },
    onunload: () => {
        Mouseless.unhook();
    },
});
