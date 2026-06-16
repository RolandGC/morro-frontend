'use client'

import { Modal } from "@/modules/inventory/products/components/Modal";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function ProductsPage() {
    const [open, setOpen] = useState(false);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <h1 className="text-2xl font-bold">Productos</h1>
            <Button onClick={() => setOpen(true)} className="rounded-md bg-primary px-4 py-2 text-primary-foreground">Crear producto</Button>
            <Modal open={open} onOpenChange={setOpen} />
        </div>
    );
}