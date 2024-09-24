import omit from 'lodash.omit';

const SET_TARGET_STATE = 'scratch-gui/code-editor/SET_TARGET_STATE';
const SET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/SET_TARGET_SCROLL_POS';
const RESET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/RESET_TARGET_SCROLL_POS';
const SET_TARGET_ERROR = 'scratch-gui/code-editor/SET_TARGET_ERROR';

const initialState = {
    targetStates: {},
    targetScrollPos: {},
    targetErrors: {}
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

export {
    reducer as default,
    initialState as codeEditorInitialState,
    setTargetState,
    setTargetScrollPos,
    resetTargetScrollPos,
    setTargetError
};
