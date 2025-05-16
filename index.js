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
const express_1 = __importDefault(require("express"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)(); //Lee los datos del archivo .env (Variables de entorno)
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const reservation_routes_1 = __importDefault(require("./routes/reservation.routes"));
const self_routes_1 = __importDefault(require("./routes/self.routes"));
const auditorium_routes_1 = __importDefault(require("./routes/auditorium.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const CleanUpTFA_1 = __importDefault(require("./sql/auto/CleanUpTFA"));
(() => __awaiter(void 0, void 0, void 0, function* () {
    const app = (0, express_1.default)();
    const apiLimiter = (0, express_rate_limit_1.default)({
        windowMs: 2 * 60 * 1000,
        limit: 100,
        standardHeaders: true,
        legacyHeaders: false
    });
    //Inicializar tareas automaticas
    (0, CleanUpTFA_1.default)();
    //Aplicar un rate limit (100 request por cada 2 minutos)
    app.use(apiLimiter);
    //Aplicar JSON y utilidades
    app.use((0, cors_1.default)());
    app.use(express_1.default.json());
    app.use((0, morgan_1.default)("dev"));
    //Usar las rutas especificadas
    app.use("/api/v1/auditoriums", auditorium_routes_1.default);
    app.use("/api/v1/reservations", reservation_routes_1.default);
    app.use("/api/v1/users", user_routes_1.default);
    app.use("/api/v1/auth", auth_routes_1.default);
    app.use("/api/v1/@me", self_routes_1.default);
    //Iniciar la API
    app.listen(process.env.API_PORT, (error) => {
        console.log("\x1b[2J\x1b[H");
        if (error)
            return console.log(`[API CRASH] ${error.message}`);
        console.log(`[API READY] La API esta escuchando en el puerto ${process.env.API_PORT}`);
    });
}))();
