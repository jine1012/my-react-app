import { ReactNode } from "react";

export default function Toolbar({ children }:{ children: ReactNode }) {
  return <div className="flex flex-wrap gap-2">{children}</div>;
}
