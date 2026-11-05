import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
};

export function MobileFilterDrawer({
  open,
  onClose,
  title = "Filters",
  children,
  actionLabel,
  onAction,
}: Props) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-[min(380px,calc(100vw-1rem))] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out lg:hidden",
          "pb-[env(safe-area-inset-bottom)]",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters"
            className="inline-flex h-11 w-11 items-center justify-center rounded-xl hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {actionLabel && (
          <div className="border-t border-slate-100 p-4">
            <Button
              className="w-full"
              size="lg"
              onClick={() => {
                onAction?.();
                onClose();
              }}
            >
              {actionLabel}
            </Button>
          </div>
        )}
      </div>
    </>
  );
}
