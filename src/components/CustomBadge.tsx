import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface CustomBadgeProps {
    value: string;
    Icon: LucideIcon;
    className?: string;
    variant?: 'default' | 'secondary';
    gap?: boolean;
    onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export const CustomBadge = ({
    value,
    Icon,
    className,
    variant = 'default',
    gap = true,
    onClick,
}: CustomBadgeProps) => {
    return (
        <div
            className={cn(
                "flex items-center truncate text-xs cursor-pointer transition-colors",
                gap && "gap-1",
                variant === 'secondary'
                    ? "text-secondary hover:text-secondary/80"
                    : "text-muted-foreground hover:text-foreground",
                className
            )}
            title={value}
            onClick={onClick}
        >
            <Icon className="size-3 shrink-0" />
            <span className="truncate">{value}</span>
        </div>
    );
};
