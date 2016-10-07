"use strict";
function isString(value) {
    return value != null && typeof value === 'string';
}
exports.isString = isString;
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;
function isThenable(value) {
    return isObject(value) && isFunction(value.then);
}
exports.isThenable = isThenable;
function isObject(value) {
    return typeof value === 'object';
}
exports.isObject = isObject;
function get(obj, path) {
    if (isString(path)) {
        path = path.replace(/\[|\]/, '.').split('.');
    }
    return path.reduce(function (result, key) {
        if (isObject(result) && key) {
            return result[key.toString()];
        }
        return undefined;
    }, obj);
}
exports.get = get;
//# sourceMappingURL=utils.js.map