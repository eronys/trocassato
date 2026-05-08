import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "ghost" | "danger";
};

export default function Button({ className, variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-orange-400 disabled:opacity-40 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-orange-400 text-black hover:bg-orange-300"
      : variant === "danger"
        ? "bg-red-500 text-white hover:bg-red-400"
        : "bg-transparent text-zinc-100 hover:bg-zinc-900";
  return <button className={cn(base, styles, className)} {...props} />;
}
