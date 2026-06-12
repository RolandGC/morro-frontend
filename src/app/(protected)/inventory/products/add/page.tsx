"use client"
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

export default function AddProductPage() {
    const [product, setProduct] = useState({
        name: '',
        model: '',
        unit_base: '',
        regime: regime.general,
        has_igv: true,
        track_stock: true,
        category_id: '',
        brand_id: ''
    });
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const regimeTypes = [
        { id: '1', name: 'General', value: regime.general },
        { id: '2', name: 'Mixto', value: regime.mixed },
        { id: '3', name: 'Zofra', value: regime.zofra },
    ]
    const has_igv = [
        { id: '1', name: 'Sí', value: true },
        { id: '2', name: 'No', value: false },
    ]
    const track_stock = [
        { id: '1', name: 'Sí', value: true },
        { id: '2', name: 'No', value: false },
    ]


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.findAll();
                console.log('Categories:', response);
                if (response.status === 200) {
                    setCategories(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const response = await brandService.findAll();
                console.log('Brands:', response);
                if (response.status === 200) {
                    setBrands(response.data.data);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchBrands();
    }, []);


    const handleSubmit = async () => {
        try {
            // Call your API to create the product here.
            console.log('Product data:', product);
            const response = await productService.create(product);
            console.log('Create product response:', response);
            if (response.status === 201) {
                console.log('Product created successfully!');
            }

        } catch (error) {
            console.error('Error creating product:', error);
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <InputText id="name" value={product.name} label="Nombre del producto" onChange={(value) =>
                    setProduct(prev => ({
                        ...prev,
                        name: value
                    }))
                } />
                <InputText id="model" value={product.model} label="Modelo" onChange={(value) => setProduct(prev => ({...prev, model: value}))} />
                <SimpleSelector
                    label="Marca"
                    options={brands.map(brand => ({ id: brand.id, name: brand.name }))}
                    onSelect={(id) => setProduct(prev => ({...prev, brand_id: id}))}
                />
                <SimpleSelector
                    label="Categoría"
                    options={categories.map(category => ({ id: category.id, name: category.name }))}
                    onSelect={(id) => setProduct(prev => ({...prev, category_id: id}))}
                />
                <SimpleSelector
                    label="Régimen"
                    options={regimeTypes}
                    onSelect={(id) => setProduct(prev => ({...prev, regime: regimeTypes.find(r => r.id === id)?.value || regime.general}))}
                />
                <InputText id="unit" value={product.unit_base} label="Unidad de medida" onChange={(value) => setProduct(prev => ({...prev, unit_base: value}))} />
                <SimpleSelector
                    label="Tiene IGV"
                    options={has_igv}
                    onSelect={(id) => setProduct(prev => ({...prev, has_igv: has_igv.find(h => h.id === id)?.value || false}))}
                />
                <SimpleSelector
                    label="Llevar stock"
                    options={track_stock}
                    onSelect={(id) => setProduct(prev => ({...prev, track_stock: track_stock.find(t => t.id === id)?.value || false}))}
                />
                <Button
                    type="submit"
                    onClick={handleSubmit}
                    className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                >
                    Guardar producto
                </Button>
            </div>
        </div>
    );
}