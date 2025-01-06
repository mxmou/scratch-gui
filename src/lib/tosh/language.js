import assert from './assert';
import * as Scratch from './commands';
import * as Earley from './earley';

/* Tokenizer */

var Token = function(kind, text, value) {
  this.kind = kind;
  this.text = text;
  this.value = value;
};

Token.prototype.toString = function() {
  var args = [this.kind, this.text, this.value];
  return "Token(" + args.map(JSON.stringify).join(", ") + ")";
};

Token.prototype.isEqual = function(other) {
  return this.kind === other.kind && this.value === other.value;
};

function getValue(token) {
  return token.value;
}


// TODO should we allow () as an empty number input slot?

var TOKENS = [
  ['ellips',  /\.{3}/],
  ['comment', /\/{2}(.*)$/],
  ['false',   /<>/],
  ['zero',    /\(\)/],
  ['empty',   /_( |$)/],
  ['number',  /([0-9]+(\.[0-9]+)?e-?[0-9]+)/], // 123[.123]e[-]123
  ['number',  /((0|[1-9][0-9]*)?\.[0-9]+)/],   // [123].123
  ['number',  /((0|[1-9][0-9]*)\.[0-9]*)/],    // 123.[123]
  ['number',  /(0|[1-9][0-9]*)/],              // 123
  ['color',   /#([A-Fa-f0-9]{3}(?:[A-Fa-f0-9]{3})?)/],
  ['string',  /"((\\["\\]|[^"\\])*)"/], // strings are backslash-escaped
  ['string',  /'((\\['\\]|[^'\\])*)'/],
  ['lparen',  /\(/],   ['rparen',  /\)/],
  ['langle',  /</],   ['rangle',  />/],
  ['lsquare', /\[/],   ['rsquare', /\]/],
  ['cloud',   /[☁]/],
  ['input',   /%[a-z](?:\.[a-zA-Z]+)?/],
  ['symbol',  /[-%#+*/=^,?]/],                // single character
  ['symbol',  /[_A-Za-z][-_A-Za-z0-9:',.]*/], // word, as in a block
  ['iden',    /[^ \t"'()<>=*/+-]+/],     // user-defined names
];

var backslashEscapeSingle = /(\\['\\])/g;
var backslashEscapeDouble = /(\\["\\])/g;

var whitespacePat = /^(?:[ \t]+|$)/;
var eolPat = /(.*)[ \t]*/;

var tokenize = function(input) {
  var remain = input;

  // consume whitespace
  var leadingWhitespace = '';
  var m = whitespacePat.exec(input);
  if (m) {
    leadingWhitespace = m[0];
    remain = remain.slice(m[0].length);
  }

  var tokens = [];
  var sawWhitespace = true;
  var expectedWhitespace = false;
  while (remain) {
    var kind = null;
    for (var i = 0; i < TOKENS.length; i++) {
      var kindAndPat = TOKENS[i];
      kind = kindAndPat[0];
      var pat = kindAndPat[1];
      m = pat.exec(remain);
      if (m && m.index == 0) {
        var text = m[0];
        var value = m[1] === undefined ? m[0] : m[1];
        break;
      }
    }
    if (i === TOKENS.length) {
      tokens.push(new Token('error', remain, "Unknown token"));
      return tokens;
    }

    if (kind === 'iden' &&
        tokens.length &&
        tokens[tokens.length - 1].kind === 'symbol') {
      // 'iden' can immediately follow a 'symbol'
      expectedWhitespace = false;
    }
    if (expectedWhitespace && text.length > 1) {
      // Both us and the previous token expected to see whitespace between us.
      // If there wasn't any, error.
      if (!sawWhitespace) {
        tokens.push(new Token('error', remain, "Expected whitespace"));
        return tokens;
      }
    }

    // consume token text
    remain = remain.slice(text.length);

    // consume whitespace
    m = whitespacePat.exec(remain);
    sawWhitespace = Boolean(m);
    if (m) {
      remain = remain.slice(m[0].length);
      text += m[0];
    }
    if (kind === 'empty') sawWhitespace = true;

    // 'iden' adds onto the preceding 'symbol'
    if (kind === 'iden' && tokens.length) {
      var lastToken = tokens[tokens.length - 1];
      if (lastToken.kind === 'symbol' && !/[ \t]$/.test(lastToken.text)) {
        lastToken.text += text;
        lastToken.value += value;
        lastToken.kind = 'iden';
        expectedWhitespace = true;
        continue;
      }
    }

    // the first token gets the leading whitespace
    if (tokens.length === 0) {
      text = leadingWhitespace + text;
    }

    // push the token
    tokens.push(new Token(kind, text, value));

    expectedWhitespace = (text.length > 1);
  }
  return tokens;
};

function splitStringToken(token) {
  var quote = token.text.trim()[0];
  var backslashEscape = quote === '"' ? backslashEscapeDouble
                                      : backslashEscapeSingle;
  var parts = token.text.split(backslashEscape);
  assert(token.kind === 'string', "Want string token, not " + token);
  var tokens = [];
  for (var i = 0; i < parts.length; i++) {
    var text = parts[i];
    if (!text) continue;

    if (text === "\\\\") {
      tokens.push(new Token('escape', '\\', '\\'));
      tokens.push(new Token('string', '\\', '\\'));
    } else if (text === "\\" + quote) {
      tokens.push(new Token('escape', '\\', '\\'));
      tokens.push(new Token('string', quote, quote));
    } else {
      // We have to trimLeft leading whitespace,
      // because mode.js will run whitespacePat after matching the token
      var m = whitespacePat.exec(text);
      if (m && m[0]) {
        assert(tokens.length);
        tokens[tokens.length - 1].text += m[0];
        text = text.slice(m[0].length);
      }

      tokens.push(new Token('string', text, text));
    }
  }
  return tokens;
}

/* for match()ing tokens */

var SymbolSpec = function(kind, value) {
  this.kind = kind;
  this.value = value;
};

SymbolSpec.prototype.match = function(token) {
  if (this.kind === token.kind) {
    if (this.value === undefined) {
      return true;
    } else {
      return this.value === token.value;
    }
  } else {
    return false;
  }
};

SymbolSpec.prototype.generate = function() {
  var text = this.kind + ' '; // TODO which side?
  return new Token(this.kind, text, this.value || this.toString());
};

SymbolSpec.prototype.toString = function() {
  switch (this.kind) {
    case "symbol":  return this.value;
    case "lparen":  return "(";
    case "rparen":  return ")";
    case "langle":  return "<";
    case "rangle":  return ">";
    case "false":   return "<>";
    case "comment": return "// …";
  }
};


/* for defining grammars */

var Grammar = Earley.Grammar;

var Rule = function(name, symbols, process) {
  var ruleSymbols = symbols.map(function(symbol) {
    if (symbol instanceof Array) {
      assert(symbol.length === 1);
      symbol = {kind: "symbol", value: symbol[0]};
    }
    if (typeof symbol === "object") {
      symbol = new SymbolSpec(symbol.kind, symbol.value);
    }
    return symbol;
  });
  return new Earley.Rule(name, ruleSymbols, process);
};


/* helper functions */

function identity(x) {
  assert(arguments.length == 1);
  return x;
}

function box(x) { return [x]; }

function textSymbols(text) {
  return text.split(" ").map(box).map(function(x) {
    var tokens = tokenize(x[0]);
    assert(tokens.length === 1, text + ": " + tokens);
    var token = tokens[0];
    if (token.kind !== "symbol") {
      assert(token.kind !== "error", text);
      return new SymbolSpec(token.kind, token.value);
    }
    return x;
  });
}


/* Grammar Processors */

function literal(a) { assert(arguments.length === 1); return a.value; }
function brackets(a, b, c) {
  // warning: mutates arguments
  if (a.kind == 'langle') a.display = '‹';
  if (c.kind == 'rangle') c.display = '›';
  return new Block(b.info, b.args, [a].concat(b.tokens).concat([c]));
}
function constant(x) {
  return function() { return x; };
}
function first(a) { return a; }
function embed() {
  return {embed: [].slice.apply(arguments)};
}
function embedConstant(x) {
  return function() {
    return {constant: x, embed: [].slice.apply(arguments)};
  };
}

function num(a) {
  return parseFloat(literal(a));
}

function push(a, b) {
  a = a.slice();
  a.push(b);
  return a;
}

function push2(a, b, c) {
  a = a.slice();
  a.push(c);
  return a;
}

function paintLiteral(category) {
  // warning: mutates argument
  return function(a) {
    assert(arguments.length == 1);
    a.category = category;
    return a.value;
  };
}

function paintLiteralWords(category) {
  // warning: mutates argument
  return function() {
    var words = [].slice.apply(arguments);
    return words.map(function(a) {
      a.category = category;
      return a.value;
    }).join(" ");
  };
}

function paint(category) {
  // warning: mutates arguments
  return function() {
    var tokens = [].slice.apply(arguments);
    tokens.forEach(function(token) {
      token.category = category;
    });
    return tokens;
  };
}

function paintList(category) {
  // warning: mutates argument
  return function(a) {
    return a.map(function(token) {
      token.category = category;
      return token.value;
    }).join(" ");
  };
}


/* Define block grammar */

function param(a, b, c) {
  // warning: mutates arguments
  a.category = c.category = "parameter";
  switch (a.kind) {
    case "lparen": return {arg: "s", name: b};
    case "langle": return {arg: "b", name: b};
  }
}

function hackedParam(i, a, b, c) {
  // warning: mutates arguments
  i.category = a.category = c.category = "parameter";
  return {arg: i.value.slice(1), name: b};
}

function definition(a, parts) {
  var isAtomic = a === 'define-atomic';

  var inputNames = [];
  var defaults = [];
  var specParts = parts.map(function(part) {
    if (typeof part === 'string') {
      return part;
    } else {
      inputNames.push(part.name);
      switch (part.arg) {
        case 'b': defaults.push(false); return '%b';
        case 's': defaults.push("");   return '%s';
        default: defaults.push(""); return '%' + part.arg;
      }
    }
  });

  var spec = specParts.join(' ');
  var args = [spec, inputNames, defaults, isAtomic];

  var definition = {
    info: {shape: 'hat', selector: 'procedures_definition'},
    args: args,
    _parts: parts,
  };
  return definition;
}

var defineGrammar = new Grammar([
    Rule("line", ["define", "spec-seq"], definition),

    Rule("define", [["define"]], paintLiteral("custom")),
    Rule("define", [["define-atomic"]], paintLiteral("custom")),

    Rule("spec-seq", ["spec-seq", "spec"], push),
    Rule("spec-seq", ["spec"], box),

    Rule("spec", [{kind: 'symbol'}], paintLiteral("custom")),
    Rule("spec", [{kind: 'iden'}], paintLiteral("custom")),
    Rule("spec", [{kind: 'number'}], paintLiteral("custom")),

    Rule("spec", [{kind: 'lparen'}, "arg-words", {kind: 'rparen'}], param),
    Rule("spec", [{kind: 'langle'}, "arg-words", {kind: 'rangle'}], param),
    Rule("spec", [{kind: 'input'}, {kind: 'lsquare'}, "arg-words", {kind: 'rsquare'}], hackedParam),

    Rule("arg-words", ["word-seq"], paintList("parameter")),

    Rule("word-seq", ["word-seq", "word"], push),
    Rule("word-seq", ["word"], box),

    Rule("word", [{kind: 'symbol'}], identity),
    Rule("word", [{kind: 'iden'}], identity),
    Rule("word", [{kind: 'number'}], identity),
]);


/* Core grammar */

var Block = function(info, args, tokens) {
  this.info = info;
  this.args = args;
  this.tokens = tokens;
};

function block(selector) {
  var indexes = [].slice.apply(arguments, [1]);
  var info = Scratch.blocksBySelector[selector];
  assert(info);
  return blockArgs.apply(null, [info].concat(indexes));
}

function blockArgs(info) {
  var indexes = [].slice.apply(arguments, [1]);
  var func = function() {
    var funcArgs = [].slice.apply(arguments);
    var args = indexes.map(function(i) {
      var arg = funcArgs[i];
      if (arg.constant) {
        arg = arg.constant;
      } else if (arg.embed) {
        arg = arg.embed.map(function(x) { return x.value; }).join(" ");
      }
      arg = arg.value || arg;
      return arg;
    });

    var tokens = [];
    funcArgs.forEach(function(value) {
      if (value && value.embed) {
        tokens = tokens.concat(value.embed);
      } else if (value && value.constant) {

      } else {
        if (value.kind === 'symbol' && info.display) {
          value.display = info.display;
        }
        tokens.push(value);
      }
    });

    // stop other scripts in sprite
    var outInfo = info;
    if (info.selector === 'control_stop') {
      var option = args[0];
      if (['all', 'this script'].indexOf(option) === -1) {
        outInfo = Scratch.stopOtherScripts;
      }
    }

    // Coerce all the arguments to match their slots!
    for (var i = 0; i < args.length; i++) {
      args[i] = convertArg(args[i], info.inputs[i]);
    }

    return new Block(outInfo, args, tokens);
  };
  func._info = info;
  return func;
}

function convertArg(arg, input) {
  if (typeof arg === 'object') return arg;

  if (input === '%n') {
    // nb. Empty number slots are zero
    return Number(arg) || 0;
  }
  // Make sure string inputs contain strings
  if (input === '%s') {
    return arg + '';
  }
  return arg;
}

function infix(info) {
  return blockArgs(Scratch.blocksBySelector[info], 0, 2);
}

function stringLiteral(a) {
  assert(arguments.length === 1);
  var quote = a.text.trim()[0];
  var backslashEscape = quote === '"' ? backslashEscapeDouble
                                      : backslashEscapeSingle;
  var parts = a.value.split(backslashEscape);
  return parts.map(function(p) {
    if (p === "\\\\") return "\\";
    if (p === "\\" + quote) return quote;
    return p;
  }).join("");
}

var colors = {
  red: '#e50000',
  orange: '#f97306',
  yellow: '#ffff14',
  green: '#15b01a',
  blue: '#0343df',
  purple: '#7e1e9c',
  black: '#000',
  white: '#fff',
  pink: '#ff81c0',
  brown: '#653700',
}; // from http://blog.xkcd.com/2010/05/03/color-survey-results/

function colorLiteral(a) {
  // warning: mutates arguments
  var color = colors[a.value];
  if (color !== '#fff') a.color = color;
  a.kind = 'color';
  return color;
}

function hexColor(a) {
  var h = a.value;
  if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
  return '#' + h;
}

function unaryMinus(a, b) {
  // warning: mutates arguments
  a.category = 'number';
  return -num(b);
}

/* precedence
  *
  *  [loosest]
  *              stack blocks              eg. move … steps
  *              arithmetic                eg. + -
  *                                        eg. * /
  *              numeric reporter blocks   eg. sin of …
  *              simple reporters          eg. x position
  *  [tightest]
  *
  * Looks like this:
  *
  *
  *   [stack blocks]
  * 8. and, or
  * 7. not
  * 6. <, >, =
  *
  * 4. +, -
  * 3. *, /, mod
  * 2. right-recursive reporters
  * 1. parentheses, simple reporters
  * 0. literals
  *
  */

var g = new Grammar([
  Rule("line", ["thing"], identity),
  Rule("line", ["thing", {kind: 'comment'}], first),
  Rule("line", [{kind: 'comment'}], constant(undefined)),

  Rule("thing", ["block"], identity),
  Rule("thing", ["r-parens"], identity),
  Rule("thing", ["b-parens"], identity),

  /* --------------------------------------------------------------------- */

  // there are lots of "block" rules
  // which use the inputs:  "n", "sb", "b", "c"
  //
  // they also have menu inputs, some of which accept reporters,
  // so they use the production "sb"

  /* --------------------------------------------------------------------- */

  Rule("n", ["n4"], identity),

  Rule("sb", ["join"], identity),
  Rule("sb", ["n4"], identity),
  Rule("sb", ["s0"], identity),

  Rule("b", ["b8"], identity),

  Rule("c", ["r-parens"], identity),
  Rule("c", ["c0"], identity),

  /* --------------------------------------------------------------------- */

  Rule("r-parens", [{kind: 'lparen'}, "r-value", {kind: 'rparen'}], brackets),

  Rule("r-value", ["join"], identity),
  Rule("r-value", ["n4"], identity),
    //  r-value -> ListName

  Rule("b-parens", [{kind: 'langle'}, "b8", {kind: 'rangle'}], brackets),

  // ---

  // There are some "reporter" and a few "predicate" rules
  // which have no expression-accepting inputs.

  //       . . .     "simple-reporter"
  Rule("predicate", ["simple-predicate"], identity),

  // The rest get defined here, because I like my sanity.

  Rule("join", [["join"], "jpart", "jpart"],
                                          block("operator_join", 1, 2)),

  Rule("jpart", ["s0"], identity),
  Rule("jpart", [{kind: 'empty'}], constant("")),
  Rule("jpart", ["join"], identity),
  Rule("jpart", ["r-parens"], identity),
  Rule("jpart", ["b-parens"], identity),

  // "join" on the LHS of a comparison is *confusing*

  Rule("predicate", [["touching"], ["color"], "c", ["?"]],
                                          block("sensing_touchingcolor", 2)),
  Rule("predicate", [["color"], "c", ["is"], ["touching"], "c", ["?"]],
                                          block("sensing_coloristouchingcolor", 1, 4)),

  /* --------------------------------------------------------------------- */

  Rule("b8", ["b-and"], identity),
  Rule("b8", ["b-or"], identity),
  Rule("b8", ["b7"], identity),

  // require parentheses when nesting and/or
  Rule("b-and", ["b-and", ["and"], "b7"], infix("operator_and")),
  Rule("b-and", ["b7", ["and"], "b7"], infix("operator_and")),

  Rule("b-or", ["b-or", ["or"], "b7"], infix("operator_or")),
  Rule("b-or", ["b7", ["or"], "b7"], infix("operator_or")),

  Rule("b7", [["not"], "b7"], block("operator_not", 1)),
  Rule("b7", ["b6"], identity),

  // nb.  "<" and ">" do not tokenize as normal symbols
  // also note comparison ops accept *booleans*!
  Rule("b6", ["sb", {kind: 'langle'}, "sb"], infix("operator_lt")),
  Rule("b6", ["sb", {kind: 'rangle'}, "sb"], infix("operator_gt")),
  Rule("b6", ["sb", ["="], "sb"], infix("operator_equals")),
  Rule("b6", ["sb", ["contains"], "sb", ["?"]], infix("operator_contains")),
  Rule("b6", ["m_listNonempty", ["contains"], "sb", ["?"]], infix("data_listcontainsitem")),
  Rule("b6", ["predicate"], identity),
  Rule("b6", ["b2"], identity),

  Rule("b2", ["b-parens"], identity),
  Rule("b2", ["b0"], identity),

  // ---

  Rule("n4", ["n4", ["+"], "n3"], infix("operator_add")),
  Rule("n4", ["n4", ["-"], "n3"], infix("operator_subtract")),
  Rule("n4", ["n3"], identity),

  Rule("n3", ["n3", ["*"],   "n2"], infix("operator_multiply")),
  Rule("n3", ["n3", ["/"],   "n2"], infix("operator_divide")),
  Rule("n3", ["n3", ["mod"], "n2"], infix("operator_mod")),
  Rule("n3", ["n2"], identity),

  Rule("n2", [["round"], "n2"],           block("operator_round", 1)),
  Rule("n2", ["m_mathOp", ["of"], "n2"],  infix("operator_mathop")),
  Rule("n2", [["pick"], ["random"], "n4", ["to"], "n2"],
                                          block("operator_random", 2, 4)),
  Rule("n2", ["m_attribute", ["of"], "m_sensing_of_object_menu"],
                                          block("sensing_of", 0, 2)),
  Rule("n2", [["distance"], ["to"], "m_sensing_distancetomenu"],
                                          block("sensing_distanceto", 2)),
  Rule("n2", [["length"], ["of"], "s2"],  block("operator_length", 2)),
  Rule("n2", [["letter"], "n", ["of"], "s2"],
                                          block("operator_letter_of", 1, 3)),
  Rule("n2", ["n1"], identity),

  Rule("n1", ["simple-reporter"], identity),
  Rule("n1", ["r-parens"], identity),
  Rule("n1", ["b-parens"], identity),
  Rule("n1", ["n0"], identity),

  // ---

  Rule("s2", ["s0"], identity),
  Rule("s2", ["n1"], identity),

  /* --------------------------------------------------------------------- */

  Rule("n0", [["-"], {kind: 'number'}], unaryMinus),
  Rule("n0", [{kind: 'number'}], num),
  Rule("n0", [{kind: 'empty'}], constant("")),

  Rule("s0", [{kind: 'string'}], stringLiteral),

  Rule("b0", [{kind: 'false'}], constant(false)), // "<>"

  Rule("c0", [{kind: 'color'}], hexColor),

  /* --------------------------------------------------------------------- */

  Rule("@greenFlag", [["flag"]], paint("green")),
  Rule("@greenFlag", [["green"], ["flag"]], paint("green")),

  Rule("@turnLeft",  [["ccw"]], identity),
  Rule("@turnLeft",  [["left"]], identity),

  Rule("@turnRight", [["cw"]], identity),
  Rule("@turnRight", [["right"]], identity),

], ["VariableName", "ListName", "AttributeVariable", "ReporterParam", "BooleanParam"]);

var coreGrammar = g.copy();

// TODO: parse +'s as variable arity, so we can "balance" the trees later on



/* Color literals */

Object.keys(colors).forEach(function(name) {
  g.addRule(Rule("c0", [{kind: 'symbol', value: name}], colorLiteral));
});

/* Menu options */

var menus = ['motion_goto_menu', 'motion_glideto_menu',
    'motion_pointtowards_menu', 'looks_costume', 'looks_backdrops',
    'sound_sounds_menu', 'event_broadcast_menu',
    'control_create_clone_of_menu', 'sensing_touchingobjectmenu',
    'sensing_distancetomenu', 'sensing_keyoptions', 'sensing_of_object_menu',
    'pen_menu_colorParam', 'music_menu_DRUM', 'music_menu_INSTRUMENT',
    'videoSensing_menu_ATTRIBUTE', 'videoSensing_menu_SUBJECT',
    'videoSensing_menu_VIDEO_STATE', 'tts_menu_voices', 'tts_menu_languages',
    'translate_menu_languages',

    'attribute', 'backdrop', 'broadcast', 'dragMode', 'effect',
    'forwardBackward', 'frontBack', 'key', 'list', 'listNonempty', 'mathOp',
    'numberName', 'rotationStyle', 'soundEffect', 'stop', 'timeAndDate',
    'triggerSensor', 'var'];

// These accept strings and reporters
var menusThatAcceptReporters = ['motion_goto_menu', 'motion_glideto_menu',
    'motion_pointtowards_menu', 'looks_costume', 'looks_backdrops',
    'sound_sounds_menu', 'event_broadcast_menu',
    'control_create_clone_of_menu', 'sensing_touchingobjectmenu',
    'sensing_distancetomenu', 'sensing_keyoptions', 'sensing_of_object_menu',
    'pen_menu_colorParam', 'music_menu_DRUM', 'music_menu_INSTRUMENT',
    'videoSensing_menu_ATTRIBUTE', 'videoSensing_menu_SUBJECT',
    'videoSensing_menu_VIDEO_STATE', 'tts_menu_voices', 'tts_menu_languages',
    'translate_menu_languages'];

// These accept string literals but not reporters
var menusThatAcceptStrings = ['attribute', 'backdrop', 'broadcast'];

// Some menus can't be empty to make sure that empty inputs are unambiguous
var menusThatMustNotBeEmpty = ['listNonempty', 'mathOp', 'soundEffect'];

var menuOptions = {
  motion_goto_menu: ['mouse-pointer', 'random position'],
  motion_glideto_menu: ['mouse-pointer', 'random position'],
  motion_pointtowards_menu: ['mouse-pointer'],
  looks_costume: [],
  looks_backdrops: ['next backdrop', 'previous backdrop', 'random backdrop'],
  sound_sounds_menu: [],
  event_broadcast_menu: [],
  control_create_clone_of_menu: ['myself'],
  sensing_touchingobjectmenu: ['mouse-pointer', 'edge'],
  sensing_distancetomenu: ['mouse-pointer'],
  sensing_keyoptions: [], // set later
  sensing_of_object_menu: ['Stage'],
  pen_menu_colorParam: ['hue', 'saturation', 'brightness', 'transparency'],
  music_menu_DRUM: ['Snare Drum', 'Bass Drum', 'Side Stick', 'Crash Cymbal',
    'Open Hi-Hat', 'Closed Hi-Hat', 'Tambourine', 'Hand Clap', 'Claves',
    'Wood Block', 'Cowbell', 'Triangle', 'Bongo', 'Conga', 'Cabasa', 'Guiro',
    'Vibraslap', 'Cuica'],
  music_menu_INSTRUMENT: ['Piano', 'Electric Piano', 'Organ', 'Guitar',
    'Electric Guitar', 'Bass', 'Pizzicato', 'Cello', 'Trombone', 'Clarinet',
    'Saxophone', 'Flute', 'Wooden Flute', 'Bassoon', 'Choir', 'Vibraphone',
    'Music Box', 'Steel Drum', 'Marimba', 'Synth Lead', 'Synth Pad'],
  videoSensing_menu_ATTRIBUTE: ['motion', 'direction'],
  videoSensing_menu_SUBJECT: ['sprite', 'stage'],
  videoSensing_menu_VIDEO_STATE: ['off', 'on', 'on flipped'],
  tts_menu_voices: ['alto', 'tenor', 'squeak', 'giant', 'kitten'],
  // Language names that contain parentheses in Scratch have been changed
  tts_menu_languages: ['Arabic', 'Brazilian Portuguese', 'Danish', 'Dutch',
    'English', 'French', 'German', 'Hindi', 'Icelandic', 'Italian', 'Japanese',
    'Korean', 'Latin American Spanish', 'Mandarin', 'Norwegian', 'Polish',
    'Portuguese', 'Romanian', 'Russian', 'Spanish', 'Swedish', 'Turkish',
    'Welsh'],
  translate_menu_languages: ['Amharic', 'Arabic', 'Azerbaijani', 'Basque',
    'Bulgarian', 'Catalan', 'Croatian', 'Czech', 'Danish', 'Dutch', 'English',
    'Estonian', 'Finnish', 'French', 'Galician', 'German', 'Greek', 'Hebrew',
    'Hungarian', 'Icelandic', 'Indonesian', 'Irish Gaelic', 'Italian',
    'Japanese', 'Korean', 'Latvian', 'Lithuanian', 'Maori', 'Norwegian',
    'Persian', 'Polish', 'Portuguese', 'Romanian', 'Russian', 'Scots Gaelic',
    'Serbian', 'Simplified Chinese', 'Slovak', 'Slovenian', 'Sorani Kurdish',
    'Spanish', 'Swedish', 'Thai', 'Traditional Chinese', 'Turkish',
    'Ukrainian', 'Vietnamese', 'Welsh', 'Zulu'],

  'attribute': ['x position', 'y position', 'direction', 'costume #',
  'costume name', 'backdrop #', 'backdrop name', 'size', 'volume'],
  'backdrop': [],
  'broadcast': [],
  'dragMode': ['draggable', 'not draggable'],
  'effect': ['color', 'fisheye', 'whirl', 'pixelate', 'mosaic',
  'brightness', 'ghost'],
  'forwardBackward': ['forward', 'backward'],
  'frontBack': ['front', 'back'],
  'key': ['space', 'up arrow', 'down arrow', 'right arrow', 'left arrow',
    'any', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', 0, 1, 2,
    3, 4, 5, 6, 7, 8, 9],
  'list': [],
  'listNonempty': [],
  'mathOp': ['abs', 'floor', 'ceiling', 'sqrt', 'sin', 'cos', 'tan',
  'asin', 'acos', 'atan', 'ln', 'log', 'e ^', '10 ^'],
  'numberName': ['number', 'name'],
  'rotationStyle': ['left-right', "don't rotate", 'all around'],
  // The pan effect is called "pan left/right" in Scratch
  // TB3 uses "pan" because "/" is a reserved symbol
  'soundEffect': ['pitch', 'pan'],
  'stop': ['all', 'this script', 'other scripts in sprite'],
  'timeAndDate': ['year', 'month', 'date', 'day of week', 'hour',
  'minute', 'second'],
  'triggerSensor': ['loudness', 'timer'],
  'var': [],
};
menuOptions.sensing_keyoptions = menuOptions.key;

// only generate number literals for some blocks
var blocksWithNumberLiterals = [
  'data_setvariableto',
  'operator_lt', 'operator_gt', 'operator_equals',
];
// force string literals for:
//  operator_join
//  data_addtolist
//  data_insertatlist
//  say
//  think
//  ask
//  operator_letter_of
//  operator_length
//  operator_contains
//  data_listcontainsitem
// ]

// Maps label to value
var menuValues = {
  'mouse-pointer': '_mouse_',
  'myself': '_myself_',
  'Stage': '_stage_',
  'edge': '_edge_',
  'random position': '_random_',
  'hue': 'color',
  'sprite': 'this sprite',
  'stage': 'Stage',
  'on flipped': 'on-flipped',
  'Amharic': 'am',
  'Arabic': 'ar',
  'Azerbaijani': 'az',
  'Basque': 'eu',
  'Brazilian Portuguese': 'pt-br',
  'Bulgarian': 'bg',
  'Catalan': 'ca',
  'Croatian': 'hr',
  'Czech': 'cs',
  'Danish': 'da',
  'Dutch': 'nl',
  'English': 'en',
  'Estonian': 'et',
  'Finnish': 'fi',
  'French': 'fr',
  'Galician': 'gl',
  'German': 'de',
  'Greek': 'el',
  'Hebrew': 'he',
  'Hindi': 'hi',
  'Hungarian': 'hu',
  'Icelandic': 'is',
  'Indonesian': 'id',
  'Irish Gaelic': 'ga',
  'Italian': 'it',
  'Japanese': 'ja',
  'Korean': 'ko',
  'Latin American Spanish': 'es-419',
  'Latvian': 'lv',
  'Lithuanian': 'lt',
  'Mandarin': 'zh-cn',
  'Maori': 'mi',
  'Norwegian': 'nb',
  'Persian': 'fa',
  'Polish': 'pl',
  'Portuguese': 'pt',
  'Romanian': 'ro',
  'Russian': 'ru',
  'Scots Gaelic': 'gd',
  'Serbian': 'sr',
  'Simplified Chinese': 'zh-cn',
  'Slovak': 'sk',
  'Slovenian': 'sl',
  'Sorani Kurdish': 'ckb',
  'Spanish': 'es',
  'Swedish': 'sv',
  'Thai': 'th',
  'Traditional Chinese': 'zh-tw',
  'Turkish': 'tr',
  'Ukrainian': 'uk',
  'Vietnamese': 'vi',
  'Welsh': 'cy',
  'Zulu': 'zu'
};

['effect', 'soundEffect', 'timeAndDate', 'triggerSensor', 'tts_menu_voices']
  .forEach(function(menu) {
    menuOptions[menu].forEach(function(label) {
      menuValues[label] = label.toUpperCase().replace(/\s/g, '');
    });
  });
['music_menu_DRUM', 'music_menu_INSTRUMENT'].forEach(function(menu) {
  menuOptions[menu].forEach(function(label, index) {
    menuValues[label] = index + 1;
  });
});

// Maps value to label for each menu
var menuLabels = {};

menus.forEach(function(name) {
  if (menusThatAcceptReporters.indexOf(name) > -1) {
    g.addRule(Rule("m_" + name, ["jpart"], identity));
  } else if (menusThatAcceptStrings.indexOf(name) > -1) {
    g.addRule(Rule("m_" + name, ["s0"], identity));
  }
  var options = menuOptions[name];
  menuLabels[name] = {};
  if (options && options.length) {
    options.forEach(function(option) {
      var symbols;
      if (typeof option === "number") {
        symbols = [{kind: 'number', value: String(option)}];
      } else {
        symbols = textSymbols(option);
      }
      process = embed;
      var value;
      value = menuValues[option];
      if (value &&
          !(name === 'pen_menu_colorParam' && option === 'brightness')) {
        process = embedConstant(value);
        menuLabels[name][value] = option;
      }
      g.addRule(Rule("m_" + name, symbols, process));
    });
  }
  if (
    // Some inputs intentionally can't be empty
    menusThatMustNotBeEmpty.indexOf(name) === -1 &&
    // The "jpart" rule already includes empty inputs
    menusThatAcceptReporters.indexOf(name) === -1
  ) {
    g.addRule(Rule("m_" + name, [{kind: 'empty'}], literal));
  }
  /*if (name === "broadcast") {
    g.addRule(Rule("m_" + name, [{kind: 'menu'}], literal));
  } else {
    g.addRule(Rule("m_" + name, [{kind: 'menu'}], identity));
  }*/
});

g.addRule(Rule("m_var", ["VariableName"], identity));
g.addRule(Rule("m_list", ["ListName"], identity));
g.addRule(Rule("m_listNonempty", ["ListName"], identity));


/* For Compiler.generate() */

var precedenceLevels = [
  // custom block args = -2
  // join = -1
  [], // zero
  ['operator_multiply', 'operator_divide', 'operator_mod'],
  ['operator_add', 'operator_subtract'],
  ['operator_equals', 'operator_lt', 'operator_gt',
    'operator_contains', 'data_listcontainsitem'],
  ['operator_not'],
  ['operator_and'],  // actually "and" and "or" have the same precedence!
  ['operator_or'],  // except they must be parenthesised when inside each other.
  // [ stack blocks ]
];

var precedence = {};
precedenceLevels.forEach(function(list, index) {
  list.forEach(function(selector) {
    precedence[selector] = index;
  });
});

// special-case "join"
precedence.operator_join = -1;


/* Add rules for blocks */

var alreadyDefined = [
  'operator_letter_of', 'operator_join',

  'operator_and', 'operator_or', 'operator_not',
  'operator_equals', 'operator_lt', 'operator_gt',
  'operator_contains', 'data_listcontainsitem',

  'operator_random', 'operator_length', 'operator_round', 'operator_mathop',
  'sensing_of', 'sensing_distanceto',

  'operator_multiply', 'operator_divide', 'operator_mod',
  'operator_add', 'operator_subtract',

  'control_if', // control_if and control_if_else have the same grammar rule!

  'sensing_touchingcolor', 'sensing_coloristouchingcolor',
];

var doneSpecs = {};
Scratch.blocks.forEach(function(block) {
  if (alreadyDefined.indexOf(block.selector) > -1) return;
  if (doneSpecs[block.spec] &&
      block.selector !== 'argument_reporter_string_number' &&
      block.selector !== 'argument_reporter_boolean') {
    return;
  }
  doneSpecs[block.spec] = true;

  var symbols = [];
  var argIndexes = [];

  block.parts.forEach(function(part, index) {
    var m = Scratch.inputPat.exec(part);
    if (!m) {
      part.split(/(\?)|[ ]+/g).forEach(function(word) {
        if (!word) return;
        if (/^@/.test(word)) {
          symbols.push(word);
        } else {
          var more = textSymbols(word);
          assert(more.length === 1);
          symbols.push(more[0]);
        }
      });
    } else {
      var input = m[1].slice(1).replace(".", "_");
      if ((index === 0 || index === block.parts.length - 1) &&
          !/^[mdc]/.test(input)) {
        assert(!(block.shape === "reporter" || block.shape === "predicate"),
                block.selector + " " + block.spec);
      }
      // Reporters with non-menu inputs at the beginning or end are defined
      // in the core grammar.

      if (input === 's') input = 'sb'; // strings accept booleans!

      argIndexes.push(symbols.length);
      symbols.push(input);
    }
  });

  var type = (block.shape === "reporter" ? "simple-reporter" :
              block.shape === "predicate" ? "simple-predicate" : "block");

  if (block.selector === "data_variable") {
    symbols = ["VariableName"];
  } else if (block.selector === "data_listcontents") {
    symbols = ["ListName"];
    type = 'r-value';
  } else if (block.selector === "argument_reporter_string_number") {
    symbols = ["ReporterParam"];
  } else if (block.selector === "argument_reporter_boolean") {
    symbols = ["BooleanParam"];
  }

  assert(symbols.length);

  g.addRule(Rule(type, symbols,
                      blockArgs.apply(null, [block].concat(argIndexes))));
});


/* Add rules for definitions */

defineGrammar.rules.forEach(g.addRule.bind(g));



/* for parsing `define`s */

function addDefinition(grammar, result) {
  var symbols = nameSymbols(result.name);
  var kind = result.value instanceof Array ? "ListName" : "VariableName";
  grammar.addRule(new Rule(kind, symbols, embed));
}

function addCustomBlock(grammar, result) {
  var specParts = result._parts;

  var parts = [];

  specParts.forEach(function(x) {
    if (x.arg) {
      parts.push("%" + x.arg);
    } else {
      parts.push(x);
    }
  });
  var spec = parts.join(" ");

  // spec = cleanName('custom', spec, {}, {});

  var symbols = [];
  parts = spec.split(Scratch.inputPat);
  var argIndexes = [];
  parts.forEach(function(part) {
    if (!part) return;
    if (Scratch.inputPat.test(part)) {
      var arg = part.slice(1).replace(".", "_");
      if (arg === 's') arg = 'sb';
      argIndexes.push(symbols.length);
      symbols.push(arg);
    } else {
      var words = tokenize(part);
      words.forEach(function(token) {
        symbols.push(new SymbolSpec(token.kind, token.value));
      });
    }
  });

  var info = {
    isCustom: true,
    spec: spec,
    parts: parts,
    category: "custom",
    shape: 'stack',
  };
  info.inputs = info.parts.filter(function(p) {
    return Scratch.inputPat.test(p);
  });

  grammar.addRule(new Rule("block", symbols,
                      blockArgs.apply(null, [info].concat(argIndexes))));
  return info;
}

function addParameters(grammar, result) {
  var specParts = result._parts;

  specParts.forEach(function(x) {
    if (x.arg) {
      var name = x.arg === 'b' ? "BooleanParam" : "ReporterParam";
      grammar.addRule(new Rule(name, nameSymbols(x.name),
                            paintLiteralWords("parameter")));
    }
  });
}


/* for variable (re)naming */

function nameSymbols(text) {
  var tokens = tokenize(text);
  return tokens.map(function(token) {
    assert(token.kind !== "error", text);
    return new SymbolSpec(token.kind, token.value);
  });
}

var reservedNames = [
  // conflicts with set _ to _
  'x',
  'y',
  'z', // so people don't hate me
  'pen color',
  'pen hue',
  'pen saturation',
  'pen brightness',
  'pen transparency',
  'pen size',
  'video transparency',
  'instrument',
  'color effect',
  'whirl effect',
  'pixelate effect',
  'mosaic effect',
  'brightness effect',
  'ghost effect',
  'fisheye effect',
  'pitch effect',
  'pan effect',
  'voice',
  'language',

  // found in the attribute _ of _ block
  'costume #',
  'backdrop #',

  // simple reporters
  'x position',
  'y position',
  'direction',
  'costume number',
  'costume name',
  'size',
  'backdrop number',
  'backdrop name',
  'volume',
  'tempo',
  'answer',
  'mouse x',
  'mouse y',
  'loudness',
  'timer',
  'current year',
  'current month',
  'current date',
  'current day of week',
  'current hour',
  'current minute',
  'current second',
  'days since 2000',
  'username',

  // menusThatAcceptReporters
  'mouse-pointer',
  'Stage',
  'edge',

  // d_-style number-menus
  'all',
  'last',
  'random',
];

var reservedWords = [
  'to',
  'on',
  'of',
  'for',
  'with',
  'mod',
  'round',
];

function cleanName(kind, name, seen, stageSeen) {
  var original = name;
  var lastToken;
  while (true) {
    var tokens = tokenize(name);
    if (!tokens.length) break;

    lastToken = tokens[tokens.length - 1];
    var suffix = "";
    if (lastToken.kind !== 'error') break;

    if (lastToken.value === "Expected whitespace") {
      suffix = " " + lastToken.text;
    } else {
      suffix = lastToken.text.slice(1);
    }
    tokens.pop();
    name = tokens.map(getValue).join(" ");
    name += suffix;
  }
  tokens.forEach(function(token, index) {
    var next;
    if (token.kind === 'lparen' || token.kind === 'langle') {
      next = tokens[index + 1];
      if (next && (next.kind === 'iden' || next.kind === 'symbol')) {
        next.value = '_' + next.value;
        next.kind = 'iden';
      }
    }
    if (token.kind === 'rparen' || token.kind === 'rangle') {
      next = tokens[index - 1];
      if (next && (next.kind === 'iden' || next.kind === 'symbol')) {
        next.value = next.value + '_';
        next.kind = 'iden';
      }
    }
  });
  tokens = tokens.filter(function(token, index) {
    return (
      (token.kind === 'symbol' && !/^[=*/+-]$/.test(token.value)) ||
      token.kind === 'iden' ||
      token.kind === 'number' ||
      (token.kind === 'cloud' && index === 0) ||
      (token.kind === 'input' && kind === 'custom')
      // reserved words
    ) && reservedWords.indexOf(token.value) === -1
      && (token.value !== 'y:' || kind === 'custom');
  });
  name = tokens.map(getValue).join(" ");

  // don't put space before question mark
  name = name.replace(/ \?( |$)/g, "?");

  var shortKind = kind === 'variable' ? "var"
                : kind === 'parameter' ? "arg" : kind;
  if (!name) {
    name = /^[^a-zA-Z]$/.test(original) ? "_" : shortKind;
  }

  nameSymbols(name); // Check this doesn't crash

  var isInvalid = (
    // reserved names
    reservedNames.indexOf(name) > -1 ||
    // name can't be a number token
    /^[0-9]+(\.[0-9]+)?$/.test(name)
  );

  function has(obj, name) {
    return Object.prototype.hasOwnProperty.call(obj, name);
  }

  // if ambiguous or non-unique, add shortKind
  if (name !== "_" && (
        isInvalid ||
        ((has(stageSeen, name) || has(seen, name)) && kind === 'parameter')
      )) {
    if (name) name += " ";
    name += shortKind;
  }

  // if still not unique, add a number
  var offset = 1;
  var prefix = name;
  while (name === "_" || name === shortKind || has(stageSeen, name) || has(seen, name)) {
    name = prefix + offset;
    offset++;
  }

  return name;
}



/* for c-blocks and `end`s */

var LineSpec = function(obj) {
  this.obj = obj;
};

LineSpec.prototype.match = function(block) {
  var keys = Object.keys(this.obj);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (block.info[key] !== this.obj[key]) return false;
  }
  return true;
};

var ShapeRule = function(s) {
  return Rule(s, [new LineSpec({shape: s})], identity);
};

// TODO remove or use
var blockGrammar = new Grammar([
    Rule("script-list", ["script"], box),
    Rule("script-list", ["script-list", "blank-line", "script"], push2),

//      Rule("script", ["lines", "cap"], push),
//      Rule("script", ["hat", "lines"], cons),
//      Rule("script", ["hat", "lines", "cap"], consPush),
    Rule("script", ["lines"], identity),

    Rule("lines", ["stack"], box),
    Rule("lines", ["lines", "stack"], push),

    ShapeRule("hat"),
    ShapeRule("stack"),
    ShapeRule("cap"),

    Rule("blank-line", [new LineSpec({blank: true})], constant(null)),
]);


/* for parseLines */

function isDefinitionLine(line) {
  return /^[ \t]*define(-atomic)? /.test(line);
}

function modeGrammar(modeCfg) {
  var grammar = g.copy();
  modeCfg.variables.forEach(function(variable) {
    var name = variable.name;
    addDefinition(grammar, {name: name});
  });
  modeCfg.lists.forEach(function(list) {
    var name = list.name;
    addDefinition(grammar, {name: name, value: []});
  });
  modeCfg.definitions.forEach(function(result) {
    addCustomBlock(grammar, result);
  });
  return grammar;
}


// selectors sorted for completion:
// - part based on block usage data
// - part based on usability guesswork (eg. blocks before their `and wait` versions)
// - part opinionated (eg. I use cloning a lot, and phosphorus doesn't support video)

var preferSelectors = [
  /* predicates */

  'BooleanParam',
  'sensing_coloristouchingcolor',
  'sensing_touchingobject',
  'sensing_touchingcolor',
  'sensing_mousedown',
  'sensing_keypressed',
  'data_listcontainsitem',
  'operator_contains',
  'operator_not',

  /* reporters */
  'ReporterParam',
  'VariableName',

  'operator_add',
  'operator_subtract',
  'operator_multiply',
  'operator_divide',

  'operator_mod',

  'operator_length',
  'operator_letter_of',
  'data_lengthoflist',
  'sensing_timer',

  'operator_round',
  'operator_mathop',

  'motion_direction',
  'sensing_distanceto',
  'looks_costumenumbername',
  'looks_backdropnumbername',

  'operator_random',

  'sensing_current',

  'sensing_mousex',
  'sensing_mousey',
  'sensing_username',
  'music_getTempo',
  'sound_volume',
  'sensing_loudness',

  'data_itemoflist',
  'data_itemnumoflist',
  'sensing_of',

  'videoSensing_videoOn',
  'translate_getTranslate',
  'translate_getViewerLanguage',

  /* blocks */

  // 'procedures_call', TODO sort calls first

  'data_addtolist',
  'sensing_askandwait',

  'event_broadcast',
  'event_broadcastandwait',

  'motion_changexby',
  'motion_changeyby',
  'looks_changesizeby',
  'looks_changeeffectby',
  'pen_changePenSizeBy',
  'pen_changePenColorParamBy',
  'sound_changevolumeby',
  'sound_changeeffectby',
  'music_changeTempo',
  'data_changevariableby', // TODO sort vars first

  'looks_cleareffects',
  'sound_cleareffects',

  'control_create_clone_of',

  // 'procedures_definition'
  'control_delete_this_clone',
  'data_deleteoflist',
  'data_deletealloflist',

  'pen_clear',

  'control_forever',

  'motion_gotoxy',
  'motion_goto',
  'looks_gotofrontback',
  'looks_goforwardbackwardlayers',
  'motion_glidesecstoxy',
  'motion_glideto',

  'looks_hide',
  'data_hidevariable',
  'data_hidelist',

  'control_if_else',
  'data_insertatlist',
  'motion_ifonedgebounce',

  'motion_movesteps',
  'makeymakey_whenMakeyKeyPressed',
  'makeymakey_whenCodePressed',

  'looks_nextcostume',
  'looks_nextbackdrop',

  'motion_pointindirection',
  'motion_pointtowards',
  'pen_penDown',
  'pen_penUp',
  'sound_playuntildone',
  'music_playNoteForBeats',
  'music_playDrumForBeats',

  'control_repeat',
  'control_repeat_until',
  'data_replaceitemoflist',
  'sensing_resettimer',
  'music_restForBeats',

  'looks_say',
  'looks_sayforsecs',

  'data_setvariableto',
  'motion_setxy',
  'motion_sety',
  'looks_setsizeto',
  'looks_seteffectto',
  'pen_setPenSizeTo',
  'pen_setPenColorToColor',
  'pen_setPenColorParamTo',
  'sound_setvolumeto',
  'sound_seteffectto',
  'motion_setrotationstyle',
  'sensing_setdragmode',
  'music_setInstrument',
  'music_setTempo',
  'videoSensing_setVideoTransparency',
  'text2speech_setVoice',
  'text2speech_setLanguage',

  'looks_show',
  'data_showvariable',
  'data_showlist',

  'control_stop',
  'sound_play',
  'sound_stopallsounds',
  'pen_stamp',
  'text2speech_speakAndWait',

  'looks_switchcostumeto',
  'looks_switchbackdropto',
  'looks_switchbackdroptoandwait',

  'motion_turnright',
  'motion_turnleft',
  'looks_think',
  'looks_thinkforsecs',
  'videoSensing_videoToggle',

  'event_whenflagclicked',

  'control_wait',
  'control_wait_until',

  'event_whenkeypressed',
  'control_start_as_clone',
  'event_whenbroadcastreceived',
  'event_whenthisspriteclicked',
  //'event_whengreaterthan', TODO completion for this
  //'videoSensing_whenMotionGreaterThan',
  'event_whenbackdropswitchesto',

  'end',
  'else',
];


export {
  tokenize,
  defineGrammar,
  g as grammar,
  coreGrammar as _coreGrammar, // DEBUG
  blockGrammar,
  whitespacePat,
  eolPat,
  addDefinition,
  addCustomBlock,
  splitStringToken,
  addParameters,

  // for Compiler
  precedence,
  menusThatAcceptReporters,
  menusThatAcceptStrings,
  menuOptions,
  menuLabels,
  blocksWithNumberLiterals,

  // for automatic variable renaming
  cleanName,

  // for parseLines
  isDefinitionLine,
  modeGrammar,

  // for completion
  preferSelectors,
};
