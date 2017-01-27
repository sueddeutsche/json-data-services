const copy = require("./utils/copy");
const core = require("./schema/core");
const jsl = require("json-schema-library");


class SchemaService {

    constructor(schema = {}, data = {}) {
        this.setData(data);
        this.setSchema(schema);
    }

    addDefaultData(data = this.data, schema = this.schema) {
        return core.getTemplate(schema, data);
    }

    setData(data) {
        this.data = data;
    }

    setSchema(schema) {
        this.schema = schema;
    }

    // return the json-schema for the given json-pointer
    get(pointer, data = this.data) {
        const result = jsl.getSchema(core, this.schema, data, pointer);
        return copy(result);
    }
}


module.exports = SchemaService;
