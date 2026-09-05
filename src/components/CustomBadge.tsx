import { Link } from 'react-router-dom';
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
    to?: string;
    onClick?: (e: React.MouseEvent<HTMLElement>) => void;
}

export const CustomBadge = ({
    value,
    Icon,
    className,
    variant = 'default',
    gap = true,
    title,
    interactive,
    to,
    onClick,
}: CustomBadgeProps) => {
    const isInteractive = interactive ?? (Boolean(onClick) || Boolean(to));

    const badgeClasses = cn(
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
    );

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        if (onClick) {
            onClick(e);
        }
    };

    if (to) {
        return (
            <Link
                to={to}
                className={badgeClasses}
                title={title || value}
                onClick={handleClick}
            >
                <Icon className="size-3 shrink-0" />
                <span className="truncate">{value}</span>
            </Link>
        );
    }

    return (
        <div
            className={badgeClasses}
            title={title || value}
            onClick={handleClick}
        >
            <Icon className="size-3 shrink-0" />
            <span className="truncate">{value}</span>
        </div>
    );
};
