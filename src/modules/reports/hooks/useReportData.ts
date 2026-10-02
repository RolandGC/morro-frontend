"use client";

import { useCallback, useEffect, useState } from "react";
import axios, { AxiosResponse } from "axios";

function extractErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string | string[] }
      | undefined;
    const message = data?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (typeof message === "string") return message;
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return "Ocurrió un error al cargar el reporte";
}

/**
 * Hook reutilizable para consultar reportes.
 * `params` debe ser un objeto serializable (se usa como dependencia).
 * Descarta respuestas obsoletas cuando los parámetros cambian rápido.
 */
export function useReportData<T, P>(
  fetchFn: (params: P) => Promise<AxiosResponse<T>>,
  params: P,
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [version, setVersion] = useState(0);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    let active = true;

    const timer = setTimeout(() => {
      const run = async () => {
        setLoading(true);
        setError(null);
        try {
          const response = await fetchFn(params);
          if (active) setData(response.data);
        } catch (err) {
          if (active) setError(extractErrorMessage(err));
        } finally {
          if (active) setLoading(false);
        }
      };
      void run();
    }, 0);

    return () => {
      active = false;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, version]);

  const refetch = useCallback(() => setVersion((value) => value + 1), []);

  return { data, loading, error, refetch };
}
