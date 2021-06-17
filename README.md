# Swathe - A collection of Blockbench plugins

Stage: Draft. This will be updated when the project reaches a usable state.

## Plugins

A bundled version of each plugin is automatically deployed on the [dist](https://github.com/Unoqwy/blockbench-mouseless/tree/dist) branch.

TOOD: table with plugins/desc/installation  
automatically generate this section from plugins' packages? maybe as PLUGIN.md?

## Project Structure

### Why a monorepo

The benefits of using a monorepo for Swathe include:

- Share the same lints and CI jobs without having duplicated code over multiple repos
- Easier to maintain, when changes are made to the core, it instantly reflects on plugins
- Centralised packing and distribution
