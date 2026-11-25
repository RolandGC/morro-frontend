import { series_type } from "@/types/types";

export const translateSerieType = (serieType: series_type): string => {
    let translate = "";
    switch (serieType) {
        case series_type.general:
            translate = "Rég. General (legado)"
            break;
        case series_type.zofra:
            translate = "Zofra (legado)"
            break;
        case series_type.order_note:
            translate = "Nota pedido"
            break;
        case series_type.boleta_general:
            translate = "Boleta general"
            break;
        case series_type.boleta_zofra:
            translate = "Boleta ZOFRA"
            break;
        case series_type.factura_general:
            translate = "Factura general"
            break;
        case series_type.factura_zofra:
            translate = "Factura ZOFRA"
            break;
        default:
            break;
    }
    return translate;
}