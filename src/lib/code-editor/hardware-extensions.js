const HARDWARE_EXTENSIONS = [
    'microbit',
    'ev3',
    'boost',
    'wedo2',
    'gdxfor'
];

/**
 * Returns the category ID of a block. Can be used to determine which extension it belongs to.
 * @param {string} opcode - The block's opcode.
 * @returns {string} The category ID.
 */
const getCategoryId = opcode => opcode.split('_')[0];

export {
    HARDWARE_EXTENSIONS,
    getCategoryId
};
