"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_1 = require("../middleware/session");
const auditorium_controller_1 = require("../controllers/auditorium.controller");
const router = (0, express_1.Router)();
//Asignar funciones a cada ruta - Separar por metodo
router.get("/", session_1.validateSession, auditorium_controller_1.getAuditoriums);
router.get("/:auditoriumId", session_1.validateSession, auditorium_controller_1.getAuditorium);
router.put("/:auditoriumId", session_1.validateSession, session_1.validateAccountActivation, auditorium_controller_1.putAuditorium);
router.post("/create", session_1.validateSession, session_1.validateAccountActivation, auditorium_controller_1.registerAuditorium);
router.delete("/:auditoriumId", session_1.validateSession, session_1.validateAccountActivation, auditorium_controller_1.removeAuditorium);
exports.default = router;
