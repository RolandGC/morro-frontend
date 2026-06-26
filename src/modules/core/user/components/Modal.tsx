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
import { useUserStore } from "../store/user.store"
import UserForm from "./UserForm"

export function Modal() {
    const {open, isEditing, close} = useUserStore()

    return (
        <Dialog open={open} onOpenChange={close}>
            <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar producto" : "Crear producto"}</DialogTitle>
                    <DialogDescription>
                        Complete la información del producto.
                    </DialogDescription>
                </DialogHeader>

                <UserForm
                    onSuccess={() => close()}
                />
            </DialogContent>
        </Dialog>
    )
}
