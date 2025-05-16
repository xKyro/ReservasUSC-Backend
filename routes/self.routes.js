"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_1 = require("../middleware/session");
const self_controller_1 = require("../controllers/self.controller");
const router = (0, express_1.Router)();
//Asignar funciones a cada ruta - Separar por metodo
router.get("/", session_1.validateSession, self_controller_1.getSelf);
router.get("/reservations", session_1.validateSession, self_controller_1.getSelfReservations);
router.get("/reservations/:reservationId", session_1.validateSession, self_controller_1.getSelfReservation);
router.get("/reservations/:reservationId/receipt", session_1.validateSession, self_controller_1.getSelfReservationReceipt);
router.put("/", session_1.validateSession, self_controller_1.putSelf);
router.put("/change-password", session_1.validateSession, self_controller_1.putSelfPassword);
router.delete("/", session_1.validateSession, self_controller_1.removeSelf);
// router.put("/", validateSession, )
exports.default = router;
