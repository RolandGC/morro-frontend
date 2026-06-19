'use client'

import { Modal } from "@/modules/inventory/products/components/Modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/features/data-table";
import { columns } from "./columns";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product } from "@/modules/inventory/products/types/produc.type";
import { useProductStore } from "@/modules/inventory/products/store/product.store";

export default function ProductsPage() {
    const { openCreate } = useProductStore();
    const [data, setData] = useState<Product[]>([]);

    useEffect(() => {
        try {
            const fetchProducts = async () => {
                const response = await productService.findAll();
                console.log('Products:', response);
                if (response.status === 200) {
                    setData(response.data.data);
                }
            };
            fetchProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, []);


    return (
        <div className="container mx-auto py-10">
            <h1 className="text-2xl font-bold">Productos</h1>
            <DataTable columns={columns} data={data} />
            <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear producto</Button>
            <Modal />
        </div>
    );
}