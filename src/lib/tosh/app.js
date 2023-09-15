import {pickedCompletion} from '@codemirror/autocomplete';

import assert from './assert';
import * as Language from './language';

/*****************************************************************************/
/* completion */

export function inputSeek(view, dir) {
  // TODO fix for ellipsises
  var l = tokenizeAtCursor(
    view.state,
    view.state.selection.main.from,
    {splitSelection: false}
  );
  if (!l) return false;
  if (l.selection.indexOf('\n') > -1) return false;
  if (!l.tokens.length) return false; // do nothing if the line is blank

  var index = l.cursor + dir;
  if (dir > 0 && l.tokens[l.cursor] && l.tokens[l.cursor].text === '-') index += 1;
  for (var i = index;
       dir > 0 ? i < l.tokens.length : i >= 0;
       i += dir
  ) {
    var token = l.tokens[i];
    if (['symbol', 'lparen', 'rparen', 'langle', 'rangle',
         'lsquare', 'rsquare'].indexOf(token.kind) === -1) {
      var start = l.start + measureTokens(l.tokens.slice(0, i));
      var end = start + token.text.replace(/ *$/, "").length;
      if (token.kind === 'number' && l.tokens[i - 1].text === '-') start--;
      if (token.kind === 'string') { start++; end--; }

      view.dispatch({selection: {anchor: start, head: end}});
      return true;
    }
  }

  var c = dir > 0 ? l.end : l.start;
  view.dispatch({selection: {anchor: c}});
  return true;
}

function tabify(text, indent) {
  text = text || '';
  var indentation = '';
  for (var i = 0; i < indent; i++) indentation += ' ';
  var lines = text.split('\n');
  for (var j = 1; j < lines.length; j++) {
    lines[j] = indentation + lines[j];
  }
  return lines.join('\n');
}

function measureTokens(tokens) {
  var length = 0;
  for (var i = 0; i < tokens.length; i++) {
    length += tokens[i].text.length;
  }
  return length;
}

function tokenizeAtCursor(state, pos, options) {
  var selection = state.sliceDoc(state.selection.main.from, state.selection.main.to);
  var line = state.doc.lineAt(pos);
  var cursorCh = pos - line.from;
  var text = line.text;

  var indent = /^[ \t]*/.exec(text)[0].length;
  var prefix = text.slice(indent, cursorCh);
  var suffix = text.slice(cursorCh);

  var isPartial = !/ $/.test(prefix);
  var hasPadding = /^[ ?]/.test(suffix);

  var tokens,
      cursorIndex;
  if (options.splitSelection) {
    var beforeTokens = Language.tokenize(prefix);
    var afterTokens = Language.tokenize(suffix);
    tokens = beforeTokens.concat(afterTokens);
    cursorIndex = beforeTokens.length;
  } else {
    tokens = Language.tokenize(prefix + suffix);
    var size = indent;
    for (var i = 0; i < tokens.length; i++) {
      size += tokens[i].text.length;
      if (size > cursorCh) {
        break;
      }
    }
    cursorIndex = i;
  }

  var to = measureTokens(tokens.slice(0, cursorIndex));
  var from;
  if (isPartial) {
    from = measureTokens(tokens.slice(0, cursorIndex - 1));
  } else {
    from = to;
  }

  return {
    from:  line.from + indent + from,
    to:    line.from + indent + to,
    end:   line.from + text.length,
    start: line.from + indent,
    indent,

    selection: selection,

    cursor: cursorIndex,
    tokens: tokens,
    isPartial: isPartial,
    hasPadding: hasPadding,
  };
}

function expandCompletions(completions, g) {
  function expand(symbol) {
    // don't suggest names twice
    if (['VariableName', 'ListName', 'ReporterParam'].indexOf(symbol) > -1) return [];

    if (typeof symbol !== 'string') {
      return [[symbol]];
    }
    if (/^@/.test(symbol)) {
      return [g.rulesByName[symbol][0].symbols];
    } if (/^[md]_/.test(symbol) || /^[A-Z]/.test(symbol)) {
      return (g.rulesByName[symbol] || []).map(function(rule) {
        return rule.symbols;
      });
    }
    return [[symbol]];
  }

  var choices = [];
  completions.forEach(function(c) {
    var symbols = c.completion;
    if (!symbols.length) return;
    var first = symbols[0],
    rest = symbols.slice(1);
    var more = expand(first).map(function(symbols) {
      return {
        completion: symbols.concat(rest),
        via: c,
      };
    });
    choices = choices.concat(more);
  });
  return choices;
}

export function computeHint(context, completer, grammar, {suggestEnd, suggestElse}) {
  var l = tokenizeAtCursor(context.state, context.pos, {splitSelection: true});
  if (!l) return false;
  if (l.cursor === 0) {
    return false;
  }
  /*
  if (!(l.selection === "" || l.selection === "_" ||
        l.selection === "<>")) {
    return false;
  }*/

  var tokens = l.tokens.slice();
  var cursor = l.cursor;

  var isValid;
  try {
    completer.parse(tokens); isValid = true;
  } catch (e) {
    isValid = false;
    // console.log(e); // DEBUG
  }

  var partial;
  if (l.isPartial) {
    partial = tokens[cursor - 1];
    tokens.splice(cursor - 1, 1);
    cursor--;

    // don't offer completions if we don't need to
    // eg. "stop all|" should *not* suggest "sounds"
    if (isValid && !l.selection && !context.explicit) return;
  }

  var completions = completer.complete(tokens, cursor);
  if (!completions) {
    return false; // not a list--there was an error!
  }

  if (!tokens.length) {
    // TODO move 'define' into main grammar
    ['define-atomic', 'define'].forEach(function(keyword) {
      completions.splice(0, 0, {
        start: 0,
        end: 0,
        pre: [],
        post: [],
        rule: {process: {_info: {category: 'custom'}}},
        item: null,
        completion: [{kind: 'symbol', value: keyword}, "block"],
      });
    });
  }

  completions = completions.filter(function(c) {
    if (c.pre.length === 1 && typeof c.pre[0] === "string") return false;
    if (c.pre[0] === "block") return false;
    if (c.rule.process.name === 'unaryMinus') return false;
    if (c.rule.process._info === undefined && c.rule.symbols[0].value === undefined) return false;
    return true;
  });

  var expansions = expandCompletions(completions, grammar);
  expansions.forEach(function(x) {
    x.length = x.via.end - x.via.start;
  });

  /*
  if (expansions.length) {
    var shortest = Math.min.apply(null, expansions.map(function(x) {
      return x.completion.filter(function(symbol) { return symbol.kind !== 'symbol' }).length;
    }));
    expansions = expansions.filter(function(x) {
      var length = x.completion.filter(function(symbol) { return symbol.kind !== 'symbol' }).length;
      return length === shortest;
    });
  }
  */

  if (l.isPartial) {
    expansions = expansions.filter(function(x) {
      var first = x.completion[0];
      return (first.kind === 'symbol' && partial.kind === 'symbol' &&
              first.value && first.value.indexOf(partial.value) === 0
      ); // || (typeof first === 'string' && x.via.pre.length);
    });
  } else {
    // don't complete keys!
    expansions = expansions.filter(function(x) {
      var first = x.completion[0];
      return !(first.kind === 'symbol' && /^[a-z0-9]$/.test(first.value));
    });

    if (cursor === tokens.length) {
      expansions = expansions.filter(function(x) {
        return x.via.pre.length || x.via.post.length;
      });
    }
  }

  expansions.sort(function(a, b) {
    var aInfo = a.via.rule.process._info;
    var bInfo = b.via.rule.process._info;
    var aSelector = aInfo ? aInfo.selector : a.via.rule.name;
    var bSelector = bInfo ? bInfo.selector : b.via.rule.name;

    var aIndex = Language.preferSelectors.indexOf(aSelector);
    var bIndex = Language.preferSelectors.indexOf(bSelector);
    if (aIndex > -1 && bIndex > -1) {
      if (aIndex !== bIndex) return aIndex - bIndex;
    } else if (aIndex > -1) {
      return +1;
    }

    var aText = a.completion.join(" ");
    var bText = b.completion.join(" ");
    return aText < bText ? -1 : aText > bText ? +1 : 0;
  });

  var ruleCategories = {
    'VariableName': 'variable',
    'ListName': 'list',
  };

  var list = [];
  expansions.forEach(function(x) {
    var symbols = x.completion.slice();
    var c = x.via;

    assert(symbols.length);

    var selection;
    var text = "";
    var displayText = "";
    for (var i = 0; i < symbols.length; i++) {
      var part = symbols[i];
      var displayPart = undefined;

      if (i > 0 && part.value !== "?") {
        displayText += " ";
        text += " ";
      }

      if (typeof part === "string") {
        var name = symbols[i];
        if (name[0] === "@") {
          part = grammar.rulesByName[name][0].symbols[0].value;
        } else {
          if (/^b[0-9]?$/.test(name)) {
            part = "<>";
          } else {
            part = "_";
          }

          if (partial && i === 0) {
            displayPart = part;
            part = partial.value;
            if (!selection) selection = {ch: text.length + part.length, size: 0};
          } else {
            if (!selection) selection = {ch: text.length, size: part.length};
          }

          /*
          if (l.isPartial && i === 0) {
            // Sometimes we need more than one token!
            // Not sure what to do about this…

            var token = l.tokens[l.cursor - 1];
            displayPart = part;
            part = token.text;
            selection = { ch: part.length };
          }
          */
        }
      } else if (part && part.kind === "symbol") {
        part = part.value;
      } else {
        return;
      }
      text += part;
      displayText += (displayPart === undefined ? part : displayPart);
    }

    if (displayText === "<>" || displayText === "_") return;

    assert(text);

    if (text === "else" && !suggestElse) return;
    if (text === "end" && !suggestEnd) return;

    // no space before trailing `?`
    text = text.replace(/ \?$/, "?");

    // add padding, but only very rarely
    if (!l.hasPadding && !isValid && partial && partial.text === text) {
      text += " ";
    }

    var info = {};
    if (c.rule.process._info) {
      info = c.rule.process._info;
    } else {
      c.item.predictedBy.forEach(function(item) {
        info = item.rule.process._info || {};
      });
    }

    // add "end" after c-blocks
    switch (info.shape) {
      case 'c-block':
      case 'c-block cap':
      case 'if-block':
        var after = "\nend";
        if (!selection) { // no inputs
          // put cursor at EOL
          selection = {ch: text.length, size: 0};
        }
        text += tabify(after, l.indent);
        break;
    }

    var completion = {
      displayLabel: displayText,
      label: text,
      type: info.category || ruleCategories[c.rule.name],
      apply: (view, completion, from, to) => applyHint(view, completion, from, to, selection),
      // _name: c.rule.name, // DEBUG
    };

    /*
    if (l.isPartial) {
      completion.text += " ";

      if (text === "_") {
        completion.selection = undefined;
      }

      if (!completion.selection) {
        completion.seekInput = true;
      }

      var nextToken = l.tokens[l.cursor];
      if (nextToken && /^ /.test(nextToken.text)) {
        completion.to = { line: l.to.line, ch: l.to.ch + 1 };
      }
    }
    */

    list.push(completion);
  });

  var result = {
    options: list,
    filter: false,
    from: l.from,
    to: l.to,
  };

  function applyHint(view, completion, from, to, selection) {
    var text = completion.label;
    view.dispatch({
      changes: {from, to, insert: text},
      selection: selection ? {
        anchor: from + selection.ch,
        head: from + selection.ch + (selection.size || 0),
      } : {anchor: from + text.length},
      scrollIntoView: true,
      userEvent: 'input.complete',
      annotations: pickedCompletion.of(completion),
    });
  }

  return result;
}
