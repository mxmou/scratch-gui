import React from 'react';
import PropTypes from 'prop-types';
import {injectIntl, intlShape} from 'react-intl';
import VM from 'scratch-vm';
import Variable from 'scratch-vm/src/engine/variable';

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
    promptOpen,
    promptType,
    onPromptClose,
    onPromptOk
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
        />
        <VariableList
            title={intl.formatMessage(sharedMessages.forThisSprite)}
            items={localVariables}
            itemClassName={styles.variable}
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
        />
        <VariableList
            title={intl.formatMessage(sharedMessages.forThisSprite)}
            items={localLists}
            itemClassName={styles.list}
        />
        {promptOpen ? (
            <Prompt
                title={{
                    [Variable.SCALAR_TYPE]: blocksMessages.VARIABLE_MODAL_TITLE,
                    [Variable.LIST_TYPE]: blocksMessages.LIST_MODAL_TITLE
                }[promptType]}
                label={{
                    [Variable.SCALAR_TYPE]: blocksMessages.NEW_VARIABLE_TITLE,
                    [Variable.LIST_TYPE]: blocksMessages.NEW_LIST_TITLE
                }[promptType]}
                defaultValue=""
                isStage={isStage}
                showListMessage={promptType === Variable.LIST_TYPE}
                showVariableOptions={true}
                showCloudOption={promptType === Variable.SCALAR_TYPE && canUseCloud}
                vm={vm}
                onCancel={onPromptClose}
                onOk={onPromptOk}
            />
        ) : null}
    </div>
);

DataPanelComponent.propTypes = {
    blocksMessages: PropTypes.object.isRequired,
    canUseCloud: PropTypes.bool,
    globalLists: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    globalVariables: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    intl: intlShape,
    isStage: PropTypes.bool,
    localLists: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    localVariables: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    onNewListClick: PropTypes.func,
    onNewVariableClick: PropTypes.func,
    onPromptClose: PropTypes.func,
    onPromptOk: PropTypes.func,
    promptOpen: PropTypes.bool,
    promptType: PropTypes.oneOf([
        Variable.SCALAR_TYPE,
        Variable.LIST_TYPE
    ]),
    vm: PropTypes.instanceOf(VM).isRequired
};

export default injectIntl(DataPanelComponent);
