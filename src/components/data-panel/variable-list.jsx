import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './data-panel.css';

const VariableList = ({
    title,
    items,
    itemClassName
}) => (
    items.length ? (
        <React.Fragment>
            <div className={styles.variableListTitle}>{title}</div>
            <ul className={styles.variableList}>
                {items.map(({ id, name }) => (
                    <li
                        key={id}
                        className={classNames(styles.variableListItem, itemClassName)}
                    >
                        {name}
                    </li>
                ))}
            </ul>
        </React.Fragment>
    ) : null
);

VariableList.propTypes = {
    itemClassName: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired
    })).isRequired,
    title: PropTypes.string
};

export default VariableList;
