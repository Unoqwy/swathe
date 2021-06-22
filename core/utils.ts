/**
 * Remove an element from `array` and returns the index it had or -1 if the lement wasn't present.
 */
function indexedRemoveFromArray<T>(array: T[], element: T): number {
    const index = array.indexOf(element);
    if (index != -1) {
        array.splice(index, 1);
    }
    return index;
}

/**
 * Try to remove an element from `array` and returns whether it was succesful.
 */
export function removeFromArray<T>(array: T[], element: T): boolean {
    return indexedRemoveFromArray(array, element) !== -1;
}
