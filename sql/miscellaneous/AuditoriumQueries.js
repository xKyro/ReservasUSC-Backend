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
exports.createAuditorium = createAuditorium;
exports.fetchAuditoriums = fetchAuditoriums;
exports.fetchAuditorium = fetchAuditorium;
exports.updateAuditorium = updateAuditorium;
exports.deleteAuditorium = deleteAuditorium;
const Database_1 = __importDefault(require("../../schemas/Database"));
function createAuditorium(auditorium) {
    return __awaiter(this, void 0, void 0, function* () {
        yield Database_1.default.query(`insert into public.auditoriums (auditorium_id, name, description, capacity, location, price, facilities)
        values ($1, $2, $3, $4, $5, $6, $7)`, [auditorium.id, auditorium.name, auditorium.description, auditorium.capacity, auditorium.location, auditorium.price, auditorium.facilities]);
    });
}
function fetchAuditoriums() {
    return __awaiter(this, void 0, void 0, function* () {
        const auditoriumCollection = {};
        const pgResult = yield Database_1.default.query(`select * from public.auditoriums;`);
        for (const auditoriumDTO of pgResult.rows) {
            const auditorium = {
                id: auditoriumDTO.auditorium_id,
                capacity: auditoriumDTO.capacity,
                location: auditoriumDTO.location,
                name: auditoriumDTO.name,
                price: auditoriumDTO.price,
                facilities: auditoriumDTO.facilities || [],
                description: auditoriumDTO.description || "No description"
            };
            auditoriumCollection[auditorium.id] = auditorium;
        }
        return auditoriumCollection;
    });
}
function fetchAuditorium(auditoriumId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`select * from public.auditoriums where auditorium_id = $1`, [auditoriumId]);
        if (pgResult.rows.length === 0)
            return null;
        const auditoriumDTO = pgResult.rows[0];
        const auditorium = {
            id: auditoriumDTO.auditorium_id,
            capacity: auditoriumDTO.capacity,
            location: auditoriumDTO.location,
            name: auditoriumDTO.name,
            price: auditoriumDTO.price,
            facilities: auditoriumDTO.facilities || [],
            description: auditoriumDTO.description || "No description"
        };
        return auditorium;
    });
}
function updateAuditorium(auditoriumId, options) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = Object.entries(options);
        const pgSetClause = data.map((v, i) => `${v[0]} = $${i + 1}`).join(", ");
        const pgResult = yield Database_1.default.query(`update public.auditoriums set ${pgSetClause} where auditorium_id = $${data.length + 1} returning *;`, [...data.map(v => v[1]), auditoriumId]);
        if (pgResult.rows.length === 0)
            return null;
        const auditoriumDTO = pgResult.rows[0];
        const auditorium = {
            id: auditoriumDTO.auditorium_id,
            name: auditoriumDTO.name,
            capacity: auditoriumDTO.capacity,
            location: auditoriumDTO.location,
            price: auditoriumDTO.price,
            facilities: auditoriumDTO.facilities,
            description: auditoriumDTO.description || "No description"
        };
        return auditorium;
    });
}
function deleteAuditorium(auditoriumId) {
    return __awaiter(this, void 0, void 0, function* () {
        const pgResult = yield Database_1.default.query(`delete from public.auditoriums where auditorium_id = $1 returning *;`, [auditoriumId]);
        if (pgResult.rows.length === 0)
            return null;
        const auditoriumDTO = pgResult.rows[0];
        const auditorium = {
            id: auditoriumDTO.auditorium_id,
            capacity: auditoriumDTO.capacity,
            location: auditoriumDTO.location,
            name: auditoriumDTO.name,
            price: auditoriumDTO.price,
            facilities: auditoriumDTO.facilities,
            description: auditoriumDTO.description || "No description"
        };
        return auditorium;
    });
}
