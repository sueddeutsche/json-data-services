const gp = require("gson-pointer");
const mitt = require("mitt");
const getChangeLocation = require("./utils/getChangeLocation");
const getChangeDetails = require("./utils/getChangeDetails");
const copy = require("./utils/copy");
const isRootPointer = require("./utils/isRootPointer");
const dataReducer = require("./reducers/dataReducer");
const ActionCreators = require("./reducers/actions").ActionCreators;
const ActionTypes = require("./reducers/actions").ActionTypes;
const getParentPointer = require("./utils/getParentPointer");
const splitPointer = require("./utils/splitPointer");
const getTypeOf = require("json-schema-library/lib/getTypeOf");

const state = require("./state");

const EVENTS = {
    BEFORE_UPDATE: "beforeUpdate",
    AFTER_UPDATE: "afterUpdate"
};


class DataService {

    constructor(data) {
        this.observers = {};
        this.emitter = mitt();

        this.id = state.createId("data");
        state.register(this.id, dataReducer);

        let lastUpdate = {};
        this.onStateChanged = () => {
            const current = state.get(this.id);

            const eventLocation = getChangeLocation(lastUpdate, current.data.present);
            const changes = getChangeDetails(lastUpdate, current.data.present);
            // const changes = getItemsOfChanges(lastUpdate, current.data.present);
            const parentData = this.getDataByReference(eventLocation);
            const parentDataType = getTypeOf(parentData);

            lastUpdate = current.data.present;
            this.emit(EVENTS.AFTER_UPDATE, eventLocation, { type: parentDataType, changes });
            this.bubbleObservers(eventLocation, { type: parentDataType, changes });
        };

        state.subscribe(this.id, this.onStateChanged);

        if (data !== undefined) {
            this.set("#", data);
            this.resetUndoRedo();
        }
    }

    resetUndoRedo() {
        state.get(this.id).data.past.length = 0;
    }

    destroy() {
        state.unsubscribe(this.id, this.onStateChanged);
        state.unregister(this.id);
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

        this.emit(EVENTS.BEFORE_UPDATE, pointer, { action: ActionTypes.DATA_SET });
        state.dispatch(ActionCreators.setData(pointer, value, currentValue));

        if (pointer === "#") {
            state.get(this.id).data.past.pop(); // do not add root changes to undo
        }
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
        this.emit(EVENTS.BEFORE_UPDATE, "#", { action: ActionTypes.UNDO });
        state.dispatch(ActionCreators.undo());
    }

    redo() {
        this.emit(EVENTS.BEFORE_UPDATE, "#", { action: ActionTypes.REDO });
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

    emit(eventType, pointer, data) {
        this.emitter.emit(eventType, createEventObject(pointer, data));
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

    bubbleObservers(pointer, data) {
        const eventObject = createEventObject(pointer, data);
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

function createEventObject(pointer, data) {
    const parentPointer = getParentPointer(pointer);
    return Object.assign(data, {
        pointer,
        parentPointer
    });
}


module.exports = DataService;
module.exports.EVENTS = EVENTS;
