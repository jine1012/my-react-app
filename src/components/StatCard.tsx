import { ReactNode } from "react";

export default function StatCard({ label, value, icon }:{
  label: string; value: string | number; icon?: ReactNode;
}) {
  return (
    <div className="card flex items-center gap-3">
      {icon && <div className="shrink-0">{icon}</div>}
      <div>
        <div className="text-sm text-cocoa-50">{label}</div>
        <div className="text-lg font-semibold">{value}</div>
      </div>
    </div>
  );
}
