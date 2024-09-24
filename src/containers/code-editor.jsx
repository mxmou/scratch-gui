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
import getParserOptions from '../lib/code-editor/parser-options';
import {errorWidget, setErrorWidget} from '../lib/code-editor/error-widget';
import generateAllTargets from '../lib/code-editor/generate-all';
import toshParser from '../lib/tosh/mode';
import {inputSeek} from '../lib/tosh/app';
import * as ToshLanguage from '../lib/tosh/language';
import {setTargetState, setTargetScrollPos, setTargetError} from '../reducers/code-editor';

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
        this.view = new EditorView({parent: this.element});
        if (this.props.editingTarget) this.loadTargetState();
    }
    componentDidUpdate (prevProps) {
        if (this.props.theme !== prevProps.theme) {
            this.updateTheme();
        }
        if (this.props.editingTarget && this.props.editingTarget !== prevProps.editingTarget) {
            this.saveTargetState(prevProps.editingTarget);
            this.loadTargetState();
        } else if (this.props.targetErrors[this.props.editingTarget] !==
                prevProps.targetErrors[this.props.editingTarget]) {
            this.showErrorWidget();
            this.scrollErrorIntoView();
        }
        if (!this.repaintTimeout && (
            this.props.sprites !== prevProps.sprites ||
            this.props.stage !== prevProps.stage
        )) {
            this.repaintTimeout = setTimeout(this.updateParserOptions, 1000);
        }
    }
    componentWillUnmount () {
        this.saveTargetState(this.props.editingTarget);
        if (this.repaintTimeout) clearTimeout(this.repaintTimeout);
        this.view.destroy();
    }
    newState (code) {
        return EditorState.create({
            doc: code,
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
                    icons: false,
                    optionClass: ({type}) => (type ? `tb3-category-${type}` : ''),
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
                    this.getEditorTheme(),
                    syntaxHighlighting(this.getHighlightStyle())
                ]),
                this.parserOptions.of([]),
                errorWidget
            ]
        });
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
        this.view.dispatch({
            effects: this.parserOptions.reconfigure([
                StreamLanguage.define(toshParser(
                    getParserOptions(this.props.vm, this.props.editingTarget)
                ))
            ])
        });
    }
    loadTargetState () {
        this.element.classList.add(styles.loading);
        if (Object.prototype.hasOwnProperty.call(this.props.targetStates, this.props.editingTarget)) {
            this.view.setState(this.props.targetStates[this.props.editingTarget]);
        } else {
            const target = this.props.vm.editingTarget;
            if (target.code === null) {
                generateAllTargets(this.props.vm);
            }
            this.view.setState(this.newState(target.code));
            this.props.setTargetState(this.props.editingTarget, this.view.state);
        }
        if (Object.prototype.hasOwnProperty.call(this.props.targetScrollPos, this.props.editingTarget)) {
            const scrollSnapshot = this.props.targetScrollPos[this.props.editingTarget];
            setTimeout(() => {
                this.view.dispatch({
                    effects: scrollSnapshot
                });
            }, 0);
        } else {
            setTimeout(() => {
                this.view.dispatch({
                    effects: EditorView.scrollIntoView(0)
                });
                this.scrollErrorIntoView();
            }, 0);
        }
        // Timeout prevents error:
        // Calls to EditorView.update are not allowed while an update is in progress
        setTimeout(() => {
            this.updateParserOptions();
            this.showErrorWidget();
            this.element.classList.remove(styles.loading);
        }, 0);
    }
    saveTargetState (target) {
        if (target) {
            this.props.setTargetState(target, this.view.state);
            this.props.setTargetScrollPos(target, this.view.scrollSnapshot());
        }
    }
    getEditorTheme () {
        const colors = getColorsForTheme(this.props.theme);
        const completion = category => `.tb3-category-${category} .cm-completionLabel`;
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
            const doc = update.state.doc;
            if (this.props.vm.editingTarget) {
                this.props.vm.editingTarget.code = doc.toString();
            }
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
    showErrorWidget () {
        const error = this.props.targetErrors[this.props.editingTarget];
        if (error && error.rendered) return;
        this.view.dispatch({
            effects: setErrorWidget.of(error)
        });
        if (error) {
            this.props.setTargetError(this.props.editingTarget, {
                ...error,
                rendered: true
            });
        }
    }
    scrollErrorIntoView () {
        const error = this.props.targetErrors[this.props.editingTarget];
        if (!error) return;
        this.view.dispatch({
            effects: EditorView.scrollIntoView(
                this.view.state.doc.line(error.lineNumber).from,
                {yMargin: 20}
            )
        });
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
    setTargetError: PropTypes.func.isRequired,
    setTargetScrollPos: PropTypes.func.isRequired,
    setTargetState: PropTypes.func.isRequired,
    sprites: PropTypes.objectOf(targetShape),
    stage: targetShape,
    targetErrors: PropTypes.objectOf(PropTypes.shape({
        lineNumber: PropTypes.number,
        message: PropTypes.string,
        rendered: PropTypes.bool
    })).isRequired,
    targetScrollPos: PropTypes.objectOf(PropTypes.shape({
        top: PropTypes.number,
        left: PropTypes.number
    })).isRequired,
    targetStates: PropTypes.objectOf(PropTypes.instanceOf(EditorState)).isRequired,
    vm: PropTypes.instanceOf(VM).isRequired
};

const mapStateToProps = state => ({
    editingTarget: state.scratchGui.targets.editingTarget,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage,
    targetErrors: state.scratchGui.codeEditor.targetErrors,
    targetScrollPos: state.scratchGui.codeEditor.targetScrollPos,
    targetStates: state.scratchGui.codeEditor.targetStates,
    theme: state.scratchGui.theme.theme
});

const mapDispatchToProps = dispatch => ({
    setTargetError: (target, error) => {
        dispatch(setTargetError(target, error));
    },
    setTargetState: (target, editorState) => {
        dispatch(setTargetState(target, editorState));
    },
    setTargetScrollPos: (target, top, left) => {
        dispatch(setTargetScrollPos(target, top, left));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(CodeEditor);
