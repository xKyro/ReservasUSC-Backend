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
exports.generateReceipt = generateReceipt;
const pdfkit_1 = __importDefault(require("pdfkit"));
function generateReceipt(reservation) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const buffers = [];
            const pdf = new pdfkit_1.default();
            pdf.on("data", (chunk) => buffers.push(chunk));
            pdf.on("end", () => resolve(Buffer.concat(buffers)));
            pdf.on("error", reject);
            const requester = reservation.requester;
            const auditorium = reservation.auditorium;
            pdf.fontSize(20).text('Comprobante de Reservación', { align: 'center' });
            pdf.moveDown();
            pdf.fontSize(12);
            pdf.text(`ID de Reservación: ${reservation.id}`);
            pdf.text(`Estado: ${reservation.state.toUpperCase()}`);
            pdf.text(`Solicitado por: ${requester.first_name} ${requester.last_name} (${requester.credentials.email})`);
            pdf.moveDown();
            pdf.text(`Inicio: ${new Date(reservation.start_at).toLocaleString()}`);
            pdf.text(`Fin: ${new Date(reservation.end_at).toLocaleString()}`);
            pdf.moveDown();
            if (auditorium) {
                pdf.text(`Auditorio: ${auditorium.name}`);
                pdf.text(`Ubicación: ${auditorium.location}`);
                pdf.text(`Capacidad: ${auditorium.capacity}`);
            }
            else {
                pdf.text('Auditorio: N/A');
            }
            pdf.moveDown();
            pdf.font('Helvetica-Bold').text('Motivo de la Reservación:');
            pdf.font('Helvetica').text(reservation.reason || 'Sin motivo especificado.');
            pdf.moveDown();
            pdf.font('Helvetica-Bold').text('Costo de la Reservación:');
            pdf.font('Helvetica').text(`$${auditorium.price.toLocaleString("es-ES")}`);
            pdf.end();
        });
    });
}
