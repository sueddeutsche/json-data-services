const gp = require("gson-pointer");
const redux = require("redux");
const mitt = require("mitt");

const copy = require("./utils/copy");
const isRootPointer = require("./utils/isRootPointer");
const reducers = require("./store/reducers");
const ActionCreators = require("./store/actions").ActionCreators;
const ActionTypes = require("./store/actions").ActionTypes;
const getParentPointer = require("./utils/getParentPointer");
const splitPointer = require("./utils/splitPointer");

const EVENTS = {
    BEFORE_UPDATE: "beforeUpdate",
    AFTER_UPDATE: "afterUpdate"
};


class DataService {

    constructor(data) {
        this.emitter = mitt();
        this.store = redux.createStore(createReducer());
        this.store.subscribe(() => {
            const action = this.store.getState().action.present;
            if (action.pointer) {
                this.emit(EVENTS.AFTER_UPDATE, action.pointer, action.type);
                this.bubbleObservers(action.pointer, action.type);
            }
        });
        this.observers = {};

        if (data !== undefined) {
            this.set("#", data);
        }
    }

    get(pointer = "#") {
        const value = this.getDataByReference(pointer);
        return copy(value);
    }

    getDataByReference(pointer = "#") {
        // eslint-disable-next-line no-invalid-this
        return gp.get(this.store.getState().data.present, pointer);
    }

    set(pointer, value) {
        if (this.isValid(pointer) === false) {
            throw new Error(`Pointer ${pointer} does not exist in data`);
        }

        const currentValue = this.getDataByReference(pointer);
        if (currentValue === value) {
            console.info("Abort update - value not changed");
            return;
        }

        this.emit(EVENTS.BEFORE_UPDATE, pointer, ActionTypes.SET_DATA);
        this.store.dispatch(ActionCreators.setData(pointer, value));
    }

    delete(pointer) {
        if (isRootPointer(pointer)) {
            throw new Error("Can not remove root data via delete. Use set(\"#/\", {}) instead.");
        }
        this.emit(EVENTS.BEFORE_UPDATE, pointer, ActionTypes.DELETE_DATA);
        this.store.dispatch(ActionCreators.deleteData(pointer));
    }

    undo() {
        this.emit(EVENTS.BEFORE_UPDATE, "#", ActionTypes.UNDO);
        this.store.dispatch(ActionCreators.undo());
    }

    redo() {
        this.emit(EVENTS.BEFORE_UPDATE, "#", ActionTypes.REDO);
        this.store.dispatch(ActionCreators.redo());
    }

    on(eventType, callback) {
        if (eventType === undefined) {
            throw new Error("Missing event type in DataService.on");
        }
        this.emitter.on(eventType, callback);
        return callback;
    }

    off(...args) {
        this.emitter.off(...args);
    }

    emit(eventType, pointer, action) {
        this.emitter.emit(eventType, createEventObject(pointer, action));
    }

    observe(pointer, callback, bubbleEvents = false) {
        callback.bubbleEvents = bubbleEvents;
        this.observers[pointer] = this.observers[pointer] || [];
        this.observers[pointer].push(callback);
        return callback;
    }

    removeObserver(pointer, callback) {
        if (this.observers[pointer] && this.observers[pointer].length > 0) {
            this.observers[pointer] = this.observers[pointer].filter((cb) => cb !== callback);
        }
    }

    notify(pointer, event) {
        if (this.observers[pointer] == null || this.observers[pointer].length === 0) {
            return;
        }
        const observers = this.observers[pointer];
        for (let i = 0, l = observers.length; i < l; i += 1) {
            if (observers[i].bubbleEvents === true || event.pointer === pointer) {
                observers[i](event);
            }
        }
    }

    bubbleObservers(pointer, action) {
        const eventObject = createEventObject(pointer, action);
        const frags = splitPointer(pointer);
        while (frags.length) {
            this.notify(`#/${frags.join("/")}`, eventObject);
            frags.length -= 1;
        }
        this.notify("#", eventObject);
    }

    isValid(pointer) {
        return isRootPointer(pointer) || gp.get(this.getDataByReference(), pointer) !== undefined;
    }
}

function createEventObject(pointer, action) {
    const parentPointer = getParentPointer(pointer);
    return {
        pointer,
        parentPointer,
        action
    };
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


module.exports = DataService;
module.exports.EVENTS = EVENTS;
