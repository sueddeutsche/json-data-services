const copy = require("./utils/copy");
const core = require("./schema/core");
const jsl = require("json-schema-library");


class SchemaService {

    constructor(schema = {}, data = {}) {
        this.setData(data);
        this.setSchema(schema);
    }

    setData(data) {
        this.data = data;
    }

    setSchema(schema) {
        this.schema = schema;
    }

    // return the json-schema for the given json-pointer
    get(pointer, data = this.data) {
        const result = jsl.getSchema(core, this.schema, pointer, data);
        return copy(result);
    }
}


module.exports = SchemaService;
