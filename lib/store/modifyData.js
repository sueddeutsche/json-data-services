/* eslint no-case-declarations: 0 */
const gp = require("gson-pointer");
const copy = require("../utils/copy");
const isRootPointer = require("../utils/isRootPointer");
const SET_DATA = "SET_DATA";
const DELETE_DATA = "DELETE_DATA";


function reducer(state = {}, action) {
    switch (action.type) {
        case SET_DATA:
            if (isRootPointer(action.pointer)) {
                return copy(action.value);
            }
            const newState = copy(state);
            gp.set(newState, action.pointer, copy(action.value));
            return newState;

        case DELETE_DATA:
            const nextState = copy(state);
            gp.delete(nextState, action.pointer);
            return nextState;

        default:
            return state;
    }
}

function setData(pointer, value) {
    return {
        type: SET_DATA,
        pointer,
        value
    };
}

function deleteData(pointer) {
    return {
        type: DELETE_DATA,
        pointer
    };
}


module.exports = {
    reducer,
    setData,
    deleteData
};
