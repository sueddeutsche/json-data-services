const DataService = require("./DataService");
const SchemaService = require("./SchemaService");
const ValidationService = require("./ValidationService");


class JsonService {

    constructor(schema = {}, data = {}) {
        this.dataService = new DataService(data);
        this.validationService = new ValidationService(schema);
        this.schemaService = new SchemaService(schema, data);

        this.dataService.on(DataService.EVENTS.AFTER_UPDATE, () => {
            this.update();
            // start validation after data has been updated
            this.validationService.validate(this.dataService.getDataByReference());
        });
    }

    getData(pointer = "#") {
        return this.dataService.get(pointer);
    }

    getSchema(pointer = "#") {
        return this.schemaService.get(pointer, this.dataService.getDataByReference());
    }

    setData(data, pointer = "#") {
        this.dataService.set(pointer, data);
    }

    deleteData(pointer) {
        this.dataService.delete(pointer);
    }

    setSchema(schema) {
        this.validationService.set(schema);
        this.schemaService.setSchema(schema);
    }

    undo() {
        this.dataService.undo();
    }

    redo() {
        this.dataService.redo();
    }

    data() {
        return this.dataService;
    }

    validator() {
        return this.validationService;
    }

    update() {
        this.schemaService.setData(this.dataService.getDataByReference());
    }
}


module.exports = JsonService;
