import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useUserStore } from "../store/user.store"
import UserForm from "./UserForm"

interface ModalProps {
    onSuccess?: () => void;
}

export function Modal({ onSuccess }: ModalProps) {
    const { open, isEditing, close } = useUserStore()

    const handleSuccess = () => {
        close();
        onSuccess?.();
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && close()}>
            <DialogContent className="lg:max-w-3xl max-h-[90vh] overflow-y-auto sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Editar usuario" : "Crear usuario"}</DialogTitle>
                    <DialogDescription>
                        Complete la información del usuario.
                    </DialogDescription>
                </DialogHeader>

                <UserForm onSuccess={handleSuccess} />
            </DialogContent>
        </Dialog>
    )
}
