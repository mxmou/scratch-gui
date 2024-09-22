import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';
import getParserOptions from '../lib/code-editor/parser-options';
import * as ToshCompiler from '../lib/tosh/compile';
import {setTargetError} from '../reducers/code-editor';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleGreenFlagClick',
            'handleStopAllClick'
        ]);
    }
    handleGreenFlagClick (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            for (const target of this.props.vm.runtime.targets) {
                if (target.isOriginal && target.code !== null) {
                    target.blocks.deleteAllBlocks();

                    // Compile code - based on ScriptsEditor.compile from tosh
                    const options = getParserOptions(this.props.vm, target.id);
                    const lines = ToshCompiler.parseLines(target.code, options);
                    const stream = lines.slice();

                    try {
                        ToshCompiler.compile(target, stream);
                        this.props.setTargetError(target.id, null);
                    } catch (err) {
                        target.blocks.deleteAllBlocks();
                        let lineNumber = lines.length - (stream.length - 1); // -1 because EOF
                        lineNumber = Math.min(lineNumber, lines.length - 1);
                        lineNumber += 1; // CodeMirror expects 1-based line numbers
                        this.props.setTargetError(target.id, {
                            lineNumber,
                            message: err.message || err,
                            rendered: false
                        });
                    }
                }
            }
            if (!this.props.isStarted) {
                this.props.vm.start();
            }
            this.props.vm.greenFlag();
        }
    }
    handleStopAllClick (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    render () {
        const {
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            setTargetError: dispatchSetTargetError, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                active={projectRunning}
                turbo={turbo}
                onGreenFlagClick={this.handleGreenFlagClick}
                onStopAllClick={this.handleStopAllClick}
            />
        );
    }
}

Controls.propTypes = {
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    setTargetError: PropTypes.func.isRequired,
    turbo: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectRunning: state.scratchGui.vmStatus.running,
    turbo: state.scratchGui.vmStatus.turbo
});
const mapDispatchToProps = dispatch => ({
    setTargetError: (target, error) => {
        dispatch(setTargetError(target, error));
    }
});

export default connect(mapStateToProps, mapDispatchToProps)(Controls);
