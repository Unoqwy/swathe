import { Plugin } from "bb-types";
import { injectStylesheet } from "./inject";
import { Storage } from "./storage";
import { unloadAction } from "./unstable";

type PluginInitOptions = {
    storage?: Storage;
};

type PluginHookOptions = {
    stylesheet?: string;
};

type RegisterEventOptions = {
    before?: () => void;
    after?: () => void;
};

type FunctionProperties<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export class SwathePlugin {
    /** Constant identifier of the plugin, with no spaces. Format enforced. */
    readonly id: string;
    /** Blockbench plugin options */
    readonly options: BBPluginOptions;

    /** Local storage for the plugin */
    readonly storage?: Storage;
    /** Element containing injected stylesheet, if any */
    readonly styleElement?: HTMLStyleElement;

    #actions: Action[] = [];

    constructor(id: string, options: BBPluginOptions, initOpts?: PluginInitOptions) {
        if (/[^a-z0-9_]/.test(id)) {
            throw new Error("Invalid plugin id! It must be alphanumeric and lowercase.");
        }

        this.id = id;
        this.options = options;
        this.storage = initOpts?.storage;
    }

    register(autoHook: boolean = true, hookOpts?: PluginHookOptions) {
        const bindHandlers = ["oninstall", "onuninstall", "onload", "onunload"];
        for (const bindHandler of bindHandlers) {
            if (this.options[bindHandler] !== undefined) {
                this.options[bindHandler] = this.options[bindHandler].bind(this);
            }
        }
        if (autoHook) {
            this.registerEvent("onload", { before: () => this.hook(hookOpts), after: this.postInit.bind(this) });
            this.registerEvent("onunload", { after: this.unhook.bind(this) });
        }
        Plugin.register(this.id, this.options);
    }

    private registerEvent(event: FunctionProperties<BBPluginOptions>, opts?: RegisterEventOptions) {
        const originalHandler = this.options[event];
        this.options[event] = function () {
            if (opts?.before) {
                opts.before();
            }
            if (originalHandler !== undefined) {
                originalHandler();
            }
            if (opts?.after) {
                opts.after();
            }
        };
    }

    hook(opts?: PluginHookOptions) {
        if (opts?.stylesheet) {
            injectStylesheet(`swathe-plugin-${this.id}`, opts.stylesheet);
        }
    }

    postInit() {
        Object.values(Toolbars).forEach(toolbar => {
            if ((toolbar as any).postload) {
                toolbar.update();
            }
        });
    }

    unhook() {
        this.styleElement?.remove();
        this.#actions.forEach(unloadAction);
    }

    createAction(id: string, opts: ActionOptions) {
        this.#actions.push(new Action(id, opts));
    }
}
