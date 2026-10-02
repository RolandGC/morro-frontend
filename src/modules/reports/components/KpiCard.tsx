import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
}

export default function KpiCard({
  title,
  value,
  hint,
  icon: Icon,
}: KpiCardProps) {
  return (
    <Card size="sm">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon ? <Icon className="size-4 text-muted-foreground" /> : null}
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {hint ? (
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
