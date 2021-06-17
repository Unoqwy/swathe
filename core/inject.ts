export function injectStylesheet(elementId: string, stylesheet: string): HTMLStyleElement {
    const styleElement = document.createElement("style");
    styleElement.id = elementId;
    styleElement.innerHTML = stylesheet;
    $(styleElement).appendTo("head");
    return styleElement;
}
