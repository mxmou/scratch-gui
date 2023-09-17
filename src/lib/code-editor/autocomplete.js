import * as Earley from '../tosh/earley';
import * as Language from '../tosh/language';
import {computeHint} from '../tosh/app';

/**
 * Returns a tosh completion source for CodeMirror.
 * @param {object} modeCfg - Configuration object for the tosh mode.
 * @param {Array} modeCfg.variables - Variable names.
 * @param {Array} modeCfg.lists - List names.
 * @param {Array} modeCfg.definitions - Custom block definitions.
 * @returns {function} A completion source.
 */
export default function autocomplete (modeCfg) {
    const startGrammar = Language.modeGrammar(modeCfg);
    const startCompleter = new Earley.Completer(startGrammar);
    const defineParser = new Earley.Parser(Language.defineGrammar);
    return context => {
        let grammar = startGrammar;
        let completer = startCompleter;
        const currentLineNumber = context.state.doc.lineAt(context.pos).number;
        let firstLineOfScript = 1;

        let foundDefinition = false;
        for (let lineNumber = currentLineNumber - 1; lineNumber >= 1; --lineNumber) {
            const text = context.state.doc.line(lineNumber).text;
            if (/^[ \t]*$/.exec(text)) { // blank line
                firstLineOfScript = lineNumber;
                break;
            }
            // If we're inside a custom block definition,
            // the parameters need to be added to the grammar
            if (!foundDefinition && Language.isDefinitionLine(text)) {
                foundDefinition = true;
                const tokens = Language.tokenize(text);
                let results;
                try {
                    results = defineParser.parse(tokens);
                } catch {
                    continue;
                }
                grammar = startGrammar.copy();
                Language.addParameters(grammar, results[0].process());
                completer = new Earley.Completer(grammar);
            }
        }

        const shapeStack = [];
        for (let lineNumber = firstLineOfScript; lineNumber < currentLineNumber; ++lineNumber) {
            const text = context.state.doc.line(lineNumber).text;
            const tokens = Language.tokenize(text);
            let results;
            try {
                results = completer.parse(tokens);
            } catch {
                continue;
            }
            const result = results[0].process();
            if (!result) continue;
            const shape = result.info.shape;
            switch (shape) {
            case 'end':
                shapeStack.pop();
                break;
            case 'else':
                shapeStack[shapeStack.length - 1] = 'else';
                break;
            default:
                shapeStack.push(shape);
            }
        }

        return computeHint(context, completer, grammar, {
            suggestEnd: shapeStack.length,
            suggestElse: shapeStack[shapeStack.length - 1] === 'if-block'
        });
    };
}
