import { Input } from "./ui/input";
import { FieldError, UseFormRegister } from "react-hook-form";

type InputProps = {
    name: string;
    label?: string;
    register: UseFormRegister<any>;
    error?: FieldError;
};

export default function InputText({
    name,
    label,
    register,
    error,
}: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && <label htmlFor={name}>{label}</label>}

            <Input
                id={name}
                {...register(name)}
            />

            {error && (
                <p className="text-[13px] text-red-500 px-2 -my-2">
                    {error.message}
                </p>
            )}
        </div>
    );
}