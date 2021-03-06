/* eslint object-property-newline: 0, max-nested-callbacks: 0 */
const expect = require("chai").expect;
const DataService = require("../lib/DataService");
const State = require("../lib/State");


describe("DataService", () => {
    let service;
    let state;
    beforeEach(() => {
        state = new State();
        service = new DataService(state);
    });

    describe("set/get", () => {

        it("should store given data", () => {
            service.set("#", { id: "storeme" });

            const data = service.get("#");

            expect(data).to.deep.eq({ id: "storeme" });
        });

        it("should return root object by default", () => {
            service.set("#", { id: "storeme" });

            const data = service.get();

            expect(data).to.deep.eq({ id: "storeme" });
        });

        it("should store copy of data", () => {
            const data = { item: { id: "original" } };
            service.set("#", data);

            data.item.id = "modified";

            expect(service.get("#")).to.deep.equal({ item: { id: "original" } });
        });

        it("should return copy of data", () => {
            service.set("#", { item: { id: "original" } });
            const data = service.get("#");

            data.item.id = "modified";

            expect(service.get("#")).to.deep.equal({ item: { id: "original" } });
        });

        it("should update nested value", () => {
            const data = { item: { id: "original", label: "" } };
            service.set("#", data);

            service.set("#/item/label", "modified");

            expect(service.get("#")).to.deep.equal({ item: { id: "original", label: "modified" } });
        });

        it("should return nested data", () => {
            const data = { item: { id: "original" } };
            service.set("#", data);

            const result = service.get("#/item/id");

            expect(result).to.eq("original");
        });

        it("should throw if pointer has no parent value", () => {
            service.set("#", {});

            expect(() => service.set("#/invalid/path", "will not be set")).to.throw(Error);
        });

        it("should throw if pointer is undefined", () => {
            service.set("#", {});

            expect(() => service.set("#/invalid", "will not be set")).to.throw(Error);
        });
    });

    describe("delete", () => {

        let data;

        beforeEach(() => {
            data = { item: { id: "original" }, root: true };
            service.set("#", data);
        });

        it("should remove value at given pointer", () => {

            service.delete("#/item/id");

            const result = service.get("#");
            expect(result).to.deep.equal({ item: {}, root: true });
        });

        it("should remove item at given pointer", () => {
            service.set("#/item", { list: [0, 1, 2, 3] });

            service.delete("#/item/list/2");

            const result = service.get("#/item/list");
            expect(result).to.deep.equal([0, 1, 3]);
        });

        it("should throw when deleting root node", () => {
            expect(() => service.delete("#")).to.throw(Error);
        });
    });

    describe("undo/redo", () => {

        let data;

        beforeEach(() => {
            data = { item: { id: "original" } };
            service.set("#", data);
        });

        it("should restore last state of data", () => {
            service.set("#/item/id", "modified");
            expect(service.get("#/item/id")).to.eq("modified");

            service.undo();

            const result = service.get("#/item/id");
            expect(result).to.eq("original");
        });

        it("should restore deleted value", () => {
            service.delete("#/item/id");
            expect(service.get("#/item/id")).to.eq(undefined);

            service.undo();

            const result = service.get("#/item/id");
            expect(result).to.eq("original");
        });

        it("should redo previous undo step", () => {
            service.set("#/item/id", "modified");
            service.undo();
            expect(service.get("#/item/id")).to.eq("original");

            service.redo();

            const result = service.get("#/item/id");
            expect(result).to.eq("modified");
        });

        it("should prevent redo if a change has been made", () => {
            service.set("#/item/id", "modified");
            service.undo();
            service.set("#/item/id", "latest");
            expect(service.get("#/item/id")).to.eq("latest");

            service.redo();

            const result = service.get("#/item/id");
            expect(result).to.eq("latest");
        });

        it("should not update states from unknown actions", () => {
            const undoStepsBefore = state.get(service.id).data.past.length;

            state.dispatch({ type: "TEST_ACTION", value: 14 });
            const undoStepsAfter = state.get(service.id).data.past.length;

            expect(undoStepsBefore).to.eq(undoStepsAfter);
        });

        it("should not update parent pointer for a single changed value", () => {
            let updatedRoot = false;
            let updatedParent = false;
            let updatedValue = false;
            service.set("#/item/id", "modified");
            service.observe("#", () => (updatedRoot = true));
            service.observe("#/item", () => (updatedParent = true));
            service.observe("#/item/id", () => (updatedValue = true));
            service.undo();

            expect(updatedRoot).to.eq(false);
            expect(updatedParent).to.eq(false, "parent pointer should not have been notified");
            expect(updatedValue).to.eq(true, "should have updated pointer at value");
        });

        it("should update parent pointer if data has been added", () => {
            let updatedRoot = false;
            let updatedParent = false;
            let updatedValue = false;
            service.set("#/item", [1, 2, 3, 4, 5]);
            service.set("#/item", [1, 2, 3, 4, 5, 6]);
            service.observe("#", () => (updatedRoot = true));
            service.observe("#/item", () => (updatedParent = true));
            service.observe("#/item/2", () => (updatedValue = true));
            service.undo();

            expect(updatedRoot).to.eq(false, "root pointer should not have been notified");
            expect(updatedParent).to.eq(true, "parent pointer should have been notified");
            expect(updatedValue).to.eq(false);
        });

        it("should update parent pointer if data has been removed", () => {
            let updatedRoot = false;
            let updatedParent = false;
            let updatedValue = false;
            service.set("#/item", [1, 2, 3, 4, 5]);
            service.set("#/item", [1, 2, 3, 5]);
            service.observe("#", () => (updatedRoot = true));
            service.observe("#/item", () => (updatedParent = true));
            service.observe("#/item/2", () => (updatedValue = true));
            service.undo();

            expect(updatedRoot).to.eq(false, "root pointer should not have been notified");
            expect(updatedParent).to.eq(true, "parent pointer should have been notified");
            expect(updatedValue).to.eq(false);
        });
    });

    describe("events", () => {

        it("should export events", () => {
            expect(DataService.EVENTS).to.be.an("object");
            expect(DataService.EVENTS.BEFORE_UPDATE).to.be.a("string");
        });

        it("should emit 'beforeUpdate' event before applying data changes", () => {
            let event;
            service.on("beforeUpdate", (e) => {
                e.idValue = service.get("#/id");
                event = e;
            });

            service.set("#", { id: "update" });

            expect(event).to.be.an("object");
            expect(event.idValue).to.eq(undefined);
        });

        it("should emit 'beforeUpdate' event before removing data", () => {
            let event;
            service.set("#", { id: "original" });
            service.on("beforeUpdate", (e) => {
                e.idValue = service.get("#/id");
                event = e;
            });

            service.delete("#/id");

            expect(event).to.be.an("object");
            expect(event.idValue).to.eq("original");
        });

        it("should emit 'afterUpdate' event after applying data changes", () => {
            let event;
            service.on("afterUpdate", (e) => {
                e.idValue = service.get("#/id");
                event = e;
            });

            service.set("#", { id: "update" });

            expect(event).to.be.an("object");
            expect(event.idValue).to.eq("update");
        });

        it("should emit 'afterUpdate' event after removing data", () => {
            let event;
            service.set("#", { id: "original" });
            service.on("afterUpdate", (e) => {
                e.idValue = service.get("#/id");
                event = e;
            });

            service.delete("#/id");

            expect(event).to.be.an("object");
            expect(event.idValue).to.eq(undefined);
        });

        it("should emit an event object like { pointer, parentPointer, action }", () => {
            let event;
            service.set("#", { id: "original" });
            service.on("beforeUpdate", (e) => {
                event = e;
            });

            service.set("#/id", { id: "update" });

            expect(event).to.be.an("object");
            expect(event.pointer).to.eq("#/id");
            expect(event.parentPointer).to.eq("#");
        });
    });

    describe("observe", () => {

        let data;

        beforeEach(() => {
            data = { item: { id: "original" }, other: { id: "other-item" } };
            service.set("#", data);
        });

        it("should notify of change at pointer", () => {
            let called = false;
            service.observe("#/item/id", () => (called = true));
            service.set("#/item/id", "modified");

            expect(called).to.eq(true);
        });

        it("should not notify parents", () => {
            let called = false;
            service.observe("#/item", () => (called = true));
            service.set("#/item/id", "modified");

            expect(called).to.eq(false);
        });

        it("should also pass type of modified data", () => {
            let event;
            service.observe("#/item/id", (e) => (event = e));
            service.set("#/item/id", "modified");

            expect(event.type).to.eq("string");
        });

        describe("bubble events", () => {

            const BUBBLE_EVENTS = true;

            it("should notify of change at pointer", () => {
                let called = false;
                service.observe("#/item/id", () => (called = true), BUBBLE_EVENTS);
                service.set("#/item/id", "modified");

                expect(called).to.eq(true);
            });

            it("should notify all parents of change", () => {
                let called = false;
                service.observe("#/item", () => (called = true), BUBBLE_EVENTS);
                service.set("#/item/id", "modified");

                expect(called).to.eq(true);
            });

            it("should notify root of change", () => {
                let called = false;
                service.observe("#", () => (called = true), BUBBLE_EVENTS);
                service.set("#/item/id", "modified");

                expect(called).to.eq(true);
            });

            it("should not notify observers on different trees", () => {
                let called = false;
                service.observe("#/item", () => (called = true), BUBBLE_EVENTS);
                service.set("#/other/id", "modified");

                expect(called).to.eq(false);
            });

            it("should remove observer", () => {
                let called = false;
                function cb() {
                    called = true;
                }
                service.observe("#/item", cb, BUBBLE_EVENTS);
                service.removeObserver("#/item", cb);
                service.set("#/item/id", "modified");

                expect(called).to.eq(false);
            });
        });
    });

    describe("multiple instances", () => {

        it("should not set data on other DataServices", () => {
            service.set("#", { title: "service1" });
            const service2 = new DataService(new State());
            service2.set("#", { title: "service2" });

            expect(service.get("#/title")).to.eq("service1");
        });
    });
});
