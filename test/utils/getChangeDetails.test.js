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
            { a: [{ change: "first" }, { change: "second" }] },
            { a: [{ change: "first" }, { change: "inserted" }, { change: "second" }] }
        );

        expect(changes).to.deep.equal({ added: ["1", "2"], removed: ["1"] });
    });
});

