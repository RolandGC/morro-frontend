"use client"
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
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { Product, ProductUnit } from "@/modules/inventory/products/types/produc.type";
import { productService } from "@/modules/inventory/products/services/product.service";
import { productUnitService } from "@/modules/inventory/products/services/producUnit.service";
import { usePurchaseStore } from "@/modules/purchases/purchase/store/purchase.store";
import { Supplier } from "@/modules/purchases/suppliers/types/suppliers.types";
import { PurchaseForm, purchaseSchema } from "@/modules/purchases/purchase/validators/purchaseSchema";
import { supplierService } from "@/modules/purchases/suppliers/services/supplier.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PurchaseItem } from "@/modules/purchases/purchase/types/purchase.types";
import { purchaseService } from "@/modules/purchases/purchase/services/purchase.service";
import { useRouter } from "next/navigation";

interface PurchaseFormProps {
    onSuccess?: () => void;
}
export default function PurchaseAddPage({ onSuccess }: PurchaseFormProps) {
    const { isEditing, purchase, open, close, purchase_id } = usePurchaseStore();
    const [isSearch, setIsSearch] = useState(false)
    const { notify: showToast } = useToast();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouse, setWarehouse] = useState<Warehouse[]>([])
    const [supplier, setSupplier] = useState<Supplier[]>([])
    const [currency, setCurrency] = useState<Currency[]>([])
    const [products, setProducts] = useState<Product[]>([]);
    const [productUnits, setProductUnits] = useState<Record<number, ProductUnit[]>>({});
    const [openProduct, setOpenProduct] = useState(false);
    const router = useRouter();
    const defaultValues: PurchaseForm = {
        company_id: "",
        warehouse_id: "",
        supplier_id: "",
        currency_id: "",
        exchange_rate: 1,
        reference_doc: "",
        items: [],
        purchase_date: new Date().toISOString().split("T")[0],
    };

    const {
        control,
        register,
        handleSubmit,
        reset: resetForm,
        setValue,
        getValues,
        watch,
        formState: { errors, isSubmitting },
    } = useForm<PurchaseForm>({
        resolver: zodResolver(purchaseSchema),
        defaultValues: {
            ...defaultValues,
            ...purchase,
            items: purchase?.items ?? [],
        },
    });

    const { fields, append, remove, update } = useFieldArray({
        control,
        name: "items",
    });
    const items = watch("items");

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
        const response = await productService.getAll({ is_active: true });
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
                ...defaultValues,
                ...purchase,
                items: purchase?.items ?? [],
            });
        } else {
            resetForm(defaultValues);
        }
    }, [purchase, isEditing, resetForm]);

    const onSubmit = async (data: PurchaseForm) => {
        console.log(JSON.stringify(data, null, 2));
        console.log("FORMULARIO COMPLETO:", data);
        try {
    
            if (!data.items || data.items.length === 0) {
                showToast("Debe agregar al menos un producto", "error");
                return;
            }
    
            const invalidItem = data.items.some(
                item =>
                    !item.product_id ||
                    !item.product_unit_id ||
                    item.quantity <= 0 ||
                    item.unit_cost <= 0
            );
    
            if (invalidItem) {
                showToast("Complete correctamente los datos de los productos", "error");
                return;
            }
    
            console.log("DATOS A ENVIAR:", data);
    
            let response;
    
            if (isEditing && purchase_id) {
                response = await purchaseService.update(
                    purchase_id ?? '',
                    data
                );
            } else {
                response = await purchaseService.create(data);
            }
    
            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing
                        ? "Compra actualizada correctamente"
                        : "Compra creada correctamente",
                    "success"
                );
    
                resetForm(defaultValues);
                router.push("/purchases/purchase")
            }
    
        } catch (error) {
            showToast(
                "Error al guardar la compra",
                "error"
            );
    
            console.error(error);
        }
    };

    const [editingIndex, setEditingIndex] = useState<number | null>(null);

    const handleAddProduct = () => {
        const newIndex = fields.length;
    
        append({
            product_id: "",
            product_unit_id: "",
            quantity: 1,
            unit_quantity: 1,
            unit_cost: 0,
            total_cost: 0,
            lot_number: "",
            expiry_date: "",
        });
    
        setEditingIndex(newIndex);
        setOpenProduct(true);
    };

    const saveProduct = () => {
        setOpenProduct(false);
        setEditingIndex(null);
    };

    const handleEdit = async (index: number) => {
        setEditingIndex(index);

        const productId = getValues(`items.${index}.product_id`);

        if (productId) {
            await loadProductUnits(productId, index);
        }

        setOpenProduct(true);
    };
    return (
        <div className="container mx-auto py-4 px-4">
            <form onSubmit={handleSubmit(onSubmit, (errors) => {
        console.log("ERRORES DEL FORMULARIO:", errors);
    })} className="flex flex-col gap-4 w-full">

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
                <Button
                    type="button"
                    onClick={handleAddProduct}
                >
                    + Agregar producto
                </Button>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Costo</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {fields.map((field, index) => {
                                const item = items?.[index];
                                const product = products.find(
                                    p => p.id === item?.product_id
                                );
                                return (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            {product?.name ?? "-"}
                                        </TableCell>
                                        <TableCell>
                                            {item?.quantity}
                                        </TableCell>
                                        <TableCell>
                                            {item?.unit_cost}
                                        </TableCell>
                                        <TableCell>
                                            {item?.total_cost}
                                        </TableCell>
                                        <TableCell className="flex gap-2">
                                            <Button
                                                type="button"
                                                onClick={() => handleEdit(index)}
                                            >
                                                Editar
                                            </Button>

                                            <Button
                                                type="button"
                                                variant="destructive"
                                                onClick={() => remove(index)}
                                            >
                                                Eliminar
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <Dialog open={openProduct} onOpenChange={setOpenProduct}>
                    <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Detalle Producto</DialogTitle>
                        </DialogHeader>

                        {editingIndex !== null && (
                            <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <Controller
                                        control={control}
                                        name={`items.${editingIndex}.product_id`}
                                        render={({ field }) => (
                                            <SimpleSelector
                                                label="Producto"
                                                value={field.value}
                                                options={products.map(product => ({
                                                    id: product.id,
                                                    name: product.name,
                                                }))}
                                                onSelect={(value) => {
                                                    field.onChange(value);
                                                    loadProductUnits(value, editingIndex);
                                                }}
                                            />
                                        )}
                                    />

                                    <Controller
                                        control={control}
                                        name={`items.${editingIndex}.product_unit_id`}
                                        render={({ field }) => (
                                            <SimpleSelector
                                                label="Unidad"
                                                value={field.value}
                                                options={(productUnits[editingIndex] ?? []).map(unit => ({
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
                                        name={`items.${editingIndex}.quantity`}
                                        register={register}
                                    />

                                    <InputText
                                        label="Cant. Unidad"
                                        name={`items.${editingIndex}.unit_quantity`}
                                        register={register}
                                    />

                                    <InputText
                                        label="Costo Unit."
                                        name={`items.${editingIndex}.unit_cost`}
                                        register={register}
                                    />

                                    <InputText
                                        label="Costo Total"
                                        name={`items.${editingIndex}.total_cost`}
                                        register={register}
                                    />

                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <InputText
                                        label="Lote"
                                        name={`items.${editingIndex}.lot_number`}
                                        register={register}
                                    />

                                    <InputText
                                        type="date"
                                        label="Fecha de vencimiento"
                                        name={`items.${editingIndex}.expiry_date`}
                                        error={errors.purchase_date}
                                        register={register}
                                    />

                                </div>

                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        onClick={() => {
                                            remove(editingIndex);
                                            setEditingIndex(null);
                                            setOpenProduct(false);
                                        }}
                                    >
                                        Eliminar
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={saveProduct}
                                    >
                                        Aceptar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting
                        ? "Guardando..."
                        : isEditing
                            ? "Actualizar compra"
                            : "Guardar compra"}
                </Button>
            </form>
        </div>
    );
}