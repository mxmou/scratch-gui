import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';
import VM from 'scratch-vm';

import styles from './code-editor.css';

import notConnectedIcon from './icon--status-not-ready.svg';
import connectedIcon from './icon--status-ready.svg';

import microbitIcon from '../../lib/libraries/extensions/microbit/microbit-small.svg';
import ev3Icon from '../../lib/libraries/extensions/ev3/ev3-small.svg';
import boostIcon from '../../lib/libraries/extensions/boost/boost-small.svg';
import wedo2Icon from '../../lib/libraries/extensions/wedo2/wedo-small.svg';
import gdxforIcon from '../../lib/libraries/extensions/gdxfor/gdxfor-small.svg';

const WIDE_ICONS = ['boost', 'wedo2'];

const CodeEditorComponent = ({
    className,
    containerRef,
    currentLine,
    currentColumn,
    hardwareExtensions,
    isPeripheralConnected,
    selectedRanges,
    selectedChars,
    vm,
    onOpenConnectionModal
}) => (
    <div className={classNames(styles.codeEditorOuter, className)}>
        <div
            className={styles.codeEditor}
            dir="ltr"
            ref={containerRef}
        />
        <div className={styles.statusBar}>
            {hardwareExtensions.map(extensionId => {
                const tooltipId = `${extensionId}_status`;
                const extensionName = vm.extensionManager.getExtensionInfo(extensionId).name;
                return (
                    <React.Fragment key={extensionId}>
                        <button
                            className={classNames(styles.statusBarItem, styles.extension)}
                            data-for={tooltipId}
                            data-tip={extensionName}
                            onClick={onOpenConnectionModal(extensionId)}
                        >
                            <img
                                className={classNames(styles.extensionIcon, {
                                    [styles.extensionIconWide]: WIDE_ICONS.includes(extensionId)
                                })}
                                src={{
                                    microbit: microbitIcon,
                                    ev3: ev3Icon,
                                    boost: boostIcon,
                                    wedo2: wedo2Icon,
                                    gdxfor: gdxforIcon
                                }[extensionId]}
                                alt={extensionName}
                                draggable={false}
                            />
                            <img
                                className={styles.extensionStatusIcon}
                                src={isPeripheralConnected[extensionId] ? connectedIcon : notConnectedIcon}
                                alt={isPeripheralConnected[extensionId] ? 'Connected' : 'Needs Connection'}
                                draggable={false}
                            />
                        </button>
                        <ReactTooltip
                            className={styles.extensionTooltip}
                            effect="solid"
                            id={tooltipId}
                            place="top"
                        />
                    </React.Fragment>
                );
            })}
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
    hardwareExtensions: PropTypes.arrayOf(PropTypes.string).isRequired,
    isPeripheralConnected: PropTypes.objectOf(PropTypes.bool).isRequired,
    selectedRanges: PropTypes.number,
    selectedChars: PropTypes.number,
    vm: PropTypes.instanceOf(VM),
    onOpenConnectionModal: PropTypes.func.isRequired
};

export default CodeEditorComponent;
