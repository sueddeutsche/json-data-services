const gp = require("gson-pointer");
const mitt = require("mitt");
const deepdiff = require("deep-diff");
const copy = require("./utils/copy");
const isRootPointer = require("./utils/isRootPointer");
const dataReducer = require("./reducers/dataReducer");
const ActionCreators = require("./reducers/actions").ActionCreators;
const ActionTypes = require("./reducers/actions").ActionTypes;
const getParentPointer = require("./utils/getParentPointer");
const splitPointer = require("./utils/splitPointer");

const state = require("./state");

const EVENTS = {
    BEFORE_UPDATE: "beforeUpdate",
    AFTER_UPDATE: "afterUpdate"
};

function getDiffLocation(diffs) {
    let parentPointer = "#";
    const paths = diffs.map((change) => change.path).sort();
    const path = paths[0];
    for (let p = 0; p < path.length; p += 1) {
        const property = path[p];
        for (let i = 0; i < paths.length; i += 1) {
            if (paths[i][p] !== property) {
                return parentPointer;
            }
        }
        parentPointer += `/${property}`;
    }
    return parentPointer;
}


class DataService {

    constructor(data) {
        this.observers = {};
        this.emitter = mitt();

        this.id = state.createId("data");
        state.register(this.id, dataReducer);

        let lastUpdate;
        state.subscribe(this.id, () => {
            let updateLocation;
            const current = state.get(this.id);

            const diff = deepdiff.diff(lastUpdate, current.data.present);

            if (diff == null) {
                updateLocation = "#";
            } else if (diff.length > 1) {
                updateLocation = getDiffLocation(diff);
            } else if (diff[0].path == null) {
                updateLocation = "#";
            } else {
                updateLocation = `#/${diff[0].path.join("/")}`;
            }

            console.log("update", updateLocation);

            lastUpdate = current.data.present;
            this.emit(EVENTS.AFTER_UPDATE, updateLocation);
            this.bubbleObservers(updateLocation);
        });

        if (data !== undefined) {
            this.set("#", data);
            state.get(this.id).data.past.length = 0;
        }
    }

    get(pointer = "#") {
        const value = this.getDataByReference(pointer);
        return copy(value);
    }

    getDataByReference(pointer = "#") {
        // eslint-disable-next-line no-invalid-this
        return gp.get(state.get(this.id).data.present, pointer);
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

        this.emit(EVENTS.BEFORE_UPDATE, pointer, ActionTypes.DATA_SET);
        state.dispatch(ActionCreators.setData(pointer, value, currentValue));
    }

    delete(pointer) {
        if (isRootPointer(pointer)) {
            throw new Error("Can not remove root data via delete. Use set(\"#/\", {}) instead.");
        }

        const key = pointer.split("/").pop();
        const parentPointer = getParentPointer(pointer);
        const data = this.get(parentPointer);

        gp.delete(data, key);
        this.set(parentPointer, data);
    }

    undoCount() {
        return state.get(this.id).data.past.length;
    }

    redoCount() {
        return state.get(this.id).data.future.length;
    }

    undo() {
        const before = this.get();
        this.emit(EVENTS.BEFORE_UPDATE, "#", ActionTypes.UNDO);
        state.dispatch(ActionCreators.undo());
        const after = this.get();
    }

    redo() {
        this.emit(EVENTS.BEFORE_UPDATE, "#", ActionTypes.REDO);
        state.dispatch(ActionCreators.redo());
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

    bubbleObservers(pointer) {
        const eventObject = createEventObject(pointer);
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

function createEventObject(pointer) {
    const parentPointer = getParentPointer(pointer);
    return {
        pointer,
        parentPointer
    };
}


module.exports = DataService;
module.exports.EVENTS = EVENTS;
