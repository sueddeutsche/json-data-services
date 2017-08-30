const expect = require("chai").expect;
const gp = require("gson-pointer");
const diffpatch = require("../../lib/utils/diffpatch");
const getPatchesPerPointer = require("../../lib/utils/getPatchesPerPointer");

describe("getPatchesPerPointer", () => {

    it("should return empty array if data is the same", () => {
        const result = getPatchesPerPointer({ a: "prop" }, { a: "prop" });

        expect(result).to.have.length(0);
    });

    it("should return patches with pointer of change and its patch", () => {
        const result = getPatchesPerPointer({ a: "prop" }, { a: "properly" });

        expect(result).to.have.length(1);
        expect(result[0]).to.deep.eq({ pointer: "#/a", patch: ["prop", "properly"] });
    });

    it("should return nested patches with pointer of change and its patch", () => {
        const result = getPatchesPerPointer(
            { a: { changedHere: "prop" } },
            { a: { changedHere: "properly" } }
        );

        expect(result).to.have.length(1);
        expect(result[0]).to.deep.eq({ pointer: "#/a/changedHere", patch: ["prop", "properly"] });
    });

    it("should return all patches with pointer of change and its patch", () => {
        const result = getPatchesPerPointer(
            { a: { changedHere: "prop" }, andHere: "boo" },
            { a: { changedHere: "properly" }, andHere: "foo" }
        );

        expect(result).to.have.length(2);
        expect(result[0]).to.deep.eq({ pointer: "#/a/changedHere", patch: ["prop", "properly"] });
        expect(result[1]).to.deep.eq({ pointer: "#/andHere", patch: ["boo", "foo"] });
    });

    it("should return pointer of object for key changes", () => {
        const result = getPatchesPerPointer(
            { a: { b: "key" } },
            { a: { c: "key" } }
        );

        expect(result).to.have.length(1);
        expect(result[0]).to.deep.eq({
            pointer: "#/a",
            patch: { b: ["key", 0, 0], c: ["key"] }
        });
    });

    it("should return pointer of array for item changes", () => {
        const result = getPatchesPerPointer(
            { a: ["string"] },
            { a: ["modifiedString"] }
        );

        expect(result).to.have.length(1);
        expect(result[0]).to.deep.eq({
            pointer: "#/a",
            patch: { "0": ["modifiedString"], _0: ["string", 0, 0], _t: "a" }
        });
    });

    it("should return movement of arrays", () => {
        const result = getPatchesPerPointer(
            { a: [{ _id: 0, title: "first" }, { _id: 1, title: "second" }, { _id: 2, title: "third" }] },
            { a: [{ _id: 2, title: "third" }, { _id: 1, title: "second" }, { _id: 0, title: "first" }] }
        );

        expect(result).to.have.length(1);
    });

    it("should return patches in correct order", () => {
        const result = getPatchesPerPointer(
            { a: [{ _id: 0, title: "first" }, { _id: 1, title: "second" }, { _id: 2, title: "third" }] },
            { a: [{ _id: 2, title: "third" }, { _id: 1, title: "zwei" }, { _id: 0, title: "eins" }] }
        );

        expect(result).to.have.length(3);
        // movement (changing indices) should come first
        expect(result[0]).to.deep.eq({
            pointer: "#/a",
            patch: { _t: "a", _1: ["", 1, 3], _2: ["", 0, 3] }
        });
        // other changes should refer to updated index
        expect(result[1].pointer).to.eq("#/a/1/title");
        expect(result[2].pointer).to.eq("#/a/2/title");
    });


    describe("patch", () => {

        function applyPatches(input, patches) {
            const orig = JSON.parse(JSON.stringify(input));
            patches.forEach((delta) => {
                const val = gp.get(orig, delta.pointer);
                const updated = diffpatch.patch(val, delta.patch);
                gp.set(orig, delta.pointer, updated);
            });
            return orig;
        }

        it("should correctly patch array movement", () => {
            const input = { a: [{ _id: 0, title: "first" }, { _id: 1, title: "second" }, { _id: 2, title: "third" }] };
            const update = { a: [{ _id: 2, title: "third" }, { _id: 1, title: "zwei" }, { _id: 0, title: "eins" }] };
            const patches = getPatchesPerPointer(input, update);

            const result = applyPatches(input, patches);

            expect(update).to.deep.eq(result);
        });

        it("should correctly patch array insertion", () => {
            const input = { a: [{ _id: 0, title: "first" }, { _id: 2, title: "third" }] };
            const update = { a: [{ _id: 0, title: "first" }, { _id: 1, title: "second" }, { _id: 2, title: "third" }] };
            const patches = getPatchesPerPointer(input, update);

            const result = applyPatches(input, patches);

            expect(update).to.deep.eq(result);
        });

        it("should also patch different input arrays", () => {
            const input = { a: [{ _id: 0, title: "first" }, { _id: 1, title: "second" }, { _id: 2, title: "third" }] };
            const update = { a: [{ _id: 2, title: "third" }, { _id: 1, title: "second" }, { _id: 0, title: "first" }] };
            const patches = getPatchesPerPointer(input, update);

            const result = applyPatches({ a: [1, 2, 3] }, patches);

            expect(result).to.deep.eq({ a: [3, 2, 1] });
        });
    });
});
