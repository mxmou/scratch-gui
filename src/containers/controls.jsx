import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import VM from 'scratch-vm';
import {connect} from 'react-redux';

import ControlsComponent from '../components/controls/controls.jsx';
import compileAllTargets from '../lib/code-editor/compile-all';

class Controls extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleKeyDown',
            'handleGreenFlag',
            'handleStopAll'
        ]);
    }
    componentDidMount () {
        document.addEventListener('keydown', this.handleKeyDown, {capture: true});
    }
    componentWillUnmount () {
        document.removeEventListener('keydown', this.handleKeyDown);
    }
    handleKeyDown (e) {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            this.handleGreenFlag(e);
            document.activeElement.blur();
            e.stopPropagation();
        } else if (e.key === 'Escape') {
            this.handleStopAll(e);
        }
    }
    handleGreenFlag (e) {
        e.preventDefault();
        if (e.shiftKey) {
            this.props.vm.setTurboMode(!this.props.turbo);
        } else {
            const compiledSuccessfully = compileAllTargets(this.props.vm, this.props.dispatch);
            if (compiledSuccessfully) {
                if (!this.props.isStarted) {
                    this.props.vm.start();
                }
                this.props.vm.greenFlag();
            }
        }
    }
    handleStopAll (e) {
        e.preventDefault();
        this.props.vm.stopAll();
    }
    render () {
        const {
            dispatch, // eslint-disable-line no-unused-vars
            vm, // eslint-disable-line no-unused-vars
            isStarted, // eslint-disable-line no-unused-vars
            projectRunning,
            turbo,
            ...props
        } = this.props;
        return (
            <ControlsComponent
                {...props}
                active={projectRunning}
                turbo={turbo}
                onGreenFlagClick={this.handleGreenFlag}
                onStopAllClick={this.handleStopAll}
            />
        );
    }
}

Controls.propTypes = {
    dispatch: PropTypes.func.isRequired,
    isStarted: PropTypes.bool.isRequired,
    projectRunning: PropTypes.bool.isRequired,
    turbo: PropTypes.bool.isRequired,
    vm: PropTypes.instanceOf(VM)
};

const mapStateToProps = state => ({
    isStarted: state.scratchGui.vmStatus.running,
    projectRunning: state.scratchGui.vmStatus.running,
    turbo: state.scratchGui.vmStatus.turbo
});

export default connect(mapStateToProps)(Controls);
