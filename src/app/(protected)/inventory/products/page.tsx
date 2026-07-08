'use client'

import { Modal } from "@/modules/inventory/products/components/Modal";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { DataTable } from "@/modules/inventory/products/components/data-table";
import { columns } from "./columns";
import { productService } from "@/modules/inventory/products/services/product.service";
import { Product, ProductQueryParams } from "@/modules/inventory/products/types/produc.type";
import { useProductStore } from "@/modules/inventory/products/store/product.store";
import { categoryService } from "@/modules/core/category/services/category.service";
import { brandService } from "@/modules/inventory/brands/services/brands.service";
import { useBrandStore } from "@/modules/inventory/brands/store/brand.store";
import { useCategoryStore } from "@/modules/core/category/store/category.store";
import { PaginationMeta } from "@/types/types";
import { useProtectedRoute } from "@/hooks/useProtectedRoute";
import { RequirePermission } from "@/components/RequirePermission";
import { useAuth } from "@/components/auth-provider";
import { useAuthStore } from "@/modules/auth/store/authStore";
import { usePermissionStore } from "@/modules/auth/store/permission.store";
import ProductForm from "@/modules/inventory/products/components/ProductForm";


export default function ProductsPage() {
    const { openCreate, product } = useProductStore();
    const { permissions } = usePermissionStore();
    const { isLoading } = useProtectedRoute('products.read');
    const { setBrands } = useBrandStore();
    const { setCategories } = useCategoryStore();
    const [data, setData] = useState<Product[]>([]);
    const [pages, setPages] = useState<PaginationMeta | null>(null);
    const [productFilter, setProductFilter] = useState<ProductQueryParams>({
        name: '',
        brand_id: undefined,
        category_id: undefined,
        regime: undefined,
        has_igv: undefined,
        is_active: true,
        model: '',
        track_stock: undefined,
        page: 1,
        limit: 10,
        order: "asc"
    });

    const handleProductFilter = <K extends keyof ProductQueryParams>(
        key: K,
        value: ProductQueryParams[K]
    ) => {
        setProductFilter((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    useEffect(() => {
        try {
            const fetchProducts = async () => {
                const response = await productService.getAll(productFilter);
                console.log('Products:', response);
                if (response.status === 200) {
                    console.log("datas", response.data.data)
                    setPages(response.data.meta)
                    setData(response.data.data);
                }
            };
            fetchProducts();
        } catch (error) {
            console.error('Error fetching products:', error);
        }
    }, [productFilter?.name, productFilter?.page]);

    useEffect(() => {
        const fetchCategoriesAndBrands = async () => {
            try {
                const categoryResponse = await categoryService.getAll();
                if (categoryResponse.status === 200) {
                    setCategories(categoryResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }

            try {
                const brandResponse = await brandService.getAll();
                if (brandResponse.status === 200) {
                    setBrands(brandResponse.data.data);
                }
            } catch (error) {
                console.error('Error fetching brands:', error);
            }
        };

        fetchCategoriesAndBrands();
    }, [setCategories, setBrands]);

    useEffect(() => {
        console.log("testtsts", product)
    }, [product])



    return (
        <div className="container mx-auto py-4 px-4">
            <div className="flex justify-between">
                <h1 className="text-2xl font-bold dark:text-yellow-300">Productos</h1>
                <Button onClick={() => openCreate()} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear producto</Button>
            </div>
            <DataTable columns={columns} data={data} productFilter={productFilter} handleProductFilter={handleProductFilter} totalPages={pages?.totalPages ?? 1} />
            <ProductForm onSuccess={() => close()} />
            <RequirePermission permission="products.read">
                <p>Contenido protegido: Solo usuarios con permiso "products.view" pueden ver esto.</p>
            </RequirePermission>
        </div>
    );
}