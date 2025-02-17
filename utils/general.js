"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.camelize = camelize;
exports.titleize = titleize;
function camelize(str) {
    return str.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
        return index == 0 ? word.toLowerCase() : word.toUpperCase();
    }).replace(/\s+/g, '');
}
function titleize(str) {
    return str.toLowerCase().split(' ').map(word => word.length === 2 ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
