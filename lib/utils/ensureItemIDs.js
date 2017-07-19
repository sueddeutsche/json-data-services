const getTypeOf = require("json-schema-library/lib/getTypeOf");
const hash = require("./hash");
const ID_PROPERTY = "_id";


function generateId(index) {
    const id = `${index}${Math.random()}${Date.now()}`;
    return hash(id);
}


function addMissingItemIDs(list) {
    list.forEach((item, index) => {
        if (item[ID_PROPERTY] == null) {
            const type = getTypeOf(item);
            if (type === "object" || type === "array") {
                item[ID_PROPERTY] = ensureItemIDs.config.generateId(index);
            }
        }
    });
}


function ensureItemIDs(data) {
    const dataType = getTypeOf(data);
    if (dataType === "array") {
        ensureItemIDs.config.addMissingItemIDs(data);
        data.forEach((item) => ensureItemIDs(item));

    } else if (dataType === "object") {
        Object.keys(data).forEach((key) => ensureItemIDs(data[key]));
    }

    return data;
}


ensureItemIDs.config = {
    ID_PROPERTY,
    addMissingItemIDs,
    generateId
};


module.exports = ensureItemIDs;
