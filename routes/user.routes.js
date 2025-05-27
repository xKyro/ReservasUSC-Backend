"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const session_1 = require("../middleware/session");
const user_controller_1 = require("../controllers/user.controller");
const router = (0, express_1.Router)();
//Asignar funciones a cada ruta - Separar por metodo
router.get("/", session_1.validateSession, session_1.validateAccountActivation, user_controller_1.getUsers);
router.get("/:userId", session_1.validateSession, session_1.validateAccountActivation, user_controller_1.getUser);
router.delete("/:userId", session_1.validateSession, session_1.validateAccountActivation, user_controller_1.removeUser);
// router.put("/", validateSession, )
exports.default = router;
