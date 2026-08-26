import { series_type } from "@/types/types";

export const translateSerieType = (serieType: series_type): string => {
    let translate = "";
    switch (serieType) {
        case series_type.general:
            translate = "Rég. General"
            break;
        case series_type.zofra:
            translate = "Zofra"
            break;
        case series_type.order_note:
            translate = "Nota pedido"
            break;
        default:
            break;
    }
    return translate;
}