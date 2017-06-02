const mitt = require("mitt");
const validateData = require("json-schema-library/lib/validateAsync");
const core = require("./schema/core");
const state = require("./state");
const ActionCreators = require("./reducers/actions").ActionCreators;
const errorReducer = require("./reducers/errorReducer");

const splitPointer = require("./utils/splitPointer");


const EVENTS = {
    BEFORE_VALIDATION: "beforeValidation",
    BEFORE_SENDING_ERRORS: "beforeSendingErrors",
    AFTER_VALIDATION: "afterValidation"
};


class ValidationService {

    constructor(schema = {}) {
        this.set(schema);
        this.observers = {};
        this.emitter = mitt();
        this.id = state.createId("errors");
        state.register(this.id, errorReducer);
        this.setErrorHandler((error) => error);
    }

    setErrorHandler(callback) {
        this.errorHandler = callback;
    }

    validate(data, schema = this.schema) {
        this.emit(EVENTS.BEFORE_VALIDATION);
        return validateData(core, schema, data)
            .then((errors) => {
                this.emit(EVENTS.BEFORE_SENDING_ERRORS, errors);
                state.dispatch(ActionCreators.setErrors(errors));
                errors
                    .map(this.errorHandler)
                    .forEach((error) => this.bubbleObservers(error.data.pointer, error));
                this.emit(EVENTS.AFTER_VALIDATION, errors);
                return errors;
            });
    }

    set(schema) {
        this.schema = schema;
    }

    get() {
        return this.schema;
    }

    on(eventType, callback) {
        if (eventType === undefined) {
            throw new Error("Missing event type in ValidationService.on");
        }
        this.emitter.on(eventType, callback);
        return callback;
    }

    off(...args) {
        this.emitter.off(...args);
    }

    emit(eventType, event = {}) {
        this.emitter.emit(eventType, event);
    }

    observe(pointer, callback, bubbledEvents = false) {
        callback.bubbledEvents = bubbledEvents;
        this.observers[pointer] = this.observers[pointer] || [];
        this.observers[pointer].push(callback);
        return callback;
    }

    removeObserver(pointer, callback) {
        if (this.observers[pointer] && this.observers[pointer].length > 0) {
            this.observers[pointer] = this.observers[pointer].filter((cb) => cb !== callback);
        }
    }

    notify(pointer, event = {}) {
        if (this.observers[pointer] == null || this.observers[pointer].length === 0) {
            return;
        }
        const observers = this.observers[pointer];
        for (let i = 0, l = observers.length; i < l; i += 1) {
            if (observers[i].bubbledEvents === true || event.data.pointer === pointer) {
                observers[i](event);
            }
        }
    }

    getErrors() {
        return state.get(this.id).filter((error) => error.severity !== "warning");
    }

    getWarnings() {
        return state.get(this.id).filter((error) => error.severity === "warning");
    }

    bubbleObservers(pointer, error) {
        const frags = splitPointer(pointer);
        while (frags.length) {
            this.notify(`#/${frags.join("/")}`, error);
            frags.length -= 1;
        }
        this.notify("#", error);
    }

    destroy() {
        this.set(null);
        this.emitter = null;
        state.unregister(this.id, errorReducer);
    }
}


module.exports = ValidationService;
module.exports.EVENTS = EVENTS;
