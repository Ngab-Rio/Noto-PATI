"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox"

import { cn } from "@/lib/utils"

export type ComboboxOption = {
  value: string
  label: string
}

type ComboboxProps = {
  options: ComboboxOption[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  name?: string
  "aria-label"?: string
  className?: string
}

function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Pilih opsi",
  searchPlaceholder = "Cari opsi...",
  emptyMessage = "Tidak ada opsi yang cocok.",
  name,
  "aria-label": ariaLabel,
  className,
}: ComboboxProps) {
  const [selectedValue, setSelectedValue] = React.useState(value)
  const selectedOption = options.find((option) => option.value === selectedValue) ?? null
  const id = React.useId()

  React.useEffect(() => {
    setSelectedValue(value)
  }, [value])

  return (
    <ComboboxPrimitive.Root
      items={options}
      value={selectedOption}
      onValueChange={(nextValue) => {
        const nextSelectedValue = nextValue?.value ?? ""
        setSelectedValue(nextSelectedValue)
        onValueChange(nextSelectedValue)
      }}
      itemToStringLabel={(option) => option.label}
      itemToStringValue={(option) => option.value}
    >
      {name && <input type="hidden" name={name} value={selectedValue} />}
      <ComboboxPrimitive.InputGroup
        className={cn(
          "relative flex h-10 w-full cursor-pointer items-center rounded-lg border-2 border-border bg-background text-text transition-all focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          className,
        )}
      >
        <ComboboxPrimitive.Input
          id={id}
          aria-label={ariaLabel}
          placeholder={selectedOption ? selectedOption.label : placeholder || searchPlaceholder}
          className="h-full min-w-0 flex-1 cursor-pointer bg-transparent px-4 text-base outline-none placeholder:text-text-muted"
        />
        <ComboboxPrimitive.Trigger
          aria-label={`Buka ${ariaLabel ?? "pilihan"}`}
          className="flex size-9 items-center justify-center text-text-muted hover:text-text"
        >
          <ChevronsUpDown className="size-4" />
        </ComboboxPrimitive.Trigger>
      </ComboboxPrimitive.InputGroup>

      <ComboboxPrimitive.Portal>
        <ComboboxPrimitive.Positioner className="z-50 outline-none" sideOffset={4}>
          <ComboboxPrimitive.Popup className="w-[var(--anchor-width)] max-w-[var(--available-width)] overflow-hidden rounded-lg border border-border bg-surface text-text shadow-lg">
            <ComboboxPrimitive.Empty className="px-3 py-2 text-sm text-text-muted">
              {emptyMessage}
            </ComboboxPrimitive.Empty>
            <ComboboxPrimitive.List className="max-h-60 overflow-y-auto p-1 outline-none">
              {(option: ComboboxOption) => (
                <ComboboxPrimitive.Item
                  key={option.value}
                  value={option}
                  className="relative flex cursor-default items-center gap-2 rounded-md px-3 py-2 text-sm outline-none data-highlighted:bg-primary-soft data-highlighted:text-primary-dark"
                >
                  <ComboboxPrimitive.ItemIndicator className="flex size-4 items-center justify-center">
                    <Check className="size-4" />
                  </ComboboxPrimitive.ItemIndicator>
                  <span>{option.label}</span>
                </ComboboxPrimitive.Item>
              )}
            </ComboboxPrimitive.List>
          </ComboboxPrimitive.Popup>
        </ComboboxPrimitive.Positioner>
      </ComboboxPrimitive.Portal>
    </ComboboxPrimitive.Root>
  )
}

export { Combobox }
