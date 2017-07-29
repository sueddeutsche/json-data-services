const diffpatch = require("./diffpatch");


/*
    Between two objects, returns the json-pointer of the edit

    - for now, returns common pointer of multiple changes (if any)
    - returns parent pointer for any array-items or object-properties that are added or removed. this ensures a
        container, array or object, receives a notification of changed children.
*/
module.exports = function getChangeDetails(previousValue, newValue) {
    const changes = {};
    const diff = diffpatch.diff(previousValue, newValue);
    if (diff == null) {
        return changes;
    }

    // console.log("diff", JSON.stringify(diff, null, 4));

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

            if (current[prop][2] === 3) {
                changes.moved = {};
                changes.moved[prop.replace(/^_/, "")] = `${current[prop][1]}`;
                return changes; // item was removed, return parent;
            }

            return changes;
        }

        current = current[prop];
        isArray = current._t === "a";
        delete current._t;
        properties = Object.keys(current);
    }

    if (isArray) { // multiple changes may be present
        // console.log("Multiple changes", JSON.stringify(current, null, 4));

        changes.added = changes.added || [];
        changes.removed = changes.removed || [];
        changes.moved = changes.moved || {};

        properties = Object.keys(current);
        for (let i = 0; i < properties.length; i += 1) {
            const entry = current[properties[i]];
            if (Array.isArray(entry) === false) {
                changes.added.push(properties[i].replace(/^_/, ""));
                changes.removed.push(properties[i].replace(/^_/, ""));
            } else if (entry.length === 1) {
                // added item
                changes.added.push(properties[i]);
            } else if (entry[2] === 0) {
                // removed item
                changes.removed.push(properties[i].replace(/^_/, ""));
            } else if (entry[2] === 3) {
                // moved item
                changes.moved[properties[i].replace(/^_/, "")] = `${entry[1]}`;
            }
        }
    }

    return changes;
};
