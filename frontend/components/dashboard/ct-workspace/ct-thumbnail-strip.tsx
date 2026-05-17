"use client"

import { useCtWorkspaceStore } from "@/store/ctWorkspaceStore"

export function CtThumbnailStrip() {
  const slices = useCtWorkspaceStore((s) => s.slices)
  const currentIndex = useCtWorkspaceStore((s) => s.currentIndex)
  const selectionStart = useCtWorkspaceStore((s) => s.selectionStart)
  const selectionEnd = useCtWorkspaceStore((s) => s.selectionEnd)
  const handleSlicePointerDown = useCtWorkspaceStore(
    (s) => s.handleSlicePointerDown,
  )
  const handleSlicePointerEnter = useCtWorkspaceStore(
    (s) => s.handleSlicePointerEnter,
  )

  const inSelection = (i: number) => {
    if (selectionStart === null || selectionEnd === null) return false
    const lo = Math.min(selectionStart, selectionEnd)
    const hi = Math.max(selectionStart, selectionEnd)
    return i >= lo && i <= hi
  }

  return (
    <div className="mt-4 border-t border-border/40 pt-4">
      <p className="mb-2 text-xs font-medium text-muted-foreground">
        Filmstrip (select range)
      </p>
      <div className="flex gap-1.5 overflow-x-auto pb-2 [scrollbar-width:thin]">
        {slices.map((sl, i) => {
          const selected = inSelection(i)
          const active = i === currentIndex
          return (
            <button
              key={sl.id}
              type="button"
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                active
                  ? "border-primary ring-2 ring-primary/25"
                  : "border-transparent hover:border-border"
              } ${
                selected
                  ? "bg-accent/18 ring-1 ring-accent/40 border-accent/60"
                  : "bg-muted/40"
              }`}
              onPointerDown={(e) =>
                handleSlicePointerDown(i, e.shiftKey)
              }
              onPointerEnter={(e) =>
                handleSlicePointerEnter(i, e.buttons)
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={sl.dataUrl}
                alt=""
                className="h-full w-full object-cover"
                draggable={false}
              />
              <span className="absolute bottom-0.5 right-0.5 rounded bg-background/90 px-1 text-[10px] font-mono text-foreground/80">
                {i + 1}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
