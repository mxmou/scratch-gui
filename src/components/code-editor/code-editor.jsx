import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './code-editor.css';

const CodeEditorComponent = ({
    className,
    containerRef,
    currentLine,
    currentColumn,
    selectedRanges,
    selectedChars
}) => (
    <div className={classNames(styles.codeEditorOuter, className)}>
        <div
            className={styles.codeEditor}
            dir="ltr"
            ref={containerRef}
        />
        <div className={styles.statusBar}>
            <div className={styles.statusBarSpace} />
            {selectedRanges > 1 || selectedChars > 0 ? <div className={styles.statusBarItem}>
                {selectedRanges === 1 ? '1 selection' : `${selectedRanges} selections`}
                {selectedChars > 0 ? ` (${selectedChars} ch)` : null}
            </div> : null}
            <div className={styles.statusBarItem}>{`Ln ${currentLine}, Col ${currentColumn}`}</div>
        </div>
    </div>
);

CodeEditorComponent.propTypes = {
    className: PropTypes.string,
    containerRef: PropTypes.func,
    currentLine: PropTypes.number,
    currentColumn: PropTypes.number,
    selectedRanges: PropTypes.number,
    selectedChars: PropTypes.number
};

export default CodeEditorComponent;
