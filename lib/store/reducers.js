const undoable = require("redux-undo").default;
const dataReducer = require("./dataReducer");
const actionReducer = require("./actionReducer");

module.exports = {
    action: undoable(actionReducer),
    data: undoable(dataReducer)
};
