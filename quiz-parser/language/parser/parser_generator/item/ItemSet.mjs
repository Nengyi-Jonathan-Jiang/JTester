import {Item} from "./Item.mjs";
import {SSet} from "../../../util/FMap.mjs";

/**
 * @extends SSet<Item>
 */
export class ItemSet extends SSet {
    #repr = '';

    constructor(...items) {
        super(items);
    }

    lock() {
        this.#repr = `{\n    ${[...this].map(i => i.toString()).sort().join('\n    ')}\n}`;
    }

    toString(){
        return this.#repr;
    }

    copy(){
        return new ItemSet(...this);
    }
}