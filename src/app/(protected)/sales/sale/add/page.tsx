"use client"

import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { showToast } from "@/hooks/useToast";
import { companyService } from "@/modules/core/companies/services/company.service";
import { Company } from "@/modules/core/companies/types/company.type";
import { warehouseService } from "@/modules/core/warehouses/services/warehouse.service";
import { Warehouse } from "@/modules/core/warehouses/types/warehouse.types";
import { currencyService } from "@/modules/finances/currency/services/currency.service";
import { Currency } from "@/modules/finances/currency/types/currency.types";
import { productService } from "@/modules/inventory/products/services/product.service";
import { productUnitService } from "@/modules/inventory/products/services/producUnit.service";
import { Product, ProductUnit } from "@/modules/inventory/products/types/produc.type";
import { customerService } from "@/modules/sales/customers/services/customer.service";
import { Customer } from "@/modules/sales/customers/types/customer.type";
import { saleService } from "@/modules/sales/sale/services/sale.service";
import { useSaleStore } from "@/modules/sales/sale/store/sale.store";
import { SaleForm, saleSchema } from "@/modules/sales/sale/validators/saleSchema";
import { sale_type } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";

export default function SaleAddPage() {
    const router = useRouter();
    const { sale, sales, isEditing, sale_id } = useSaleStore();
    const [companies, setCompanies] = useState<Company[]>([]);
    const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
    const [customer, setCustomer] = useState<Customer[]>([]);
    const [currency, setCurrency] = useState<Currency[]>([]);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [openProduct, setOpenProduct] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [productUnits, setProductUnits] = useState<Record<number, ProductUnit[]>>({});

    const saleTypes = [
        { id: "1", name: "Efectivo", value: sale_type.cash },
        { id: "2", name: "Crédito", value: sale_type.credit },
    ];
    const is_bonus = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];
    const defaultValues: SaleForm = {
        company_id: "",
        warehouse_id: "",
        customer_id: "",
        price_list_id: "",
        currency_id: "",
        exchange_rate: 1,
        sale_type: sale_type.cash,
        sale_date: new Date().toISOString().split("T")[0],
        items: [],
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
    } = useForm<SaleForm>({
        resolver: zodResolver(saleSchema),
        defaultValues: {
            ...defaultValues,
            ...sale,
            items: sale?.items ?? [],
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customer, currencyResponse] = await Promise.all([
                    customerService.getAll({ is_active: true }),
                    currencyService.getAll({ is_active: true }),
                ]);

                if (customer.status === 200) {
                    setCustomer(customer.data.data);
                }

                if (currencyResponse.status === 200) {
                    setCurrency(currencyResponse.data.data);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, [setCustomer, setCurrency]);

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

    const onSubmit = async (data: SaleForm) => {
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
                    item.quantity <= 0
            );

            if (invalidItem) {
                showToast("Complete correctamente los datos de los productos", "error");
                return;
            }

            console.log("DATOS A ENVIAR:", data);

            let response;

            if (isEditing && sale_id) {
                response = await saleService.update(
                    sale_id ?? '',
                    data
                );
            } else {
                response = await saleService.create(data);
            }

            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing
                        ? "Compra actualizada correctamente"
                        : "Compra creada correctamente",
                    "success"
                );

                resetForm(defaultValues);
                router.push("/sales/sale")
            }

        } catch (error) {
            showToast(
                "Error al guardar la compra",
                "error"
            );

            console.error(error);
        }
    };

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


    const handleAddProduct = () => {
        const newIndex = fields.length;

        append({
            product_id: "",
            product_unit_id: "",
            quantity: 1,
            unit_quantity: 1,
            unit_price: 0,
            igv_amount: 0,
            subtotal: 0,
            is_bonus: false,
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
                console.log("Errores:", errors);
            })} className="flex flex-col gap-4 w-full">

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
                        name="customer_id"
                        control={control}
                        render={({ field }) => (
                            <SimpleSelector
                                label="cliente"
                                value={field.value}
                                options={customer.map((customer) => ({
                                    id: customer.id,
                                    name: customer.full_name,
                                }))}
                                onSelect={field.onChange}
                                error={errors.customer_id}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Controller
                        name="sale_type"
                        control={control}
                        render={({ field }) => (
                            <SimpleSelector
                                label="Tipo de venta"
                                value={saleTypes.find((r) => r.value === field.value)?.id}
                                options={saleTypes}
                                onSelect={(id) => {
                                    const selected = saleTypes.find((r) => r.id === id);
                                    field.onChange(selected?.value ?? sale_type.cash);
                                }}
                            />
                        )}
                    />
                    <InputText
                        name="exchange_rate"
                        label="Tipo de cambio"
                        register={register}
                        error={errors.exchange_rate}
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
                                <TableHead>Precio</TableHead>
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
                                            {item?.unit_quantity}
                                        </TableCell>
                                        <TableCell>
                                            {item?.subtotal}
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
                                        label="Precio Unit."
                                        name={`items.${editingIndex}.unit_price`}
                                        register={register}
                                    />
                                    <InputText
                                        label="Sub Total"
                                        name={`items.${editingIndex}.subtotal`}
                                        register={register}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                                   {/*  <InputText
                                        label="Lote"
                                        name={`items.${editingIndex}.lot_number`}
                                        register={register}
                                    /> */}
                                    <Controller
                                        name={`items.${editingIndex}.is_bonus`}
                                        control={control}
                                        render={({ field }) => (
                                            <SimpleSelector
                                                label="Es bono"
                                                value={field.value ? is_bonus[0].id : is_bonus[1].id}
                                                options={is_bonus}
                                                onSelect={(id) => {
                                                    const selected = is_bonus.find(h => h.id === id);
                                                    field.onChange(selected?.value ?? false);
                                                }}
                                            />
                                        )}
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
                <Button type="submit" disabled={isSubmitting} onClick={() => console.log("click")}>
                    {isSubmitting
                        ? "Guardando..."
                        : isEditing
                            ? "Actualizar venta"
                            : "Guardar venta"}
                </Button>
            </form>
        </div>
    )
}