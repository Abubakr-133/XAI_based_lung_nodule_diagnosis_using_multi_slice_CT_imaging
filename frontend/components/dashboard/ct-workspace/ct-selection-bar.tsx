"use client"

import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MAX_SELECTED_SLICES,
  OUTPUT_SIZE,
  useCtWorkspaceStore,
} from "@/store/ctWorkspaceStore"

export function CtSelectionBar() {
  const slices = useCtWorkspaceStore((s) => s.slices)
  const selectionStart = useCtWorkspaceStore((s) => s.selectionStart)
  const selectionEnd = useCtWorkspaceStore((s) => s.selectionEnd)
  const roi = useCtWorkspaceStore((s) => s.roi)

  if (slices.length === 0) return null

  const lo =
    selectionStart !== null && selectionEnd !== null
      ? Math.min(selectionStart, selectionEnd)
      : null
  const hi =
    selectionStart !== null && selectionEnd !== null
      ? Math.max(selectionStart, selectionEnd)
      : null
  const count = lo !== null && hi !== null ? hi - lo + 1 : 0
  const roiOnSelected =
    roi &&
    lo !== null &&
    hi !== null &&
    roi.sliceIndex >= lo &&
    roi.sliceIndex <= hi

  let hint: string | null = null
  if (count < 2) {
    hint = `Select 2-${MAX_SELECTED_SLICES} consecutive slices (Shift+click or drag on the filmstrip).`
  } else if (count > MAX_SELECTED_SLICES) {
    hint = `Slice selection cannot exceed ${MAX_SELECTED_SLICES} contiguous slices.`
  } else if (!roi) {
    hint = `Draw ROI on exactly one of the selected slices. The system preprocesses it automatically and resizes it to ${OUTPUT_SIZE}x${OUTPUT_SIZE}.`
  } else if (!roiOnSelected) {
    hint =
      "ROI must be drawn on a slice inside the selected range."
  }

  return (
    <div className="shrink-0 space-y-2">
      <div className="rounded-xl border border-border/50 bg-muted/20 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Guidelines for Slice & ROI Selection
        </p>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>Select 2-20 consecutive slices where the nodule is clearly visible.</li>
          <li>Prefer central slices (where the nodule appears most prominent).</li>
          <li>Draw ROI tightly around the nodule (avoid background areas).</li>
          <li>Preprocessing is handled automatically by the system after slice and ROI selection.</li>
          <li>ROI size can be flexible; the system resizes it to 224x224 automatically.</li>
          <li>Ensure the selected slices and ROI represent the same region consistently.</li>
          <li>ROI must be drawn on exactly one of the selected slices.</li>
        </ul>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 px-4 py-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Selected slices
          </p>
          <p className="font-mono text-sm font-semibold">
            {lo !== null && hi !== null ? `Slice ${lo + 1}-${hi + 1} (${count})` : "None"}
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          {roi ? (
            <>
              ROI:{" "}
              <span className="font-mono text-foreground">
                {roi.width}x{roi.height}px @ ({roi.x}, {roi.y}) - slice{" "}
                {roi.sliceIndex + 1}
              </span>
              <span className="mt-1 block text-xs">
                Automatic preprocessing: {OUTPUT_SIZE}x{OUTPUT_SIZE} per slice to API
              </span>
            </>
          ) : (
            "No ROI"
          )}
        </div>
      </div>
      {hint && (
        <Alert variant="default" className="border-amber-500/40 bg-amber-500/5 py-2">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-sm text-foreground/90">
            {hint}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
