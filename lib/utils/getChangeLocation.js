const diffpatch = require("./diffpatch");
const gp = require("gson-pointer");


/*
    Between two objects, returns the json-pointer of the edit

    - for now, returns common pointer of multiple changes (if any)
    - returns parent pointer for any array-items or object-properties that are added or removed. this ensures a
        container, array or object, receives a notification of changed children.
*/
module.exports = function getChangeLocation(previousValue, newValue) {
    const diff = diffpatch.diff(previousValue, newValue);
    if (diff == null) {
        return "#";
    }

    // console.log(JSON.stringify(diff, null, 4));

    let eventLocation = "#";
    let current = diff;
    delete current._t;
    let properties = Object.keys(current);

    while (properties.length === 1) { // if multiple edits are present, return parent
        const prop = properties[0];

        // if the next item is a diff, this is the change location
        if (Array.isArray(current[prop])) {
            if (current[prop].length === 1) {
                return eventLocation; // item was added, return parent
            }

            // current[prop].length == 2 - is an edit

            if (current[prop][2] === 0) {
                return eventLocation; // item was removed, return parent
            }

            // current[prop][2] == 2 - is a text diff

            if (current[prop][2] === 3) {
                return eventLocation; // item has moved, return parent
            }

            return gp.join(eventLocation, prop);
        }

        eventLocation = gp.join(eventLocation, prop);
        current = current[prop];
        delete current._t;
        properties = Object.keys(current);
    }

    return eventLocation;
};
