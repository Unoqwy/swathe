/* This module groups code depending on internal fields of Blockbench.
 * An internal field is anything considered to not be used by plugins and
 * may therefore be suject to breaking changes without warning (hence unstable).
 *
 * Each function should declare a @because annotation listing used internal fields.
 */

import { removeFromArray } from "./utils";

/**
 * Unload an action but avoid calling save to keep it in storage.
 * This allows for plugin reloading and updating by preventing leftovers from previous state
 * yet keeping the user's toolbars as they are.
 *
 * @because Action#postload, Action#positionLookup
 */
export function unloadAction(action: any) {
    // TODO: type def for stable Action fields to use Action instead of any
    delete BarItems[action.id];

    for (const toolbar of action.toolbars) {
        let idx = 0;
        while (idx < toolbar.children.length) {
            const item = toolbar.children[idx];
            if (item === action || item.id === action) {
                toolbar.children.splice(idx, 1);
                if (removeFromArray(item.toolbars, toolbar)) {
                    const position = parseInt(
                        Object.entries(toolbar.positionLookup).find(([_, item]) => item === action)[0]
                    );
                    if (position !== undefined) {
                        if (toolbar.postload === undefined) {
                            toolbar.postload = [];
                        }
                        toolbar.postload.push([action.id, position]);
                    }
                }
            } else {
                idx++;
            }
        }
        toolbar.update();
    }

    if (removeFromArray(Keybinds.actions, action)) {
        const category = action.category;
        const structCategoryActions = Keybinds.structure[category].actions;
        removeFromArray(structCategoryActions, action);
        if (structCategoryActions.length == 0) {
            delete Keybinds.structure[category];
        }
    }

    Object.keys(action).forEach(prop => delete action[prop]);
    action.id = "DISABLED";
}
