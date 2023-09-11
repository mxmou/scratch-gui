import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import bindAll from 'lodash.bindall';
import {OrderedMap} from 'immutable';
import VM from 'scratch-vm';
import Variable from 'scratch-vm/src/engine/variable';

import DataPanelComponent from '../components/data-panel/data-panel.jsx';
import * as ToshLanguage from '../lib/tosh/language';

const CLOUD_PREFIX = '☁ ';

class DataPanel extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleNewVariableClick',
            'handleNewListClick',
            'handlePromptClose',
            'handlePromptOk',
            'handleToggleVisibility',
            'handleRenameListClick',
            'handleRenameVariableClick',
            'handleDeleteClick'
        ]);
        this.state = {
            promptOpen: false,
            promptType: Variable.SCALAR_TYPE,
            promptDefaultValue: '',
            idToRename: null
        };
    }
    getVariablesOfType (variables, type) {
        return Object.entries(variables)
            .filter(([_, variable]) => variable.type === type)
            .map(([id, variable]) => {
                const monitor = this.props.monitors.get(id);
                return {
                    id,
                    name: variable.name,
                    monitorVisible: monitor && monitor.visible
                }
            })
            .sort((a, b) => {
                if (a.name < b.name) return -1;
                if (a.name > b.name) return 1;
                return 0;
            });
    }
    getVariableData (variables) {
        return [
            this.getVariablesOfType(variables, Variable.SCALAR_TYPE),
            this.getVariablesOfType(variables, Variable.LIST_TYPE)
        ];
    }
    findVariable (id) {
        const target = this.props.vm.editingTarget;
        if (!target) {
            return null;
        }
        const isLocal = Object.prototype.hasOwnProperty.call(target.variables, id);
        if (isLocal) {
            return target.variables[id];
        } else {
            return this.props.stage.variables[id];
        }
    }
    getExistingVariableNames (isLocal) {
        // Finds names that might conflict with a new variable
        const target = this.props.vm.editingTarget;
        if (!target) {
            return [];
        }
        let existingVariableNames;
        if (isLocal) {
            existingVariableNames = [
                ...Object.values(target.variables),
                ...Object.values(this.props.stage.variables)
            ].filter(variable => [Variable.SCALAR_TYPE, Variable.LIST_TYPE].includes(variable.type))
                .map(variable => variable.name);
        } else {
            existingVariableNames = [
                ...this.props.vm.runtime.getAllVarNamesOfType(Variable.SCALAR_TYPE),
                ...this.props.vm.runtime.getAllVarNamesOfType(Variable.LIST_TYPE)
            ];
        }
        // Don't include the variable that's being renamed
        existingVariableNames = existingVariableNames.filter(
            name => name !== this.state.promptDefaultValue
        );
        return existingVariableNames;
    }
    generateVariableId () {
        // Based on Blockly.utils.genUid
        const soup = '!#$%()*+,-./:;=?@[]^_`{|}~' +
            'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const length = 20;
        const id = [];
        for (let i = 0; i < length; i++) {
            id[i] = soup.charAt(Math.random() * soup.length);
        }
        return id.join('');
    }
    createMonitorBlock (id, name, type) {
        const fieldName = {
            [Variable.SCALAR_TYPE]: 'VARIABLE',
            [Variable.LIST_TYPE]: 'LIST'
        }[type];
        this.props.vm.runtime.monitorBlocks.createBlock({
            id,
            topLevel: true,
            parent: null,
            shadow: false,
            opcode: {
                [Variable.SCALAR_TYPE]: 'data_variable',
                [Variable.LIST_TYPE]: 'data_listcontents'
            }[type],
            fields: {
                [fieldName]: {
                    name: fieldName,
                    id,
                    value: name,
                    variableType: type
                }
            },
            inputs: {},
            next: null,
            x: 0,
            y: 0
        });
    }
    handleNewVariableClick () {
        this.setState({
            promptOpen: true,
            promptType: Variable.SCALAR_TYPE,
            promptDefaultValue: '',
            idToRename: null
        });
    }
    handleNewListClick () {
        this.setState({
            promptOpen: true,
            promptType: Variable.LIST_TYPE,
            promptDefaultValue: '',
            idToRename: null
        });
    }
    handlePromptClose () {
        this.setState({promptOpen: false});
    }
    handlePromptOk (name, newVariableOptions) {
        this.handlePromptClose();

        // Do nothing if name is empty
        name = name.trim();
        if (!name) {
            return;
        }

        if (newVariableOptions && newVariableOptions.isCloud) {
            name = CLOUD_PREFIX + name;
        }

        const target = this.props.vm.editingTarget;
        if (!target) {
            return;
        }
        const type = this.state.promptType;
        let isLocal;
        if (this.state.idToRename) {
            isLocal = Object.prototype.hasOwnProperty.call(target.variables, this.state.idToRename);
        } else {
            isLocal = newVariableOptions.scope === 'local' && !target.isStage;
        }
        const existingVariableNames = this.getExistingVariableNames(isLocal);
        const existingVariablesMap = {};
        for (let name of existingVariableNames) {
            existingVariablesMap[name] = true;
        }
        name = ToshLanguage.cleanName(
            {
                [Variable.SCALAR_TYPE]: 'variable',
                [Variable.LIST_TYPE]: 'list'
            }[type],
            name,
            existingVariablesMap,
            {}
        );

        const stage = this.props.vm.runtime.getTargetForStage();
        if (this.state.idToRename) {
            if (isLocal) {
                target.renameVariable(this.state.idToRename, name);
            } else {
                stage.renameVariable(this.state.idToRename, name);
            }
        } else {
            const id = this.generateVariableId();
            if (isLocal) {
                target.createVariable(id, name, type);
            } else {
                stage.createVariable(id, name, type, newVariableOptions.isCloud);
            }
            this.createMonitorBlock(id, name, type);
        }
        this.props.vm.runtime.emitProjectChanged();
        this.forceUpdate();
    }
    handleToggleVisibility (id) {
        return (e) => {
            if (!this.props.vm.runtime.monitorBlocks.getBlock(id)) {
                const variable = this.findVariable(id);
                if (!variable) return;
                this.createMonitorBlock(id, variable.name, variable.type);
            }
            this.props.vm.runtime.monitorBlocks.changeBlock({
                id,
                element: 'checkbox',
                value: e.target.checked
            });
        }
    }
    handleRenameVariableClick (id, name) {
        return () => {
            this.setState({
                promptOpen: true,
                promptType: Variable.SCALAR_TYPE,
                promptDefaultValue: name,
                idToRename: id
            });
        };
    }
    handleRenameListClick (id, name) {
        return () => {
            this.setState({
                promptOpen: true,
                promptType: Variable.LIST_TYPE,
                promptDefaultValue: name,
                idToRename: id
            });
        };
    }
    handleDeleteClick (id) {
        return () => {
            const target = this.props.vm.editingTarget;
            if (Object.prototype.hasOwnProperty.call(target.variables, id)) {
                target.deleteVariable(id);
            } else {
                const stage = this.props.vm.runtime.getTargetForStage();
                stage.deleteVariable(id);
            }
            this.props.vm.runtime.emitProjectChanged();
            this.forceUpdate();
        };
    }
    render () {
        const {
            vm,
            sprites,
            stage,
            editingTarget,
            ...componentProps
        } = this.props;
        if (!vm.editingTarget) {
            return null;
        }

        const [globalVariables, globalLists] = this.getVariableData(stage.variables);
        let localVariables = [];
        let localLists = [];
        const target = vm.editingTarget;
        if (!target.isStage) {
            [localVariables, localLists] = this.getVariableData(target.variables);
        }

        return (
            <DataPanelComponent
                {...componentProps}
                isStage={target.isStage}
                vm={vm}
                globalVariables={globalVariables}
                globalLists={globalLists}
                localVariables={localVariables}
                localLists={localLists}
                onNewVariableClick={this.handleNewVariableClick}
                onNewListClick={this.handleNewListClick}
                newPromptOpen={!!(this.state.promptOpen && !this.state.idToRename)}
                renamePromptOpen={!!(this.state.promptOpen && this.state.idToRename)}
                promptType={this.state.promptType}
                promptDefaultValue={this.state.promptDefaultValue}
                onPromptClose={this.handlePromptClose}
                onPromptOk={this.handlePromptOk}
                onToggleVisibility={this.handleToggleVisibility}
                onRenameVariableClick={this.handleRenameVariableClick}
                onRenameListClick={this.handleRenameListClick}
                onDeleteClick={this.handleDeleteClick}
            />
        )
    }
}

DataPanel.propTypes = {
    editingTarget: PropTypes.string,
    monitors: PropTypes.instanceOf(OrderedMap).isRequired,
    sprites: PropTypes.object,
    stage: PropTypes.object,
    vm: PropTypes.instanceOf(VM).isRequired
}

const mapStateToProps = state => ({
    blocksMessages: state.locales.blocksMessages,
    editingTarget: state.scratchGui.targets.editingTarget,
    monitors: state.scratchGui.monitors,
    sprites: state.scratchGui.targets.sprites,
    stage: state.scratchGui.targets.stage
});

export default connect(mapStateToProps)(DataPanel);
