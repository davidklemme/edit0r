'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FolderOpen } from 'lucide-react'

interface StorageMenuProps {
  savedKeys: string[]
  onLoad: (key: string) => void
  onRefresh: () => void
}

export function StorageMenu({ savedKeys, onLoad, onRefresh }: StorageMenuProps) {
  const [open, setOpen] = useState(false)

  const trigger = (
    <PopoverTrigger asChild>
      <Button size="icon" variant="ghost">
        <FolderOpen />
      </Button>
    </PopoverTrigger>
  )

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (isOpen) onRefresh()
      }}
    >
      {open ? (
        trigger
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent>Load Saved</TooltipContent>
        </Tooltip>
      )}

      <PopoverContent align="end" className="w-56 p-2">
        {savedKeys.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2 text-center">No saved entries</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {savedKeys.map((key) => (
              <button
                key={key}
                className="text-left text-sm px-2 py-1.5 rounded hover:bg-accent transition-colors truncate"
                onClick={() => {
                  onLoad(key)
                  setOpen(false)
                }}
              >
                {key}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
