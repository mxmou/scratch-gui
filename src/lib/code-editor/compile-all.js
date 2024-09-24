import getParserOptions from './parser-options';
import * as ToshCompiler from '../tosh/compile';

/**
 * Converts code to blocks in all targets.
 * @param {VirtualMachine} vm - scratch-vm instance.
 * @param {function(string, object): void} setTargetError - Callback that takes a target ID
 *     and an object describing an error (null if there was no error).
 * @returns {boolean} True if the compilation was successful.
 */
export default function compileAllTargets (vm, setTargetError) {
    let success = true;
    for (const target of vm.runtime.targets) {
        if (target.isOriginal && target.code !== null) {
            target.blocks.deleteAllBlocks();

            // Compile code - based on ScriptsEditor.compile from tosh
            const options = getParserOptions(vm, target.id);
            const lines = ToshCompiler.parseLines(target.code, options);
            const stream = lines.slice();

            try {
                ToshCompiler.compile(target, stream);
                setTargetError(target.id, null);
            } catch (err) {
                target.blocks.deleteAllBlocks();
                let lineNumber = lines.length - (stream.length - 1); // -1 because EOF
                lineNumber = Math.min(lineNumber, lines.length - 1);
                lineNumber += 1; // CodeMirror expects 1-based line numbers
                setTargetError(target.id, {
                    lineNumber,
                    message: err.message || err,
                    rendered: false
                });
                success = false;
            }
        }
    }
    return success;
}
