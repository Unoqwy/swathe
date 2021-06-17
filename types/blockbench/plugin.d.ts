// PluginOptions conflicts with dom
declare interface BBPluginOptions {
    title: string;
    author: string;
    /** Short description */
    description: string;
    /** Long description showed when queried for (e.g. unfolding in plugin browser).  */
    about?: string;
    icon: string;
    variant: "both" | "desktop" | "web";

    min_version?: string;
    max_version?: string;

    onload?(): void;
    onunload?(): void;
    oninstall?(): void;
    onuninstall?(): void;
}
