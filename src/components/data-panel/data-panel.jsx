import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';

import Prompt from '../../containers/prompt.jsx';
import sharedMessages from '../../lib/shared-messages';

import VariableList from './variable-list.jsx';
import styles from './data-panel.css';

const DataPanelComponent = ({
    blocksMessages,
    intl,
    isStage,
    canUseCloud,
    vm,
    globalVariables,
    globalLists,
    localVariables,
    localLists,
    onNewVariableClick,
    onNewListClick,
    newPromptOpen,
    renamePromptOpen,
    promptType,
    promptDefaultValue,
    onPromptClose,
    onPromptOk,
    onRenameVariableClick,
    onRenameListClick,
    ...variableListProps
}) => (
    <div className={styles.dataPanel}>
        <div className={styles.header}>
            {blocksMessages.CATEGORY_VARIABLES}
        </div>
        <div className={styles.newButtonContainer}>
            <button
                type="button"
                className={styles.newButton}
                onClick={onNewVariableClick}
            >
                {blocksMessages.NEW_VARIABLE}
            </button>
        </div>
        <VariableList
            title={intl.formatMessage(sharedMessages.forAllSprites)}
            items={globalVariables}
            itemClassName={styles.variable}
            blocksMessages={blocksMessages}
            onRenameClick={onRenameVariableClick}
            {...variableListProps}
        />
        <VariableList
            title={intl.formatMessage(sharedMessages.forThisSprite)}
            items={localVariables}
            itemClassName={styles.variable}
            blocksMessages={blocksMessages}
            onRenameClick={onRenameVariableClick}
            {...variableListProps}
        />
        <div className={styles.newButtonContainer}>
            <button
                type="button"
                className={styles.newButton}
                onClick={onNewListClick}
            >
                {blocksMessages.NEW_LIST}
            </button>
        </div>
        <VariableList
            title={intl.formatMessage(sharedMessages.forAllSprites)}
            items={globalLists}
            itemClassName={styles.list}
            blocksMessages={blocksMessages}
            onRenameClick={onRenameListClick}
            {...variableListProps}
        />
        <VariableList
            title={intl.formatMessage(sharedMessages.forThisSprite)}
            items={localLists}
            itemClassName={styles.list}
            blocksMessages={blocksMessages}
            onRenameClick={onRenameListClick}
            {...variableListProps}
        />
        {newPromptOpen ? (
            <Prompt
                title={{
                    [VM.SCALAR_VARIABLE]: blocksMessages.VARIABLE_MODAL_TITLE,
                    [VM.LIST_VARIABLE]: blocksMessages.LIST_MODAL_TITLE
                }[promptType]}
                label={{
                    [VM.SCALAR_VARIABLE]: blocksMessages.NEW_VARIABLE_TITLE,
                    [VM.LIST_VARIABLE]: blocksMessages.NEW_LIST_TITLE
                }[promptType]}
                defaultValue=""
                isStage={isStage}
                showListMessage={promptType === VM.LIST_VARIABLE}
                showVariableOptions
                showCloudOption={promptType === VM.SCALAR_VARIABLE && canUseCloud}
                vm={vm}
                onCancel={onPromptClose}
                onOk={onPromptOk}
            />
        ) : null}
        {renamePromptOpen ? (
            <Prompt
                title={{
                    [VM.SCALAR_VARIABLE]: blocksMessages.RENAME_VARIABLE_MODAL_TITLE,
                    [VM.LIST_VARIABLE]: blocksMessages.RENAME_LIST_MODAL_TITLE
                }[promptType]}
                label={{
                    [VM.SCALAR_VARIABLE]: blocksMessages.RENAME_VARIABLE_TITLE.replace('%1', promptDefaultValue),
                    [VM.LIST_VARIABLE]: blocksMessages.RENAME_LIST_TITLE.replace('%1', promptDefaultValue)
                }[promptType]}
                defaultValue={promptDefaultValue}
                isStage={isStage}
                showListMessage={promptType === VM.LIST_VARIABLE}
                showVariableOptions={false}
                showCloudOption={promptType === VM.SCALAR_VARIABLE && canUseCloud}
                vm={vm}
                onCancel={onPromptClose}
                onOk={onPromptOk}
            />
        ) : null}
    </div>
);

const variableShape = PropTypes.shape({
    id: PropTypes.string.isRequired,
    monitorVisible: PropTypes.bool,
    name: PropTypes.string.isRequired
});

DataPanelComponent.propTypes = {
    blocksMessages: PropTypes.objectOf(PropTypes.string).isRequired,
    canUseCloud: PropTypes.bool,
    globalLists: PropTypes.arrayOf(variableShape).isRequired,
    globalVariables: PropTypes.arrayOf(variableShape).isRequired,
    intl: intlShape,
    isStage: PropTypes.bool,
    localLists: PropTypes.arrayOf(variableShape).isRequired,
    localVariables: PropTypes.arrayOf(variableShape).isRequired,
    newPromptOpen: PropTypes.bool,
    onDeleteClick: PropTypes.func.isRequired,
    onNewListClick: PropTypes.func,
    onNewVariableClick: PropTypes.func,
    onPromptClose: PropTypes.func,
    onPromptOk: PropTypes.func,
    onRenameListClick: PropTypes.func.isRequired,
    onRenameVariableClick: PropTypes.func.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    promptDefaultValue: PropTypes.string,
    promptType: PropTypes.oneOf([
        VM.SCALAR_VARIABLE,
        VM.LIST_VARIABLE
    ]),
    renamePromptOpen: PropTypes.bool,
    theme: PropTypes.string,
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(DataPanelComponent);
