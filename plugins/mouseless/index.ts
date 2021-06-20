// FIXME: split this file

import { mouselessStylesheet } from "@stylesheets";
import { SwathePlugin } from "../../core/plugin";
import { removeFromArray } from "../../core/utils";
import { onlyModifiers } from "./keyboard";

namespace Mouseless {
    export let vimode = false;
}

let statusLine: {
    root: HTMLDivElement,

    state: HTMLSpanElement,
    input: HTMLSpanElement,
};
let lastCapturedEvent: KeyboardEvent;

const plugin = new SwathePlugin(
    "mouseless",
    {
        icon: "keyboard",
        title: "Mouseless",
        author: "Unoqwy",
        description: "Vi-like keybindings in Blockbench",
        variant: "desktop",

        onload: () => {
            Mouseless.vimode = plugin.storage.get("vi-mode");
            (Keybinds as any).capture.push(captureKeys);

            plugin.createAction("toggle_vi_mode", {
                name: "Toggle vi mode",
                icon: "star",
                category: "mouseless",
                click: () => {
                    const newState = (Mouseless.vimode = !Mouseless.vimode);
                    plugin.storage.set("vi-mode", newState || undefined);
                    toggleHook();
                },
            });

            $(document).on("keydown.mouseless", event => {
                if (lastCapturedEvent !== event.originalEvent) {
                    mlv.clearInputStack();
                } else {
                    mlv.handleKeyEvent(event.originalEvent as KeyboardEvent);
                }
                lastCapturedEvent = undefined;
            });

            const viLine = document.createElement("div");
            viLine.id = "mouseless-line";
            const stateSpan = document.createElement("span");
            viLine.appendChild(stateSpan);
            const inputSpan = document.createElement("span");
            inputSpan.id = "mlv-input";
            viLine.appendChild(inputSpan);
            $("#status_bar").prepend(viLine);
            statusLine = {
                root: viLine,
                state: stateSpan,
                input: inputSpan,
            };
            toggleHook();
        },
        onunload: () => {
            removeFromArray((Keybinds as any).capture, captureKeys);
            $(document).off(".mouseless");
            $(statusLine.root).remove();
        },
    },
    { storage: true }
);
plugin.register(true, {
    stylesheet: mouselessStylesheet,
});

function toggleHook() {
    if (statusLine !== undefined) {
        statusLine.state.innerHTML = "Vi-mode: " + (Mouseless.vimode ? "on" : "off");
    }
}

function captureKeys(jqueryEvent: any): boolean {
    if (!(jqueryEvent.originalEvent instanceof KeyboardEvent) || !Mouseless.vimode) {
        return false;
    }

    const event: KeyboardEvent = jqueryEvent.originalEvent;
    if (event.ctrlKey && event.shiftKey && event.key === "I") {
        currentwindow.toggleDevTools();
        return true;
    }

    if (open_menu !== undefined) {
        lastCapturedEvent = event;
    }
    return true;
}

enum InputStackStep {
    None,

    Operator,
    OperatorOptions,
    MotionCount,
    Motion,

    Keybinding,
}

class InputStack {
    at: InputStackStep;

    stack?: string;
    trail?: string;
    op: {
        operator?: Operator;
        motionCount?: number;
    };

    constructor() {
        this.op = {};
        this.reset();
    }

    reset() {
        this.at = InputStackStep.None;
        this.stack = undefined;
        this.trail = undefined;
        delete this.op.operator;
        delete this.op.motionCount;
    }

    appendToTrail(value: string) {
        if (this.trail === undefined) {
            this.trail = value;
        } else {
            this.trail += value;
        }
        if (this.stack === undefined) {
            this.stack = value;
        } else {
            this.stack += value;
        }
    }
}

abstract class Operator {
    abstract exec(motionCount: number, motion: string): void;
}

const specialKeys = ["Tab", "Space"];

class MLV {
    readonly operators: Record<string, Operator> = {};
    readonly keybindings: Record<string, () => void> = {};

    readonly #inputStack: InputStack = new InputStack();

    handleKeyEvent(event: KeyboardEvent) {
        const { key } = event;
        if (key === "Shift" || key === "Control" || key === "Alt" || key === "Meta") {
            return; // let modifiers be modifiers
        }

        if (key === "Escape" || (onlyModifiers(event, { ctrl: true }) && key == "[")) {
            return this.clearInputStack();
        }

        const input = this.#inputStack;
        if (input.at === InputStackStep.MotionCount && /^[+-.0-9]$/.test(key)) {
            if (
                (input.trail !== undefined && (key === "+" || key === "-")) || // minus/plus can only be at the beginning
                (key === "." && (input.trail !== undefined && input.trail.indexOf(".") !== -1)) // dot cannot have a sibling
            ) {
                return this.clearInputStack();
            }

            if (key === "." && (input.trail === undefined || input.trail === "-")) {
                this.appendToTrail("0.");
            } else {
                this.appendToTrail(key);
            }
        } else if (key !== "<" && key !== ">" && (/^[\x22-\x7F]$/.test(key) || specialKeys.includes(key))) {
            // \x22.. -> exlamation mark (\x21) ignore, and space (\x20) is a special char
            if (input.at === InputStackStep.MotionCount) {
                const motionCount = parseFloat(input.trail);
                if (!isNaN(motionCount)) {
                    input.op.motionCount = motionCount;
                }
                input.trail = undefined;
                input.at = InputStackStep.Motion;
            }

            let append = specialKeys.includes(key) ? `<${key}>` : key;
            if (event.ctrlKey) {
                append = "<C-" + append + ">";
            }
            this.appendToTrail(append);

            if (input.at === InputStackStep.None || input.at === InputStackStep.Operator) {
                const operator = this.checkAndReserveInputKind(this.operators, InputStackStep.Operator);
                if (operator instanceof Operator) {
                    input.op.operator = operator;
                    input.at = InputStackStep.MotionCount;
                }
            } else if (input.at === InputStackStep.Motion) {
                // TODO(priority 1): actually support motions...
                if (key === "s" || key === "n") { // very ugly solution will be fixed with TODO above
                    return;
                }

                if (key === "x" || key === "y" || key === "z") {
                    input.op.operator.exec(input.op.motionCount ?? 1, input.trail);
                } else if  (key === "a") {
                    ["x", "y", "z"].forEach(axis => {
                        input.op.operator.exec(input.op.motionCount ?? 1, input.trail.slice(0, -1) + axis);
                    });
                }
                return this.clearInputStack();
            }

            if (input.at === InputStackStep.None || input.at === InputStackStep.Keybinding) {
                const keybinding = this.checkAndReserveInputKind(this.keybindings, InputStackStep.Keybinding);
                if (keybinding !== true) {
                    if (keybinding !== false) {
                        keybinding();
                    }
                    return this.clearInputStack();
                }
            }
        } else {
            return this.clearInputStack();
        }
    }

    /** Returns either the value or whether it's reserved */
    private checkAndReserveInputKind<T>(record: Record<string, T>, reserve: InputStackStep): T | boolean {
        const input = this.#inputStack;
        const val = record[input.trail];
        if (val !== undefined) {
            input.trail = undefined;
            return val;
        } else {
            let multiChoice = Object.keys(record).filter(s => s.startsWith(input.trail)).length != 0;
            if (multiChoice && input.at !== reserve) {
                input.at = reserve;
            }
            return multiChoice;
        }
    }

    appendToTrail(input: string) {
        this.#inputStack.appendToTrail(input);
        statusLine.input.innerHTML = "· " + this.#inputStack.stack;
    }

    clearInputStack() {
        this.#inputStack.reset();
        statusLine.input.innerHTML = "";
    }
}

function edit(title: string, affects: any, makeEdit: () => boolean | void) {
    // TYPINGS: affects
    Undo.initEdit(affects);
    if (makeEdit() !== false) {
        Undo.finishEdit(title);
    } else {
        Undo.cancelEdit();
    }
}

function editSelected(title: string, makeEdit: (elements: any[]) => boolean | void) {
    if (selected.length === 0) {
        return;
    }
    edit(title, { elements: selected }, function () {
        const result = makeEdit(selected);
        if (result === false) {
            return false;
        }
        updateSelection();
    });
}

const AXIS = ["x", "y", "z"];
type Axis = 0 | 1 | 2;

function getAxis(name: string): Axis {
    return AXIS.indexOf(name) as Axis;
}

function moveSelected(step: number, axis: Axis) {
    moveElementsInSpace(step, axis);
}

const mlv = new MLV();

/**
 * Quickly add an operator.
 */
function op(name: string, exec: (motionCount: number, motion: string) => void) {
    mlv.operators[name] = new (class extends Operator {
        exec(motionCount: number, motion: string) {
            exec(motionCount, motion);
        }
    })();
}

op("m", (rel, axis) => {
    editSelected("Move", () => moveSelected(rel, getAxis(axis)));
});
op("r", (rel, axis) => {
    editSelected("Rotate", () => rotateOnAxis(n => n + rel, getAxis(axis)));
});
op("s", (rel, input) => {
    // still needing a  workaround, actual motions are really needed
    const heading = input.length === 2 ? input[0] : undefined;
    const axis = input.slice(-1);
    console.log(heading, axis);
    editSelected("Resize", elements => {
        elements.forEach(element => {
            if (!element.resizable) {
                return;
            }
            if (heading === undefined || heading === "n") {
                element.resize((n: number) => n + rel, getAxis(axis), false, false);
            }
            if (heading === undefined || heading === "s") {
                element.resize((n: number) => n + -rel, getAxis(axis), true, false);
            }
        })
    });
});

mlv.keybindings["u"] = () => Undo.undo();
mlv.keybindings["<C-r>"] = () => Undo.redo();
mlv.keybindings["dd"] = () => (BarItems.delete as any).click();
mlv.keybindings["<C-n>"] = () => (BarItems.add_cube as any).click();
mlv.keybindings["<C-d>"] = () => (BarItems.duplicate as any).click();
mlv.keybindings["<Tab>"] = () => (BarItems.toggle_quad_view as any).click();

mlv.keybindings["<C-h>"] = () => (BarItems.toggle_left_sidebar as any).click();
mlv.keybindings["<C-l>"] = () => (BarItems.toggle_right_sidebar as any).click();
mlv.keybindings["RL"] = () => (BarItems.reload_plugins as any).click();
