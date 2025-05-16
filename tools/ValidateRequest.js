"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
const REQUIRED_PARAMATERS = {
    USER: ["first_name", "last_name", "email", "password"],
    RESERVATION: ["reason", "auditorium_id", "start_at", "end_at", "assistants", "purpose"],
    AUDITORIUM: ["id", "name", "location", "capacity", "facilities", "price"]
};
//Si se modifican las Build Options de entidades originales, modificar esto tambien
function validateBody(options) {
    const compare = REQUIRED_PARAMATERS[options.type];
    if (!compare)
        return [false, []];
    return [compare.every((p) => p in options.data), compare.filter((p) => !(p in options.data))];
}
