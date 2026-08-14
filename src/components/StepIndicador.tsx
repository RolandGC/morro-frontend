"use client";

import { Check } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type Step = {
    id: string;
    label: string;
    href: string;
};

interface StepIndicatorProps {
    steps: Step[];
}

export function StepIndicator({ steps }: StepIndicatorProps) {
    const pathname = usePathname();
    const router = useRouter();

    // Busca el paso cuya ruta coincida con la actual, priorizando la más específica
    // (p. ej. "/sales/sale/add/cliente" debe marcar el paso "Cliente", no "Productos").
    const currentIndex = steps
        .map((step, index) => ({ step, index }))
        .filter(({ step }) => pathname.startsWith(step.href))
        .sort((a, b) => b.step.href.length - a.step.href.length)[0]?.index ?? -1;

    const handleStepClick = (step: Step, index: number) => {
        // Solo permite volver a pasos anteriores
        if (index <= currentIndex) {
            router.push(step.href);
        }
    };

    return (
        <div className="w-full">
            {/* Desktop */}
            <div className="hidden md:flex items-center w-full">
                {steps.map((step, index) => {
                    const completed = index < currentIndex;
                    const current = index === currentIndex;
                    const clickable = index <= currentIndex;

                    return (
                        <div
                            key={step.id}
                            className="flex items-center flex-1 last:flex-none"
                        >
                            <button
                                type="button"
                                disabled={!clickable}
                                onClick={() =>
                                    handleStepClick(step, index)
                                }
                                className={cn(
                                    "flex items-center gap-3",
                                    clickable &&
                                    "cursor-pointer",
                                    !clickable &&
                                    "cursor-not-allowed"
                                )}
                            >
                                {/* Circle */}
                                <div
                                    className={cn(
                                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 font-semibold transition-colors",
                                        completed &&
                                        "border-primary bg-primary text-primary-foreground",
                                        current &&
                                        "border-primary bg-background text-primary",
                                        !completed &&
                                        !current &&
                                        "border-muted-foreground/30 bg-background text-muted-foreground"
                                    )}
                                >
                                    {completed ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                {/* Label */}
                                <div className="text-left">
                                    <p
                                        className={cn(
                                            "text-sm font-medium",
                                            current || completed
                                                ? "text-foreground"
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {step.label}
                                    </p>
                                </div>
                            </button>

                            {/* Line */}
                            {index < steps.length - 1 && (
                                <div
                                    className={cn(
                                        "mx-4 h-[2px] flex-1",
                                        index < currentIndex
                                            ? "bg-primary"
                                            : "bg-muted"
                                    )}
                                />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Mobile */}
            <div className="md:hidden">
                <div className="flex items-center justify-between">
                    {steps.map((step, index) => {
                        const completed = index < currentIndex;
                        const current = index === currentIndex;

                        return (
                            <div
                                key={step.id}
                                className="flex flex-1 items-center"
                            >
                                <div
                                    className={cn(
                                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                                        completed &&
                                        "border-primary bg-primary text-primary-foreground",
                                        current &&
                                        "border-primary bg-background text-primary",
                                        !completed &&
                                        !current &&
                                        "border-muted-foreground/30 text-muted-foreground"
                                    )}
                                >
                                    {completed ? (
                                        <Check className="h-4 w-4" />
                                    ) : (
                                        index + 1
                                    )}
                                </div>

                                {index < steps.length - 1 && (
                                    <div
                                        className={cn(
                                            "mx-2 h-[2px] flex-1",
                                            index < currentIndex
                                                ? "bg-primary"
                                                : "bg-muted"
                                        )}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Current step */}
                {currentIndex >= 0 && (
                    <div className="mt-3 text-center">
                        <p className="text-sm font-medium">
                            {steps[currentIndex].label}
                        </p>

                        <p className="text-xs text-muted-foreground">
                            Paso {currentIndex + 1} de {steps.length}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}