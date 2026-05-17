"use client"

import { useMemo } from "react"
import { Crosshair, Loader2, Scan, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MAX_SELECTED_SLICES, OUTPUT_SIZE, useCtWorkspaceStore } from "@/store/ctWorkspaceStore"
import { USE_DUMMY_PREDICTION } from "@/lib/mock-prediction"
import { RoiCropPreview } from "./roi-crop-preview"

export function PredictionSidebar() {
  const slices = useCtWorkspaceStore((s) => s.slices)
  const currentIndex = useCtWorkspaceStore((s) => s.currentIndex)
  const roi = useCtWorkspaceStore((s) => s.roi)
  const initRoiOnSlice = useCtWorkspaceStore((s) => s.initRoiOnSlice)
  const clearRoi = useCtWorkspaceStore((s) => s.clearRoi)
  const canPredict = useCtWorkspaceStore((s) => s.canPredict)
  const predict = useCtWorkspaceStore((s) => s.predict)
  const isPredicting = useCtWorkspaceStore((s) => s.isPredicting)
  const predictionError = useCtWorkspaceStore((s) => s.predictionError)
  const selectionStart = useCtWorkspaceStore((s) => s.selectionStart)
  const selectionEnd = useCtWorkspaceStore((s) => s.selectionEnd)

  const rangeLo =
    selectionStart !== null && selectionEnd !== null
      ? Math.min(selectionStart, selectionEnd)
      : null
  const rangeHi =
    selectionStart !== null && selectionEnd !== null
      ? Math.max(selectionStart, selectionEnd)
      : null

  const previewSlice = useMemo(() => {
    if (!roi || slices.length === 0) return null
    return slices[roi.sliceIndex] ?? null
  }, [roi, slices])

  const enabled = canPredict() && !isPredicting
  const rangeOk =
    rangeLo !== null &&
    rangeHi !== null &&
    rangeHi - rangeLo + 1 >= 2 &&
    rangeHi - rangeLo + 1 <= MAX_SELECTED_SLICES
  const roiAllowedOnCurrentSlice =
    rangeOk && rangeLo !== null && rangeHi !== null
      ? currentIndex >= rangeLo && currentIndex <= rangeHi
      : false

  return (
    <div className="flex min-h-0 flex-col gap-4 rounded-2xl border border-border/50 bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Scan className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">ROI & diagnosis</h2>
          <p className="text-sm text-muted-foreground">
            Draw a box on one selected slice. The system preprocesses it to {OUTPUT_SIZE}x{OUTPUT_SIZE} for the model.
          </p>
        </div>
      </div>

      {USE_DUMMY_PREDICTION && (
        <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent px-3.5 py-3">
          <p className="text-xs font-medium text-foreground">Preview mode</p>
          <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
            Sample diagnosis and per-slice visuals load here with no API. Toggle
            mock mode in{" "}
            <span className="font-mono text-[10px] text-foreground/80">
              lib/mock-prediction.ts
            </span>{" "}
            when you are ready to connect the backend.
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          disabled={slices.length === 0 || isPredicting || !roiAllowedOnCurrentSlice}
          onClick={() => initRoiOnSlice(currentIndex)}
        >
          <Crosshair className="mr-2 h-4 w-4" />
          Draw ROI on current selected slice
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-muted-foreground"
          disabled={!roi || isPredicting}
          onClick={() => clearRoi()}
        >
          Clear ROI
        </Button>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">
          Model input preview ({OUTPUT_SIZE}x{OUTPUT_SIZE})
        </p>
        <div className="mx-auto aspect-square w-full max-w-[240px] overflow-hidden rounded-xl bg-zinc-100 ring-1 ring-border/60 dark:bg-zinc-950">
          {previewSlice && roi ? (
            <RoiCropPreview
              dataUrl={previewSlice.dataUrl}
              roi={roi}
              sliceW={previewSlice.width}
              sliceH={previewSlice.height}
            />
          ) : (
            <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
              Place ROI to see the crop that will be sent across the selected slices.
            </div>
          )}
        </div>
      </div>

      {predictionError && (
        <Alert variant="destructive">
          <AlertDescription className="text-sm">{predictionError}</AlertDescription>
        </Alert>
      )}

      <Button
        type="button"
        className="w-full rounded-xl py-6 text-base shadow-lg shadow-primary/20"
        disabled={!enabled}
        onClick={() => void predict()}
      >
        {isPredicting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Running diagnosis...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Diagnose
          </>
        )}
      </Button>
    </div>
  )
}
