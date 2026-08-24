'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HardDriveDownload } from 'lucide-react'
import type { CaptureMeta } from '@/lib/note-capture'
import type { NoteFileStatus } from '@/hooks/use-note-file'

export interface NoteFilePopoverProps {
  status: NoteFileStatus
  fileName: string | null
  meta: CaptureMeta
  isAppending: boolean
  hasContent: boolean
  onConnect: () => void
  onChangeFile: () => void
  onAppend: (meta: CaptureMeta) => void
}

const fieldClass =
  'h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function NoteFilePopover({
  status,
  fileName,
  meta,
  isAppending,
  hasContent,
  onConnect,
  onChangeFile,
  onAppend,
}: NoteFilePopoverProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(meta.name ?? '')
  const [project, setProject] = useState(meta.project ?? '')

  // Firefox and Safari have no showSaveFilePicker — offer nothing rather than a
  // button that throws.
  if (status === 'unsupported') return null

  const handleSubmit = () => {
    if (!hasContent || isAppending) return
    onAppend({ name: name.trim() || undefined, project: project.trim() || undefined })
    setOpen(false)
  }

  const trigger = (
    <PopoverTrigger asChild>
      <Button size="icon" variant="ghost" aria-label="Append to notes file">
        <HardDriveDownload />
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
          <TooltipContent>Append to notes file</TooltipContent>
        </Tooltip>
      )}

      <PopoverContent align="end" className="w-72 p-3">
        {status === 'disconnected' ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Append to a local file</p>
            <p className="text-xs text-muted-foreground">
              Pick a file once. Every append is written straight to disk — nothing is uploaded.
            </p>
            <Button size="sm" onClick={onConnect}>
              Choose notes file…
            </Button>
          </div>
        ) : status === 'needs-permission' ? (
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">Reconnect {fileName}</p>
            <p className="text-xs text-muted-foreground">
              The browser drops write access on reload and needs one click to restore it.
            </p>
            <Button size="sm" onClick={onConnect}>
              Grant write access
            </Button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
            className="flex flex-col gap-2"
          >
            <label className="text-sm font-medium" htmlFor="note-file-name">
              Append a block
            </label>
            <input
              id="note-file-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name (optional)"
              autoFocus
              className={fieldClass}
            />
            <input
              id="note-file-project"
              type="text"
              value={project}
              onChange={(e) => setProject(e.target.value)}
              placeholder="Project (optional)"
              className={fieldClass}
            />
            <Button size="sm" type="submit" disabled={!hasContent || isAppending}>
              {isAppending ? 'Appending…' : 'Append'}
            </Button>
            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="truncate text-[11px] text-muted-foreground" title={fileName ?? ''}>
                {fileName}
              </span>
              <button
                type="button"
                onClick={onChangeFile}
                className="text-[11px] text-muted-foreground underline hover:text-foreground"
              >
                Change
              </button>
            </div>
          </form>
        )}
      </PopoverContent>
    </Popover>
  )
}
