import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import InlineIcon from '../inline-icon/inline-icon.jsx';

import styles from './toggle-buttons.css';

const ToggleButtons = ({buttons, className, disabled}) => (
    <div
        className={classNames(
            className,
            styles.row,
            {
                [styles.disabled]: disabled
            }
        )}
    >
        {buttons.map((button, index) => (
            <button
                key={`toggle-${index}`}
                className={styles.button}
                title={button.title}
                aria-label={button.title}
                aria-pressed={button.isSelected}
                onClick={button.handleClick}
                disabled={disabled}
            >
                <InlineIcon
                    src={button.icon}
                    className={button.iconClassName}
                />
            </button>
        ))}
    </div>
);

ToggleButtons.propTypes = {
    buttons: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        handleClick: PropTypes.func.isRequired,
        icon: PropTypes.string.isRequired,
        iconClassName: PropTypes.string,
        isSelected: PropTypes.bool
    })),
    className: PropTypes.string,
    disabled: PropTypes.bool
};

ToggleButtons.defaultProps = {
    disabled: false
};

export default ToggleButtons;
