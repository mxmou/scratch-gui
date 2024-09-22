import VM from 'scratch-vm';

import * as ToshEarley from '../tosh/earley';
import * as ToshLanguage from '../tosh/language';

function getVariableNamesOfType (variables, type) {
    return Object.values(variables).filter(variable => variable.type === type);
}

/**
 * Returns a configuration object for the tosh mode.
 * @param {VM} vm - scratch-vm instance.
 * @param {string} targetId - ID of the target whose code will be parsed.
 * @returns {{
 *     variables: Array,
 *     lists: Array,
 *     definitions: Array
 * }} The configuration object.
 */
export default function getParserOptions (vm, targetId) {
    const target = vm.runtime.getTargetById(targetId);
    const stage = vm.runtime.getTargetForStage();
    if (!target || !stage) {
        return {
            variables: [],
            lists: [],
            definitions: []
        };
    }

    let variables = getVariableNamesOfType(target.variables, VM.SCALAR_VARIABLE);
    let lists = getVariableNamesOfType(target.variables, VM.LIST_VARIABLE);
    if (!target.isStage) {
        variables = [
            ...variables,
            ...getVariableNamesOfType(stage.variables, VM.SCALAR_VARIABLE)
        ];
        lists = [
            ...lists,
            ...getVariableNamesOfType(stage.variables, VM.LIST_VARIABLE)
        ];
    }

    // Update definitions - based on ScriptsEditor.checkDefinitions from tosh
    const definitions = [];
    const defineParser = new ToshEarley.Parser(ToshLanguage.defineGrammar);
    if (target.code) {
        for (const line of target.code.split('\n')) {
            if (!ToshLanguage.isDefinitionLine(line)) continue;
            const tokens = ToshLanguage.tokenize(line);
            let results;
            try {
                results = defineParser.parse(tokens);
            } catch {
                continue;
            }
            if (results.length > 1) {
                console.log(`ambiguous define. count: ${results.length}`); // eslint-disable-line no-console
                continue;
            }
            definitions.push(results[0].process());
        }
    }

    return {variables, lists, definitions};
}
