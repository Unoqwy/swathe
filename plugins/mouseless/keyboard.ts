type ModifiersSelection = {
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
};

/**
 * Check if a KeyboardEvent has the wanted modifiers and not any other.
 */
export function onlyModifiers(event: KeyboardEvent, modifiers: ModifiersSelection) {
    return (
        event.ctrlKey === (modifiers.ctrl ?? false) &&
        event.shiftKey === (modifiers.shift ?? false) &&
        event.altKey === (modifiers.alt ?? false) &&
        event.metaKey === (modifiers.meta ?? false)
    );
}
