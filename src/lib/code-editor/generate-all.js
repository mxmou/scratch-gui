import * as ToshCompiler from '../tosh/compile';

/**
 * Converts blocks to code in all targets that don't yet have code.
 * @param {VirtualMachine} vm - scratch-vm instance.
 */
export default function generateAllTargets (vm) {
    for (const target of vm.runtime.targets) {
        if (target.code === null) {
            target.code = ToshCompiler.generate(target.blocks);
        }
    }
}
