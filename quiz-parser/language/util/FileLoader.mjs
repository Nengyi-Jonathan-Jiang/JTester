import Regex from "../lexer/regex/Regex.mjs";
import {compileToDFA} from "../lexer/fsm/NFAtoDFAConverter.mjs";
import {JSymbol} from "../common/JSymbol.mjs";
import {Rule} from "../parser/ParseRule.mjs";
import {SymbolString} from "../parser/SymbolString.mjs";
import {Grammar} from "../parser/grammar/Grammar.mjs";
import {LR1ParseTableBuilder} from "../parser/parser_generator/LR1ParseTableBuilder.mjs";
import {LRParser} from "../parser/lr_parser/LRParser.mjs";
import {Lexer} from "../lexer/lexer.mjs";

export function createLexerFromFile(file_contents, ...ignored_symbols) {
    const lex_rules = file_contents
        .trim()
        .split(/\s*\n\s*/g)
        .filter(i => !i.startsWith('//'))
        .map(i => i.split(':='))
        .map(([a, b]) => ({
            nfa: Regex.parse(
                b?.trim() ?? a.trim().replaceAll(/[()[+*?.\]]/g, '\\$&')
            ).compile(), symbol: JSymbol.get(a.trim())
        }));

    const dfa = compileToDFA(...lex_rules);

    return new Lexer(dfa, ignored_symbols.map(i => JSymbol.get(i)));
}

/**
 * @param {JSymbol} start_symbol
 * @param {string} file_contents
 */
export function createParserFromFile(start_symbol, ...file_contents) {
    let lines = [].concat(
        ...file_contents.map(
            file => file
                .trim()
                .split(/\s*\n\s*/g)
                .filter(i => !i.startsWith('//'))
        )
    );
    const rules = lines
        .map(i => i.split(/\s+/))
        .map(x => {
            let unwrap = true, chained = false;
            /** @type {JSymbol} */
            let lhs;

            let n = x.shift();
            while(true) {
                if(n === "__WRAP__")  unwrap = false;
                else if(n === "__CHAIN__") chained = true;
                else break;

                n = x.shift();
            }

            lhs = JSymbol.get(n);

            if(x.shift() === "__EPSILON__"){
                return new Rule(lhs, new SymbolString(), false, true);
            }
            const rhs = x.map(i => JSymbol.get(i));

            return new Rule(lhs, new SymbolString(...rhs), chained, unwrap);
        });

    const grammar = new Grammar(rules, start_symbol);

    const generator = new LR1ParseTableBuilder(grammar);

    const table = generator.table;

    return new LRParser(table);
}

export async function fetchTextContents(url) {
    return (await fetch(url)).text();
}