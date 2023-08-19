import React from 'react';
import bindAll from 'lodash.bindall';
import {
    EditorView,
    keymap,
    lineNumbers,
    drawSelection,
    dropCursor,
    rectangularSelection,
    crosshairCursor
} from '@codemirror/view';
import {EditorState} from '@codemirror/state';
import {
    defaultKeymap,
    indentWithTab,
    history,
    historyKeymap
} from '@codemirror/commands';
import {searchKeymap} from '@codemirror/search';

import CodeEditorComponent from '../components/code-editor/code-editor.jsx';

class CodeEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setElement'
        ]);
        this.element = null;
        this.view = null;
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
                ])
            ]
        });
        if (document.activeElement === document.body) this.view.focus();
    }
    setElement (element) {
        this.element = element;
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

export default CodeEditor;
