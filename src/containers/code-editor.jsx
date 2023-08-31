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

import CodeEditorComponent from '../components/code-editor/code-editor.jsx';
import {themeMap} from '../lib/themes';

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
                keymap.of([
                    ...defaultKeymap,
                    indentWithTab,
                    ...historyKeymap,
                    ...searchKeymap
                ]),
                this.themeOptions.of([
                    EditorView.darkTheme.of(themeMap[this.props.theme].dark)
                ])
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
                EditorView.darkTheme.of(themeMap[this.props.theme].dark)
            ])
        });
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
