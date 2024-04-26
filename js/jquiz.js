import {createLexerFromFile, fetchTextContents} from '../quiz-parser/language/util/FileLoader.mjs';
import {ParsingTable} from "../quiz-parser/language/parser/lr_parser/ParsingTable.mjs";
import {LRParser} from "../quiz-parser/language/parser/lr_parser/LRParser.mjs";
import {AbstractSyntaxTree} from "../quiz-parser/language/common/AbstractSyntaxTree.mjs";
import {Token} from "../quiz-parser/language/common/Token.mjs";

const lexer = createLexerFromFile(
    await fetchTextContents('../quiz-parser/syntax/jquiz.lex'),
    'whitespace'
);
const parser = new LRParser(ParsingTable.fromString(
    await fetchTextContents('../quiz-parser/syntax/jquiz.ptbl')
));

/**
 * @type {Object.<string,{
 *     type?: string,
 *     create: function(HTMLElement, ...HTMLElement):void
 * }>}
 */
const objs = {
    'quiz': {
        create: () => {}
    },
    'questions': {
        create: (el) => {
            el.className = 'questions';
        }
    },
    'question': {
        type: 'div',
        create: (el) => {
            el.className = 'question';
        }
    },
    'block': {
        type: 'pre',
        create: (el) => {
            el.className = 'code-block';
        }
    },
    'inline-frq': {
        type: 'span',
        create: (el, ...children) => {
            el.setAttribute('contenteditable', '');
            el.className = 'inline-input';
            el.onkeydown = (evt) => {
                if(evt.key === 'Enter') evt.preventDefault();
            }
        }
    },
};

function parseString(str) {
    return [new Text(str)];
}

/**
 * @param {HTMLElement} el
 * @param {AbstractSyntaxTree|Token} ast
 */
function generateQuizFromAST(el, ast) {
    if(ast instanceof Token) {
        switch (ast.type.name) {
            case 'string': {
                let s = ast.value.substring(1);
                if(s.endsWith('"')) s = s.substring(0, s.length - 1);
                else s += '\n';
                el.append(...parseString(s));
            } break;

            default:
                console.log(ast.type.name);
        }
        return;
    }
    switch (ast.type.name) {
        case 'object': {
            const objType = ast.children[0].value;
            let obj = objs[objType];
            if(obj === undefined) {
                console.log(`Unknown object of type ${objType}`)
                break;
            }
            console.log(objType, obj, ast.children[2].children);

            if(obj.type) {
                const newEl = document.createElement(obj.type);
                ast.children[2].children.forEach(generateQuizFromAST.bind(null, newEl));
                obj.create(newEl, ...newEl.children);
                el.append(newEl);
            }
            else {
                ast.children[2].children.forEach(generateQuizFromAST.bind(null, el));
                obj.create(el);
            }
        } break;

        default:
            console.log(ast.type.name);
    }
}

/**
 * @param {HTMLElement} el
 * @param {string} url
 * @returns {Promise<void>}
 */
export async function generateQuiz(el, url) {
    const string = await fetchTextContents(url);
    const tokens = lexer.lex(string);
    const ast = parser.parseTokens(tokens);

    generateQuizFromAST(el, ast);
}