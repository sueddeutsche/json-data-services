/* eslint object-property-newline: 0 */
const UndoActionCreators = require("redux-undo").ActionCreators;
const UndoActionTypes = require("redux-undo").ActionTypes;

const ActionTypes = {
    SET_DATA: "SET_DATA",
    DELETE_DATA: "DELETE_DATA",
    UNDO: UndoActionTypes.UNDO,
    REDO: UndoActionTypes.REDO
};

const ActionCreators = {
    setData(pointer, value) {
        return { type: ActionTypes.SET_DATA, pointer, value };
    },
    deleteData(pointer) {
        return { type: ActionTypes.DELETE_DATA, pointer };
    },
    undo() {
        return UndoActionCreators.undo();
    },
    redo() {
        return UndoActionCreators.redo();
    }
};


module.exports = {
    ActionTypes,
    ActionCreators
};
