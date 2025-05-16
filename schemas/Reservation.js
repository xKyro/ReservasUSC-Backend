"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReservationState = void 0;
var ReservationState;
(function (ReservationState) {
    ReservationState["PENDING"] = "pending";
    ReservationState["APPROVED"] = "approved";
    ReservationState["REJECTED"] = "rejected";
    ReservationState["CHECKED"] = "checked"; //Para los pagos de reservas externas
})(ReservationState || (exports.ReservationState = ReservationState = {}));
