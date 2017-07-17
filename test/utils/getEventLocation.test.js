/* eslint object-property-newline: 0, max-nested-callbacks: 0 */
const expect = require("chai").expect;
const getEventLocation = require("../../lib/utils/getEventLocation");


describe("utils.getEventLocation", () => {

    it("should return json-pointer of change location", () => {
        const pointer = getEventLocation(
            { a: [{ change: "here" }] },
            { a: [{ change: "here!" }] }
        );

        expect(pointer).to.equal("#/a/0/change");
    });

    it("should return common path of multiple changes", () => {
        const pointer = getEventLocation({
            common: {
                a: {
                    title: "oh"
                },
                b: {
                    title: "oh"
                }
            }
        }, {
            common: {
                a: {
                    title: "ohmy"
                },
                b: {
                    title: "ohmy"
                }
            }
        });

        expect(pointer).to.equal("#/common");
    });

    it("should return pointer to item for a modification", () => {
        const pointer = getEventLocation(
            { an: [{ item: "before" }] },
            { an: [{ item: "after" }] }
        );

        expect(pointer).to.equal("#/an/0/item");
    });

    it("should return pointer to array for added items", () => {
        const pointer = getEventLocation(
            { an: [{ item: "here" }] },
            { an: [{ item: "here" }, { item: "added" }] }
        );

        expect(pointer).to.equal("#/an");
    });

    it("should return pointer to array for removed items", () => {
        const pointer = getEventLocation(
            { an: [{ item: "here" }, { item: "added" }] },
            { an: [{ item: "here" }] }
        );

        expect(pointer).to.equal("#/an");
    });

    it("should return pointer to item for modified property", () => {
        const pointer = getEventLocation(
            { an: { object: { withAKey: "before" } } },
            { an: { object: { withAKey: "after" } } }
        );

        expect(pointer).to.equal("#/an/object/withAKey");
    });

    it("should return pointer to object for a added property", () => {
        const pointer = getEventLocation(
            { an: { object: { } } },
            { an: { object: { withAKey: "" } } }
        );

        expect(pointer).to.equal("#/an/object");
    });

    it("should return pointer to object for removed property", () => {
        const pointer = getEventLocation(
            { an: { object: { withAKey: "" } } },
            { an: { object: { } } }
        );

        expect(pointer).to.equal("#/an/object");
    });
});
