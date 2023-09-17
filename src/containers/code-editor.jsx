import React from 'react';
import PropTypes from 'prop-types';
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
import {defaultKeymap, history, historyKeymap} from '@codemirror/commands';
import {searchKeymap} from '@codemirror/search';
import {
    syntaxHighlighting,
    StreamLanguage,
    HighlightStyle,
    indentOnInput,
    indentRange
} from '@codemirror/language';
import {
    closeBrackets,
    closeBracketsKeymap,
    autocompletion,
    completionKeymap,
    acceptCompletion
} from '@codemirror/autocomplete';
import VM from 'scratch-vm';

import CodeEditorComponent from '../components/code-editor/code-editor.jsx';
import {themeMap, getColorsForTheme} from '../lib/themes';
import toshTags from '../lib/code-editor/tags';
import toshParser from '../lib/tosh/mode';
import {inputSeek} from '../lib/tosh/app';
import * as ToshEarley from '../lib/tosh/earley';
import * as ToshLanguage from '../lib/tosh/language';

import styles from '../components/code-editor/code-editor.css';

class CodeEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setElement',
            'updateParserOptions',
            'handleViewUpdate',
            'indentSelection'
        ]);
        this.element = null;
        this.view = null;
        this.themeOptions = new Compartment();
        this.parserOptions = new Compartment();
        this.repaintTimeout = null;
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
                autocompletion({
                    defaultKeymap: false,
                    addToOptions: [
                        {
                            render: () => Object.assign(document.createElement('span'), {
                                className: styles.tabHint,
                                textContent: 'Tab ⇥'
                            }),
                            position: 90
                        }
                    ]
                }),
                keymap.of([
                    // Tab accepts the selected completion
                    {key: 'Tab', run: acceptCompletion},
                    // If no completions are available, it jumps to the next input
                    {key: 'Tab', run: view => inputSeek(view, 1)},
                    {key: 'Shift-Tab', run: view => inputSeek(view, -1)},
                    // inputSeek fails if the selection is on an empty line or contains multiple lines
                    // Tab can be used to auto-indent in those cases
                    {key: 'Tab', run: this.indentSelection},
                    // Only complete on Tab, not Enter
                    ...completionKeymap.filter(cmd => cmd.key !== 'Enter'),
                    ...closeBracketsKeymap,
                    ...historyKeymap,
                    ...searchKeymap,
                    ...defaultKeymap
                ]),
                EditorView.updateListener.of(this.handleViewUpdate),
                this.themeOptions.of([
                    EditorView.darkTheme.of(themeMap[this.props.theme].dark),
                    syntaxHighlighting(this.getHighlightStyle())
                ]),
                this.parserOptions.of([])
            ]
        });
        this.updateParserOptions();
    }
    componentDidUpdate () {
        this.updateTheme();
        if (!this.repaintTimeout) this.repaintTimeout = setTimeout(this.updateParserOptions, 1000);
    }
    getVariableNamesOfType (variables, type) {
        return Object.values(variables)
            .filter(variable => variable.type === type)
            .map(variable => ({
                _name: () => variable.name
            }));
    }
    setElement (element) {
        this.element = element;
        if (element && this.view) {
            element.appendChild(this.view.dom);
            if (document.activeElement === document.body) this.view.focus();
        }
    }
    updateTheme () {
        this.view.dispatch({
            effects: this.themeOptions.reconfigure([
                this.getEditorTheme(),
                syntaxHighlighting(this.getHighlightStyle())
            ])
        });
    }
    updateParserOptions () {
        this.repaintTimeout = null;

        const target = this.props.vm.editingTarget;
        if (!target) {
            return;
        }
        let variables = this.getVariableNamesOfType(target.variables, VM.SCALAR_VARIABLE);
        let lists = this.getVariableNamesOfType(target.variables, VM.LIST_VARIABLE);
        if (!target.isStage) {
            variables = [
                ...variables,
                ...this.getVariableNamesOfType(this.props.stage.variables, VM.SCALAR_VARIABLE)
            ];
            lists = [
                ...lists,
                ...this.getVariableNamesOfType(this.props.stage.variables, VM.LIST_VARIABLE)
            ];
        }

        // Update definitions - based on ScriptsEditor.checkDefinitions from tosh
        const definitions = [];
        const defineParser = new ToshEarley.Parser(ToshLanguage.defineGrammar);
        for (const line of this.view.state.doc.iterLines()) {
            if (!ToshLanguage.isDefinitionLine(line)) continue;
            const tokens = ToshLanguage.tokenize(line);
            let results;
            try {
                results = defineParser.parse(tokens);
            } catch {
                continue;
            }
            if (results.length > 1) {
                console.log(`ambiguous define. count: ${results.length}`); // eslint-disable-line no-console
                continue;
            }
            definitions.push(results[0].process());
        }

        this.view.dispatch({
            effects: this.parserOptions.reconfigure([
                StreamLanguage.define(toshParser({
                    variables,
                    lists,
                    definitions
                }))
            ])
        });
    }
    getEditorTheme () {
        const colors = getColorsForTheme(this.props.theme);
        const completion = category => `.cm-completionIcon-${category} + .cm-completionLabel`;
        return EditorView.theme({
            [completion('motion')]: {color: colors.motion.code},
            [completion('looks')]: {color: colors.looks.code},
            [completion('sound')]: {color: colors.sounds.code},
            [completion('events')]: {color: colors.event.code},
            [completion('control')]: {color: colors.control.code},
            [completion('sensing')]: {color: colors.sensing.code},
            [completion('pen')]: {color: colors.pen.code},
            [completion('operators')]: {color: colors.operators.code},
            [completion('variable')]: {color: colors.data.code},
            [completion('list')]: {color: colors.data_lists.code},
            [completion('custom')]: {color: colors.more.code},
            [completion('extension')]: {color: colors.pen.code},
            [completion('parameter')]: {color: colors.customBlockParameter}
        }, {dark: themeMap[this.props.theme].dark});
    }
    getHighlightStyle () {
        const colors = getColorsForTheme(this.props.theme);
        return HighlightStyle.define([
            {tag: toshTags['s-escape'], color: colors.codeTransparentText},

            {tag: toshTags['s-motion'], color: colors.motion.code},
            {tag: toshTags['s-looks'], color: colors.looks.code},
            {tag: toshTags['s-sound'], color: colors.sounds.code},
            {tag: toshTags['s-events'], color: colors.event.code},
            {tag: toshTags['s-control'], color: colors.control.code},
            {tag: toshTags['s-sensing'], color: colors.sensing.code},
            {tag: toshTags['s-pen'], color: colors.pen.code},
            {tag: toshTags['s-operators'], color: colors.operators.code},
            {tag: toshTags['s-variable'], color: colors.data.code},
            {tag: toshTags['s-list'], color: colors.data_lists.code},
            {tag: toshTags['s-custom'], color: colors.more.code},
            {tag: toshTags['s-extension'], color: colors.pen.code},

            {tag: toshTags['s-green'], color: colors.operators.code},
            {tag: toshTags['s-parameter'], color: colors.customBlockParameter},
            {tag: toshTags['s-error'], color: colors.error},
            {tag: toshTags['s-grey'], color: colors.codeTransparentText}
        ]);
    }
    handleViewUpdate (update) {
        if (update.docChanged) {
            const doc = this.view.state.doc;
            const changedLines = new Set();
            update.changes.iterChanges((fromA, toA, fromB, toB) => {
                const firstLine = doc.lineAt(fromB).number;
                const lastLine = doc.lineAt(toB).number;
                for (let line = firstLine; line <= lastLine; line++) {
                    changedLines.add(line);
                }
            });
            for (const lineNumber of changedLines) {
                if (ToshLanguage.isDefinitionLine(doc.line(lineNumber).text)) {
                    // Definition changed - need to repaint
                    if (this.repaintTimeout) clearTimeout(this.repaintTimeout);
                    this.repaintTimeout = setTimeout(this.updateParserOptions, 1000);
                    break;
                }
            }
        }
    }
    indentSelection (view) {
        view.dispatch(view.state.changeByRange(range => {
            const changes = indentRange(view.state, range.from, range.to);
            const newRange = range.map(changes.desc);
            return {changes, range: newRange};
        }));
        return true;
    }
    render () {
        /* eslint-disable no-unused-vars */
        const {
            vm,
            sprites,
            stage,
            editingTarget,
            theme,
            ...componentProps
        } = this.props;
        /* eslint-enable no-unused-vars */
        if (!vm.editingTarget) {
            return null;
        }
        return (
            <CodeEditorComponent
                containerRef={this.setElement}
                {...componentProps}
            />
        );
    }
}

const targetShape = PropTypes.shape({
    variables: PropTypes.objectOf(PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string
    }))
});

CodeEditor.propTypes = {
    editingTarget: PropTypes.string,
    theme: PropTypes.string,
    sprites: PropTypes.objectOf(targetShape),
    stage: targetShape,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    theme: state.scratchGui.theme.theme
});

export default connect(mapStateToProps)(CodeEditor);
