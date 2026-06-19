"use client";

import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/modules/core/category/services/category.service";
import { Category } from "@/modules/core/category/types/category.types";
import { brandService } from "@/modules/inventory/brands/services/brands.service";
import { Brand } from "@/modules/inventory/brands/types/brand.types";
import { productService } from "@/modules/inventory/products/services/product.service";
import { regime } from "@/types/types";
import { useEffect, useState } from "react";
import { useProductStore } from "../store/product.store";
import { useToast } from "@/hooks/useToast";

interface ProductFormProps {
    onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
    const product = useProductStore((state) => state.product);
    const updateField = useProductStore((state) => state.updateField);
    const isEditing = useProductStore((state) => state.isEditing);
    const reset = useProductStore((state) => state.reset);
    const { notify: showToast} = useToast();
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

    const regimeTypes = [
        { id: "1", name: "General", value: regime.general },
        { id: "2", name: "Mixto", value: regime.mixed },
        { id: "3", name: "Zofra", value: regime.zofra },
    ];

    const has_igv = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];

    const track_stock = [
        { id: "1", name: "Sí", value: true },
        { id: "2", name: "No", value: false },
    ];

    useEffect(() => {
        categoryService.findAll().then((response) => {
            if (response.status === 200) {
                setCategories(response.data.data);
            }
        });

        brandService.findAll().then((response) => {
            if (response.status === 200) {
                setBrands(response.data.data);
            }
        });
    }, []);

    const handleSubmit = async () => {
        try {
            let response;
            
            if (isEditing && product.id) {
                response = await productService.update(product.id, product);
            } else {
                response = await productService.create(product);
            }

            if (response.status === 201 || response.status === 200) {
                showToast(
                    isEditing ? "Producto actualizado correctamente" : "Producto creado correctamente",
                    "success"
                );
                reset();
                onSuccess?.();
            }
        } catch (error) {
            showToast("Error al guardar el producto", "error");
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <InputText
                id="name"
                value={product.name}
                label="Nombre del producto"
                onChange={(value) => updateField("name", value)}
            />

            <InputText
                id="model"
                value={product.model}
                label="Modelo"
                onChange={(value) => updateField("model", value)}
            />

            <SimpleSelector
                label="Marca"
                value={product.brand_id}
                options={brands.map((brand) => ({
                    id: brand.id,
                    name: brand.name,
                }))}
                onSelect={(id) =>
                    updateField("brand_id", id)
                }
            />

            <SimpleSelector
                label="Categoría"
                value={product.category_id}
                options={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                }))}
                onSelect={(id) =>
                    updateField("category_id", id)
                }
            />

            <SimpleSelector
                label="Régimen"
                value={regimeTypes.find((r) => r.value === product.regime)?.id}
                options={regimeTypes}
                onSelect={(id) =>
                    updateField("regime", regimeTypes.find((r) => r.id === id)?.value ?? regime.general)
                }
            />

            <InputText
                id="unit"
                value={product.unit_base}
                label="Unidad de medida"
                onChange={(value) =>
                    updateField("unit_base", value)
                }
            />

            <SimpleSelector
                label="Tiene IGV"
                value={product.has_igv === true ? has_igv[0].id : has_igv[1].id}
                options={has_igv}
                onSelect={(id) =>
                    updateField("has_igv", has_igv.find((h) => h.id === id)?.value ?? true)
                }
            />

            <SimpleSelector
                label="Llevar stock"
                value={product.track_stock === true ? track_stock[0].id : track_stock[1].id}
                options={track_stock}
                onSelect={(id) =>
                    updateField("track_stock", track_stock.find((t) => t.id === id)?.value ?? true)
                }
            />

            <Button onClick={handleSubmit}>
                {isEditing ? "Actualizar producto" : "Guardar producto"}
            </Button>
        </div>
    );
}