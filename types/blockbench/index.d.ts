// Some more type definitions for Blockbench
// Defining things to any is a quick and dirty solution and should eventually be properly typed.

declare const CustomTheme: any;
declare const Prop: any;
declare const Toolbars: { [name: string]: Toolbar };

declare const Undo: any;
declare const selected: any[];
declare const open_menu: any;
declare const currentwindow: any;

// TOOD: add a wrapper around blockbench globals so that they are namespaced

declare function moveElementsInSpace(difference: number, axis: 0 | 1 | 2): void;
declare function rotateOnAxis(modify: (current: number) => number, axis: 0 | 1 | 2, slider?: boolean): void;
declare function resizeWindow(event?: any): void;
