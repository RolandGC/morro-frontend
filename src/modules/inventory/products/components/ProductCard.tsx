import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Minus, Plus, X } from "lucide-react";
import { Product, ProductUnit } from "../types/produc.type";

interface ProductCardProps {
    product: Product;
    onIncrease: () => void;
    onDecrease: () => void;
    onRemove: () => void;
    quantity?: number;
    onChangeQuantity?: (q: number) => void;
    units?: ProductUnit[];
    selectedUnitId?: string;
    onSelectUnit?: (unitId: string) => void;
    unitPrice?: number;
    onChangeUnitPrice?: (q: number) => void;
}

export function ProductCard({
    product,
    onIncrease,
    onDecrease,
    onRemove,
    quantity,
    onChangeQuantity,
    units,
    selectedUnitId,
    onSelectUnit,
    unitPrice,
    onChangeUnitPrice,
}: ProductCardProps) {
    return (
        <div className="relative rounded-xl border border-gray-200 bg-white px-3 py-3">
            <div className="flex items-start justify-between">
                <div>
                    <h3 className="text-[15px] font-normal leading-5 text-gray-900">
                        {product.name}
                    </h3>

                    <p className="mt-1 text-[13px] text-gray-500">
                        <span>unid</span>
                        {/* <span className="ml-2">
                            Stock disponible: {product.warehouse_stock} unid
                        </span> */}
                    </p>
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            {units?.find((unit) => unit.id === selectedUnitId)?.name ?? "Seleccionar unidad"}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {(units ?? product.product_units ?? []).map((unit) => {
                            return (
                                <button
                                    key={unit.id}
                                    type="button"
                                    className={`block w-full text-left px-3 py-1 text-sm hover:bg-gray-100 ${selectedUnitId === unit.id ? 'font-medium' : ''}`}
                                    onClick={() => onSelectUnit?.(unit.id)}
                                >
                                    {unit.name}
                                </button>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>

                <button
                    type="button"
                    onClick={onRemove}
                    className="mt-1 ml-2 bg-red-600 text-white hover:bg-red-400 rounded-sm"
                >
                    <X size={18} strokeWidth={1.8} />
                </button>
            </div>

            <div className="mt-4 grid grid-cols-[35px_1fr_35px_1fr] items-center gap-3">
                <button
                    type="button"
                    onClick={onDecrease}
                    disabled={quantity <= 1}
                    className="flex h-9 w-8.75 items-center justify-center rounded-xl border border-gray-200 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Minus size={16} strokeWidth={1.5} />
                </button>

                <div className="text-center">
                   {/*  <div className="text-[18px] leading-5 text-gray-900">
                        {quantity}
                    </div> */}

                    <input
                        type="number"
                        value={quantity ?? 0}
                        min={1}
                        onChange={(e) => onChangeQuantity?.(Number(e.target.value))}
                        className="mx-auto w-20 rounded-md border px-2 py-1 text-center text-[18px] text-gray-900 outline-none"
                    />

                    <div className="mt-1 text-[13px] text-gray-500">unid</div>
                </div>

                <button
                    type="button"
                    onClick={onIncrease}
                    //disabled={quantity >= stock || stock === undefined}
                    className="flex h-9 w-8.75 items-center justify-center rounded-xl border border-gray-200 text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <Plus size={16} strokeWidth={1.5} />
                </button>

                <input
                    type="number"
                    value={unitPrice ?? 0}
                    min={0}
                    step="0.01"
                    onChange={(e) => {
                        const value = e.target.value;

                        onChangeUnitPrice?.(
                            value === "" ? 0 : Number(value)
                        );
                    }}
                    className="h-9 w-full rounded-md border border-gray-200 bg-white px-3 text-right text-[18px] text-gray-900 outline-none"
                />
            </div>
        </div>
    );
}