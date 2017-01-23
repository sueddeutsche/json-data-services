const expect = require("chai").expect;
const DataService = require("../lib/DataService");


describe("DataService", () => {
    let service;
    beforeEach(() => {
        service = new DataService();
    });

    it("should store given data", () => {
        service.set("#", { id: "storeme" });

        const data = service.get("#");

        expect(data).to.deep.eq({ id: "storeme" });
    });

    it("should store copy of data", () => {
        const data = { item: { id: "original" } };
        service.set("#", data);

        data.item.id = "modified";

        expect(service.get("#")).to.deep.equal({ item: { id: "original" } });
    });

    it("should update nested value", () => {
        const data = { item: { id: "original" } };
        service.set("#", data);

        service.set("#/item/label", "modified");

        expect(service.get("#")).to.deep.equal({ item: { id: "original", label: "modified" } });
    });

    it("should throw if pointer has no parent value", () => {
        service.set("#", {});

        expect(() => service.set("#/invalid/path", "will not be set")).to.throw(Error);
    });

    it("should return nested data", () => {
        const data = { item: { id: "original" } };
        service.set("#", data);

        const result = service.get("#/item/id");

        expect(result).to.eq("original");
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
    });
});
