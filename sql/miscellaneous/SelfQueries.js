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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSelfLoginTime = updateSelfLoginTime;
exports.updateSelfPassword = updateSelfPassword;
exports.updateSelfUser = updateSelfUser;
const Database_1 = __importDefault(require("../../schemas/Database"));
function updateSelfLoginTime(userId, time) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database_1.default.query(`update public.users_account set last_login = $1 where user_id = $2`, [time, userId]);
    });
}
function updateSelfPassword(userId, password) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database_1.default.query(`update public.users_credentials set password = $1 where user_id = $2`, [password, userId]);
    });
}
function updateSelfUser(userId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = Object.entries(options);
        const pgSetClause = data.map((v, i) => `${v[0]} = $${i + 1}`).join(", ");
        const pgResult = yield Database_1.default.query(`update public.users set ${pgSetClause} where user_id = $${data.length + 1} returning *;`, [...data.map(v => {
                return v[1];
            }), userId]);
        const userDTO = (pgResult.rows.length > 0 && pgResult.rows[0]);
        if (!userDTO)
            return null;
        const user = {
            id: userDTO.user_id,
            first_name: userDTO.first_name,
            last_name: userDTO.last_name,
            role: userDTO.role,
            account: {
                created_at: userDTO.created_at,
                last_login: userDTO.last_login,
                tfa: userDTO.tfa,
                active: userDTO.active
            },
            credentials: {
                email: userDTO.email,
                password: userDTO.password,
                phone: userDTO.phone
            },
        };
        return user;
    });
}
