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

interface ProductFormProps {
    onSuccess?: () => void;
}

export default function ProductForm({ onSuccess }: ProductFormProps) {
    const [product, setProduct] = useState({
        name: "",
        model: "",
        unit_base: "",
        regime: regime.general,
        has_igv: true,
        track_stock: true,
        category_id: "",
        brand_id: "",
    });

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
            const response = await productService.create(product);

            if (response.status === 201) {
                onSuccess?.();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <InputText
                id="name"
                value={product.name}
                label="Nombre del producto"
                onChange={(value) =>
                    setProduct((prev) => ({
                        ...prev,
                        name: value,
                    }))
                }
            />

            <InputText
                id="model"
                value={product.model}
                label="Modelo"
                onChange={(value) =>
                    setProduct((prev) => ({
                        ...prev,
                        model: value,
                    }))
                }
            />

            <SimpleSelector
                label="Marca"
                options={brands.map((brand) => ({
                    id: brand.id,
                    name: brand.name,
                }))}
                onSelect={(id) =>
                    setProduct((prev) => ({
                        ...prev,
                        brand_id: id,
                    }))
                }
            />

            <SimpleSelector
                label="Categoría"
                options={categories.map((category) => ({
                    id: category.id,
                    name: category.name,
                }))}
                onSelect={(id) =>
                    setProduct((prev) => ({
                        ...prev,
                        category_id: id,
                    }))
                }
            />

            <SimpleSelector
                label="Régimen"
                options={regimeTypes}
                onSelect={(id) =>
                    setProduct((prev) => ({
                        ...prev,
                        regime:
                            regimeTypes.find((r) => r.id === id)?.value ??
                            regime.general,
                    }))
                }
            />

            <InputText
                id="unit"
                value={product.unit_base}
                label="Unidad de medida"
                onChange={(value) =>
                    setProduct((prev) => ({
                        ...prev,
                        unit_base: value,
                    }))
                }
            />

            <SimpleSelector
                label="Tiene IGV"
                options={has_igv}
                onSelect={(id) =>
                    setProduct((prev) => ({
                        ...prev,
                        has_igv:
                            has_igv.find((h) => h.id === id)?.value ?? false,
                    }))
                }
            />

            <SimpleSelector
                label="Llevar stock"
                options={track_stock}
                onSelect={(id) =>
                    setProduct((prev) => ({
                        ...prev,
                        track_stock:
                            track_stock.find((t) => t.id === id)?.value ?? false,
                    }))
                }
            />

            <Button onClick={handleSubmit}>
                Guardar producto
            </Button>
        </div>
    );
}