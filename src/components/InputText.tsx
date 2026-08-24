import { Input } from "./ui/input";
import { FieldError, RegisterOptions, UseFormRegister } from "react-hook-form";

type InputProps = {
    name: string;
    label?: string;
    type?: string;
    register: UseFormRegister<any>;
    error?: FieldError;
    registerOptions?: RegisterOptions<any, string>;
    support?: string;
};

export default function InputText({
    name,
    label,
    type = "text",
    register,
    error,
    registerOptions,
    support,
}: InputProps) {
    return (
        <div className="flex flex-col gap-2">
            {label && <label htmlFor={name}>{label}</label>}

            <Input
                id={name}
                type={type}
                {...register(name, registerOptions)}
            />

            {error && (
                <p className="text-[13px] text-red-500 px-2 -my-2">
                    {error.message}
                </p>
            )}
           {/*  {support && (
                <p className="text-[13px] text-gray-500 px-2 -my-2">
                    {support}
                </p>
            )} */}
        </div>
    );
}
