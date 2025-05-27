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
exports.getSelfReservations = getSelfReservations;
exports.getSelfReservation = getSelfReservation;
exports.getSelfReservationReceipt = getSelfReservationReceipt;
exports.getSelf = getSelf;
exports.putSelf = putSelf;
exports.putSelfPassword = putSelfPassword;
exports.removeSelf = removeSelf;
const ReservationQueries_1 = require("../sql/miscellaneous/ReservationQueries");
const UserQueries_1 = require("../sql/miscellaneous/UserQueries");
const PDF_1 = require("../tools/PDF");
const constants_1 = require("../constants");
const bcrypt_1 = require("bcrypt");
const SelfQueries_1 = require("../sql/miscellaneous/SelfQueries");
const transport_1 = __importDefault(require("../mail/transport"));
//Obtener lista de reservas propias
function getSelfReservations(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = request.user;
            const reservations = yield (0, ReservationQueries_1.fetchUserReservations)(user.id);
            response.status(200).send({ message: "Reservations fetched.", reservations });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener una reserva propia
function getSelfReservation(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = request.user;
            const { reservationId } = request.params;
            const { include_auditorium } = request.query;
            if (!reservationId)
                return response.status(400).send({ message: `Reservation ID not provided.` });
            const reservation = yield (0, ReservationQueries_1.fetchUserReservation)(user.id, reservationId, {
                includeAuditorium: (include_auditorium === "true")
            });
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            response.status(200).send({ message: "Reservation fetched.", reservation });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener factura en PDF de una reserva
function getSelfReservationReceipt(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        try {
            const user = request.user;
            const { reservationId } = request.params;
            if (!reservationId)
                return response.status(400).send({ message: `Reservation ID not provided.` });
            if (constants_1.EXCLUDED_EMAILS_FROM_RECEIPTS.some(e => user.email.endsWith(e)))
                return response.status(422).send({ message: `Email's domain excluded from receipts.` });
            const reservation = yield (0, ReservationQueries_1.fetchReservation)(reservationId, { includeRequester: true, includeAuditorium: true });
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            if (((_a = reservation.requester) === null || _a === void 0 ? void 0 : _a.id) !== user.id)
                return response.status(403).send({ message: `Foreign reservation.` });
            const receiptPDF = yield (0, PDF_1.generateReceipt)(reservation);
            response.setHeader("Content-Type", "application/pdf");
            response.setHeader("Content-Disposition", `attachment; filename=receipt_${reservation.id}.pdf`);
            response.status(200).send(receiptPDF);
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener datos propios
function getSelf(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const userId = request.user.id;
            const { include_reservations } = request.query;
            const user = yield (0, UserQueries_1.fetchUser)(userId, (include_reservations === "true" && true));
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            response.status(200).send({ message: `Fetched self.`, user });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//PENDIENTE: Actualiza usuario propio
function putSelf(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = request.body;
            const user = request.user;
            const newUser = yield (0, SelfQueries_1.updateSelfUser)(user.id, data);
            response.status(200).send({ message: `Updated self.`, user: newUser });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Actualiza contraseña
function putSelfPassword(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = request.user;
            const { password } = request.body;
            if (!password)
                return response.status(400).send({ message: `New password not provided.` });
            if (password.length < 3)
                return response.status(403).send({ message: `Password must have minimun length of 3 characters.` });
            transport_1.default.sendMail({
                to: user.email,
                from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                subject: "CAMBIO DE CONTRASEÑA",
                text: `Has cambiado tu contraseña a ${password}. Guardala y no la compartas con nadie.`
            }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.email}: ${e.message}`));
            const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
            yield (0, SelfQueries_1.updateSelfPassword)(user.id, hashedPassword);
            response.status(200).send({ message: `Password updated.` });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Eliminar usuario
function removeSelf(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const user = request.user;
            transport_1.default.sendMail({
                to: user.email,
                from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                subject: "CUENTA ELIMINADA",
                text: `Has eliminado tu cuenta correctamente. Lamentamos que hayas decidido tomar esta medida drastica.`
            }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.email}: ${e.message}`));
            yield (0, UserQueries_1.deleteUser)(user.id);
            response.status(200).send({ message: `User account deleted.` });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
