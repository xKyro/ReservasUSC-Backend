"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_ACTIVATION_URL = exports.EXCLUDED_EMAILS_FROM_RECEIPTS = exports.RESULTS_PER_PAGE = exports.TFA_EXPIRATION_TIME = exports.TOKEN_EXPIRATION_TIME = exports.ACCOUNT_NOT_ACTIVATED_MESSAGE = void 0;
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.ACCOUNT_NOT_ACTIVATED_MESSAGE = "User's account is not activated. Check email for further information.";
exports.TOKEN_EXPIRATION_TIME = 30 * 24 * 60 * 60 * 1000;
exports.TFA_EXPIRATION_TIME = 5; //Minutos
exports.RESULTS_PER_PAGE = 30;
exports.EXCLUDED_EMAILS_FROM_RECEIPTS = ["@usc.edu.co"];
const GET_ACTIVATION_URL = (token) => `${process.env.API_URL}/api/v1/auth/activate?token=${token}`;
exports.GET_ACTIVATION_URL = GET_ACTIVATION_URL;
