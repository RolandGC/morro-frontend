import { useForm } from "react-hook-form";
import { useUserStore } from "../store/user.store";
import { FormUserDto, userSchema } from "../validators/userShema";
import { zodResolver } from "@hookform/resolvers/zod";

interface ProductFormProps {
    onSuccess?: () => void;
}
export default function UserForm({onSuccess}:ProductFormProps) {
    const {user, isEditing, user_id, open} = useUserStore();
    const defaultValues = user

    const {register, handleSubmit, control, reset:resetForm, formState: {errors}} = useForm<FormUserDto>({
        resolver: zodResolver(userSchema),
    })

    const onSubmit = async (user: FormUserDto) => {

    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <form onSubmit={handleSubmit(onSubmit)}>
                
            </form>
            
        </div>
    )
}