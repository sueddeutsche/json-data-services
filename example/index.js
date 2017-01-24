const JsonService = require("../lib/JsonService");
const service = new JsonService({
    type: "object",
    properties: {
        title: { type: "string" },
        chapter: { type: "number", minimum: 1 },
        modules: {
            type: "array",
            items: { type: "string" }
        }
    }
});

service.validationService.observe("#", (error) => console.log("error", error));
service.redo = () => service.dataService.redo();
service.undo = () => service.dataService.undo();

module.exports = service;
