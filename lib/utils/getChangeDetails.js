const jsondiffpatch = require("jsondiffpatch");


/*
    Between two objects, returns the json-pointer of the edit

    - for now, returns common pointer of multiple changes (if any)
    - returns parent pointer for any array-items or object-properties that are added or removed. this ensures a
        container, array or object, receives a notification of changed children.
*/
module.exports = function getChangeDetails(previousValue, newValue) {
    const changes = {};
    const diff = jsondiffpatch.diff(previousValue, newValue);
    if (diff == null) {
        return changes;
    }

    let current = diff;
    let isArray = current._t === "a";
    delete current._t;
    let properties = Object.keys(current);

    while (properties.length === 1) { // if multiple edits are present, return parent
        const prop = properties[0];
        // console.log(current);

        // if the next item is a diff, this is the change location
        if (Array.isArray(current[prop])) {
            if (current[prop].length === 1) {
                changes.added = [prop.replace(/^_/, "")];
                return changes; // item was added, return parent;
            }

            // current[prop].length == 2 - is an edit

            if (current[prop][2] === 0) {
                changes.removed = [prop.replace(/^_/, "")];
                return changes; // item was removed, return parent;
            }

            // current[prop][2] == 2 - is a text diff

            return changes;
        }

        current = current[prop];
        isArray = current._t === "a";
        delete current._t;
        properties = Object.keys(current);
    }

    if (isArray) { // multiple changes may be present
        // console.log("Multiple changes?", current);

        changes.added = changes.added || [];
        changes.removed = changes.removed || [];

        properties = Object.keys(current);
        for (let i = 0; i < properties.length; i += 1) {
            const entry = current[properties[i]];
            if (Array.isArray(entry) === false) {
                changes.added.push(properties[i]);
                changes.removed.push(properties[i]);
            } else if (entry.length === 1) {
                changes.added.push(properties[i]);
            } else if (entry[2] === 0) {
                changes.removed.push(properties[i]);
            }
        }
    }

    return changes;
};
