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
exports.registerReservation = registerReservation;
exports.getReservations = getReservations;
exports.getReservation = getReservation;
exports.getReservationReceipt = getReservationReceipt;
exports.putReservation = putReservation;
exports.removeReservation = removeReservation;
const Reservation_1 = require("../schemas/Reservation");
const ReservationQueries_1 = require("../sql/miscellaneous/ReservationQueries");
const AccessResolver_1 = require("../tools/AccessResolver");
const transport_1 = __importDefault(require("../mail/transport"));
const constants_1 = require("../constants");
const PDF_1 = require("../tools/PDF");
const DateFormat_1 = require("../tools/DateFormat");
const ValidateRequest_1 = require("../tools/ValidateRequest");
const SignID_1 = require("../tools/SignID");
//Registrar una reserva por un usuario
function registerReservation(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = request.body;
            const user = request.user;
            const [validRequest, missingParameters] = (0, ValidateRequest_1.validateBody)({ type: "RESERVATION", data });
            if (!validRequest)
                return response.status(400).send({ message: `Missing parameters. These parameters are required: ${missingParameters.join(", ")}` });
            const formattedDates = {
                start: new Date(data.start_at),
                end: new Date(data.end_at)
            };
            if (formattedDates.end <= formattedDates.start)
                return response.status(403).send({ message: `Reservation end time must be greater than start time.` });
            const reservation = {
                id: (0, SignID_1.getSnowflake)(),
                title: data.title,
                reason: data.reason || "No reason",
                state: Reservation_1.ReservationState.PENDING,
                requested_by: user.id,
                auditorium_id: data.auditorium_id,
                start_at: new Date(data.start_at),
                end_at: new Date(data.end_at),
                assistants: data.assistants,
                purpose: data.purpose,
                requires_tech: data.requires_tech
            };
            const overlapping = yield (0, ReservationQueries_1.isReservationOverlapping)({
                auditorium: reservation.auditorium_id,
                start: formattedDates.start,
                end: formattedDates.end
            });
            if (overlapping)
                return response.status(409).send({ message: `Reservation overlaps with an existing one.` });
            yield (0, ReservationQueries_1.createReservation)(reservation);
            transport_1.default.sendMail({
                to: user.email,
                from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                subject: "RESERVA EXITOSA",
                text: `Se ha registrado tu reserva "${reservation.title}" para el auditorio ${reservation.auditorium_id}.\nTu reserva ahora está en estado ${reservation.state.toUpperCase()}`
            }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.email}: ${e.message}`));
            response.status(200).send({ message: `Reservation created.`, reservation: Object.assign(Object.assign({}, reservation), { start_at: (0, DateFormat_1.formatToLocale)(formattedDates.start), end_at: (0, DateFormat_1.formatToLocale)(formattedDates.end) }) });
        }
        catch (err) {
            console.log(err);
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener todas las reservas existentes
function getReservations(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const reservations = yield (0, ReservationQueries_1.fetchReservations)();
            response.status(200).send({ message: `Reservations fetched.`, reservations });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener una unica reserva
function getReservation(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reservationId } = request.params;
            const { include_requester, include_auditorium } = request.query;
            const reservation = yield (0, ReservationQueries_1.fetchReservation)(reservationId, {
                includeRequester: (include_requester === "true" && true),
                includeAuditorium: (include_auditorium === "true" && true)
            });
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            response.status(200).send({ message: `Reservation fetched.`, reservation });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener recibo de pago de una reserva
function getReservationReceipt(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reservationId } = request.params;
            if (!reservationId)
                return response.status(400).send({ message: `Reservation ID not provided.` });
            const reservation = yield (0, ReservationQueries_1.fetchReservation)(reservationId, { includeRequester: true, includeAuditorium: true });
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            const user = reservation.requester;
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            if (constants_1.EXCLUDED_EMAILS_FROM_RECEIPTS.some(e => user.credentials.email.endsWith(e)))
                return response.status(422).send({ message: `User's email is excluded from receipts.` });
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
//Actualizar una reserva
function putReservation(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reservationId } = request.params;
            const data = request.body;
            const user = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const reservation = yield (0, ReservationQueries_1.updateReservation)(reservationId, data);
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            if (typeof reservation === "string")
                return response.status(400).send({ message: `Cannot update reservation due to: ${reservation}` });
            //Advertir al usuario que se modifico su solicitud - Solamente el estado
            if (data.state) {
                transport_1.default.sendMail({
                    to: user.email,
                    from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                    subject: "ESTADO DE RESERVA ACTUALIZADO",
                    text: `El estado de tu reserva ${reservationId} ha cambiado a ${data.state.toUpperCase()}`
                }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.email}: ${e.message}`));
            }
            response.status(200).send({ message: `Reservation updated.`, reservation });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Eliminar una reserva
function removeReservation(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { reservationId } = request.params;
            const user = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const reservation = yield (0, ReservationQueries_1.deleteReservation)(reservationId);
            if (!reservation)
                return response.status(404).send({ message: `Reservation not found.` });
            response.status(200).send({ message: `Reservation deleted.`, reservation });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
