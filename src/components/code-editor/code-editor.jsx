import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './code-editor.css';

const CodeEditorComponent = ({
    className,
    containerRef
}) => (
    <div className={classNames(styles.codeEditorOuter, className)}>
        <div
            className={styles.codeEditor}
            ref={containerRef}
        />
    </div>
);

CodeEditorComponent.propTypes = {
    className: PropTypes.string,
    containerRef: PropTypes.func
};

export default CodeEditorComponent;
