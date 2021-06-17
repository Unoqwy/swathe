# Goals I want to achieve with mouseless

This document is an example-driven draft explaining the goals of mouseless and will serve as a reference for the implementation.  
Mainly made for me not to forget what I already thought about.

## Vim-like keybindings

Precise, efficient, pleasant to work with keybindings.

`m-50x` -> move by `-50` on the x axis  
`s3.85x` -> set x to `3.85` or `mt3.85x` -> move to `3.85` x  
`mp1x` -> move pivot by 1 x  
`r45y` -> rotate by 45 degrees on the y axis  
`/ok<CR>` -> look for cubes or groups named `ok` and go next/prev with `n`/`N`

Note: `m` name conflict with mark which could be used to mark groups to quickly go back to them  
e.g. if `m` meant mark:

`mc/head<CR>2jdd'c` : will delete second element in head and select back whatever cube you had selected

- `mc` - mark current as `c`
- `/head<CR>` - go to group named head
- `2j` - go to 2nd child (group selected so j is first child and 2j second)
- `dd` - delete selected elt
- `'c` - go back to current

Possible solutions :

- rename move to go or shift, but the terminology sounds weird
- use `M` to mark because it can be achieved with `50%` anyway

### Macros

Now the big question is should mouseless support macros?

### Config and File Format

Configuration file will be a `.mouselessrc` or `$HOME/.config/Blockbench/mouseless.mlv`.

This will introduce a custom file format, MLV (MouseLess Vi).
The syntax will resemble Vimscript with less features but some keywords and options are yet to be determined.

Thoughts:

`emap`, `pmap`, `amap` - Edit, Paint, Animate keymaps?

`imap` change native inputs editing behavior? not sure it is worth it

## Keymap layers

Since vim-like keybindings will take a large part of the keyboard, it _will_ conflict with regular keybidings.

A naive approach would be to completely replace keybindings with vim-like, which will effectively make the regular
Keybindings configuration useless but since vim-like keybindings will have their own config file, it would be fine.  
A better approach would be to implement keymap layers which are basically an enhanced version of
"switch between regular and vim-like keybindings" and would allow multiple layers of regular keybindings as well.
This would inject a "Layer" dropdown in native Keybindings dialog, or [more likely] deprecate the native dialog and create a custom one.

The most likely option to go with at first is a simple toggle between regular and vim-like keybindings.
Then maybe implement actual layers later, but I'm not entierely conviced of the usefulness of it.
