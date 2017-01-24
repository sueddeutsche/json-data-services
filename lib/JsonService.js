const DataService = require("./DataService");
const SchemaService = require("./SchemaService");
const ValidationService = require("./ValidationService");


class JsonService {

    constructor(schema = {}, data = {}) {
        this.dataService = new DataService(data);
        this.validationService = new ValidationService(schema);
        this.schemaService = new SchemaService(schema, data);

        this.dataService.on(DataService.EVENTS.AFTER_UPDATE, () => {
            // start validation after data has been updated
            this.validationService.validate(this.dataService.get());
        });
    }

    setSchema(schema) {
        this.validationService.set(schema);
        this.schemaService.setSchema(schema);
    }

    getSchema(pointer = "#") {
        if (pointer === "#") {
            return this.schemaService.schema;
        }
        return this.schemaService.get(pointer, this.dataService.get());
    }

    setData(data) {
        this.dataService.set("#", data);
        this.schemaService.setData(data);
    }

    getData() {
        return this.dataService.get();
    }
}


module.exports = JsonService;
