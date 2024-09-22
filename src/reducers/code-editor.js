const SET_TARGET_STATE = 'scratch-gui/code-editor/SET_TARGET_STATE';
const SET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/SET_TARGET_SCROLL_POS';
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
                [action.target]: {
                    top: action.top,
                    left: action.left
                }
            }
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

const setTargetScrollPos = (target, top, left) => ({
    type: SET_TARGET_SCROLL_POS,
    target,
    top,
    left
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
    setTargetError
};
