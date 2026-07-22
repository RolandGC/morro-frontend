import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import InputText from "@/components/InputText";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import SimpleSelector from "@/components/SimpleSelector";
import { Company } from "@/modules/core/companies/types/company.type";
import { companyService } from "@/modules/core/companies/services/company.service";
import { confirmAction } from "@/lib/swal";
import Swal from "sweetalert2";
import { usePurchaseStore } from "../store/purchase.store";
import { PurchaseForm, purchaseSchema } from "../validators/purchaseSchema";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import { Supplier } from "../../suppliers/types/suppliers.types";
import { supplierService } from "../../suppliers/services/supplier.service";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { purchaseService } from "../services/purchase.service";
import { Product, ProductUnit } from "@/modules/inventory/products/types/produc.type";
import { productService } from "@/modules/inventory/products/services/product.service";
import { productUnitService } from "@/modules/inventory/products/services/producUnit.service";

interface PurchaseFormProps {
    onSuccess?: () => void;
    fetchData: () => void,
}
export default function PurchaseFormModal({ onSuccess, fetchData }: PurchaseFormProps) {
    const { isEditing, purchase, open, close, purchase_id } = usePurchaseStore();
    const [isSearch, setIsSearch] = useState(false)
    const defaultValues = purchase;
    const { notify: showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouse, setWarehouse] = useState<Warehouse[]>([])
    const [supplier, setSupplier] = useState<Supplier[]>([])
    const [currency, setCurrency] = useState<Currency[]>([])
    const [products, setProducts] = useState<Product[]>([]);
    const [productUnits, setProductUnits] = useState<ProductUnit[]>([]);

    const {
        control,
        register,
        handleSubmit,
        reset: resetForm,
        setValue,
        formState: { errors, isSubmitting },
    } = useForm<PurchaseForm>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            ...purchase,
            items: purchase.items ?? [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "items",
    });

    /* "company_id": "uuid-company",
  "warehouse_id": "uuid-warehouse",
  "supplier_id": "uuid-supplier",
  "currency_id": "uuid-currency", */
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companiesResponse, warehouseResponse] = await Promise.all([
                    companyService.getAllCompanies({ is_active: true }),
                    warehouseService.getAll({ is_active: true }),
                ]);

                if (companiesResponse.status === 200) {
                    setCompanies(companiesResponse.data.data);
                }

                if (warehouseResponse.status === 200) {
                    setWarehouse(warehouseResponse.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [setCompanies, setWarehouse]);

    const fetchCuurencySupplier = async () => {
        try {
            const [supplierResponse, currencyResponse] = await Promise.all([
                supplierService.getAll({ is_active: true }),
                currencyService.getAll({ is_active: true }),
            ]);

            if (supplierResponse.status === 200) {
                setSupplier(supplierResponse.data.data);
            } else {
                console.error("Error fetching suppliers:", supplierResponse.statusText);
            }

            if (currencyResponse.status === 200) {
                setCurrency(currencyResponse.data.data);
            } else {
                console.error("Error fetching currencies:", currencyResponse.statusText);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };

    useEffect(() => {
        fetchCuurencySupplier();
    }, []);

    const fetchProducts = async () => {
        const response = await productService.getAll({is_active: true});
        if (response.status === 200) {
            setProducts(response.data.data)
        } else {
            console.error("Error fetching products:", response.statusText);
        }
    }
    
    useEffect(() => {
        try {
            fetchProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);

    const loadProductUnits = async (
        productId: string,
        index: number
    ) => {
        try {
            const response = await productUnitService.getAll(productId);
    
            if (response.status === 200) {
    
                const units: ProductUnit[] = response.data;
    
                setProductUnits((prev) => ({
                    ...prev,
                    [index]: units,
                }));
    
                // Seleccionar automáticamente si solo existe una unidad
                if (units.length === 1) {
                    setValue(
                        `items.${index}.product_unit_id`,
                        units[0].id
                    );
                }
            }
    
        } catch (error) {
            console.error("Error cargando unidades:", error);
        }
    };

    useEffect(() => {
        if (isEditing && purchase) {
            resetForm({
                //name: purchase.name ?? "",
                company_id: purchase.company_id ?? "",
                //email: purchase.email ?? "",
                exchange_rate: purchase.exchange_rate ?? "",
                supplier_id: purchase.supplier_id ?? "",
            });
        } else {
            resetForm(defaultValues);
        }
    }, [supplier, isEditing, resetForm]);

    const onSubmit = async (purchase: PurchaseForm) => {
        try {
            let response;
            if (isEditing && purchase_id) {
                response = await purchaseService.update(purchase_id, purchase);
            } else {
                response = await purchaseService.create(purchase);
            }
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Compra actualizado correctamente" : "Compra creado correctamente",
                    "success"
                );
                resetForm();
                await fetchData();
                close();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar la compra", "error")
            console.error(error)
        }
    };

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle className="font-bold text-2xl">{isEditing ? "Editar proveedor" : "Crear proveedor"}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-4 w-full">
                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 w-full">
                       
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputText
                                name="reference_doc"
                                label="Documento de referencia"
                                register={register}
                                error={errors.reference_doc}
                            />
                            <InputText
                                name="exchange_rate"
                                label="Tipo de cambio"
                                register={register}
                                error={errors.exchange_rate}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="company_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Empresa"
                                        value={field.value}
                                        options={companies.map((company) => ({
                                            id: company.id,
                                            name: company.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.company_id}
                                    />
                                )}
                            />
                            <Controller
                                name="warehouse_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Almacén"
                                        value={field.value}
                                        options={warehouse.map((warehouse) => ({
                                            id: warehouse.id,
                                            name: warehouse.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.warehouse_id}
                                    />
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="supplier_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Proveedor"
                                        value={field.value}
                                        options={supplier.map((supplier) => ({
                                            id: supplier.id,
                                            name: supplier.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.supplier_id}
                                    />
                                )}
                            />
                            <Controller
                                name="currency_id"
                                control={control}
                                render={({ field }) => (
                                    <SimpleSelector
                                        label="Moneda"
                                        value={field.value}
                                        options={currency.map((currency) => ({
                                            id: currency.id,
                                            name: currency.name,
                                        }))}
                                        onSelect={field.onChange}
                                        error={errors.currency_id}
                                    />
                                )}
                            />
                        </div>

                        <div className="space-y-4 border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">
                                    Detalle de la compra
                                </h3>

                                <Button
                                    type="button"
                                    onClick={() =>
                                        append({
                                            product_id: "",
                                            product_unit_id: "",
                                            quantity: 1,
                                            unit_quantity: 1,
                                            unit_cost: 0,
                                            total_cost: 0,
                                            lot_number: "",
                                            expiry_date: "",
                                        })
                                    }
                                >
                                    + Agregar producto
                                </Button>
                            </div>

                            {fields.length === 0 && (
                                <div className="text-center py-8 text-gray-500 border rounded-md">
                                    No hay productos agregados.
                                </div>
                            )}

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="border rounded-lg p-4 bg-gray-50 space-y-4"
                                    >
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <Controller
                                                control={control}
                                                name={`items.${index}.product_id`}
                                                render={({ field }) => (
                                                    <SimpleSelector
                                                        label="Producto"
                                                        value={field.value}
                                                        options={products.map((product) => ({
                                                            id: product.id,
                                                            name: product.name,
                                                        }))}
                                                        onSelect={field.onChange}
                                                    />
                                                )}
                                            />

                                            <Controller
                                                control={control}
                                                name={`items.${index}.product_unit_id`}
                                                render={({ field }) => (
                                                    <SimpleSelector
                                                        label="Unidad"
                                                        value={field.value}
                                                        options={productUnits.map((unit) => ({
                                                            id: unit.id,
                                                            name: unit.name,
                                                        }))}
                                                        onSelect={field.onChange}
                                                    />
                                                )}
                                            />

                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

                                            <InputText
                                                label="Cantidad"
                                                name={`items.${index}.quantity`}
                                                register={register}
                                            />

                                            <InputText
                                                label="Cant. Unidad"
                                                name={`items.${index}.unit_quantity`}
                                                register={register}
                                            />

                                            <InputText
                                                label="Costo Unit."
                                                name={`items.${index}.unit_cost`}
                                                register={register}
                                            />

                                            <InputText
                                                label="Costo Total"
                                                name={`items.${index}.total_cost`}
                                                register={register}
                                            />

                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                            <InputText
                                                label="Lote"
                                                name={`items.${index}.lot_number`}
                                                register={register}
                                            />

                                            <InputText
                                                type="date"
                                                label="Fecha de vencimiento"
                                                name={`items.${index}.expiry_date`}
                                                register={register}
                                            />

                                        </div>

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => remove(index)}
                                            >
                                                Eliminar
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? "Guardando..."
                                : isEditing
                                    ? "Actualizar compra"
                                    : "Guardar compra"}
                        </Button>
                    </form>

                </div>

            </DialogContent>
        </Dialog>
    );
}