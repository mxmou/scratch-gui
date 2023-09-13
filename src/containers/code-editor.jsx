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
import VM from 'scratch-vm';
import Variable from 'scratch-vm/src/engine/variable';

import CodeEditorComponent from '../components/code-editor/code-editor.jsx';
import {themeMap, getColorsForTheme} from '../lib/themes';
import toshTags from '../lib/code-editor/tags';
import toshParser from '../lib/tosh/mode';
import * as ToshEarley from '../lib/tosh/earley';
import * as ToshLanguage from '../lib/tosh/language';

class CodeEditor extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'setElement',
            'updateParserOptions',
            'handleViewUpdate'
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
                keymap.of([
                    ...closeBracketsKeymap,
                    ...defaultKeymap,
                    indentWithTab,
                    ...historyKeymap,
                    ...searchKeymap
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
                EditorView.darkTheme.of(themeMap[this.props.theme].dark),
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
        let variables = this.getVariableNamesOfType(target.variables, Variable.SCALAR_TYPE);
        let lists = this.getVariableNamesOfType(target.variables, Variable.LIST_TYPE);
        if (!target.isStage) {
            variables = [
                ...variables,
                ...this.getVariableNamesOfType(this.props.stage.variables, Variable.SCALAR_TYPE)
            ];
            lists = [
                ...lists,
                ...this.getVariableNamesOfType(this.props.stage.variables, Variable.LIST_TYPE)
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
