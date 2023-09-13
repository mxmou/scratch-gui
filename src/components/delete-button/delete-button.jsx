import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import {getIconsForTheme} from '../../lib/themes';

import styles from './delete-button.css';

const DeleteButton = props => (
    <div
        aria-label="Delete"
        className={classNames(
            styles.deleteButton,
            props.className
        )}
        role="button"
        tabIndex={props.tabIndex}
        onClick={props.onClick}
    >
        <div className={styles.deleteButtonVisible}>
            <img
                className={styles.deleteIcon}
                src={getIconsForTheme(props.theme).delete.onAccent}
                draggable={false}
            />
        </div>
    </div>

);

DeleteButton.propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func.isRequired,
    tabIndex: PropTypes.number,
    theme: PropTypes.string
};

DeleteButton.defaultProps = {
    tabIndex: 0
};

export default DeleteButton;
