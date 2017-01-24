/* eslint object-property-newline: 0 */
const expect = require("chai").expect;
const ValidationService = require("../lib/ValidationService");


describe("ValidationService", () => {

    let schema;
    let service;

    beforeEach(() => {
        schema = {
            type: "object",
            properties: {
                title: { type: "string" },
                chapter: { type: "number", minimum: 1 },
                modules: {
                    type: "array",
                    items: { type: "string" }
                }
            }
        };
        service = new ValidationService(schema);
    });

    it("should store json schema", () => {
        const result = service.get();
        expect(result).to.eq(schema);
    });

    it("should validate data by json schema", () => service
        .validate({ title: "test", chapter: 1, modules: [] })
        .then((errors) => expect(errors).to.have.lengthOf(0))
    );

    it("should pass errors for invalid data", () => service
        .validate({ title: "test", chapter: 0, modules: [] })
        .then((errors) => expect(errors).to.have.lengthOf(1))
    );

    describe("observe", () => {

        it("should notify error at pointer", () => {
            let called = false;
            service.observe("#/modules/0", () => (called = true));
            return service.validate({ title: "test", chapter: 1, modules: [1, "two"] })
                .then(() => expect(called).to.eq(true));
        });

        it("should notify all parents of error", () => {
            let called = false;
            service.observe("#/modules", () => (called = true));
            return service.validate({ title: "test", chapter: 1, modules: [1, "two"] })
                .then(() => expect(called).to.eq(true));
        });

        it("should notify root of error", () => {
            let called = false;
            service.observe("#", () => (called = true));
            return service.validate({ title: "test", chapter: 1, modules: [1, "two"] })
                .then(() => expect(called).to.eq(true));
        });

        it("should not notify observers on different tree", () => {
            let called = false;
            service.observe("#/test", () => (called = true));
            return service.validate({ title: "test", chapter: 1, modules: [1, "two"] })
                .then(() => expect(called).to.eq(false));
        });
    });

    describe("events", () => {

        it("should emit 'beforeValidation' event before starting validation", () => {
            let called = false;
            service.on("beforeValidation", () => (called = true));

            service.validate({ title: "test", chapter: 1, modules: [] });

            expect(called).to.eq(true);
        });

        it("should emit 'afterValidation' event after notifying observers", () => {
            let called = false;
            service.observe("#/chapter", () => (called = true));

            service.on("afterValidation", () => expect(called).to.eq(true));

            return service.validate({ title: "test", chapter: 0, modules: [] });
        });
    });
});
