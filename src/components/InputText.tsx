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
    step?: string;
};

export default function InputText({
    name,
    label,
    type = "text",
    register,
    error,
    registerOptions,
    support,
    step
}: InputProps) {
    return (
        <div className="flex flex-col gap-1">
            {label && <label htmlFor={name} className="text-sm">{label}</label>}

            <Input
                id={name}
                type={type}
                {...register(name, registerOptions)}
                step={step}
            />

            {error && (
                <p className="text-[13px] text-red-500 px-2 -my-2 py-1">
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
