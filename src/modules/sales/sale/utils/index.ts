import { sale_status } from "@/types/types";

export function translateSaleStatus(saleStatus: sale_status) {
    let translate = '';
    switch (saleStatus) {
        case sale_status.delivered:
            translate = "Enviado"
            break;
        case sale_status.cancelled:
            translate = "Cancelado"
            break;
        case sale_status.pending:
            translate = "Pendiente"
            break;
        case sale_status.paid:
            translate = "Pagado"
            break;
        default:
            break;
    }
    return translate;
}