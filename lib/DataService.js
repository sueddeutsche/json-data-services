const gp = require("gson-pointer");
const stripPointerPrefix = require("gson-pointer/lib/common").stripPointerPrefix;
const getParentPointer = require("gson-pointer/lib/common").getParentPointer;
const getTypeOf = require("json-schema-library").getTypeOf;
const redux = require("redux");
const copy = require("./utils/copy");
const DEBUG = false;

const validDataActions = ["set", "delete"];
const initialState = {
    present: {
        previousAction: undefined,
        data: undefined
    },
    future: [],
    past: [],
    getData() { return this.present.data; },
    undo() {
        if (this.present.length <= 0) {
            DEBUG && console.error("There are no more undo steps");
            return;
        }
        this.future.push(this.present);
        this.present = this.past.pop();
    },
    redo() {
        if (this.future.length <= 0) {
            DEBUG && console.error("There are changes to redo");
            return;
        }
        this.past.push(this.present);
        this.present = this.future.pop();
    }
};

function actions(currentState = initialState, action) {
    // immutable
    action = copy(action);
    // currentState = copy(currentState);
    // track action
    const nextState = {
        previousAction: validDataActions.indexOf(action.type) >= 0 ? action : null,
        data: undefined
    };

    if (action.type === "set") {
        const isRoot = stripPointerPrefix(action.pointer) === "";
        if (isRoot) {
            nextState.data = action.value;
        } else {
            nextState.data = copy(currentState.getData());
            gp.set(nextState.data, action.pointer, action.value);
        }
        currentState.past.push(currentState.present);
        currentState.present = nextState;
        currentState.future.length = 0;
        return currentState;
    }

    if (action.type === "delete") {
        nextState.data = copy(currentState.getdata());
        gp.delete(nextState.data, action.pointer);
        currentState.past.push(currentState.present);
        currentState.present = nextState;
        return currentState;
    }

    if (action.type !== "@@redux/INIT") {
        console.error("Unknown action", action.type, "in", JSON.stringify(action));
    }

    return currentState;
}


class DataService {

    constructor() {
        this.store = redux.createStore(actions);
    }

    get(pointer) {
        const data = this.store.getState().getData();
        const value = gp.get(data, pointer);
        return copy(value);
    }

    set(pointer, value) {
        if (this.isValid(pointer) === false) {
            throw new Error(`Pointer ${pointer} is invalid for current data`);
        }

        this.store.dispatch({
            type: "set",
            pointer,
            value
        });
    }

    undo() {
        this.store.getState().undo();
    }

    redo() {
        this.store.getState().redo();
    }

    isValid(pointer) {
        if (stripPointerPrefix(pointer) === "") {
            return true;
        }
        const data = this.store.getState().getData();
        const parentPointer = getParentPointer(pointer);
        const value = gp.get(data, parentPointer);
        if (value == null) {
            return false;
        }
        const type = getTypeOf(value);
        return type === "object" || type === "array";
    }
}


module.exports = DataService;
