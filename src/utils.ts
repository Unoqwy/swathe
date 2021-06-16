export function removeFromArray<T>(array: T[], elt: T): boolean {
    const eltIndex = array.indexOf(elt);
    if (eltIndex != -1) {
        array.splice(eltIndex, 1);
        return true;
    }
    return false;
}
