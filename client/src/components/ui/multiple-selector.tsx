import * as React from 'react'
import { X } from 'lucide-react'
import { Command, CommandGroup, CommandItem, CommandList } from '@/components/ui/command'
import { Command as CommandPrimitive } from 'cmdk'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface Option {
  value: string
  label: string
  disable?: boolean
  fixed?: boolean
}

interface MultipleSelectorProps {
  value?: Option[]
  defaultOptions?: Option[]
  options?: Option[]
  placeholder?: string
  loadingIndicator?: React.ReactNode
  emptyIndicator?: React.ReactNode
  delay?: number
  onSearch?: (value: string) => Promise<Option[]>
  onChange?: (options: Option[]) => void
  maxSelected?: number
  disabled?: boolean
  className?: string
  badgeClassName?: string
  creatable?: boolean
  hidePlaceholderWhenSelected?: boolean
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value)
  React.useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay || 500)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debouncedValue
}

const MultipleSelector = React.forwardRef<{ selectedValue: Option[]; input: HTMLInputElement }, MultipleSelectorProps>(
  ({ value, onChange, placeholder, defaultOptions = [], options: arrayOptions, delay, onSearch, loadingIndicator, emptyIndicator, maxSelected = Number.MAX_SAFE_INTEGER, disabled, className, badgeClassName, creatable = false, hidePlaceholderWhenSelected = false }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)
    const [open, setOpen] = React.useState(false)
    const [isLoading, setIsLoading] = React.useState(false)
    const [selected, setSelected] = React.useState<Option[]>(value || [])
    const [options, setOptions] = React.useState<Option[]>(defaultOptions)
    const [inputValue, setInputValue] = React.useState('')
    const debouncedSearchTerm = useDebounce(inputValue, delay || 500)

    React.useImperativeHandle(ref, () => ({ selectedValue: [...selected], input: inputRef.current as HTMLInputElement }), [selected])

    const handleUnselect = React.useCallback((option: Option) => {
      const newOptions = selected.filter(s => s.value !== option.value)
      setSelected(newOptions)
      onChange?.(newOptions)
    }, [selected, onChange])

    React.useEffect(() => { if (value) setSelected(value) }, [value])

    React.useEffect(() => {
      if (arrayOptions) setOptions(arrayOptions)
    }, [arrayOptions])

    React.useEffect(() => {
      if (!onSearch || !open) return
      const doSearch = async () => {
        setIsLoading(true)
        const res = await onSearch(debouncedSearchTerm)
        setOptions(res || [])
        setIsLoading(false)
      }
      if (debouncedSearchTerm || inputValue === '') doSearch()
    }, [debouncedSearchTerm, open, onSearch])

    const filteredOptions = options.filter(o => !selected.find(s => s.value === o.value))

    return (
      <Command shouldFilter={false} className="overflow-visible bg-transparent">
        <div className={cn('group rounded-md border border-input px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2', className)}>
          <div className="flex flex-wrap gap-1">
            {selected.map(option => (
              <Badge key={option.value} className={cn(badgeClassName)} data-fixed={option.fixed} data-disabled={disabled}>
                {option.label}
                <button
                  className={cn('ml-1 rounded-full outline-none', (disabled || option.fixed) && 'hidden')}
                  onClick={() => handleUnselect(option)}
                >
                  <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            ))}
            <CommandPrimitive.Input
              ref={inputRef}
              value={inputValue}
              disabled={disabled}
              onValueChange={setInputValue}
              onBlur={() => setTimeout(() => setOpen(false), 200)}
              onFocus={() => setOpen(true)}
              placeholder={hidePlaceholderWhenSelected && selected.length > 0 ? '' : placeholder}
              className="ml-2 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>
        {open && (
          <div className="relative mt-2">
            <CommandList className="z-10 w-full rounded-md border bg-popover text-popover-foreground shadow-md outline-none">
              {isLoading ? (
                <div className="py-6 text-center text-sm">{loadingIndicator || 'Searching...'}</div>
              ) : filteredOptions.length === 0 ? (
                <div className="py-6 text-center text-sm">
                  {emptyIndicator || 'No results found'}
                  {creatable && inputValue && (
                    <div
                      className="cursor-pointer text-emerald-400 hover:underline mt-1"
                      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation() }}
                      onClick={() => {
                        if (selected.length >= maxSelected) return
                        const newOpt = { value: inputValue, label: inputValue }
                        const newOptions = [...selected, newOpt]
                        setSelected(newOptions)
                        onChange?.(newOptions)
                        setInputValue('')
                      }}
                    >
                      Create &quot;{inputValue}&quot;
                    </div>
                  )}
                </div>
              ) : (
                <CommandGroup className="h-full overflow-auto">
                  {filteredOptions.map(option => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      disabled={option.disable}
                      onSelect={() => {
                        if (selected.length >= maxSelected) return
                        setInputValue('')
                        const newOptions = [...selected, option]
                        setSelected(newOptions)
                        onChange?.(newOptions)
                      }}
                      className="cursor-pointer"
                    >
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </div>
        )}
      </Command>
    )
  }
)

MultipleSelector.displayName = 'MultipleSelector'
export default MultipleSelector
