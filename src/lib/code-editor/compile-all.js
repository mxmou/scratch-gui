import getParserOptions from './parser-options';
import * as ToshCompiler from '../tosh/compile';
import {setTargetError, resetTargetScrollPos} from '../../reducers/code-editor';
import {activateTab, BLOCKS_TAB_INDEX} from '../../reducers/editor-tab';

/**
 * Converts code to blocks in all targets.
 * @param {VirtualMachine} vm - scratch-vm instance.
 * @param {function(object): void} dispatch - The dispatch function.
 * @returns {boolean} True if the compilation was successful.
 */
export default function compileAllTargets (vm, dispatch) {
    let success = true;
    let firstTargetWithError = null;
    let editingTargetHasError = false;
    for (const target of vm.runtime.targets) {
        if (target.isOriginal && target.code !== null) {
            target.blocks.deleteAllBlocks();

            // Compile code - based on ScriptsEditor.compile from tosh
            const options = getParserOptions(vm, target.id);
            const lines = ToshCompiler.parseLines(target.code, options);
            const stream = lines.slice();

            try {
                ToshCompiler.compile(target, stream);
                dispatch(setTargetError(target.id, null));
            } catch (err) {
                target.blocks.deleteAllBlocks();
                let lineNumber = lines.length - (stream.length - 1); // -1 because EOF
                lineNumber = Math.min(lineNumber, lines.length - 1);
                lineNumber += 1; // CodeMirror expects 1-based line numbers
                dispatch(setTargetError(target.id, {
                    lineNumber,
                    message: err.message || err,
                    rendered: false
                }));
                success = false;
                if (!firstTargetWithError) firstTargetWithError = target;
                if (target === vm.editingTarget) editingTargetHasError = true;
            }
        }
    }
    if (!success) {
        // Make sure the error message is visible
        // Reseting the scroll position tells CodeEditor to scroll to the line with the error
        dispatch(activateTab(BLOCKS_TAB_INDEX));
        if (editingTargetHasError) {
            dispatch(resetTargetScrollPos(vm.editingTarget.id));
        } else {
            vm.setEditingTarget(firstTargetWithError.id);
            dispatch(resetTargetScrollPos(firstTargetWithError.id));
        }
    }
    return success;
}
