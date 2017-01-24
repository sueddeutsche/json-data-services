const stripPointerPrefix = require("gson-pointer/lib/common").stripPointerPrefix;


module.exports = function splitPointer(pointer) {
    return stripPointerPrefix(pointer)
        .split("/")
        .filter((val) => val !== "");
};
