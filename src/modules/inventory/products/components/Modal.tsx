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
import ProductForm from "./ProductForm"

interface ModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}
export function Modal({ open, onOpenChange }: ModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <form>
                {/* <DialogTrigger asChild>
                    <Button variant="outline">Open Dialog</Button>
                </DialogTrigger> */}
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Crear producto</DialogTitle>
                        <DialogDescription>
                            Complete la información del producto.
                        </DialogDescription>
                    </DialogHeader>

                    <ProductForm
                        onSuccess={() => onOpenChange(false)}
                    />
                </DialogContent>
            </form>
        </Dialog>
    )
}
