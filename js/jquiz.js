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

const counter = new class Counter {
    #i = 0;
    getNext() {
        return this.#i++;
    }
}

/**
 * @type {Object.<string,{
 *     type?: string,
 *     create?: function(HTMLElement, ...HTMLElement):void
 * }>}
 */
const objs = {
    'quiz': {},
    'questions': {
        create: (el) => {
            el.className = 'questions';
        }
    },
    'question': {
        type: 'div',
        create: (el) => {
            el.className = 'question';

            const b = document.createElement('span');
            b.className = 'bottom';

            const bl = document.createElement('label');
            const bb = document.createElement('input');
            bb.className = 'check-button';
            bb.type = 'checkbox';
            bl.appendChild(bb);
            b.appendChild(bl);
            el.appendChild(b);
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
        create: (el) => {
            el.className = 'inline-frq';
            const i = document.createElement('span');

            i.setAttribute('contenteditable', '');
            i.className = 'inline-input';
            i.onkeydown = (evt) => {
                if(evt.key === 'Enter') evt.preventDefault();
            }

            el.appendChild(i);

            const c = document.createElement('span');
            c.className = 'correct'
            c.append(el.firstChild);

            el.appendChild(c);
        }
    },
    'mcq': {
        type: 'div',
        create: (el, ...children) => {
            const n = `j-radio-${counter.getNext()}`;
            el.className = 'answer-choices';
            children.map(child => child.firstChild).forEach(i => {
                i.setAttribute('name', n);
                i.setAttribute('type', 'radio');
            })
        }
    },
    'choice': {
        type: 'label',
        create: (el) => {
            el.className = 'answer-choice';

            const i = document.createElement('input');

            el.prepend(i)
        }
    },
    'correct-choice': {
        type: 'label',
        create: (el) => {
            el.className = 'answer-choice correct';

            const i = document.createElement('input');
            i.setAttribute('type', 'radio');

            el.insertBefore(i, el.firstChild)
        }
    },
    'code': {
        type: 'pre'
    },
    'msq': {
        type: 'div',
        create: (el, ...children) => {
            el.className = 'answer-select';
            children.map(child => child.firstChild).forEach(i => {
                i.setAttribute('type', 'checkbox');
            })
        }
    }
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
                el.append(newEl);
                obj.create?.(newEl, ...newEl.children);
            }
            else {
                ast.children[2].children.forEach(generateQuizFromAST.bind(null, el));
                obj.create?.(el);
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