import React from 'react';
import { Sun, Moon, Laptop, ChevronDown, Check } from 'lucide-react';
import { useTheme, type Theme } from '@/providers/theme-provider';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
];

interface ThemeSelectorProps {
  className?: string;
  align?: 'start' | 'center' | 'end';
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  className,
  align = 'end',
}) => {
  const { theme, setTheme } = useTheme();

  const CurrentThemeIcon =
    theme === 'dark' ? Moon : theme === 'light' ? Sun : Laptop;

  return (
    <div className={cn('inline-flex items-center', className)}>
      {/* Desktop View: Shadcn Dropdown */}
      <div className="hidden sm:inline-block">
        <DropdownMenu>
          <DropdownMenuTrigger className="h-8 gap-2 px-3 text-xs font-medium justify-between border-border/60 bg-background hover:bg-accent hover:text-accent-foreground min-w-28 rounded-lg border flex items-center">
            <div className="flex items-center gap-2 min-w-0">
              <CurrentThemeIcon className="size-4 text-muted-foreground shrink-0" />
              <span className="capitalize truncate">{theme}</span>
            </div>
            <ChevronDown className="size-3.5 opacity-60 shrink-0 ml-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align={align} className="w-32 p-1">
            {THEME_OPTIONS.map((option) => {
              const isSelected = theme === option.value;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => setTheme(option.value)}
                  className="flex items-center justify-between text-xs py-1.5 px-2.5 cursor-pointer font-medium"
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="size-4 text-primary ml-2 shrink-0" />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile View: Native Select */}
      <div className="sm:hidden relative inline-flex items-center">
        <CurrentThemeIcon className="absolute left-2.5 size-4 text-muted-foreground pointer-events-none" />
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="h-8 rounded-md border border-input bg-background pl-8 pr-7 text-xs font-medium text-foreground capitalize appearance-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {THEME_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-2 size-3.5 text-muted-foreground pointer-events-none opacity-60" />
      </div>
    </div>
  );
};

export default ThemeSelector;
