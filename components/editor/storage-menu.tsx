'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { FolderOpen } from 'lucide-react'
import type { SavedNote } from '@/lib/note-storage'

interface StorageMenuProps {
  savedNotes: SavedNote[]
  onLoad: (id: string) => void
  onRefresh: () => void
}

export function StorageMenu({ savedNotes, onLoad, onRefresh }: StorageMenuProps) {
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
        {savedNotes.length === 0 ? (
          <p className="text-xs text-muted-foreground p-2 text-center">No saved entries</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {savedNotes.map((note) => (
              <button
                key={note.id}
                className="text-left px-2 py-1.5 rounded hover:bg-accent transition-colors"
                onClick={() => {
                  onLoad(note.id)
                  setOpen(false)
                }}
              >
                <span className="block truncate text-sm">{note.name}</span>
                <span className="block text-[11px] text-muted-foreground">
                  {note.savedAt ? new Date(note.savedAt).toLocaleString() : 'Legacy save'}
                </span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
