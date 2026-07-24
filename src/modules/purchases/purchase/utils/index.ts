import { purchase_status } from "@/types/types";

export const translatePurchaseStatus = (purchaseStatus: purchase_status): string => {
    let translate = "";
    switch (purchaseStatus) {
        case purchase_status.confirmed:
            translate = "Confirmado"
            break;
        case purchase_status.pending:
            translate = "Pendiente"
            break;
        case purchase_status.cancelled:
            translate = "Cancelado"
            break;
        default:
            break;
    }
    return translate;
}