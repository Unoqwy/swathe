# Swathe - A collection of Blockbench plugins

## Plugins

| Plugin        | About                                        | Links                                                                     |
| ---           | ---                                          | ---                                                                       |
| CSS Companion | Sync a CSS file to edit a theme in real-time | [usage][cc-readme] [download][cc-cdn] · [source](./plugins/css-companion) |

[cc-readme]: ./plugins/css-companion/README.md
[cc-cdn]: https://cdn.jsdelivr.net/gh/Unoqwy/blockbench-mouseless@dist/css_companion.js

A bundled version of each plugin is automatically deployed on the [dist](https://github.com/Unoqwy/blockbench-mouseless/tree/dist) branch.  
The download link of a plugin will therefore always be up to date with the source code.

### Installation instructions

1. Copy the `download` link of a plugin you wish to install
2. In Blockbench, go to `File -> Plugins`
3. Click on the button "Load Plugin from URL" on top of the dialog

#### Need to update?

If you want to update a plugin you already installed to the latest version, 
go back to `File -> Plugins`, and click `Reload` next to the plugin.

## Project Structure

### Why a monorepo

The benefits of using a monorepo for Swathe include:

- Share the same lints and CI jobs without having duplicated code over multiple repos
- Easier to maintain, when changes are made to the core, it instantly reflects on plugins
- Centralised packing and distribution
