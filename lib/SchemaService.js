const copy = require("./utils/copy");
const core = require("./schema/core");
const jsl = require("json-schema-library");
const addValidator = require("json-schema-library/lib/addValidator");
const getChildSchemaSelection = require("json-schema-library").getChildSchemaSelection;

class SchemaService {

    constructor(schema = {}, data = {}) {
        this.setData(data);
        this.setSchema(schema);
    }

    addDefaultData(data = this.data, schema = this.schema) {
        return core.getTemplate(schema, data);
    }

    getTemplate(schema) {
        return core.getTemplate(schema);
    }

    getChildSchemaSelection(pointer, property) {
        const parentSchema = this.get(pointer);
        return getChildSchemaSelection(core, parentSchema, property);
    }

    setData(data) {
        this.data = data;
        this.resetCache();
    }

    setSchema(schema) {
        core.rootSchema = schema;
        this.schema = core.rootSchema;
        this.resetCache();
    }

    resetCache() {
        this.cache = {};
    }

    addValidator(type, value, validator) {
        if (type === "format") {
            addValidator.format(core, value, validator);
            return;
        }

        throw new Error(`Unknown or unsupported validation ${type}`);
    }

    // return the json-schema for the given json-pointer
    get(pointer, data) {
        if (data) {
            const result = jsl.getSchema(core, this.schema, data, pointer);
            return copy(result);
        }

        if (this.cache[pointer] === undefined) {
            const result = jsl.getSchema(core, this.schema, this.data, pointer);
            if (result.variableSchema === true) {
                // @special case: do not cache dynamic schema object (oneOf)
                return result;
            }
            this.cache[pointer] = copy(result);
        }

        return this.cache[pointer];
    }

    destroy() {
        this.setData(null);
        this.setSchema(null);
    }
}


module.exports = SchemaService;
