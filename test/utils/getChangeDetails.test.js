/* eslint object-property-newline: 0, max-nested-callbacks: 0 */
const expect = require("chai").expect;
const getChangeDetails = require("../../lib/utils/getChangeDetails");


describe("utils.getChangeDetails", () => {

    it("should return object", () => {
        const changes = getChangeDetails(
            { a: [{ change: "here" }] },
            { a: [{ change: "here!" }] }
        );

        expect(changes).to.be.an("object");
    });

    it("should return removed item index", () => {
        const changes = getChangeDetails(
            { a: [{ change: "here" }] },
            { a: [] }
        );

        expect(changes).to.deep.equal({ removed: ["0"] });
    });

    it("should return added item index", () => {
        const changes = getChangeDetails(
            { a: [] },
            { a: [{ change: "here" }] }
        );

        expect(changes).to.deep.equal({ added: ["0"] });
    });

    it("should return all modified indices", () => {
        const changes = getChangeDetails(
            { a: [{ change: "first", _id: 0 }, { change: "second", _id: 1 }] },
            { a: [{ change: "first", _id: 0 }, { change: "inserted", _id: 2 }, { change: "second", _id: 3 }] }
        );

        expect(changes).to.deep.equal({ added: ["1", "2"], removed: ["1"], moved: {} });
    });

    it("should return moved indices", () => {
        const changes = getChangeDetails(
            { a: [{ change: "first", _id: 0 }, { change: "second", _id: 1 }, { change: "third", _id: 2 }] },
            { a: [{ change: "third", _id: 2 }, { change: "first", _id: 0 }, { change: "second", _id: 1 }] }
        );

        expect(changes).to.deep.equal({ moved: { "2": "0" } });
    });

    it("should return inserted item", () => {
        const changes = getChangeDetails(
            { a: [{ change: "first", _id: 0 }, { change: "third", _id: 2 }] },
            { a: [{ change: "first", _id: 0 }, { change: "second", _id: 1 }, { change: "third", _id: 2 }] }
        );

        expect(changes).to.deep.equal({ added: ["1"] });
    });

    it("should not required object ids on non-array-items", () => {
        const changes = getChangeDetails(
            { a: { a1: "original" } },
            { a: { a1: "original", b2: "added" } }
        );

        expect(changes).to.deep.equal({ added: ["b2"] });
    });

    it("should return all changes with unique indices", () => {
        const changes = getChangeDetails(
            { a: [{ change: "first", _id: 0 }, { change: "second", _id: 1 }, { change: "third", _id: 2 }] },
            { a: [{ change: "new", _id: 3 }, { change: "third", _id: 2 }, { change: "first", _id: 0 }] }
        );

        expect(changes).to.deep.equal({ added: ["0"], removed: ["1"], moved: { "2": "1" } });
    });
});

