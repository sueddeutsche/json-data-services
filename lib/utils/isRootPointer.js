const split = require("gson-pointer/lib/split");


module.exports = function isRootPointer(pointer) {
    const list = split(pointer);
    return list.length === 1 && list[0] === "";
};
