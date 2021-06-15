export function removeFromArray<T>(elt: T, array: T[]): boolean {
    const eltIndex = array.indexOf(elt);
    if (eltIndex != -1) {
        array.splice(eltIndex, 1);
        return true;
    }
    return false;
}
