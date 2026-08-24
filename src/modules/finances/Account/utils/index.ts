import { payment_account_type } from "@/types/types";

export function translateAccountType(saleStatus: payment_account_type) {
    let translate = '';
    switch (saleStatus) {
        case payment_account_type.cash:
            translate = "Efectivo"
            break;
        case payment_account_type.credit_card:
            translate = "Tarjeta crédito"
            break;
        case payment_account_type.debit_card:
            translate = "Tarjeta débito"
            break;
        case payment_account_type.transfer:
            translate = "Transferencia"
            break;
        case payment_account_type.plin:
            translate = "Plin"
            break;
        case payment_account_type.yape:
            translate = "Yape"
            break;
        default:
            break;
    }
    return translate;
}