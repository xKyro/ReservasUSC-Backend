"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasAdminPrivileges = hasAdminPrivileges;
const User_1 = require("../schemas/User");
function hasAdminPrivileges(user, checkAdmin) {
    return (checkAdmin && (user.role === User_1.UserRole.ADMINISTRATOR) || false);
}
