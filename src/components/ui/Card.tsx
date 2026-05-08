import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export default function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-2xl border border-zinc-800 bg-zinc-950/40 p-4", className)}>{children}</div>;
}
