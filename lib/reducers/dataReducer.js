const undoable = require("redux-undo").default;

/* eslint no-case-declarations: 0 */
const gp = require("gson-pointer");
const copy = require("../utils/copy");
const isRootPointer = require("../utils/isRootPointer");
const ActionTypes = require("./actions").ActionTypes;
const redux = require("redux");

const actions = [ActionTypes.DATA_SET, ActionTypes.UNDO, ActionTypes.REDO];
const defaultState = {
    hasChanged: false,
    action: null,
    data: null
};

function dataReducer(state = defaultState, action) {
    switch (action.type) {
        case ActionTypes.DATA_SET:
            if (isRootPointer(action.pointer)) {
                return copy(action.value);
            }
            const newState = copy(state);
            gp.set(newState, action.pointer, copy(action.value));
            return newState;

        default:
            return state;
    }
}

function actionReducer(state, action) {
    if (ActionTypes.DATA_SET === action.type) {
        return action;
    }
    return state;
}

const config = {
    filter: (action) => actions.includes(action.type)
};


module.exports = redux.combineReducers({
    hasChanged: (state, action) => actions.includes(action.type),
    action: undoable(actionReducer, config),
    data: undoable(dataReducer, config)
});
