"use client"

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type AutocompleteProps = {
  items: string[];
  value?: string | null;
  onChange?: (val: string | null) => void;
  onSelect?: (val: string) => void;
  placeholder?: string;
  className?: string;
};

export function Autocomplete({ items, value, onChange, onSelect, placeholder, className }: AutocompleteProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>(value || "");
  const [activeIndex, setActiveIndex] = React.useState<number>(-1);
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  const filtered = React.useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (!q) return items.slice(0, 50);
    return items.filter((i) => i.toLowerCase().includes(q)).slice(0, 50);
  }, [items, inputValue]);

  React.useEffect(() => {
    if (!open) setActiveIndex(-1);
  }, [open]);

  const pick = (item: string) => {
    setInputValue(item);
    setOpen(false);
    onChange?.(item);
    onSelect?.(item);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((idx) => Math.min(idx + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => Math.max(idx - 1, 0));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0 && activeIndex < filtered.length) {
        e.preventDefault();
        pick(filtered[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  // close on outside click
  React.useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <Input
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          onChange?.(e.target.value || null);
          setOpen(true);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-haspopup="listbox"
      />

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          aria-label="Suggestions"
          className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {filtered.map((it, idx) => (
            <li
              key={it}
              role="option"
              aria-selected={idx === activeIndex}
              onMouseDown={(e) => {
                // onMouseDown to prevent blur before click
                e.preventDefault();
                pick(it);
              }}
              onMouseEnter={() => setActiveIndex(idx)}
              className={cn(
                "cursor-pointer rounded px-2 py-1 text-sm",
                idx === activeIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted"
              )}
            >
              {it}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Autocomplete;
