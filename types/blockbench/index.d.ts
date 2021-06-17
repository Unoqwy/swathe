// Some more type definitions for Blockbench

/// <reference types="./plugin.d.ts"/>

// workaround to get typescript to stop complaining about duplicate declarations and keep compat with 3.8
declare module "bb-types" {
    class Plugin extends BBPlugin {}
}

declare const Prop: any;
declare const Toolbars: { [name: string]: Toolbar };

declare function resizeWindow(event?: any): void;
