import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  rating: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function StarRatingDisplay({ rating, size = "md", className }: Props) {
  return (
    <div className={cn("flex gap-0.5 text-accent-500", className)}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = rating >= i + 1;
        const half = !filled && rating >= i + 0.5;
        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              filled ? "fill-current" : half ? "fill-current opacity-50" : "text-slate-200"
            )}
          />
        );
      })}
    </div>
  );
}
