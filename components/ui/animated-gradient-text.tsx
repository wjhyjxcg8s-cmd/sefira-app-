import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function AnimatedGradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-4 py-1.5 text-sm font-medium shadow-[inset_0_-8px_10px_#0d948820] backdrop-blur-sm transition-shadow duration-500 ease-out [--bg-size:300%] hover:shadow-[inset_0_-5px_10px_#0d948840]",
        className
      )}
    >
      <div
        className={cn(
          "absolute inset-0 block h-full w-full animate-gradient bg-gradient-to-r from-teal-400/50 via-cyan-300/50 to-teal-600/50 bg-[length:var(--bg-size)_100%] p-[1px] [border-radius:inherit] ![mask-composite:subtract] [mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]",
        )}
      />
      {children}
    </div>
  );
}
