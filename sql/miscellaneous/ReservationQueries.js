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
exports.isReservationOverlapping = isReservationOverlapping;
exports.createReservation = createReservation;
exports.fetchReservations = fetchReservations;
exports.fetchReservation = fetchReservation;
exports.updateReservation = updateReservation;
exports.updateAndCompareReservation = updateAndCompareReservation;
exports.deleteReservation = deleteReservation;
exports.fetchUserReservations = fetchUserReservations;
exports.fetchUserReservation = fetchUserReservation;
const Database_1 = __importDefault(require("../../schemas/Database"));
const DateFormat_1 = require("../../tools/DateFormat");
const AuditoriumQueries_1 = require("./AuditoriumQueries");
const UserQueries_1 = require("./UserQueries");
//#region Funciones de reservas globales o dirigidas a administradores
function isReservationOverlapping(options) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const pgOverlap = yield Database_1.default.query(`select reservation_id from public.reservations where auditorium_id = $1 and not (end_at <= $2 or start_at >= $3)`, [options.auditorium, options.start, options.end]);
        return !!((_a = pgOverlap.rows[0]) === null || _a === void 0 ? void 0 : _a.reservation_id);
    });
}
function createReservation(reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database_1.default.query(`insert into public.reservations (reservation_id, state, title, reason, start_at, end_at, auditorium_id, requested_by, assistants, purpose, requires_tech)
        values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, [reservation.id, reservation.state, reservation.title, reservation.reason, reservation.start_at, reservation.end_at, reservation.auditorium_id, reservation.requested_by, reservation.assistants, reservation.purpose, reservation.requires_tech]);
    });
}
function fetchReservations() {
    return __awaiter(this, void 0, void 0, function* () {
        const reservationCollection = {};
        const pgResult = yield Database_1.default.query("select * from public.reservations;");
        for (const reservationDTO of pgResult.rows) {
            const reservation = {
                id: reservationDTO.reservation_id,
                title: reservationDTO.title,
                reason: reservationDTO.reason,
                state: reservationDTO.state,
                requested_by: reservationDTO.requested_by,
                end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
                start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
                auditorium_id: reservationDTO.auditorium_id,
                assistants: reservationDTO.assistants,
                purpose: reservationDTO.purpose,
                requires_tech: reservationDTO.requires_tech
            };
            reservationCollection[reservation.id] = reservation;
        }
        return reservationCollection;
    });
}
function fetchReservation(reservationId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgReservation = yield Database_1.default.query("select * from public.reservations where reservation_id = $1;", [reservationId]);
        if (pgReservation.rows.length === 0)
            return null;
        const reservationDTO = pgReservation.rows[0];
        const reservation = {
            id: reservationDTO.reservation_id,
            title: reservationDTO.title,
            reason: reservationDTO.reason,
            state: reservationDTO.state,
            requester: reservationDTO.requested_by,
            end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
            start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
            auditorium: reservationDTO.auditorium_id,
            assistants: reservationDTO.assistants,
            purpose: reservationDTO.purpose,
            requires_tech: reservationDTO.requires_tech
        };
        //Si se require incluir el usuario que solicito la reserva
        if (options === null || options === void 0 ? void 0 : options.includeRequester) {
            const userDTO = yield (0, UserQueries_1.fetchUser)(reservationDTO.requested_by);
            if (!userDTO) {
                reservation.requester = null;
            }
            else {
                reservation.requester = userDTO;
            }
        }
        //Si se require incluir el auditorio solicitado
        if (options === null || options === void 0 ? void 0 : options.includeAuditorium) {
            const auditoriumDTO = yield (0, AuditoriumQueries_1.fetchAuditorium)(reservationDTO.auditorium_id);
            if (!auditoriumDTO) {
                reservation.auditorium = null;
            }
            else {
                reservation.auditorium = auditoriumDTO;
            }
        }
        return reservation;
    });
}
function updateReservation(reservationId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield Database_1.default.query("begin");
            const data = Object.entries(options);
            const pgSetClause = data.map((v, i) => `${v[0]} = $${i + 1}`).join(", ");
            const pgResult = yield Database_1.default.query(`update public.reservations set ${pgSetClause} where reservation_id = $${data.length + 1} returning *;`, [...data.map(v => {
                    if (["number", "string"].indexOf(typeof v[1]) !== -1 && ["start_at", "end_at"].indexOf(v[0]) !== -1) {
                        return new Date(v[1]);
                    }
                    else {
                        return v[1];
                    }
                }), reservationId]);
            if (pgResult.rows.length === 0)
                return null;
            const reservationDTO = pgResult.rows[0];
            const reservation = {
                id: reservationDTO.reservation_id,
                title: reservationDTO.title,
                reason: reservationDTO.reason,
                state: reservationDTO.state,
                requested_by: reservationDTO.requested_by,
                end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
                start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
                auditorium_id: reservationDTO.auditorium_id,
                assistants: reservationDTO.assistants,
                purpose: reservationDTO.purpose,
                requires_tech: reservationDTO.requires_tech
            };
            if (reservationDTO.end_at <= reservationDTO.start_at)
                throw new Error(`End date must be greater than start date.`);
            yield Database_1.default.query("commit");
            return reservation;
        }
        catch (err) {
            yield Database_1.default.query("rollback");
            return err.message;
        }
    });
}
function updateAndCompareReservation(reservationId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = Object.entries(options);
        const pgSetClause = data.map((v, i) => `${v[0]} = $${i + 1}`).join(", ");
        const oldReservation = yield fetchReservation(reservationId).then(r => r);
        if (!oldReservation)
            return [null, null];
        const pgResult = yield Database_1.default.query(`update public.reservations set ${pgSetClause} where reservation_id = $${data.length + 1} returning *;`, [...data.map(v => {
                if (typeof v[1] === "number") {
                    return new Date(v[1]);
                }
                else {
                    return v[1];
                }
            }), reservationId]);
        if (pgResult.rows.length === 0)
            return [null, null];
        const reservationDTO = pgResult.rows[0];
        const reservation = {
            id: reservationDTO.reservation_id,
            title: reservationDTO.title,
            reason: reservationDTO.reason,
            state: reservationDTO.state,
            requested_by: reservationDTO.requested_by,
            end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
            start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
            auditorium_id: reservationDTO.auditorium_id,
            assistants: reservationDTO.assistants,
            purpose: reservationDTO.purpose,
            requires_tech: reservationDTO.requires_tech
        };
        return [oldReservation, reservation];
    });
}
function deleteReservation(reservationId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`delete from public.reservations where reservation_id = $1 returning *;`, [reservationId]);
        if (pgResult.rows.length === 0)
            return null;
        const reservationDTO = pgResult.rows[0];
        const reservation = {
            id: reservationDTO.reservation_id,
            title: reservationDTO.title,
            reason: reservationDTO.reason,
            state: reservationDTO.state,
            requested_by: reservationDTO.requested_by,
            end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
            start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
            auditorium_id: reservationDTO.auditorium_id,
            assistants: reservationDTO.assistants,
            purpose: reservationDTO.purpose,
            requires_tech: reservationDTO.requires_tech
        };
        return reservation;
    });
}
//#region Funcion de reservas dirigidas a un usuario
function fetchUserReservations(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        const reservationCollection = {};
        const pgResult = yield Database_1.default.query("select * from public.reservations where requested_by = $1", [userId]);
        for (const reservationDTO of pgResult.rows) {
            if (reservationDTO.requested_by !== userId)
                continue;
            const reservation = {
                id: reservationDTO.reservation_id,
                title: reservationDTO.title,
                reason: reservationDTO.reason,
                state: reservationDTO.state,
                requested_by: reservationDTO.requested_by,
                end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
                start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
                auditorium_id: reservationDTO.auditorium_id,
                assistants: reservationDTO.assistants,
                purpose: reservationDTO.purpose,
                requires_tech: reservationDTO.requires_tech
            };
            reservationCollection[reservation.id] = reservation;
        }
        return reservationCollection;
    });
}
function fetchUserReservation(userId, reservationId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgReservation = yield Database_1.default.query("select * from public.reservations where reservation_id = $1 and requested_by = $2;", [reservationId, userId]);
        if (pgReservation.rows.length === 0)
            return null;
        const reservationDTO = pgReservation.rows[0];
        const reservation = {
            id: reservationDTO.reservation_id,
            title: reservationDTO.title,
            reason: reservationDTO.reason,
            state: reservationDTO.state,
            requester: reservationDTO.requested_by,
            end_at: (0, DateFormat_1.formatToLocale)(reservationDTO.end_at),
            start_at: (0, DateFormat_1.formatToLocale)(reservationDTO.start_at),
            auditorium: reservationDTO.auditorium_id,
            assistants: reservationDTO.assistants,
            purpose: reservationDTO.purpose,
            requires_tech: reservationDTO.requires_tech
        };
        //Si se require incluir el auditorio solicitado
        if (options === null || options === void 0 ? void 0 : options.includeAuditorium) {
            const auditoriumDTO = yield (0, AuditoriumQueries_1.fetchAuditorium)(reservationDTO.auditorium_id);
            if (!auditoriumDTO) {
                reservation.auditorium = null;
            }
            else {
                reservation.auditorium = auditoriumDTO;
            }
        }
        return reservation;
    });
}
