import { ReactNode } from "react";

export default function EmptyState({ icon, title, desc, cta }:{
  icon?: ReactNode; title: string; desc?: string; cta?: ReactNode;
}) {
  return (
    <div className="card grid place-items-center text-center gap-2 py-10">
      {icon}
      <div className="font-semibold">{title}</div>
      {desc && <p className="text-sm text-cocoa-50 m-0">{desc}</p>}
      {cta}
    </div>
  );
}
