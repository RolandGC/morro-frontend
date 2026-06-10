"use client"

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { categoryService } from "@/modules/core/category/services/category.service";
import { Category } from "@/modules/core/category/types/category.types";
import { productService } from "@/modules/inventory/products/services/product.service";
import { useEffect, useState } from "react";

export default function AddProductPage() {
    const product = {
        name: '',
        description: '',
        price: 0,
        stock: 0,
    };
    const[categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.findAll();
                console.log('Categories:', response);
                if(response.status === 200) {
                    setCategories(response.data.data);
                }
                // Set categories in state here.
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
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
                <div className="flex flex-col gap-2">
                    <label htmlFor="name">Nombre del producto</label>
                    <Input id="name" value={''} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="description">Categoría</label>
                    <Select>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                {categories?.map((category) => (
                                    <SelectItem key={category.id} value={category.id}>
                                        {category?.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="model">Modelo</label>
                    <Input id="model" value={''} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="price">Precio</label>
                    <Input id="price" value={''} readOnly />
                </div>
                <div className="flex flex-col gap-2">
                    <label htmlFor="stock">Stock</label>
                    <Input id="stock" value={''} readOnly />
                </div>
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