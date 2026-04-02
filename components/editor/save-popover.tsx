'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Save } from 'lucide-react'

interface SavePopoverProps {
  onSave: (name: string) => void
}

export function SavePopover({ onSave }: SavePopoverProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')

  const handleSubmit = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(trimmed)
    setName('')
    setOpen(false)
  }

  const trigger = (
    <PopoverTrigger asChild>
      <Button size="icon" variant="ghost">
        <Save />
      </Button>
    </PopoverTrigger>
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      {open ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>
      )}

      <PopoverContent align="end" className="w-64 p-3">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit()
          }}
          className="flex flex-col gap-2"
        >
          <label className="text-sm font-medium">Save as</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter a name..."
            autoFocus
            className="h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
          <Button size="sm" type="submit" disabled={!name.trim()}>
            Save
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
