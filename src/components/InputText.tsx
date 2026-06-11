import { Input } from "./ui/input";
import type { ChangeEvent } from "react";

type InputProps = {
    id: string;
    value: string;
    label?: string;
    onChange: (value: string) => void;
}

export default function InputText({ id, value, label, onChange }: InputProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        onChange(event.target.value);
    };

    return (
        <div className="flex flex-col gap-2">
            {label && <label htmlFor={id}>{label}</label>}
            <Input id={id} value={value} onChange={handleChange} />
        </div>
    );
}