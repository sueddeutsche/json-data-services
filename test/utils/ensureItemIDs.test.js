/* eslint object-property-newline: 0, max-nested-callbacks: 0 */
const expect = require("chai").expect;
const ensureItemIDs = require("../../lib/utils/ensureItemIDs");


describe("utils.ensureItemIDs", () => {
    const ID = ensureItemIDs.config.ID_PROPERTY;

    it("should return the passed data", () => {
        const data = {};
        const returnValue = ensureItemIDs(data);

        expect(returnValue).to.eq(data);
    });

    it("should add unique ids to each array item", () => {
        const data = ensureItemIDs([{ title: "oh" }, { title: "my" }]);

        expect(data[0][ID]).not.to.be.undefined; // eslint-disable-line no-unused-expressions
        expect(data[1][ID]).not.to.be.undefined; // eslint-disable-line no-unused-expressions
        expect(data[0][ID]).not.to.eq(data[1][ID]);
    });

    it("should not modify existing ids", () => {
        const data = [{ title: "oh" }, { title: "my" }];
        data[0][ID] = "manualId";
        ensureItemIDs(data);

        expect(data[0][ID]).to.eq("manualId");
        expect(data[1][ID]).not.to.be.undefined; // eslint-disable-line no-unused-expressions
        expect(data[0][ID]).not.to.eq(data[1][ID]);
    });

    it("should not add ids to non-array items", () => {
        const data = { first: { title: "oh" }, second: { title: "my" } };
        ensureItemIDs(data);

        expect(data.first[ID]).to.be.undefined; // eslint-disable-line no-unused-expressions
        expect(data.first.title[ID]).to.be.undefined; // eslint-disable-line no-unused-expressions
    });

    it("should add ids to nested arrays", () => {
        const data = [{ title: "oh", list: [{ title: "stilloh" }] }, { title: "my", list: [{ title: "stillmy" }] }];
        ensureItemIDs(data);

        expect(data[0].list[0][ID]).not.to.be.undefined; // eslint-disable-line no-unused-expressions
        expect(data[1].list[0][ID]).not.to.be.undefined; // eslint-disable-line no-unused-expressions
    });
});
