const mitt = require("mitt");
const validateData = require("json-schema-library/lib/validateAsync");
const core = require("./schema/core");

const splitPointer = require("./utils/splitPointer");


const EVENTS = {
    BEFORE_VALIDATION: "beforeValidation",
    AFTER_VALIDATION: "afterValidation"
};


class ValidationService {

    constructor(schema = {}) {
        this.set(schema);
        this.observers = {};
        this.emitter = mitt();
    }

    validate(data, schema = this.schema) {
        this.emit(EVENTS.BEFORE_VALIDATION);
        return validateData(core, schema, data)
            .then((errors) => {
                errors.forEach((error) => this.bubbleObservers(error.data.pointer, error));
                this.emit(EVENTS.AFTER_VALIDATION);
                return errors;
            });
    }

    set(schema) {
        this.schema = schema;
    }

    get() {
        return this.schema;
    }

    on(...args) {
        if (args[0] === undefined) {
            throw new Error("Missing event type in ValidationService.on");
        }
        this.emitter.on(...args);
    }

    off(...args) {
        this.emitter.off(...args);
    }

    emit(eventType, event = {}) {
        this.emitter.emit(eventType, event);
    }

    observe(pointer, callback) {
        this.observers[pointer] = this.observers[pointer] || [];
        this.observers[pointer].push(callback);
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
            observers[i](event);
        }
    }

    bubbleObservers(pointer, error) {
        const frags = splitPointer(pointer);
        while (frags.length) {
            this.notify(`#/${frags.join("/")}`, error);
            frags.length -= 1;
        }
        this.notify("#", error);
    }
}


module.exports = ValidationService;
