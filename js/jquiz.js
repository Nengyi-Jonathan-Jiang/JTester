import {createLexerFromFile, fetchTextContents} from '../quiz-parser/language/util/FileLoader.mjs';
import {ParsingTable} from "../quiz-parser/language/parser/lr_parser/ParsingTable.mjs";
import {LRParser} from "../quiz-parser/language/parser/lr_parser/LRParser.mjs";
import {AbstractSyntaxTree} from "../quiz-parser/language/common/AbstractSyntaxTree.mjs";
import {Token} from "../quiz-parser/language/common/Token.mjs";

const lexer = createLexerFromFile(
    await fetchTextContents('../quiz-parser/syntax/jquiz.lex'),
    'whitespace', 'comment'
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
    'section': {
        type: 'div'
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
            i.setAttribute('spellcheck', 'false')
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
    'frq': {
        type: 'div',
        create: (e, ...children) => {
            e.className = 'frq-container';

            const el = document.createElement('pre');
            e.appendChild(el);

            const correct = document.createElement('pre');
            correct.className = 'code-block correct';
            correct.append(...children);
            e.appendChild(correct);

            el.className = 'code-block frq';
            el.setAttribute('contenteditable', '');
            el.setAttribute('spellcheck', 'false');
            el.onkeyup = evt => {
                if(evt.key === 'Enter') {
                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
            }

            if(!el.lastChild) {
                el.appendChild(new Text('\n'));
            }
            if(!el.lastChild.textContent.endsWith('\n')) {
                el.lastChild.textContent += '\n';
            }

            el.onkeydown = (evt) => {
                if(evt.key === 'Enter') {
                    const range = window.getSelection().getRangeAt(0);
                    range.deleteContents();

                    if(!range.startContainer) {
                        console.log('no more start container');
                    }

                    const p = range.startOffset;
                    const t = range.startContainer.textContent;
                    range.startContainer.textContent = t.substring(0, p) + '\n' + t.substring(p);
                    range.setStart(range.startContainer, p + 1);
                    range.collapse(true);

                    evt.preventDefault();
                    evt.stopImmediatePropagation();
                }
                if(!el.lastChild) {
                    el.appendChild(new Text('\n'));
                    window.getSelection().getRangeAt(0).setStart(el.lastChild, el.lastChild.textContent.length);
                    window.getSelection().getRangeAt(0).collapse();
                }
                if(!el.lastChild.textContent.endsWith('\n')) {
                    el.lastChild.textContent += '\n';
                    window.getSelection().getRangeAt(0).setStart(el.lastChild, el.lastChild.textContent.length);
                    window.getSelection().getRangeAt(0).collapse();
                }
            }
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
            if(obj.type) {
                const newEl = document.createElement(obj.type);
                ast.children[2].children.forEach(generateQuizFromAST.bind(null, newEl));
                el.append(newEl);
                obj.create?.(newEl, ...newEl.childNodes);
            }
            else {
                ast.children[2].children.forEach(generateQuizFromAST.bind(null, el));
                obj.create?.(el);
            }
        } break;
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