/*
This file defines a bunch of default mappings for vi-mode,
trying to keep some common habits with native keybindings.
Feel free to override them.
*/

module.exports = function () {
    const { map, action } = this;

    map({
        "<C-n>": action.add_cube,
        "<C-g>": action.add_group,
        "<C-d>": action.duplicate,

        "<Tab>": action.toggle_quad_view,
    });
};
