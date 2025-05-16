"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_1 = require("../middleware/session");
const reservations_controller_1 = require("../controllers/reservations.controller");
const router = (0, express_1.Router)();
//Asignar funciones a cada ruta - Separar por metodo
router.get("/", session_1.validateSession, reservations_controller_1.getReservations);
router.get("/:reservationId", session_1.validateSession, reservations_controller_1.getReservation);
router.get("/:reservationId/receipt", session_1.validateSession, reservations_controller_1.getReservationReceipt);
router.put("/:reservationId", session_1.validateSession, session_1.validateAccountActivation, reservations_controller_1.putReservation);
router.post("/create", session_1.validateSession, session_1.validateAccountActivation, reservations_controller_1.registerReservation);
router.delete("/:reservationId", session_1.validateSession, session_1.validateAccountActivation, reservations_controller_1.removeReservation);
exports.default = router;
