export interface Base64File {
  base64: string;
  filename: string;
  mime_type: string;
}

/** Decodifica un base64 (con o sin prefijo data URI) a un Blob. */
export function base64ToBlob(base64: string, mimeType: string): Blob {
  const clean = base64.includes(",") ? base64.split(",")[1] : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

/** Dispara la descarga en el navegador de un archivo recibido en base64. */
export function downloadBase64File(file: Base64File): void {
  if (typeof window === "undefined") return;

  const blob = base64ToBlob(file.base64, file.mime_type);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.filename || "reporte";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
