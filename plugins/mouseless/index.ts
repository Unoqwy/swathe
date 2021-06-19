// FIXME: split this file

import { SwathePlugin } from "../../core/plugin";
import { removeFromArray } from "../../core/utils";
import { onlyModifiers } from "./keyboard";

namespace Mouseless {
    export let vimode = false;
}

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
                    console.log("Toggled vi mode", newState ? "on" : "off");
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
        },
        onunload: () => {
            removeFromArray((Keybinds as any).capture, captureKeys);
            $(document).off(".mouseless");
        },
    },
    { storage: true }
);
plugin.register();

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
    }
}

abstract class Operator {
    abstract exec(motionCount: number, motion: string): void;
}

const specialKeys = ["Tab"];

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
                (key === "." && input.trail?.indexOf(".") !== -1) // dot cannot lead nor have a sibling
            ) {
                return this.clearInputStack();
            }
            input.appendToTrail(key);
        } else if ((key !== "<" && key !== ">") && (/^[\x00-\x7F]$/.test(key) || specialKeys.includes(key))) {
            if (input.at === InputStackStep.MotionCount) {
                const motionCount = parseFloat(input.trail);
                if (motionCount !== NaN) {
                    input.op.motionCount = motionCount;
                }
                input.trail = undefined;
                input.at = InputStackStep.Motion;
            }

            let append = specialKeys.includes(key) ? `<${key}>` : key;
            if (event.ctrlKey) {
                append = "<C-" + append + ">";
            }
            input.appendToTrail(append);

            if (input.at === InputStackStep.None || input.at === InputStackStep.Operator) {
                const operator = this.checkAndReserveInputKind(this.operators, InputStackStep.Operator);
                if (operator instanceof Operator) {
                    input.op.operator = operator;
                    input.at = InputStackStep.MotionCount;
                }
            } else if (input.at === InputStackStep.Motion) {
                // TODO: actually support motions...
                if (key === "x" || key === "y" || key === "z") {
                    input.op.operator.exec(input.op.motionCount ?? 1, key);
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

    clearInputStack() {
        this.#inputStack.reset();
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

function moveSelected(step: number, axis: "x" | "y" | "z") {
    moveElementsInSpace(step, AXIS.indexOf(axis) as 0 | 1 | 2);
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
    editSelected("Move", () => moveSelected(rel, axis as "x" | "y" | "z"));
});
op("r", (rel, axis) => {
    editSelected("Rotate", () => rotateOnAxis(n => n + rel, AXIS.indexOf(axis) as 0 | 1 | 2));
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
