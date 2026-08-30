import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CustomBadgeProps {
    value: string;
    Icon: LucideIcon;
    className?: string;
    variant?: 'default' | 'secondary';
    gap?: boolean;
    title?: string;
    interactive?: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const CustomBadge = ({
    value,
    Icon,
    className,
    variant = 'default',
    gap = true,
    title,
    interactive,
    onClick,
}: CustomBadgeProps) => {
    const isInteractive = interactive ?? Boolean(onClick);

    return (
        <div
            className={cn(
                "flex items-center truncate text-xs transition-colors select-none",
                gap && "gap-1",
                isInteractive
                    ? variant === 'secondary'
                        ? "text-secondary hover:text-secondary/80 cursor-pointer"
                        : "text-muted-foreground hover:text-foreground cursor-pointer"
                    : variant === 'secondary'
                        ? "text-secondary cursor-default"
                        : "text-muted-foreground cursor-default",
                className
            )}
            title={title || value}
            onClick={onClick}
        >
            <Icon className="size-3 shrink-0" />
            <span className="truncate">{value}</span>
        </div>
    );
};
