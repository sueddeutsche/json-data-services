const redux = require("redux");

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
        this.store = redux.createStore(() => {}); // eslint-disable-line no-empty-function
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

    subscribe(...args) {
        return this.store.subscribe(...args);
    }
}

const Singleton = new State();
Singleton.StateConstructor = State;

module.exports = Singleton;
