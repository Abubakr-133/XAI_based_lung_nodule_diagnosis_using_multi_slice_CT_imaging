"use client"

import { useEffect } from "react"
import { Layers } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { useCtWorkspaceStore } from "@/store/ctWorkspaceStore"
import { RoiCanvasOverlay } from "./roi-canvas-overlay"
import { CtThumbnailStrip } from "./ct-thumbnail-strip"

export function CtSliceViewport() {
  const slices = useCtWorkspaceStore((s) => s.slices)
  const currentIndex = useCtWorkspaceStore((s) => s.currentIndex)
  const setCurrentIndex = useCtWorkspaceStore((s) => s.setCurrentIndex)
  const roi = useCtWorkspaceStore((s) => s.roi)

  useEffect(() => {
    const up = () => useCtWorkspaceStore.getState().endSelectionPointer()
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
    return () => {
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
    }
  }, [])

  if (slices.length === 0) {
    return (
      <div className="flex min-h-[320px] flex-1 flex-col rounded-2xl border border-border/50 bg-card p-6">
        <div className="flex items-center gap-3 border-b border-border/40 pb-4">
          <div className="rounded-xl bg-accent/10 p-2">
            <Layers className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold">Slice viewer</h2>
            <p className="text-sm text-muted-foreground">
              Load DICOM slices to preview the stack
            </p>
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center rounded-xl bg-zinc-100 text-sm text-muted-foreground dark:bg-zinc-950">
          No volume loaded
        </div>
      </div>
    )
  }

  const slice = slices[currentIndex]

  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-border/50 bg-card p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-accent/10 p-2">
            <Layers className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-semibold">Axial CT viewer</h2>
            <p className="text-sm text-muted-foreground">
              Slice {currentIndex + 1} / {slices.length}
              {roi && (
                <span className="ml-2 text-cyan-600 dark:text-cyan-400">
                  · ROI on slice {roi.sliceIndex + 1}
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
        {/* Fixed-size viewer (no manual resizing) */}
        <div className="relative mx-auto w-full max-w-4xl rounded-xl bg-zinc-100 ring-1 ring-zinc-300/80 dark:bg-zinc-950 dark:ring-zinc-800 aspect-square max-h-[75vh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slice.dataUrl}
            alt={`Slice ${currentIndex + 1}`}
            className="pointer-events-none absolute inset-0 m-auto h-full w-full object-contain"
            draggable={false}
          />
          <RoiCanvasOverlay imageWidth={slice.width} imageHeight={slice.height} />
        </div>

        {/* Always-visible stack selector + filmstrip */}
        <div className="flex min-h-0 flex-col gap-3 pb-1">
          <div className="space-y-2 px-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                Stack position
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {currentIndex + 1} / {slices.length}
              </span>
            </div>
            <Slider
              value={[currentIndex]}
              min={0}
              max={slices.length - 1}
              step={1}
              onValueChange={(v) => setCurrentIndex(v[0] ?? 0)}
              className="py-2"
            />
          </div>

          <CtThumbnailStrip />
        </div>
      </div>

      <p className="mt-3 text-center text-[11px] text-muted-foreground">
        Use slider or filmstrip to navigate · Shift+click or drag thumbnails — contiguous only, 2–5 slices
      </p>
    </div>
  )
}
