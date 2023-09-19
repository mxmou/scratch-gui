const SET_TARGET_STATE = 'scratch-gui/code-editor/SET_TARGET_STATE';
const SET_TARGET_SCROLL_POS = 'scratch-gui/code-editor/SET_TARGET_SCROLL_POS';

const initialState = {
    targetStates: {},
    targetScrollPos: {}
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

export {
    reducer as default,
    initialState as codeEditorInitialState,
    setTargetState,
    setTargetScrollPos
};
