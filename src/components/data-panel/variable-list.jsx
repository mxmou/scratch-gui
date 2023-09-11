import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import InlineIcon from '../inline-icon/inline-icon.jsx';

import styles from './data-panel.css';
import checkedIcon from './icon--check.svg';
import renameIcon from './icon--edit.svg';
import deleteIcon from '../delete-button/icon--delete.svg';

const VariableList = ({
    blocksMessages,
    title,
    items,
    itemClassName,
    onToggleVisibility,
    onRenameClick,
    onDeleteClick
}) => (
    items.length ? (
        <React.Fragment>
            <div className={styles.variableListTitle}>{title}</div>
            <ul className={styles.variableList}>
                {items.map(({ id, name, monitorVisible }) => (
                    <li
                        key={id}
                        className={classNames(styles.variableListItem, itemClassName)}
                    >
                        <input
                            type="checkbox"
                            className={styles.checkbox}
                            title={name}
                            checked={monitorVisible}
                            onChange={onToggleVisibility(id)}
                        />
                        <InlineIcon
                            className={styles.checkedIcon}
                            src={checkedIcon}
                            alt=""
                        />
                        <span
                            className={styles.variableName}
                            title={name /* show whole name on hover if it's long */}
                        >
                            {name}
                        </span>
                        <button
                            type="button"
                            className={styles.variableAction}
                            title={blocksMessages.RENAME_VARIABLE}
                            onClick={onRenameClick(id, name)}
                        >
                            <InlineIcon
                                className={styles.variableActionIcon}
                                src={renameIcon}
                                alt=""
                            />
                        </button>
                        <button
                            type="button"
                            className={styles.variableAction}
                            title={blocksMessages.DELETE_VARIABLE.replace('%1', name)}
                            onClick={onDeleteClick(id)}
                        >
                            <InlineIcon
                                className={styles.variableActionIcon}
                                src={deleteIcon}
                                alt=""
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </React.Fragment>
    ) : null
);

VariableList.propTypes = {
    blocksMessages: PropTypes.object.isRequired,
    itemClassName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        monitorVisible: PropTypes.bool,
        name: PropTypes.string.isRequired
    })).isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onRenameClick: PropTypes.func.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    title: PropTypes.string
};

export default VariableList;
