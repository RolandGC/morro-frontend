import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FieldError } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type SimpleSelectorProps = {
    label: string;
    options: { id: string; name: string }[];
    onSelect: (id: string) => void;
    value?: string;
    error?: FieldError | undefined;

    // Nuevo
    onAdd?: () => void;
    addLabel?: string;
};

export default function SimpleSelector({
    label,
    options,
    onSelect,
    value,
    error,
    onAdd,
    addLabel = "Agregar",
}: SimpleSelectorProps) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <label htmlFor={label} className="text-sm">{label}</label>

                {onAdd && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={onAdd}
                    >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        {addLabel}
                    </Button>
                )}
            </div>

            <Select
                onValueChange={onSelect}
                value={value}
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona" />
                </SelectTrigger>

                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem
                                key={option.id}
                                value={option.id}
                            >
                                {option.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>

            {error && (
                <span className="text-[13px] text-red-500 px-2 -my-2 py-1">
                    {error.message}
                </span>
            )}
        </div>
    );
}
