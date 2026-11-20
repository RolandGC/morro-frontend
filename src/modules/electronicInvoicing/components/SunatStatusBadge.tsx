import {
  ELECTRONIC_STATUS_LABELS,
  ELECTRONIC_STATUS_STYLES,
  getElectronicStatus,
} from "../utils/electronicInvoicingFormat";

export function SunatStatusBadge({ status }: { status: string | null | undefined }) {
  const current = getElectronicStatus(status);

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ELECTRONIC_STATUS_STYLES[current]}`}
    >
      {ELECTRONIC_STATUS_LABELS[current]}
    </span>
  );
}
