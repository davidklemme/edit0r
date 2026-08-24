# Notes file bridge

edit0r stays stateless — no cookies, no telemetry, no API keys, no `fetch`. The way notes reach an AI assistant or a knowledge graph is therefore the filesystem, not the network:

```
edit0r (browser)            disk                    notes-ingest workflow    knowledge graph
  append block  ──────►  edit0r-inbox.md  ──────►  clean / extract  ──────►  kg_record
  (File System                                     dedupe / gate            kg_update
   Access API)                                     advance watermark        kg_relate
```

The editor's only job is to append text to a file the user picked. Nothing leaves the machine until the local watcher hands it to the graph. No API key in `localStorage`, no CORS, and no waiting on a model before you can keep typing.

The other half lives in [`bmad-kmplzn`](https://github.com/Komplyzen/bmad-kmplzn) as the `notes-ingest` workflow.

## What gets written

One immutable block per append. The sentinel is an HTML comment, so the file stays readable markdown while remaining trivially greppable:

```
<!-- edit0r:snapshot ts=2026-08-24T18:04:57.123Z id=3f9a2b7c1d4e5f60 name="rema call" project=rema -->
Peter will not hand over the Ivanti inventory without Lorig's sign-off.
```

| Field | Required | Purpose |
|---|---|---|
| `ts` | yes | ISO-8601 UTC. Lets the watcher resolve relative dates in the body. |
| `id` | yes | Hash of `ts` + body. Keys the watcher's exactly-once ledger. |
| `name` | no | The save name typed in the popover. |
| `project` | no | Knowledge-graph project. Without it the watcher asks, or parks the note. |

The file is **append-only**: blocks are written at the current end of file and never rewritten. Editing or truncating it is detected on the ingest side and reported.

Two details worth knowing:

- A body that itself contains `<!-- edit0r:snapshot` would split one block into two on the ingest side, so that exact string is rewritten to `<!-- edit0r_snapshot`. One visible character, on a string that essentially never occurs, instead of an invisible edit to someone's notes.
- Blocks after the first get a leading newline unconditionally. That costs one blank line between blocks and avoids reading the file's last byte back just to find out whether one was needed.

## Browser support

`showSaveFilePicker` is Chromium-only. Firefox and Safari have no equivalent, so `isNoteFileSupported()` gates the whole feature and the toolbar button is not rendered at all rather than throwing on click.

The `FileSystemFileHandle` is persisted in IndexedDB — it is structured-cloneable, and `localStorage` can only hold strings. On reload the handle comes back but its write permission does not: the browser reports `prompt`, and restoring it needs a user gesture. Hence the three states in `useNoteFile`:

| Status | Meaning |
|---|---|
| `unsupported` | No File System Access API. Nothing is rendered. |
| `disconnected` | Supported, no file chosen yet. |
| `needs-permission` | File remembered, write access needs one click. |
| `ready` | Appends will land on disk. |

## Files

| Path | Role |
|---|---|
| `lib/note-capture.ts` | The block format. Pure strings, so the contract is unit-testable without the FS API. |
| `lib/note-file.ts` | Picker, IndexedDB handle persistence, the append itself. |
| `hooks/use-note-file.ts` | State machine, permission handling, append queue. |
| `components/editor/note-file-popover.tsx` | Toolbar affordance. |

Appends are chained through a promise queue in the hook: two fast clicks would otherwise compute the same write position and clobber each other. The design assumes this tab is the only writer, which holds because the watcher only ever reads.

`Cmd/Ctrl+Shift+S` appends using the last name and project, so repeat capture is one keystroke.

## Relationship to localStorage snapshots

`lib/note-storage.ts` keeps append-only snapshots in `localStorage` under `edit0r:snapshot:`. That is in-browser history for the editor itself and is unrelated to this bridge — it never touches the filesystem.
