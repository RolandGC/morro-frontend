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
import Swal from "sweetalert2";
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
import { purchaseService } from "@/modules/purchases/purchase/services/purchase.service";
import { useRouter } from "next/navigation";
import InputSearch from "@/components/InputSearch";

interface PurchaseFormProps {
    onSuccess?: () => void;
}
export default function PurchaseAddPage({ onSuccess }: PurchaseFormProps) {
    const { isEditing, purchase, open, close, purchase_id } = usePurchaseStore();
    const { notify: showToast } = useToast();
    const [supplier, setSupplier] = useState<Supplier[]>([])
    const [currency, setCurrency] = useState<Currency[]>([])
    const [productUnits, setProductUnits] = useState<Record<number, ProductUnit[]>>({});
    const [openProduct, setOpenProduct] = useState(false);
    const [searchProduct, setSearchProduct] = useState<Record<number, string>>({});
    const [productLoading, setProductLoading] = useState(false);
    const [productResults, setProductResults] = useState<Product[]>([]);
    const [selectedProducts, setSelectedProducts] = useState<Record<number, Product>>({});

    const [productFilter, setProductFilter] = useState({
        name: "",
        track_stock: undefined,
        barcode: "",
        is_active: true,
        page: 1,
        limit: 6,
    });

    const router = useRouter();
    const defaultValues: PurchaseForm = {
        //company_id: "",
        //warehouse_id: "",
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
        console.log("FORMULARIO COMPLETO:", data);
        const storedCompany = localStorage.getItem("selected_company");
        if (!storedCompany) {
            showToast("No existe empresa seleccionada", "error");
            return;
        }
        const parsedCompany: Company = JSON.parse(storedCompany);

        const result = await Swal.fire({
            title: "¿Estás seguro?",
            text: `Se agregará la compra "${purchase.reference_doc}".`,
            icon: "info",
            showCancelButton: true,
            confirmButtonText: "Sí, agregar",
            cancelButtonText: "Cancelar",
            reverseButtons: true,
            customClass: {
                confirmButton:
                    "bg-green-600 hover:bg-gray-300 text-white font-medium px-4 py-2 rounded-lg ml-2",
                cancelButton:
                    "bg-gray-500 hover:bg-gray-600 text-white font-medium px-4 py-2 rounded-lg mr-2",
            },
            buttonsStyling: false
        });

        if (!result.isConfirmed) {
            return;
        }
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
                response = await purchaseService.create({
                    ...data,
                    company_id: parsedCompany.id,
                    warehouse_id: parsedCompany.warehouse?.id,
                });
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
            //unit_quantity: 1,
            unit_cost: 0,
            //total_cost: 0,
            lot_number: "",
            expiry_date: "",
        });

        setSearchProduct((prev) => ({
            ...prev,
            [newIndex]: "",
        }));

        setEditingIndex(newIndex);
        setOpenProduct(true);
    };


    const saveProduct = () => {
        if (editingIndex === null) return;

        const item = getValues(`items.${editingIndex}`);

        if (!item.product_id) {
            showToast("Seleccione un producto", "error");
            return;
        }

        if (!item.product_unit_id) {
            showToast("Seleccione una unidad", "error");
            return;
        }

        if (!item.quantity || Number(item.quantity) <= 0) {
            showToast("Ingrese una cantidad válida", "error");
            return;
        }

        if (!item.unit_cost || Number(item.unit_cost) <= 0) {
            showToast("Ingrese un costo válido", "error");
            return;
        }

        setOpenProduct(false);
        setEditingIndex(null);
    };

    const handleEdit = async (index: number) => {
        setEditingIndex(index);

        const item = getValues(`items.${index}`);

        if (item?.product_id) {
            const product = productResults.find(
                (p) => p.id === item.product_id
            );

            if (product) {
                setSelectedProducts((prev) => ({
                    ...prev,
                    [index]: product,
                }));

                setSearchProduct((prev) => ({
                    ...prev,
                    [index]: product.name,
                }));
            }

            await loadProductUnits(item.product_id, index);
        }

        setOpenProduct(true);
    };


    const fetchProducts = async () => {
        try {
            setProductLoading(true);

            const response = await productService.getAll(productFilter);

            if (response.status === 200) {
                setProductResults(response.data.data);
            } else {
                console.error(
                    "Error fetching products:",
                    response.statusText
                );
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setProductLoading(false);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, [productFilter]);

    useEffect(() => {
        if (editingIndex === null) return;

        const search = searchProduct[editingIndex] ?? "";

        const timeout = setTimeout(() => {
            setProductFilter((prev) => ({
                ...prev,
                name: search,
                page: 1,
            }));
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchProduct, editingIndex]);

    return (
        <div className="container mx-auto py-4 px-4">
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
                <div className="flex items-center justify-center">
                    <Button
                        type="button"
                        onClick={handleAddProduct}
                        className="px-6"
                    >
                        + Agregar producto
                    </Button>
                </div>
                <div className="overflow-hidden rounded-md border">
                    <Table>
                        <TableHeader className="font-bold bg-gray-100">
                            <TableRow>
                                <TableHead>Producto</TableHead>
                                <TableHead>Unidad</TableHead>
                                <TableHead>Cantidad</TableHead>
                                <TableHead>Costo</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Acciones</TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {fields.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center text-gray-500 py-8"
                                    >
                                        No hay productos agregados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                fields.map((field, index) => {
                                    const item = items?.[index];
                                    const product = selectedProducts[index];

                                    return (
                                        <TableRow key={field.id}>
                                            <TableCell>
                                                {product?.name} {product?.model}
                                            </TableCell>
                                            <TableCell>
                                                {item?.product_unit_id
                                                    ? productUnits[index]?.find(
                                                        (unit) => unit.id === item.product_unit_id)?.name
                                                    : "No disponible"}
                                            </TableCell>
                                            <TableCell>
                                                {item?.quantity}
                                            </TableCell>

                                            <TableCell>
                                                {item?.unit_cost}
                                            </TableCell>

                                            <TableCell>
                                                {item?.quantity && item?.unit_cost
                                                    ? (item.quantity * item.unit_cost).toFixed(2)
                                                    : "0.00"}
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
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>

                </div>

                <Dialog open={openProduct} onOpenChange={setOpenProduct}>
                    <DialogContent className="lg:max-w-2xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Detalle Producto</DialogTitle>
                        </DialogHeader>

                        {editingIndex !== null && (
                            <div className="border rounded-lg p-4 bg-white space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                    <InputSearch
                                        label="Producto"
                                        placeholder="Buscar producto..."
                                        value={
                                            editingIndex !== null
                                                ? searchProduct[editingIndex] ?? ""
                                                : ""
                                        }
                                        onChange={(value) => {
                                            if (editingIndex === null) return;

                                            setSearchProduct((prev) => ({
                                                ...prev,
                                                [editingIndex]: value,
                                            }));
                                        }}
                                        results={productResults.map((product) => ({
                                            id: product.id,
                                            label: `${product.name} ${product?.model}`,
                                        }))}
                                        onSelect={(product) => {
                                            if (editingIndex === null) return;

                                            const index = editingIndex;

                                            setSearchProduct((prev) => ({
                                                ...prev,
                                                [index]: product.label,
                                            }));

                                            const selectedProduct = productResults.find(
                                                (p) => p.id === product.id
                                            );

                                            if (selectedProduct) {
                                                setSelectedProducts((prev) => ({
                                                    ...prev,
                                                    [index]: selectedProduct,
                                                }));
                                            }

                                            setValue(
                                                `items.${index}.product_id`,
                                                product.id,
                                                {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                }
                                            );
                                            setValue(
                                                `items.${index}.product_unit_id`,
                                                "",
                                                {
                                                    shouldValidate: true,
                                                    shouldDirty: true,
                                                }
                                            );
                                            loadProductUnits(product.id, index);
                                        }}
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

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputText
                                        label="Cantidad"
                                        name={`items.${editingIndex}.quantity`}
                                        register={register}
                                    />
                                    <InputText
                                        label={`Costo por ${productUnits[editingIndex]?.find(unit => unit.id === getValues(`items.${editingIndex}.product_unit_id`))?.name ?? "unidad"}`}
                                        name={`items.${editingIndex}.unit_cost`}
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
                <div className="mt-6 flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full sm:w-auto"
                        disabled={isSubmitting}
                        onClick={() => {
                            router.push("/purchases/purchase")
                        }}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" className="px-6" disabled={isSubmitting}>
                        {isSubmitting
                            ? "Guardando..."
                            : isEditing
                                ? "Actualizar compra"
                                : "Guardar compra"}
                    </Button>
                </div>
            </form>
        </div>
    );
}