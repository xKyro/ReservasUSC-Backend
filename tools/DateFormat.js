"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatToLocale = formatToLocale;
function formatToLocale(date) {
    const pad = (int) => int.toString().padStart(2, '0');
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const year = pad(date.getFullYear());
    const hour = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    //Formato simple que se puede traducir a un objeto Date facilmente
    return `${year}-${month}-${day} ${hour}:${minutes}:${seconds}`;
}
