import omit from 'lodash.omit';

import {sortExtensions} from '../lib/code-editor/hardware-extensions';

const SET_TARGET_STATE = 'scratch-gui/code-editor/SET_TARGET_STATE';
const SET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/SET_TARGET_SCROLL_POS';
const RESET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/RESET_TARGET_SCROLL_POS';
const SET_TARGET_ERROR = 'scratch-gui/code-editor/SET_TARGET_ERROR';
const SET_HARDWARE_EXTENSIONS = 'scratch-gui/code-editor/SET_HARDWARE_EXTENSIONS';

const initialState = {
    targetStates: {},
    targetScrollPos: {},
    targetErrors: {},
    hardwareExtensions: []
};

const reducer = (state = initialState, action) => {
    switch (action.type) {
    case SET_TARGET_STATE:
        return {
            ...state,
            targetStates: {
                ...state.targetStates,
                [action.target]: action.editorState
            }
        };
    case SET_TARGET_SCROLL_POS:
        return {
            ...state,
            targetScrollPos: {
                ...state.targetScrollPos,
                [action.target]: action.snapshot
            }
        };
    case RESET_TARGET_SCROLL_POS:
        return {
            ...state,
            targetScrollPos: omit(state.targetScrollPos, action.target)
        };
    case SET_TARGET_ERROR:
        return {
            ...state,
            targetErrors: {
                ...state.targetErrors,
                [action.target]: action.error
            }
        };
    case SET_HARDWARE_EXTENSIONS:
        return {
            ...state,
            hardwareExtensions: sortExtensions(action.extensionIds)
        };
    default:
        return state;
    }
};

const setTargetState = (target, editorState) => ({
    type: SET_TARGET_STATE,
    target,
    editorState
});

const setTargetScrollPos = (target, snapshot) => ({
    type: SET_TARGET_SCROLL_POS,
    target,
    snapshot
});

const resetTargetScrollPos = target => ({
    type: RESET_TARGET_SCROLL_POS,
    target
});

const setTargetError = (target, error) => ({
    type: SET_TARGET_ERROR,
    target,
    error
});

const setHardwareExtensions = extensionIds => ({
    type: SET_HARDWARE_EXTENSIONS,
    extensionIds
});

export {
    reducer as default,
    initialState as codeEditorInitialState,
    setTargetState,
    setTargetScrollPos,
    resetTargetScrollPos,
    setTargetError,
    setHardwareExtensions
};
