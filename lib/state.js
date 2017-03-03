const redux = require("redux");
const mitt = require("mitt");
const FLAG_CHANGED = "hasChanged";

const idPool = {
    createId(prefix) {
        let count = 1;
        let id = `${prefix}-`;
        while (this[id + count]) {
            count++;
        }
        id += count;
        this[id] = true;
        return id;
    }
};

class State {
    constructor() {
        this.reducers = {
            action: (state, action) => action
        };
        this.emitter = mitt();
        this.store = redux.createStore(() => {}); // eslint-disable-line no-empty-function
        this.store.subscribe(() => this.onChange(this.store.getState()));
    }

    onChange(currentState) {
        Object
            .keys(currentState)
            .forEach((id) => {
                const subState = currentState[id];
                if (subState[FLAG_CHANGED] != null && subState[FLAG_CHANGED] !== false) {
                    this.emitter.emit(id, subState);
                    subState[FLAG_CHANGED] = false;
                }
            });
    }

    // eslint-disable-next-line
    // http://stackoverflow.com/questions/32968016/how-to-dynamically-load-reducers-for-code-splitting-in-a-redux-application
    register(id, reducer) {
        if (this.reducers[id]) {
            throw new Error(`A reducer with id ${id} is already registered`);
        }
        this.reducers[id] = reducer;
        this.store.replaceReducer(redux.combineReducers(this.reducers));
    }

    createId(prefix) {
        return idPool.createId(prefix);
    }

    get(id) {
        const currentState = this.store.getState();
        return id == null ? currentState : currentState[id];
    }

    dispatch(...args) {
        return this.store.dispatch(...args);
    }

    subscribe(id, callback) {
        if (id === "*") {
            this.store.subscribe(callback);
        } else if (typeof id === "function") {
            this.store.subscribe(id);
        } else {
            const state = this.store.getState();
            if (state[id] && state[id][FLAG_CHANGED] != null) {
                this.emitter.on(id, callback);
            } else {
                throw new Error(`Could not subscribe to state ${id}. Property ${FLAG_CHANGED} not available`);
            }
        }
    }

    unsubscribe(id, callback) {
        if (id === "*") {
            this.store.unsubscribe(callback);
        } else if (typeof id === "function") {
            this.store.unsubscribe(id);
        } else {
            this.emitter.off(id, callback);
        }
    }
}

const Singleton = new State();
Singleton.StateConstructor = State;
Singleton.FLAG_CHANGED = FLAG_CHANGED;

module.exports = Singleton;
