import { ReactNode } from "react";

export default function SectionCard({ title, right, children }:{
  title?: ReactNode; right?: ReactNode; children?: ReactNode;
}) {
  return (
    <section className="card">
      {(title || right) && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="m-0 font-semibold">{title}</h3>
          {right}
        </div>
      )}
      {children}
    </section>
  );
}
