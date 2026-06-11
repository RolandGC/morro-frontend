"use client"
import InputText from "@/components/InputText";
import SimpleSelector from "@/components/SimpleSelector";
import { Button } from "@/components/ui/button";
import { categoryService } from "@/modules/core/category/services/category.service";
import { Category } from "@/modules/core/category/types/category.types";
import { brandService } from "@/modules/inventory/brands/services/brands.service";
import { Brand } from "@/modules/inventory/brands/types/brand.types";
import { productService } from "@/modules/inventory/products/services/product.service";
import { useEffect, useState } from "react";

export default function AddProductPage() {
    const product = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
        unit: '',
        regimen: '',
        categoryId: '',
        brandId: ''
    };
    const [categories, setCategories] = useState<Category[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);

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
        } catch (error) {
            console.error('Error creating product:', error);
        }
    }

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <InputText id="name" value={''} label="Nombre del producto" onChange={() => {}} />
                <InputText id="model" value={''} label="Modelo" onChange={() => {}} />
                <SimpleSelector
                    label="Categoría"
                    options={categories.map(category => ({ id: category.id, name: category.name }))}
                    onSelect={(id) => console.log('Selected category ID:', id)}
                />
                <SimpleSelector
                    label="Marca"
                    options={brands.map(brand => ({ id: brand.id, name: brand.name }))}
                    onSelect={(id) => console.log('Selected brand ID:', id)}
                />
                <InputText id="unit" value={''} label="Unidad de medida" onChange={() => {}} />
                <InputText id="regimen" value={''} label="Régimen" onChange={() => { }} />

                <InputText id="stock" value={''} label="Stock" onChange={() => {}} />
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