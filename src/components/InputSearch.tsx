"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"

interface SearchResult {
    id: string
    label: string
}

interface InputSearchProps {
    label?: string
    placeholder?: string
    value?: string
    results?: SearchResult[]
    loading?: boolean
    onChange?: (value: string) => void
    onSelect?: (item: SearchResult) => void
    onClear?: () => void
}

export default function InputSearch({
    label,
    placeholder,
    value = "",
    results = [],
    loading = false,
    onChange,
    onSelect,
    onClear,
}: InputSearchProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState(value)

    useEffect(() => {
        setSearch(value)
    }, [value])

    const handleChange = (value: string) => {
        setSearch(value)
        onChange?.(value)

        setOpen(value.length > 0)

        // Si se borra manualmente todo el texto
        if (value.length === 0) {
            onClear?.()
        }
    }

    const handleSelect = (item: SearchResult) => {
        setSearch(item.label)
        setOpen(false)

        onSelect?.(item)
    }

    return (
        <div className="flex flex-col gap-1 relative">
            {label && (
                <label>
                    {label}
                </label>
            )}

            <Input
                type="text"
                value={search}
                onChange={(e) => handleChange(e.target.value)}
                placeholder={placeholder}
                className="h-8 bg-white"
            />

            {open && (
                <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border bg-popover shadow-lg">
                    {loading ? (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                            Buscando ...
                        </div>
                    ) : results.length > 0 ? (
                        <div className="max-h-60 overflow-y-auto p-1">
                            {results.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground"
                                    onClick={() => handleSelect(item)}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="px-3 py-3 text-sm text-muted-foreground">
                            No se encontraron resultados
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
