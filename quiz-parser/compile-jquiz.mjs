import {readFileSync, writeFileSync} from 'fs'
import {JSymbol} from "./language/common/common.mjs"

import {createParserFromFile} from "./language/util/FileLoader.mjs";

const parser = createParserFromFile(
    JSymbol.get('program'),
    readFileSync('./syntax/jquiz.bnf', 'utf8'),
);
const pTable = parser.table;
writeFileSync('./syntax/jquiz.ptbl', pTable.toString());