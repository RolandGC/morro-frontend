"use client";

import { useState } from "react";
import { GalleryVerticalEndIcon } from "lucide-react";
import { UserPlusIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APIS_PERU_TOKEN, APIS_PERU_BASE_URL } from "@/config/environment";

export default function RegisterPage() {
    const [dni, setDni] = useState("");
    const [nombres, setNombres] = useState("");
    const [apellidoPaterno, setApellidoPaterno] = useState("");
    const [apellidoMaterno, setApellidoMaterno] = useState("");

    const searchDni = async () => {
        try {
            const response = await fetch(
                `${APIS_PERU_BASE_URL}/dni/${dni}?token=${APIS_PERU_TOKEN}`
            );

            if (!response.ok) {
                throw new Error("Error al consultar DNI");
            }

            const data = await response.json();

            setNombres(data.nombres);
            setApellidoPaterno(data.apellidoPaterno);
            setApellidoMaterno(data.apellidoMaterno);
        } catch (error) {
            console.error(error);
            alert("No se pudo consultar el DNI");
        }
    };

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <a href="#" className="flex items-center gap-2 self-center font-medium">
                    <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        <UserPlusIcon className="size-4" />
                    </div>
                    Registrar nuevo usuario
                </a>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="dni">DNI</Label>
                    <div className="flex gap-2">
                        <Input
                            id="dni"
                            value={dni}
                            onChange={(e) => setDni(e.target.value)}
                            placeholder="Ingrese DNI"
                            className="bg-white/80"
                        />
                        <button
                            type="button"
                            onClick={searchDni}
                            className="rounded-md bg-primary px-4 py-2 text-primary-foreground"
                        >
                            Buscar
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="nombres">Nombres</Label>
                    <Input id="nombres" value={nombres} readOnly />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="apellidoPaterno">Apellido paterno</Label>
                    <Input
                        id="apellidoPaterno"
                        value={apellidoPaterno}
                        readOnly
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="apellidoMaterno">Apellido materno</Label>
                    <Input
                        id="apellidoMaterno"
                        value={apellidoMaterno}
                        readOnly
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="username">Nombre de usuario</Label>
                    <Input id="username" placeholder="Nombre de usuario" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="email">Correo electrónico</Label>
                    <Input id="email" type="email" placeholder="Correo electrónico" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input id="password" type="password" placeholder="Contraseña" />
                </div>

                <div className="flex flex-col gap-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Confirmar contraseña"
                    />
                </div>

                <button className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Registrar
                </button>
            </div>
        </div>
    );
}