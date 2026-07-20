import { create } from "zustand";
import { ProductUnit } from "../types/produc.type";
import { ProductUnitForm } from "../validators/productUnitSchema";

const initialState: ProductUnitForm = {
    name: "",
    conversion_factor: 1,
    barcode: "",
    is_default: false,
};


type ProductUnitMode = "list" | "create" | "edit";


interface ProductUnitStore {

    open: boolean;

    mode: ProductUnitMode;

    productUnit: ProductUnitForm;

    product_unit_id: string | null;

    product_id: string | null;

    productUnits: ProductUnit[];

    backToList: () => void;


    openList: (product_id: string) => void;

    openCreate: () => void;

    openEdit: (
        productUnit: ProductUnitForm,
        product_unit_id: string
    ) => void;


    close: () => void;


    setProductUnits: (
        productUnits: ProductUnit[]
    ) => void;


    updateField: <K extends keyof ProductUnitForm>(
        field: K,
        value: ProductUnitForm[K]
    ) => void;


    reset: () => void;

}


export const useProductUnitStore = create<ProductUnitStore>((set) => ({

    open: false,

    mode: "list",

    productUnit: initialState,

    product_unit_id: null,

    product_id: null,

    productUnits: [],



    openList: (product_id) =>
        set({
            open: true,
            mode: "list",
            product_id,
            product_unit_id: null,
        }),



    openCreate: () =>
        set({
            mode: "create",
            productUnit: initialState,
            product_unit_id: null,
        }),

    backToList: () =>
        set({
            mode: "list",
            productUnit: initialState,
            product_unit_id: null,
        }),

    openEdit: (productUnit, product_unit_id) =>
        set({
            mode: "edit",
            productUnit,
            product_unit_id,
        }),



    close: () =>
        set({
            open: false,
        }),



    setProductUnits: (productUnits) =>
        set({
            productUnits
        }),



    updateField: (field, value) =>
        set((state) => ({
            productUnit: {
                ...state.productUnit,
                [field]: value
            }
        })),



    reset: () =>
        set({
            open: false,
            mode: "list",
            product_id: null,
            product_unit_id: null,
            productUnit: initialState,
            productUnits: []
        })

}));