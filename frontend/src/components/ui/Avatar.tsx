import { cn, initials } from "@/lib/utils";

interface Props {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  ring?: boolean;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-lg",
};

export function Avatar({ src, name, size = "md", className, ring }: Props) {
  return (
    <div
      className={cn(
        "relative inline-flex flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-brand-500 to-accent-500 font-semibold text-white",
        sizes[size],
        ring && "ring-2 ring-white shadow-sm",
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : (
        <span>{initials(name)}</span>
      )}
    </div>
  );
}
