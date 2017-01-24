const gp = require("gson-pointer");
const redux = require("redux");

const copy = require("./utils/copy");
const hasParentValue = require("./utils/hasParentValue");
const isRootPointer = require("./utils/isRootPointer");
const reducers = require("./store/reducers");
const ActionCreators = require("./store/actions").ActionCreators;


class DataService {

    constructor() {
        this.store = redux.createStore(createReducer());
    }

    get(pointer) {
        const value = gp.get(getData.call(this), pointer);
        return copy(value);
    }

    set(pointer, value) {
        if (this.isValid(pointer) === false) {
            throw new Error(`Pointer ${pointer} is invalid for current data`);
        }
        this.store.dispatch(ActionCreators.setData(pointer, value));
    }

    delete(pointer) {
        this.store.dispatch(ActionCreators.deleteData(pointer));
    }

    undo() {
        this.store.dispatch(ActionCreators.undo());
    }

    redo() {
        this.store.dispatch(ActionCreators.redo());
    }

    isValid(pointer) {
        return isRootPointer(pointer) || hasParentValue(getData.call(this), pointer);
    }
}

function createReducer() {
    const list = Object.keys(reducers);
    return function (state = {}, action) {
        const newState = {};
        list.forEach((key) => {
            newState[key] = reducers[key](state[key], action);
        });
        return newState;
    };
}

function getData() {
    // eslint-disable-next-line no-invalid-this
    return this.store.getState().data.present;
}


module.exports = DataService;
