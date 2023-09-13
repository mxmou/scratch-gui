import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import {getIconsForTheme} from '../../lib/themes';

import styles from './data-panel.css';

const VariableList = ({
    blocksMessages,
    theme,
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
                {items.map(({id, name, monitorVisible}) => (
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
                        <img
                            className={styles.checkedIcon}
                            src={getIconsForTheme(theme).check.onAccent}
                            aria-hidden="true"
                            draggable={false}
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
                            <img
                                className={styles.variableActionIcon}
                                src={getIconsForTheme(theme).edit.default}
                                aria-hidden="true"
                                draggable={false}
                            />
                        </button>
                        <button
                            type="button"
                            className={styles.variableAction}
                            title={blocksMessages.DELETE_VARIABLE.replace('%1', name)}
                            onClick={onDeleteClick(id)}
                        >
                            <img
                                className={styles.variableActionIcon}
                                src={getIconsForTheme(theme).delete.default}
                                aria-hidden="true"
                                draggable={false}
                            />
                        </button>
                    </li>
                ))}
            </ul>
        </React.Fragment>
    ) : null
);

VariableList.propTypes = {
    blocksMessages: PropTypes.objectOf(PropTypes.string).isRequired,
    itemClassName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        monitorVisible: PropTypes.bool,
        name: PropTypes.string.isRequired
    })).isRequired,
    onDeleteClick: PropTypes.func.isRequired,
    onRenameClick: PropTypes.func.isRequired,
    onToggleVisibility: PropTypes.func.isRequired,
    theme: PropTypes.string,
    title: PropTypes.string
};

export default VariableList;
