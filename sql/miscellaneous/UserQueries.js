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
exports.isEmailAlreadyUsed = isEmailAlreadyUsed;
exports.createUser = createUser;
exports.fetchUsers = fetchUsers;
exports.fetchUser = fetchUser;
exports.fetchUserByEmail = fetchUserByEmail;
exports.deleteUser = deleteUser;
exports.enableUser = enableUser;
exports.setUserActivationToken = setUserActivationToken;
exports.fetchUserActivationToken = fetchUserActivationToken;
exports.setUserTFA = setUserTFA;
exports.fetchUserTFA = fetchUserTFA;
exports.deleteUserTFA = deleteUserTFA;
const Database_1 = __importDefault(require("../../schemas/Database"));
const ReservationQueries_1 = require("./ReservationQueries");
const bcrypt_1 = require("bcrypt");
const constants_1 = require("../../constants");
const DateFormat_1 = require("../../tools/DateFormat");
//#region Funciones dirigidas al auth
function isEmailAlreadyUsed(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select email from public.users where email = $1`, [email]);
        return !!pgResult.rows[0];
    });
}
function createUser(user) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Database_1.default.query("begin");
            const pgUser = yield Database_1.default.query(`insert into public.users (user_id, first_name, last_name, role, phone, email, password, last_login, created_at, tfa, active)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);`, [
                user.id, user.first_name, user.last_name, user.role,
                user.credentials.phone, user.credentials.email, user.credentials.password,
                user.account.last_login, user.account.created_at, user.account.tfa, user.account.active
            ]);
            yield Database_1.default.query("commit");
            return pgUser.rows[0];
        }
        catch (err) {
            yield Database_1.default.query("rollback");
            throw err;
        }
    });
}
//#region Funciones dirigidas para administradores
function fetchUsers() {
    return __awaiter(this, void 0, void 0, function* () {
        const userCollection = {};
        const pgResult = yield Database_1.default.query(`select * from public.users;`);
        //Convertimos los resultados al formato usado para la API
        for (const userDTO of pgResult.rows) {
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
                }
            };
            userCollection[user.id] = user;
        }
        return userCollection;
    });
}
function fetchUser(userId, includeReservations) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select * from public.users where user_id = $1;`, [userId]);
        const userDTO = (pgResult.rows.length > 0 && pgResult.rows[0]);
        if (!userDTO)
            return null;
        //Convertimos los resultados al formato usado para la API
        const user = {
            id: userDTO.user_id,
            first_name: userDTO.first_name,
            last_name: userDTO.last_name,
            role: userDTO.role,
            account: {
                created_at: (0, DateFormat_1.formatToLocale)(userDTO.created_at),
                last_login: (0, DateFormat_1.formatToLocale)(userDTO.last_login),
                tfa: userDTO.tfa,
                active: userDTO.active
            },
            credentials: {
                email: userDTO.email,
                password: userDTO.password,
                phone: userDTO.phone
            },
        };
        if (includeReservations) {
            const reservations = yield (0, ReservationQueries_1.fetchUserReservations)(user.id);
            if (reservations)
                user.reservations = reservations;
        }
        return user;
    });
}
function fetchUserByEmail(email) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select * from public.users where email = $1;`, [email]);
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
function deleteUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const user = yield fetchUser(userId);
        if (!user)
            return null;
        const pgResult = yield Database_1.default.query(`delete from public.users where user_id = $1`, [userId]);
        if (pgResult.rows.length === 0)
            return null;
        return user;
    });
}
//#region Funciones dirigidas para la activacion de cuenta y seguridad
function enableUser(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Database_1.default.query("begin");
            yield Database_1.default.query(`update public.users set active = true where user_id = $1;`, [userId]);
            yield Database_1.default.query(`delete from public.users_activation where user_id = $1`, [userId]);
            yield Database_1.default.query("commit");
        }
        catch (err) {
            yield Database_1.default.query("rollback");
            throw err;
        }
    });
}
function setUserActivationToken(userId, token) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`insert into public.users_activation (user_id, token) values ($1, $2)
        on conflict(user_id) do update set token = excluded.token;`, [userId, token]);
        return pgResult.rows[0];
    });
}
function fetchUserActivationToken(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select * from public.users_activation ua where ua.user_id = $1;`, [userId]);
        if (pgResult.rows.length === 0)
            return null;
        return pgResult.rows[0].token;
    });
}
//#region TFA
function setUserTFA(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const tfaCode = (Math.floor(Math.random() * 899999) + 100000).toString();
        const hashedTfaCode = yield (0, bcrypt_1.hash)(tfaCode, 10);
        yield Database_1.default.query(`insert into public.users_tfa (user_id, code, expires_at) values ($1, $2, now() + interval '${constants_1.TFA_EXPIRATION_TIME} minutes')
        on conflict(user_id) do update set code = excluded.code, expires_at = excluded.expires_at;`, [userId, hashedTfaCode]);
        return tfaCode;
    });
}
function fetchUserTFA(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select * from public.users_tfa where user_id = $1;`, [userId]);
        if (pgResult.rows.length === 0)
            return null;
        return pgResult.rows[0].code;
    });
}
function deleteUserTFA(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database_1.default.query(`delete from public.users_tfa where user_id = $1;`, [userId]);
    });
}
