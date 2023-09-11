import React from 'react';
import bindAll from 'lodash.bindall';
import {connect} from 'react-redux';
import {
    EditorView,
    keymap,
    lineNumbers,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor
} from '@codemirror/view';
import {EditorState, Compartment} from '@codemirror/state';
import {
    defaultKeymap,
    indentWithTab,
    history,
    historyKeymap
} from '@codemirror/commands';
import {searchKeymap} from '@codemirror/search';
import {
    syntaxHighlighting,
    StreamLanguage,
    HighlightStyle,
    indentOnInput
} from '@codemirror/language';
import {closeBrackets, closeBracketsKeymap} from '@codemirror/autocomplete';
import {Tag, tags} from '@lezer/highlight';

import CodeEditorComponent from '../components/code-editor/code-editor.jsx';
import {themeMap, getColorsForTheme} from '../lib/themes';
import toshParser from '../lib/tosh/mode';

tags['s-number'] = Tag.define(tags.number);
tags['s-menu'] = Tag.define(tags.string);
tags['s-escape'] = Tag.define(tags.escape);
tags['s-color'] = Tag.define(tags.color);
tags['s-comment'] = Tag.define(tags.comment);
tags['s-false'] = Tag.define(tags.bool);
tags['s-zero'] = Tag.define();
tags['s-empty'] = Tag.define();
tags['s-ellipsis'] = Tag.define();

tags['s-motion'] = Tag.define();
tags['s-looks'] = Tag.define();
tags['s-sound'] = Tag.define();
tags['s-events'] = Tag.define();
tags['s-control'] = Tag.define();
tags['s-sensing'] = Tag.define();
tags['s-pen'] = Tag.define();
tags['s-operators'] = Tag.define();
tags['s-variable'] = Tag.define();
tags['s-list'] = Tag.define();
tags['s-custom'] = Tag.define();
tags['s-extension'] = Tag.define();

tags['s-green'] = Tag.define();
tags['s-parameter'] = Tag.define();
tags['s-error'] = Tag.define();
tags['s-grey'] = Tag.define();

class CodeEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setElement'
        ]);
        this.element = null;
        this.view = null;
        this.themeOptions = new Compartment();
    }
    componentDidMount () {
        this.view = new EditorView({
            parent: this.element,
            extensions: [
                history(),
                lineNumbers(),
                dropCursor(),
                drawSelection(),
                EditorState.allowMultipleSelections.of(true),
                rectangularSelection(),
                crosshairCursor(),
                closeBrackets(),
                indentOnInput(),
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    indentWithTab,
                    ...historyKeymap,
                    ...searchKeymap
                ]),
                this.themeOptions.of([
                    EditorView.darkTheme.of(themeMap[this.props.theme].dark),
                    syntaxHighlighting(this.getHighlightStyle())
                ]),
                StreamLanguage.define(toshParser({
                    variables: [],
                    lists: [],
                    definitions: []
                }))
            ]
        });
        if (document.activeElement === document.body) this.view.focus();
    }
    componentDidUpdate () {
        this.updateTheme();
    }
    setElement (element) {
        this.element = element;
    }
    updateTheme () {
        this.view.dispatch({
            effects: this.themeOptions.reconfigure([
                EditorView.darkTheme.of(themeMap[this.props.theme].dark),
                syntaxHighlighting(this.getHighlightStyle())
            ])
        });
    }
    getHighlightStyle () {
        const colors = getColorsForTheme(this.props.theme);
        return HighlightStyle.define([
            {tag: tags['s-escape'], color: colors.codeTransparentText},

            {tag: tags['s-motion'], color: colors.motion.code},
            {tag: tags['s-looks'], color: colors.looks.code},
            {tag: tags['s-sound'], color: colors.sounds.code},
            {tag: tags['s-events'], color: colors.event.code},
            {tag: tags['s-control'], color: colors.control.code},
            {tag: tags['s-sensing'], color: colors.sensing.code},
            {tag: tags['s-pen'], color: colors.pen.code},
            {tag: tags['s-operators'], color: colors.operators.code},
            {tag: tags['s-variable'], color: colors.data.code},
            {tag: tags['s-list'], color: colors.data_lists.code},
            {tag: tags['s-custom'], color: colors.more.code},
            {tag: tags['s-extension'], color: colors.pen.code},

            {tag: tags['s-green'], color: colors.operators.code},
            {tag: tags['s-parameter'], color: colors.customBlockParameter},
            {tag: tags['s-error'], color: colors.error},
            {tag: tags['s-grey'], color: colors.codeTransparentText}
        ]);
    }
    render () {
        return (
            <CodeEditorComponent
                containerRef={this.setElement}
                {...this.props}
            />
        );
    }
}

const mapStateToProps = state => ({
    theme: state.scratchGui.theme.theme
});

export default connect(mapStateToProps)(CodeEditor);
