import { removeFromArray } from "./utils";

export namespace Mouseless {
    // keep track of added actions to remove them on unload
    const actions: Action[] = [];

    export function createAction(id: string, opts: ActionOptions) {
        registerAction(new Action(id, opts));
    }

    export function registerAction(action: Action) {
        actions.push(action);
    }

    export function unhook() {
        actions.forEach(removeAction);
    }
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
