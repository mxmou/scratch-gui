import assert from './assert';
import blocks from '../code-editor/blocks';

var blocksBySelector = {};

var inputPat = /(%[a-zA-Z](?:\.[a-zA-Z_]+)?)/g;

blocks.forEach(function(block) {
  block.parts = block.spec.split(inputPat);
  block.inputs = block.parts.filter(function(p) { return inputPat.test(p); });
  assert(!blocksBySelector[block.selector], block.selector);
  blocksBySelector[block.selector] = block;
});

var inputShapes = {
  '%b': 'boolean',
  '%c': 'color',
  '%d': 'number-menu',
  '%m': 'readonly-menu',
  '%n': 'number',
  '%s': 'string',
};

var getInputShape = function(input) {
  var s = input.slice(0, 2);
  return inputShapes[s];
};

/* alternative info for stop block */

var osisInfo = {
  category: "control",
  inputNames: ["STOP_OPTION"],
  inputs: ["%m.stop"],
  parts: ["stop", "%m.stop", ""],
  selector: "control_stop",
  shape: "stack",
  spec: "stop %m.stop",
};


export {
  blocks,
  blocksBySelector,
  inputPat,
  getInputShape,

  osisInfo as stopOtherScripts,
};
