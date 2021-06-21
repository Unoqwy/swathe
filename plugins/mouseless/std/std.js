/*
Standard vi-mode mappings.
This file is the core implementation of vi-like keybindings hence
mapping coming from here shouldn't be overwritten, but you do you.

See 'defaults.js' for default mappings which are not considered to be std.
*/

module.exports = function () {
    const { map, action } = this;

    map({
        "u": Undo.undo,
        "<C-r>": Undo.redo,

        "dd": action.delete,
    });
};
