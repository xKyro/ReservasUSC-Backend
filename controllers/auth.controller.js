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
exports.registerUser = registerUser;
exports.loginUser = loginUser;
exports.activateUser = activateUser;
exports.validateTFA = validateTFA;
const session_1 = require("../middleware/session");
const User_1 = require("../schemas/User");
const bcrypt_1 = require("bcrypt");
const UserQueries_1 = require("../sql/miscellaneous/UserQueries");
const jsonwebtoken_1 = require("jsonwebtoken");
const transport_1 = __importDefault(require("../mail/transport"));
const dotenv_1 = require("dotenv");
const SelfQueries_1 = require("../sql/miscellaneous/SelfQueries");
const ValidateRequest_1 = require("../tools/ValidateRequest");
const SignID_1 = require("../tools/SignID");
(0, dotenv_1.config)();
//Registrar un usuario en el sistema
function registerUser(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = request.body;
            const [validRequest, missingParameters] = (0, ValidateRequest_1.validateBody)({ type: "USER", data });
            if (!validRequest)
                return response.status(400).send({ message: `Missing parameters. These parameters are required: ${missingParameters.join(", ")}` });
            //Implementar verificacion de correo existente
            const emailTaken = yield (0, UserQueries_1.isEmailAlreadyUsed)(data.email);
            if (emailTaken)
                return response.status(409).send({ message: "This email is already used." });
            const hashedPassword = yield (0, bcrypt_1.hash)(data.password, 10);
            const user = {
                account: { created_at: new Date(), last_login: new Date(), tfa: true, active: true },
                credentials: { phone: data.phone, password: hashedPassword, email: data.email },
                first_name: data.first_name,
                last_name: data.last_name,
                id: (0, SignID_1.getSnowflake)(),
                role: User_1.UserRole.DEFAULT,
            };
            //Implementar registro de usuario en base de datos
            yield (0, UserQueries_1.createUser)(user);
            //Generar token de activacion
            const activationToken = (0, session_1.generateActivationToken)({ id: user.id });
            yield (0, UserQueries_1.setUserActivationToken)(user.id, activationToken);
            //Generar codigo TFA
            const code = yield (0, UserQueries_1.setUserTFA)(user.id);
            //Enviar el correo de confirmacion
            transport_1.default.sendMail({
                to: user.credentials.email,
                from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                subject: "REGISTRO EXITOSO",
                html: `<html>
                <body>
                    <div>
                        <p>Hola, ${user.first_name} ${user.last_name}</p>
                        <p>¡Ya casi estas listo! Solo introduce este codigo para verificar la autenticidad del correo.</p>
                        <h2 style="text-align: center; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: rgb(44, 53, 59) !important; padding: 10px; border-radius: 5px;"
                            data-ogsb="rgb(225, 236, 244)">${code}</h2>
                        <p>Este código es válido por <strong>5 minutos</strong>.</p>
                        <p>Si no crees haber registrado el correo. Puede que alguien mas lo esté utilizando.</p>
                    </div>
                </body>
            </html>`,
            }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.credentials.email}: ${e.message}`));
            response.status(202).send({ message: "User created. Check email for TFA code." });
        }
        catch (err) {
            response.status(500).send({ message: `User registration error. ${err.message}` });
        }
    });
}
//Ingreso de sesion del usuario
function loginUser(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, password } = request.body;
            const user = yield (0, UserQueries_1.fetchUserByEmail)(email);
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            const validPassword = yield (0, bcrypt_1.compare)(password, user.credentials.password);
            if (!validPassword)
                return response.status(401).send({ message: `User password mismatch.` });
            //Determinar si la cuenta tiene TFA
            if (user.account.tfa) {
                const code = yield (0, UserQueries_1.setUserTFA)(user.id);
                transport_1.default.sendMail({
                    to: user.credentials.email,
                    from: `"Sistema de Reservas USC" <${process.env.MAIL_USER}>`,
                    subject: "INICIO DE SESION",
                    html: `<html>
                    <body>
                        <div>
                            <p>Hola, ${user.first_name} ${user.last_name}</p>
                            <p>Recibimos una solicitud de intento de inicio de sesion. Por favor usa este codigo para confirmar que eres tu:</p>
                            <h2 style="text-align: center; background-image: initial; background-position: initial; background-size: initial; background-repeat: initial; background-attachment: initial; background-origin: initial; background-clip: initial; background-color: rgb(44, 53, 59) !important; padding: 10px; border-radius: 5px;"
                                data-ogsb="rgb(225, 236, 244)">${code}</h2>
                            <p>Este código es válido por <strong>5 minutos</strong>.</p>
                        </div>
                    </body>
                </html>`
                }).catch(e => console.log(`[MAIL] Failed to send mail to ${user.credentials.email}: ${e.message}`));
                response.status(202).send({ message: `User logged but requires TFA. Sent via email` });
            }
            else {
                //Generar token de sesion
                const token = (0, session_1.generateSessionToken)({
                    id: user.id
                });
                //Actualiza el tiempo de login
                yield (0, SelfQueries_1.updateSelfLoginTime)(user.id, new Date());
                response.status(200).send({ message: `User logged.`, token });
            }
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Activar cuenta de usuario
function activateUser(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { token } = request.query;
            if (!token)
                return response.status(400).send({ message: "Activation token was not provided." });
            const decodedToken = (0, jsonwebtoken_1.verify)(token, process.env.API_ACCOUNT_ACTIVATION_SECRET);
            if (!decodedToken || !decodedToken.id)
                return response.status(400).send({ message: "Malformed token provided." });
            const expectedToken = yield (0, UserQueries_1.fetchUserActivationToken)(decodedToken.id);
            if (!expectedToken)
                return response.status(400).send({ message: "User token not found." });
            if (token !== expectedToken)
                return response.status(403).send({ message: "Token mismatch." });
            yield (0, UserQueries_1.enableUser)(decodedToken.id);
            response.status(200).send({ message: `User account activated.` });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Validar codigo de TFA
function validateTFA(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { email, code } = request.body;
            if (!email || !code)
                return response.status(400).send({ message: `TFA code not provided.` });
            const user = yield (0, UserQueries_1.fetchUserByEmail)(email);
            if (!user)
                return response.status(404).send({ message: `User not found.` });
            const userTFA = yield (0, UserQueries_1.fetchUserTFA)(user.id);
            if (!userTFA)
                return response.status(404).send({ message: `User TFA not found.` });
            const tfaValid = yield (0, bcrypt_1.compare)(code, userTFA);
            if (!tfaValid)
                return response.status(401).send({ message: `TFA Code is not valid.` });
            yield (0, UserQueries_1.deleteUserTFA)(user.id);
            //Generar token de sesion
            const token = (0, session_1.generateSessionToken)({
                id: user.id
            });
            //Actualiza el tiempo de login
            yield (0, SelfQueries_1.updateSelfLoginTime)(user.id, new Date());
            response.status(200).send({ message: `User logged with TFA.`, token });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
