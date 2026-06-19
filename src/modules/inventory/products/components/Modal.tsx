import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProductStore } from "../store/product.store"
import ProductForm from "./ProductForm"

export function Modal() {
    const open = useProductStore((state) => state.open);
    const isEditing = useProductStore((state) => state.isEditing);
    const close = useProductStore((state) => state.close);

    return (
        <Dialog open={open} onOpenChange={close}>
            <form>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditing ? "Editar producto" : "Crear producto"}</DialogTitle>
                        <DialogDescription>
                            Complete la información del producto.
                        </DialogDescription>
                    </DialogHeader>

                    <ProductForm
                        onSuccess={() => close()}
                    />
                </DialogContent>
            </form>
        </Dialog>
    )
}
