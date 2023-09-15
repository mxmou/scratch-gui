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
        let suggestEnd = false;
        let suggestElse = false;
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
            switch (result.info.shape) {
            case 'c-block':
            case 'c-block cap':
                suggestEnd = true;
                suggestElse = false;
                break;
            case 'if-block':
                suggestEnd = true;
                suggestElse = true;
                break;
            case 'end':
                suggestEnd = false;
                suggestElse = false;
                break;
            case 'else':
                suggestElse = false;
                break;
            }
        }

        return computeHint(context, completer, grammar, {suggestEnd, suggestElse});
    };
}
