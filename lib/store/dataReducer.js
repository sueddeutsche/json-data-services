/* eslint no-case-declarations: 0 */
const gp = require("gson-pointer");
const copy = require("../utils/copy");
const isRootPointer = require("../utils/isRootPointer");
const ActionTypes = require("./actions").ActionTypes;


function dataReducer(state = {}, action) {
    switch (action.type) {
        case ActionTypes.SET_DATA:
            if (isRootPointer(action.pointer)) {
                return copy(action.value);
            }
            const newState = copy(state);
            gp.set(newState, action.pointer, copy(action.value));
            return newState;

        case ActionTypes.DELETE_DATA:
            const nextState = copy(state);
            gp.delete(nextState, action.pointer);
            return nextState;

        default:
            return state;
    }
}


module.exports = dataReducer;
