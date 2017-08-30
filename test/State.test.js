/* eslint object-property-newline: 0, max-nested-callbacks: 0 */
const expect = require("chai").expect;
const State = require("../lib/state");


describe("state", () => {

    let state;

    beforeEach(() => {
        state = new State();
    });

    it("should return a unique id", () => {
        const first = State.createId("data");
        const second = State.createId("data");

        expect(first).to.not.eq(second);
    });

    it("should dispatch action", () => {
        let calledAction;
        function reducer(state = {}, action) {
            calledAction = action;
            return state;
        }
        state.register("data", reducer);

        state.dispatch({ type: "DUMMY_ACTION", value: 14 });

        expect(calledAction).to.deep.eq({ type: "DUMMY_ACTION", value: 14 });
    });

    it("should register multiple reducers", () => {
        const calledActions = [];
        const action = { type: "DUMMY_ACTION", value: 14 };
        state.register("A", (state = {}, action) => {
            action.type === "DUMMY_ACTION" && calledActions.push(action);
            return state;
        });
        state.register("B", (state = {}, action) => {
            action.type === "DUMMY_ACTION" && calledActions.push(action);
            return state;
        });

        state.dispatch(action);

        expect(calledActions).to.deep.equal([action, action]);
    });

    it("should register reducers on separate entry points", () => {
        const calledActions = [];
        const action = { type: "DUMMY_ACTION", value: 14 };
        state.register("A", (state = {}, action) => {
            action.type === "DUMMY_ACTION" && calledActions.push(action);
            return { id: "A" };
        });
        state.register("B", (state = {}, action) => {
            action.type === "DUMMY_ACTION" && calledActions.push(action);
            return { id: "B" };
        });
        state.dispatch(action);

        const currentState = state.get();

        expect(currentState.A).to.deep.equal({ id: "A" });
        expect(currentState.B).to.deep.equal({ id: "B" });
    });

    it("should return state of given reducer", () => {
        state.register("A", (state = {}, action) => ({ id: "A" }));

        const stateA = state.get("A");

        expect(stateA).to.deep.eq({ id: "A" });
    });
});
