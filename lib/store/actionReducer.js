module.exports = function (state = {}, action) {
    return {
        type: action.type,
        pointer: action.pointer
    };
};
