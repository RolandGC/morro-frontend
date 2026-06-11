import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type SimpleSelectorProps = {
    label: string;
    options: { id: string; name: string }[];
    onSelect: (id: string) => void;
}
export default function SimpleSelector({ label, options, onSelect }: SimpleSelectorProps) {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor="description">{label}</label>
            <Select onValueChange={onSelect}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {options.map((option) => (
                            <SelectItem key={option.id} value={option.id}>
                                {option?.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
}