"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = getUsers;
exports.getUser = getUser;
exports.removeUser = removeUser;
const AccessResolver_1 = require("../tools/AccessResolver");
const UserQueries_1 = require("../sql/miscellaneous/UserQueries");
function getUsers(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const users = yield (0, UserQueries_1.fetchUsers)();
            response.status(200).send({ users });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
function getUser(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = request.params;
            const me = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(me, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const user = yield (0, UserQueries_1.fetchUser)(userId);
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            response.status(200).send({ user });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
function removeUser(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { userId } = request.params;
            const me = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(me, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const user = yield (0, UserQueries_1.deleteUser)(userId);
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            response.status(200).send({ message: `User deleted.`, user });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
