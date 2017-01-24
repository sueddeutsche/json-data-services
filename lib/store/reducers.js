const modifyData = require("./modifyData");
const undoable = require("redux-undo").default;

module.exports = {
    data: undoable(modifyData.reducer)
};
