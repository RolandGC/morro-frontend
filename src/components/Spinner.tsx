import Image from "next/image";

export const Spinner = () => {
    return (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20" />
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-primary" />

                <div className="flex h-20 w-20 items-center justify-center">
                    <Image
                        src="/logo-morro.png"
                        alt="logo"
                        width={34}
                        height={24}
                    />
                </div>
            </div>

            <p className="text-sm text-muted-foreground">
                Cargando información...
            </p>
        </div>
    )
}