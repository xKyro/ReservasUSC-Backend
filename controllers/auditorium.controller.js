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
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerAuditorium = registerAuditorium;
exports.getAuditoriums = getAuditoriums;
exports.getAuditorium = getAuditorium;
exports.putAuditorium = putAuditorium;
exports.removeAuditorium = removeAuditorium;
const AccessResolver_1 = require("../tools/AccessResolver");
const AuditoriumQueries_1 = require("../sql/miscellaneous/AuditoriumQueries");
const ValidateRequest_1 = require("../tools/ValidateRequest");
//Registrar un auditorio
function registerAuditorium(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const data = request.body;
            const user = request.user;
            const [validRequest, missingParameters] = (0, ValidateRequest_1.validateBody)({ type: "AUDITORIUM", data });
            if (!validRequest)
                return response.status(400).send({ message: `Missing parameters. These parameters are required: ${missingParameters.join(", ")}` });
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const auditorium = {
                id: data.id,
                capacity: data.capacity,
                location: data.location,
                name: data.name,
                price: data.price,
                facilities: data.facilities,
                description: data.description
            };
            yield (0, AuditoriumQueries_1.createAuditorium)(auditorium);
            response.status(200).send({ message: `Auditorium created.`, auditorium });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener todos los auditorios existentes
function getAuditoriums(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const auditoriums = yield (0, AuditoriumQueries_1.fetchAuditoriums)();
            response.status(200).send({ message: `Auditoriums fetched.`, auditoriums });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Obtener un unico auditorio
function getAuditorium(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { auditoriumId } = request.params;
            const auditorium = yield (0, AuditoriumQueries_1.fetchAuditorium)(auditoriumId);
            if (!auditorium)
                return response.status(404).send({ message: `Auditorium not found.` });
            response.status(200).send({ message: `Auditorium fetched.`, auditorium });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Actualizar un auditorio
function putAuditorium(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { auditoriumId } = request.params;
            const data = request.body;
            const user = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const auditorium = yield (0, AuditoriumQueries_1.updateAuditorium)(auditoriumId, data);
            if (!auditorium)
                return response.status(404).send({ message: `Auditorium not found.` });
            response.status(200).send({ message: `Auditorium updated.`, auditorium });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
//Eliminar un auditorio
function removeAuditorium(request, response) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { auditoriumId } = request.params;
            const user = request.user;
            const hasAccess = (0, AccessResolver_1.hasAdminPrivileges)(user, true);
            if (!hasAccess)
                return response.status(401).send({ message: `Access denied. Requires Admin privileges` });
            const auditorium = yield (0, AuditoriumQueries_1.deleteAuditorium)(auditoriumId);
            if (!auditorium)
                return response.status(404).send({ message: `Auditorium not found.` });
            response.status(200).send({ message: `Auditorium deleted.`, auditorium });
        }
        catch (err) {
            response.status(500).send({ message: err.message });
        }
    });
}
