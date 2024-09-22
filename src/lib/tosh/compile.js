import VM from 'scratch-vm';

import assert from './assert';
import * as Scratch from './commands';
import * as Earley from './earley';
import * as Language from './language';
import uid from '../uid';

function cAssert(value, message) {
  if (!value) throw new Error(message || "There's a problem here");
}


/* parse lines */

function parseLines(code, options) {
  var Parser = Earley.Parser;
  var startGrammar = Language.modeGrammar(options);
  var grammar = startGrammar;
  var parser = new Parser(grammar);

  var stream = [];
  code.split('\n').forEach(function(line) {
    var result = parseLine(line, parser);
    stream.push(result);

    // if definition, add parameters to scope
    if (result.info.selector === 'procedures_definition') {
      grammar = startGrammar.copy();
      Language.addParameters(grammar, result);
      parser = new Parser(grammar);
    }

    // if blank line, pop parameters from scope
    if (result.info.shape === 'blank') {
      grammar = startGrammar;
      parser = new Parser(grammar);
    }
  });
  return stream;
}

function parseLine(line, parser) {
  var tokens = Language.tokenize(line);
  if (!tokens.length) {
    return {info: {shape: 'blank'}};
  }

  var results;
  try {
    results = parser.parse(tokens);
  } catch (err) {
    return {info: {shape: 'error', error: err.message}};
  }

  var result = results[0];
  result = result.process();
  return result;
}


/***************************************************************************/

/* compile: tosh -> AST */

function compile(target, lines) {
  lines.push({info: {shape: 'eof'}});
  var stream = new Stream(lines);
  compileFile(target, stream);

  var gap = 48;
  var y = gap;
  var hatHeight = 16;
  var defineHatHeight = 20;
  target.blocks.getScripts().forEach(function(blockId) {
    var topBlock = target.blocks.getBlock(blockId);
    var info = Scratch.blocksBySelector[topBlock.opcode];
    topBlock.x = gap;
    if (topBlock.opcode === 'procedures_definition')
      topBlock.y = y + defineHatHeight;
    else if (info && info.shape === 'hat') topBlock.y = y + hatHeight;
    else topBlock.y = y;
    var height = measureStack(target.blocks, topBlock);
    y += height + gap;
  });
}


function Stream(lines) {
  this.lines = lines;
}
Stream.prototype.peek = function() {
  var value = this.lines[0];
  cAssert(value);
  return value;
};
Stream.prototype.shift = function() {
  var value = this.lines.shift();
  while (this.lines.length && !this.lines[0]) {
    this.lines.shift(); // skip comments
  }
  return value;
};



// line-level parser

function compileFile(target, stream) {
  while (true) {
    switch (stream.peek().info.shape) {
      case 'blank':
        stream.shift();
        break;
      case 'eof':
        return;
      default:
        compileScript(target, stream);
        switch (stream.peek().info.shape) {
          case 'blank':
            break;
          case 'eof':
            return;
          case 'error':
            var info = stream.peek().info;
            throw new Error(info.error);
          default:
            cAssert(false, "Expected a blank line");
        }
    }
  }
}

function compileScript(target, stream) {
  switch (stream.peek().info.shape) {
    case 'reporter':
    case 'predicate':
      compileReporter(target, stream.shift(), null);
      break;
    default:
      var first = compileBlock(target, stream, null);
      if (first) compileBlocks(target, stream, first.id);
  }
}

function compileBlocks(target, stream, parentId) {
  if (stream.peek().info.shape === 'ellips') {
    stream.shift();
  }
  var firstBlock = null;
  var block = target.blocks.getBlock(parentId);
  var nextBlock;
  while (true) {
    switch (stream.peek().info.shape) {
      case 'cap':
      case 'c-block cap':
        nextBlock = compileBlock(target, stream, parentId);
        if (nextBlock) {
          if (block) block.next = nextBlock.id;
          block = nextBlock;
          if (!firstBlock) firstBlock = block;
        }
        return firstBlock;
      default:
        nextBlock = compileBlock(target, stream, parentId);
        if (nextBlock) {
          if (block) block.next = nextBlock.id;
          block = nextBlock;
          if (!firstBlock) firstBlock = block;
          parentId = block.id;
        } else {
          return firstBlock;
        }
    }
  }
}

function compileBlock(target, stream, parentId) {
  var block;
  var scratchBlock = makeBlock(parentId);
  var inputBlock;
  switch (stream.peek().info.shape) {
    case 'c-block':
    case 'c-block cap':
      block = stream.shift();
      scratchBlock.opcode = block.info.selector;
      compileInputs(target, scratchBlock, block.args, block.info);

      inputBlock = compileBlocks(target, stream, scratchBlock.id);
      if (inputBlock) {
        scratchBlock.inputs.SUBSTACK = {
          name: 'SUBSTACK',
          block: inputBlock.id
        };
      }
      cAssert(stream.peek().info.shape === 'end', 'Expected "end"');
      stream.shift();
      break;
    case 'if-block':
      block = stream.shift();
      compileInputs(target, scratchBlock, block.args, block.info);

      inputBlock = compileBlocks(target, stream, scratchBlock.id);
      if (inputBlock) {
        scratchBlock.inputs.SUBSTACK = {
          name: 'SUBSTACK',
          block: inputBlock.id
        };
      }

      scratchBlock.opcode = 'control_if';
      switch (stream.peek().info.shape) {
        case 'else':
          scratchBlock.opcode = 'control_if_else';
          stream.shift();

          inputBlock = compileBlocks(target, stream, scratchBlock.id);
          if (inputBlock) {
            scratchBlock.inputs.SUBSTACK2 = {
              name: 'SUBSTACK2',
              block: inputBlock.id
            };
          }

          // falls through
        case 'end':
          cAssert(stream.peek().info.shape === 'end', 'Expected "end"');
          stream.shift();
          break;
        default:
          cAssert(false, 'Expected "else" or "end"');
      }
      break;
    case 'cap':
    case 'stack':
      block = stream.shift();
      scratchBlock.opcode = block.info.selector;
      if (block.info.isCustom) {
        var inputIds = block.info.inputs.map(
          (input, index) => index.toString()
        );
        block.info.inputNames = inputIds;
        scratchBlock.opcode = 'procedures_call';
        scratchBlock.mutation = makeMutation();
        scratchBlock.mutation.proccode = block.info.spec;
        scratchBlock.mutation.argumentids = JSON.stringify(inputIds);
      }
      if (block.info.selector === 'control_stop') {
        scratchBlock.mutation = makeMutation();
        scratchBlock.mutation.hasnext =
          JSON.stringify(['all', 'this script'].indexOf(block.args[0]) === -1);
      }
      compileInputs(target, scratchBlock, block.args, block.info);
      break;
    case 'hat':
      if (parentId === null) {
        block = stream.shift();
        scratchBlock.opcode = block.info.selector;
        if (block.info.selector === 'procedures_definition') {
          var [spec, inputNames, defaults, isAtomic] = block.args;
          var inputIds = inputNames.map((name, index) => index.toString());
          var prototype = makeBlock(scratchBlock.id);
          prototype.opcode = 'procedures_prototype';
          prototype.shadow = true;
          prototype.mutation = makeMutation();
          prototype.mutation.proccode = spec;
          prototype.mutation.argumentids = JSON.stringify(inputIds);
          prototype.mutation.argumentnames = JSON.stringify(inputNames);
          prototype.mutation.argumentdefaults = JSON.stringify(defaults);
          prototype.mutation.warp = JSON.stringify(isAtomic);
          target.blocks.createBlock(prototype);
          scratchBlock.inputs.custom_block = {
            name: 'custom_block',
            shadow: prototype.id,
            block: prototype.id
          };
        } else {
          compileInputs(target, scratchBlock, block.args, block.info);
        }
        break;
      }
      // falls through
    default:
      return;
  }
  target.blocks.createBlock(scratchBlock);
  return scratchBlock;
}

function compileReporter(target, b, parentId) {
  var scratchBlock = makeBlock(parentId);
  scratchBlock.opcode = b.info.selector;
  compileInputs(target, scratchBlock, b.args, b.info);
  target.blocks.createBlock(scratchBlock);
  return scratchBlock;
}

function compileInputs(target, scratchBlock, args, info) {
  args.forEach(function(arg, index) {
    var inputName = info.inputNames[index];
    var argIsReporter = !!arg.info;
    if (!argIsReporter && arg.value) arg = arg.value;
    var variableId = null;
    var variableType = null;
    switch (inputName) {
      case 'VARIABLE':
        variableType = VM.SCALAR_VARIABLE;
        break;
      case 'LIST':
        variableType = VM.LIST_VARIABLE;
        break;
      case 'BROADCAST_OPTION':
      case 'BROADCAST_INPUT':
        variableType = VM.BROADCAST_MESSAGE_VARIABLE;
        break;
    }
    if (variableType !== null) {
      var variable = target.lookupVariableByNameAndType(arg, variableType);
      if (variable) {
        variableId = variable.id;
      } else if (variableType === VM.BROADCAST_MESSAGE_VARIABLE) {
        variableId = uid();
        var stage = target.runtime.getTargetForStage();
        stage.createVariable(variableId, arg, variableType);
      }
    }
    var isField = false;
    var shadow = makeBlock(scratchBlock.id);
    shadow.shadow = true;
    switch (Scratch.getInputShape(info.inputs[index])) {
      case 'number':
        shadow.opcode = 'math_number';
        shadow.fields.NUM = {
          name: 'NUM',
          value: argIsReporter ? '' : arg
        };
        break;
      case 'string':
        shadow.opcode = 'text';
        shadow.fields.TEXT = {
          name: 'TEXT',
          value: argIsReporter ? '' : arg
        };
        break;
      case 'color':
        shadow.opcode = 'colour_picker';
        shadow.fields.COLOUR = {
          name: 'COLOUR',
          value: argIsReporter ? '#3373cc' : arg
        };
        break;
      case 'readonly-menu':
        var menuName = info.inputs[index].slice(3);
        if (Language.menusThatAcceptReporters.indexOf(menuName) > -1) {
          shadow.opcode = menuName;
          var fieldName = {
            event_broadcast_menu: 'BROADCAST_OPTION',
            pen_menu_colorParam: 'colorParam'
          }[menuName] || inputName;
          shadow.fields[fieldName] = {
            name: fieldName,
            value: argIsReporter ? '' : arg,
          };
          if (variableId) shadow.fields[fieldName].id = variableId;
        } else {
          isField = true;
          shadow = null;
        }
        break;
      default:
        shadow = null;
    }
    if (isField) {
      // Field
      scratchBlock.fields[inputName] = {
        name: inputName,
        value: arg,
      };
      if (variableId) scratchBlock.fields[inputName].id = variableId;
    } else {
      // Input
      var input = {name: inputName};
      if (shadow) {
        target.blocks.createBlock(shadow);
        input.shadow = shadow.id;
        input.block = shadow.id;
      }
      if (argIsReporter) {
        input.block = compileReporter(target, arg, scratchBlock.id).id;
      }
      scratchBlock.inputs[inputName] = input;
    }
  });
}

function makeBlock(parentId) {
  return {
    id: uid(),
    topLevel: parentId === null,
    parent: parentId,
    shadow: false,
    opcode: 'motion_movesteps',
    fields: {},
    inputs: {},
    next: null
  };
}

function makeMutation() {
  return {
    tagName: 'mutation',
    children: []
  }
}


/***************************************************************************/

/* measure: AST -> height in pixels */

var measureLog = function() {};

function internalHeight(info) {
  var shape = info.shape;
  switch (shape) {
    case 'if-block':    return 80;
    case 'c-block cap': return 40; // "forever"
    case 'cap':         return 8;
    case 'c-block':     return 48;
    case 'stack':       return 16;
    case 'hat':         return 32;
    case 'predicate':   return 8; // ###
    case 'reporter':    return 8; // ###
  }
  throw "internalHeight can't do " + info.selector;
}

function minHeight(info) {
  var shape = info.shape;
  switch (shape) {
    case 'if-block':    return 120;
    case 'c-block cap': return 80;
    case 'cap':         return 48;
    case 'c-block':     return 88;
    case 'stack':       return 56;
    case 'hat':         return 72;
    case 'predicate':   return 40;
    case 'reporter':    return 40;
  }
  throw "minHeight can't do " + info.selector;
}

function emptySlot(inputShape) {
  /* For arguments which are literals, menu options, or just empty */
  switch (inputShape) {
    case 'list':          return 24;
    case 'number':        return 32;
    case 'string':        return 32; // ###
    case 'boolean':       return 32; // ###
    case 'readonly-menu': return 32; // ###
    case 'number-menu':   return 32; // ###
    case 'color':         return 32; // ###
  }
  throw "emptySlot can't do " + inputShape;
}

function measureStack(blocks, topBlock, isCBlockInput, debug) {
  if (debug) measureLog = debug;
  var notchHeight = 8;
  var height = measureBlock(blocks, topBlock);
  if (topBlock.next) {
    height -= notchHeight;
    height += measureStack(
      blocks, blocks.getBlock(topBlock.next), isCBlockInput
    );
  } else if (isCBlockInput) {
    var info = blockInfo(topBlock);
    if (!/cap/.test(info.shape)) height -= notchHeight;
  }
  return height;
}

function blockInfo(block) {
  var selector = block.opcode,
      info;
  switch (selector) {
    case 'procedures_call':
      var spec = block.mutation.proccode;
      var inputIds = JSON.parse(block.mutation.argumentids);
      info = {
        spec: spec,
        parts: spec.split(Scratch.inputPat),
        inputNames: inputIds,
        shape: 'stack',
        category: 'custom',
        selector: null
      };
      info.inputs = info.parts.filter(function(p) { return Scratch.inputPat.test(p); });
      return info;
    default:
      info = Scratch.blocksBySelector[selector];
      if (!info) throw "unknown selector: " + selector;
      return info;
  }
}

function measureBlock(blocks, block) {
  var selector = block.opcode,
      hasInputs;
  if (selector === 'procedures_definition') {
    return 92;
  }
  var info = blockInfo(block);
  if (selector === 'control_stop' && JSON.parse(block.mutation.hasnext)) {
    info.shape = 'stack';
  }

  var internal = internalHeight(info);
  measureLog(internal, "internalHeight", info.selector);

  var argHeight = 0;
  var stackHeight = 0;

  hasInputs = (info.inputs.length
                || /c-block|if-block/.test(info.shape));

  if (!hasInputs) {
    argHeight = 0;

  } else { // has inputs
    var inputNames = info.inputNames.slice();
    if (info.shape.startsWith('c-block')) inputNames.push('SUBSTACK');
    if (info.shape === 'if-block') inputNames.push('SUBSTACK', 'SUBSTACK2');
    for (var i = 0; i < inputNames.length; i++) {
      var inputName = inputNames[i];
      var arg;
      if (Object.prototype.hasOwnProperty.call(block.inputs, inputName)) {
        arg = blocks.getBlock(block.inputs[inputName].block);
        if (block.inputs[inputName].block &&
            block.inputs[inputName].block === block.inputs[inputName].shadow) {
          // Shadow block
          arg = Object.values(blocks.getFields(arg))[0].value;
        }
      } else if (Object.prototype.hasOwnProperty.call(block.fields, inputName)) {
        arg = block.fields[inputName].value;
      } else {
        arg = null;
      }
      var inputShape = info.inputs[i] ? Scratch.getInputShape(info.inputs[i])
                                      : 'list';
      var nonEmpty = (typeof arg === 'object' && arg !== null);
      var foo;
      if (!nonEmpty) {
        foo = emptySlot(inputShape);
        measureLog(foo, "emptySlot", inputShape);
      }

      if (inputShape === 'list') {
        // c-mouth
        if (nonEmpty) {
          foo = measureStack(blocks, arg, true);
        }
        stackHeight += foo;

      } else {
        // arg
        if (nonEmpty) {
          foo = measureBlock(blocks, arg);
        }
        argHeight = Math.max(argHeight, foo);
      }
    }
  }
  var min = minHeight(info);
  // Extension blocks are taller because they have icons
  if (info.category === 'extension') min += 8;
  measureLog(min, "minHeight", info.shape);
  var total = Math.max(internal + argHeight, min) + stackHeight;
  measureLog(total, block);
  return total;
}


/***************************************************************************/

/* generate: AST -> tosh */

var images = {
  '@greenFlag': 'flag',
  '@turnLeft': 'ccw',
  '@turnRight': 'cw',
};

function generate(blocks) {
  var scriptText = [];
  var scripts = blocks.getScripts().slice();
  scripts.sort((a, b) => blocks.getBlock(a).y - blocks.getBlock(b).y);
  for (var i = 0; i < scripts.length; i++) {
    var topBlock = blocks.getBlock(scripts[i]);
    var opcode = blocks.getOpcode(topBlock);

    // standalone reporter?
    var info = Scratch.blocksBySelector[opcode]
    if (info && ['reporter', 'predicate'].includes(info.shape)) {
      // TODO preference to skip all standalone reporters

      // if it contains a parameter -> not valid!
      if (containsParameter(blocks, topBlock)) continue;
    }

    scriptText.push(generateStack(blocks, topBlock).join('\n'));
  }
  var result = scriptText.join('\n\n');

  // enforce trailing blank line
  if (result && result[result.length - 1] !== '\n') result += '\n';
  return result;
}

function containsParameter(blocks, reporter) {
  if (blocks.getOpcode(reporter).startsWith('argument_')) return true;
  var inputs = Object.values(blocks.getInputs(reporter));
  for (var i = 0; i < inputs.length; i++) {
    var arg = inputs[i];
    if (containsParameter(blocks, blocks.getBlock(arg.block))) {
      return true;
    }
  }
  return false;
}

function generateStack(blocks, topBlock) {
  var lines = [];
  var blockId = topBlock.id;
  while (blockId) {
    lines = lines.concat(generateBlock(blocks, blocks.getBlock(blockId)));
    blockId = blocks.getNextBlock(blockId);
  }
  return lines;
}

function generateBlock(blocks, block) {
  var selector = blocks.getOpcode(block),
      inputs = blocks.getInputs(block),
      fields = blocks.getFields(block),
      info = Scratch.blocksBySelector[selector],
      spec,
      result;

  if (selector === 'procedures_call') {
    var mutation = blocks.getMutation(block);
    spec = selector = mutation.proccode;
    info = {
      spec: spec,
      parts: spec.split(Scratch.inputPat),
      inputNames: JSON.parse(mutation.argumentids),
      shape: 'stack',
      category: 'custom',
      selector: null,
      _isCustom: true,
    };
    info.inputs = info.parts.filter(function(p) { return Scratch.inputPat.test(p); });
  } else if (selector === 'procedures_definition') {
    var prototype = blocks.getBlock(blocks.getInputs(block).custom_block.block);
    var mutation = blocks.getMutation(prototype);
    spec = mutation.proccode;
    var names = JSON.parse(mutation.argumentnames),
        isAtomic = mutation.warp === 'true';
    result = isAtomic ? 'define-atomic ' : 'define ';
    return result + spec.split(Scratch.inputPat).map(function(part) {
      var m = Scratch.inputPat.exec(part);
      if (m) {
        var inputShape = Scratch.getInputShape(part);
        var name = names.shift();
        name = name.replace(/ \?$/, "?");
        switch (inputShape) {
          case 'number':  return '(' + name + ')';
          case 'string':  return '(' + name + ')';
          case 'boolean': return '<' + name + '>';
          default: return part + '[' + name + ']';
        }
      } else {
        return part.split(/ +/g).map(function(word) {
          if (word === '\\%') return '%';
          return word;
        }).join(' ');
      }
    }).join('');
  }

  if (!info) return '';

  // top-level reporters
  if (info.shape === 'reporter' || info.shape === 'predicate') {
    return generateReporter(blocks, block, null, -Infinity);
  }

  var level = +Infinity;
  if (info._isCustom) level = -2;
  result = generateParts(blocks, info, inputs, fields, level, selector);

  var lines;
  switch (info.shape) {
    case 'if-block': // if-else
      lines = [result];
      lines = lines.concat(generateMouth(blocks, block, 1));
      lines.push('else');
      lines = lines.concat(generateMouth(blocks, block, 2));
      lines.push('end');
      return lines;
    case 'c-block':
    case 'c-block cap':
      lines = [result];
      lines = lines.concat(generateMouth(blocks, block, 1));
      lines.push('end');
      return lines;
    default:
      return [result];
  }
}

function generateMouth(blocks, block, branchNum) {
  var topBlock = blocks.getBlock(blocks.getBranch(block.id, branchNum));
  var lines = topBlock ? generateStack(blocks, topBlock) : [];
  if (!lines.length) lines = ['...'];
  return indent(lines);
}

function generateReporter(blocks, block, inputShape, outerLevel, outerSelector, argIndex) {
  var selector = blocks.getOpcode(block),
      inputs = blocks.getInputs(block),
      fields = blocks.getFields(block),
      info = Scratch.blocksBySelector[selector];

  if (!info) return '';

  var level = Language.precedence[selector] || 0;

  var result = generateParts(blocks, info, inputs, fields, level, selector);

  var needsParens = (level > outerLevel
                  || (selector === 'operator_or' &&
                      outerLevel === Language.precedence.operator_and)
                  || (selector === 'operator_and' &&
                      outerLevel === Language.precedence.operator_or)
                  || inputShape === 'color'
                  || (inputShape !== 'boolean' && info.shape === 'predicate')
                  // x - (y + z), x / (y * z), x mod (y * z)
                  || (level === outerLevel &&
                      ['operator_subtract', 'operator_divide', 'operator_mod']
                        .indexOf(outerSelector) > -1 &&
                      argIndex === 1)
                  // x * (y mod z)
                  || (level === outerLevel && selector === 'operator_mod' &&
                      argIndex === 1)
                  || inputShape === 'readonly-menu'
                  || selector === 'data_listcontents'
                  || (level === -1 && outerLevel > 0) // join
  );
  if (needsParens) {
    switch (info.shape) {
      case 'predicate': result = '<' + result + '>'; break;
      default:          result = '(' + result + ')'; break;
    }
  }
  return result;
}

function generateParts(blocks, info, inputs, fields, outerLevel, outerSelector) {
  var argIndex = 0;
  var result = [];
  for (var i = 0; i < info.parts.length; i++) {
    var part = info.parts[i];
    var m = Scratch.inputPat.exec(part);
    if (m) {
        var inputShape = Scratch.getInputShape(part);
        var inputName = info.inputNames[argIndex];
        var value;
        if (Object.prototype.hasOwnProperty.call(inputs, inputName)) {
          value = blocks.getBlock(inputs[inputName].block);
          if (inputs[inputName].block &&
              inputs[inputName].block === inputs[inputName].shadow) {
            // Shadow block
            value = Object.values(blocks.getFields(value))[0].value;
          }
        } else if (Object.prototype.hasOwnProperty.call(fields, inputName)) {
          value = fields[inputName].value;
        } else {
          value = null;
        }
        var menu = part.split('.').pop();
        if (value && blocks.getOpcode(value)) {
          // value is a block
          part = generateReporter(blocks, value, inputShape, outerLevel, outerSelector, argIndex);
        } else if (part === '%s' &&
            Language.blocksWithNumberLiterals.indexOf(info.selector) > -1) {
          // string input, that we might show as a number literal
          var isNumber = /^-?(0|[1-9][0-9]*)(\.[0-9]*)?$/.test(value);
          part = isNumber ? '' + value : generateStringLiteral(value);
        } else {
          part = generateLiteral(value, inputShape, menu, outerLevel);
        }
        argIndex += 1;
    } else {
      part = part.split(/( +)/g).map(function(word) {
        if (/[:]$/.test(word)) word += ' ';
        return images[word] || word || '';
      }).join('');
    }
    result.push(part);
  }
  return result.join('').replace(/ +/g, ' ');
}

function generateLiteral(value, inputShape, menu) {
  switch (inputShape) {
    case 'color':
      return generateColorLiteral(value);
    case 'boolean':
      if (!value) return '<>';
      assert(false, 'literal non-false booleans not allowed: ' + value);
      return;
    case 'readonly-menu':
      return generateMenuLiteral(value, menu);
    case 'string':
      return generateStringLiteral(value);
    case 'number':
      // nb. Scratch saves empty number slots as 0
      // so it is always allowable to convert a number slot to zero
      return Number(value) || 0;
    default:
      // TODO
      return value;
  }
}

function generateMenuLiteral(value, menu) {
  if (Language.menuLabels[menu] && Language.menuLabels[menu][value]) {
    return Language.menuLabels[menu][value];
  }
  if (isStringMenu(menu, value)) {
    return generateStringLiteral(value);
  } else {
    if (menu === 'param') {
      value = value.replace(/ \?$/, "?");
    }
    return value;
  }
}

function isStringMenu(menu, value) {
  if ((Language.menusThatAcceptReporters.indexOf(menu) > -1 ||
       Language.menusThatAcceptStrings.indexOf(menu) > -1) &&
      Language.menuOptions[menu].indexOf(value) === -1) {
    return true;
  }
  return false;
}

function generateStringLiteral(value) {
  value = value === undefined ? "" : "" + value;
  return '"' + value.replace(/\\/g, '\\\\')
                    .replace(/"/g, '\\"') + '"';
}

function generateColorLiteral(hex) {
  hex = hex.replace('#', '');
  while (hex.length < 6) hex = '0' + hex;
  if (hex[0] === hex[1] && hex[2] === hex[3] && hex[4] === hex[5]) {
    hex = hex[0] + hex[2] + hex[4];
  }
  return '#' + hex;
}

function indent(lines) {
  return lines.map(function(x) { return '  ' + x; });
}


/***************************************************************************/

/* rename a variable */

// TODO can we abstract out the AST-recursing stuff from generate()?

function renameInScript(mapping, script) {
  var x = script[0], y = script[1], blocks = script[2];
  return [x, y, renameInList(mapping, blocks)];
}

function renameInList(mapping, blocks) {
  if (!blocks) return [];
  return blocks.map(renameInBlock.bind(null, mapping));
}

function renameInBlock(mapping, block) {
  // this is heavily optimised because reasons

  var selector = block[0];
  var info = Scratch.blocksBySelector[selector];
  var shape = info ? info.shape : null;

  if (/if-block/.test(shape) || selector === 'control_if_else') {
    if (block.length > 3) {
      return [selector,
        renameInArg(mapping, block[1]),
        renameInList(mapping, block[2]),
        renameInList(mapping, block[3]),
      ];
    } else {
      return [selector,
        renameInArg(mapping, block[1]),
        renameInList(mapping, block[2]),
      ];
    }
  } else if (/c-block/.test(shape)) {
    if (block.length === 3) {
      return [selector,
        renameInArg(mapping, block[1]),
        renameInList(mapping, block[2]),
      ];
    } else {
      return [selector,
        renameInList(mapping, block[1]),
      ];
    }
  }

  var result = [selector];
  var i = 1;
  if (selector === 'procedures_call') {
    result.push(block[1]);
    i = 2;
  }
  for (; i < block.length; i++) {
    result.push(renameInArg(mapping, block[i]));
  }

  var newArgs = renameInBlockArgs(mapping, selector, result);
  if (newArgs) {
    assert(newArgs.length === block.length - 1);
    result = [selector].concat(newArgs);
  }
  return result;
}

function renameInArg(mapping, value) {
  if (value.constructor === Array) {
    value = renameInBlock(mapping, value);
  }
  return value;
}

function renameInBlockArgs(rename, selector, block) {
  var a = block[1], b = block[2], c = block[3];
  // rename(kind, name, target)
  switch (selector) {
    // variables
    case 'data_variable':
    case 'data_showvariable':
    case 'data_hidevariable':
      return [rename('variable', a)];
    case 'data_setvariableto':
    case 'data_changevariableby':
      return [rename('variable', a), b];

    // variable on other sprite
    case 'sensing_of':
      if (b instanceof Array ||
          a instanceof Array ||
          Language.menuOptions.attribute.indexOf(a) > -1) {
        return [a, b];
      }
      return [rename('variable', a, b), b];

    // lists
    case 'data_listcontents':
    case 'data_showlist':
    case 'data_hidelist':
    case 'data_lengthoflist':
      return [rename('list', a)];
    case 'data_addtolist':
    case 'data_deleteoflist':
    case 'data_itemoflist':
      return [a, rename('list', b)];
    case 'data_insertatlist':
      return [a, b, rename('list', c)];
    case 'data_replaceitemoflist':
      return [a, rename('list', b), c];
    case 'data_listcontainsitem':
      return [rename('list', a), b];

    // parameters
    case 'argument_reporter_string_number':
    case 'argument_reporter_boolean':
      return [rename('parameter', a), b];

    case 'procedures_definition':
      var spec = a,
          names = b,
          defaults = c.slice(),
          isAtomic = block[4];
      var newNames = names.map(function(param) {
        return rename('parameter', param);
      });
      return [rename('custom', spec), newNames, defaults, isAtomic];
    case 'procedures_call':
      return [rename('custom', a)].concat(block.slice(2));
  }
}

/***************************************************************************/


export {
  generate, // AST -> tosh
  parseLines,
  compile,   // tosh -> AST
  renameInScript, // used by format's automatic renaming
  measureStack as _measure, // internal to compile()
};
