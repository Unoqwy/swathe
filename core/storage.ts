export type StorageData = { [key: string]: any };

/**
 * Key-Value storage with keys being strings.
 * The data is then stored into localStorage as one json value.
 */
export class Storage {
    /** Storage name, used as the key in localStorage */
    name: string;
    #data: StorageData;

    constructor(name: string, data?: StorageData) {
        this.name = name;
        this.#data = data ?? {};
    }

    get(key: string): any {
        return this.#data[key];
    }

    set(key: string, value: any) {
        if (value === undefined) {
            this.remove(key);
        } else if (this.#data[key] !== value) {
            this.#data[key] = value;
            this.persist();
        }
    }

    remove(key: string) {
        if (delete this.#data[key]) {
            this.persist();
        }
    }

    private persist() {
        localStorage.setItem(this.name, JSON.stringify(this.#data));
    }

    static load(name: string): Storage {
        const jsonData = localStorage.getItem(name);
        return new Storage(name, jsonData !== undefined ? JSON.parse(jsonData) : {});
    }
}
