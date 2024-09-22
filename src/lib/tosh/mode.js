import assert from './assert';
import * as Earley from './earley';
import * as Language from './language';
import toshTags from '../code-editor/tags';
import autocomplete from '../code-editor/autocomplete';

export default function(modeCfg) {

  var State = function() {
    this.lineTokens = [];
    this.indent = [];
    this.lastLine = null; // for indenting

    var grammar = Language.modeGrammar(modeCfg);

    // store original grammar, for clearing scope correctly
    this.startGrammar = grammar;
    this.startCompleter = new Earley.Completer(grammar);
    // custom block parameters are added to a new Completer with a fresh grammar
    this.completer = this.startCompleter;
  };

  State.prototype.copy = function() {
    var s = new State();
    s.lineTokens = this.lineTokens.slice();
    s.indent = this.indent.slice();

    // don't copy these. when they change, app will refresh the entire mode.
    s.startGrammar = this.startGrammar;
    s.startCompleter = this.startCompleter;
    s.completer = this.completer;
    return s;
  };

  State.prototype.parseAndPaint = function(tokens) {
    this.lastLine = null;

    if (!tokens.length) { // blank line
      this.completer = this.startCompleter;
      this.indent = [];
      return;
    }

    var results;
    try {
      results = this.completer.parse(tokens);
    } catch (err) {
      // can't parse; mark line red
      tokens.forEach(function(t) { t.category = "error"; });
      return;
    }

    if (results.length > 1) {
      console.log("AMBIGUOUS: " + results.length + " results");
      results.forEach(function(result) {
        console.log(result.pretty());
      });
    }
    var result = results[0];
    result = result.process();

    switch (result && result.info ? result.info.shape : null) {
      case 'c-block':
      case 'c-block cap':
        this.indent.push('c');
        break;
      case 'if-block':
        this.indent.push('if');
        break;
      case 'end':
        this.indent.pop();
        break;
      case 'else':
        this.indent[this.indent.length - 1] = 'else';
        break;
    }

    // if definition, add parameters to scope
    if (result && result.info && result.info.selector === 'procedures_definition') {
      var scopeGrammar = this.startGrammar.copy();
      Language.addParameters(scopeGrammar, result);
      this.completer = new Earley.Completer(scopeGrammar);
      return;
    }

    paintBlocks(result);
    this.lastLine = result;
    return result;
  };

  function paintBlocks(b) {
    if (!b) return;
    b.tokens.forEach(function(p) {
      if (typeof p !== 'object') return;
      if (p.info) {
        paintBlocks(p);
      } else if (b.info) {
        p.category = b.info.category;
        // TODO paint variables
      }
    });
  }

  /* CodeMirror mode */

  return {
    startState: function() { return new State(); },
    copyState:  function(state) { return state.copy(); },
    token: function(stream, state) {
      if (state.lineTokens.length === 0) {
        stream.match(Language.whitespacePat);

        var m = stream.match(Language.eolPat, false); // don't consume
        var line = m[0];
        var tokens = Language.tokenize(line);
        state.parseAndPaint(tokens);

        state.lineTokens = [];
        tokens.forEach(function(token) {
          if (token.kind === 'string') {
            var stringParts = Language.splitStringToken(token);
            state.lineTokens = state.lineTokens.concat(stringParts);
          } else {
            state.lineTokens.push(token);
          }
        });
      }

      if (!state.lineTokens.length) {
        stream.match(/[ \t]*$/); // blank line?
        return;
      }

      var token = state.lineTokens.shift();
      assert(stream.match(token.text), "Does not match stream: " + token);
      stream.match(Language.whitespacePat);
      if (token.kind === 'error' && /^['"]/.test(token.text)) {
        return 'string';
      } else if (token.category) {
        return "s-" + token.category;
      } else if (token.kind === 'string') {
        return 'string';
      } else if ([
        'number',
        'color',
        'empty',
        'zero',
        'false',
        'comment',
        'ellips',
        'escape',
      ].indexOf(token.kind) !== -1) {
        return "s-" + token.kind;
      }
    },
    tokenTable: toshTags,

    blankLine: function(state) {
      state.parseAndPaint([]);
    },

    indent: function(state, textAfter, context) {
      var indent = state.indent.length; // indentation of previous line

      // look ahead to get this line's indentation
      switch (textAfter.trim()) {
        case 'end':
        case 'else':
          indent--;
      }

      // return number of spaces to indent, taking indentUnit into account
      return indent * context.unit;
    },

    languageData: {
      commentTokens: {line: '//'},
      indentOnInput: /^[ \t]*( |else|end)$/,
      closeBrackets: {brackets: ['(', '[', "'", '"']},
      autocomplete: autocomplete(modeCfg),
    },
  };
}
