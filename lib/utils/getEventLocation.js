const jsondiffpatch = require("jsondiffpatch");
const gp = require("gson-pointer");


module.exports = function getEventLocation(previousValue, newValue) {
    const diff = jsondiffpatch.diff(previousValue, newValue);
    if (diff == null) {
        return "#";
    }

    /*
        - For now, return common pointer of multiple changes (if any)
        - Return parent pointer for any array-items or object properties that are added or removed
    */
    let eventLocation = "#";
    let current = diff;
    // let currentIsArray = current._t === "a";
    delete current._t;
    let properties = Object.keys(current);

    while (properties.length === 1) {
        const prop = properties[0];

        // if the next item is a diff, this is the change location
        if (Array.isArray(current[prop])) {
            // if (currentIsArray) {
            //     console.log(current[prop]);
            //     return eventLocation; // return the parent (array)
            // }

            if (current[prop].length === 1) {
                return eventLocation; // item was added, return parent;
            }

            if (current[prop][2] === 0) {
                return eventLocation; // item was removed, return parent;
            }

            return gp.join(eventLocation, prop);
        }

        eventLocation = gp.join(eventLocation, prop);
        current = current[prop];
        // currentIsArray = current._t === "a";
        delete current._t;
        properties = Object.keys(current);
    }

    return eventLocation;
};
