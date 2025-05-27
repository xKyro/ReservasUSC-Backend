"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("../controllers/auth.controller");
const router = (0, express_1.Router)();
//Asignar funciones a cada ruta - Separar por metodo
router.get("/activate", auth_controller_1.activateUser);
router.post("/register", auth_controller_1.registerUser);
router.post("/login", auth_controller_1.loginUser);
router.post("/validate-tfa", auth_controller_1.validateTFA);
exports.default = router;
