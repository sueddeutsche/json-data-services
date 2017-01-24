const stripPointerPrefix = require("gson-pointer/lib/common").stripPointerPrefix;


module.exports = function isRootPointer(pointer) {
    return stripPointerPrefix(pointer) === "";
};
