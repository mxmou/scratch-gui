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
import {Tag, tags} from '@lezer/highlight';
import VM from 'scratch-vm';
import Variable from 'scratch-vm/src/engine/variable';

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
        this.parserOptions = new Compartment();
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
                this.parserOptions.of([])
            ]
        });
        this.updateParserOptions();
        if (document.activeElement === document.body) this.view.focus();
    }
    componentDidUpdate () {
        this.updateTheme();
        this.updateParserOptions();
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
        if (this.view) {
            this.element.appendChild(this.view.dom);
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
        const target = this.props.vm.editingTarget;
        if (!target) {
            return;
        }
        let variableNames = this.getVariableNamesOfType(target.variables, Variable.SCALAR_TYPE);
        let listNames = this.getVariableNamesOfType(target.variables, Variable.LIST_TYPE);
        if (!target.isStage) {
            variableNames = [
                ...variableNames,
                ...this.getVariableNamesOfType(this.props.stage.variables, Variable.SCALAR_TYPE)
            ];
            listNames = [
                ...listNames,
                ...this.getVariableNamesOfType(this.props.stage.variables, Variable.LIST_TYPE)
            ];
        }

        this.view.dispatch({
            effects: this.parserOptions.reconfigure([
                StreamLanguage.define(toshParser({
                    variables: variableNames,
                    lists: listNames,
                    definitions: []
                }))
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
