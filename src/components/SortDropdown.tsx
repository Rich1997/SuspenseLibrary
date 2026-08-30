import { ArrowUpDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface SortOption<T extends string = string> {
  value: T;
  label: string;
}

interface SortDropdownProps<T extends string = string> {
  options: SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel?: string;
  dropdownLabel?: string;
}

export function SortDropdown<T extends string = string>({
  options,
  value,
  onChange,
  ariaLabel = 'Sort options',
  dropdownLabel = 'Sort By',
}: SortDropdownProps<T>) {
  const currentOption = options.find((opt) => opt.value === value) || options[0];

  return (
    <>
      {/* Mobile Native Select Dropdown */}
      <div className="relative sm:hidden">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-label={ariaLabel}
          className="h-8 rounded-md border border-input bg-background pl-2.5 pr-7 text-xs font-medium text-foreground shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring appearance-none cursor-pointer"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Sort: {opt.label}
            </option>
          ))}
        </select>
        <ArrowUpDown className="pointer-events-none absolute right-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
      </div>

      {/* Desktop Custom Dropdown */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex whitespace-nowrap items-center gap-1.5 text-xs font-medium border px-1.5 py-1 rounded-lg">
            <ArrowUpDown className="size-3.5 text-muted-foreground" />
            <div>Sort: {currentOption?.label}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            {dropdownLabel && (
              <DropdownMenuLabel className="text-[11px] text-muted-foreground font-normal">
                {dropdownLabel}
              </DropdownMenuLabel>
            )}
            {options.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <DropdownMenuItem
                  key={opt.value}
                  onClick={() => onChange(opt.value)}
                  className={cn(
                    'flex items-center justify-between gap-2 text-xs cursor-pointer',
                    isSelected && 'font-semibold text-primary'
                  )}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check className="size-3.5" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );
}

export default SortDropdown;
