const chalk = require("chalk");
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

service.validationService.observe("#", (error) => console.log(chalk.red(`error: ${error.message}`)));

module.exports = service;
