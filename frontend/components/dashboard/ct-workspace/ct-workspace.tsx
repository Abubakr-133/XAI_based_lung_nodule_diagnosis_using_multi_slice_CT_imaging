"use client"

import { Button } from "@/components/ui/button"
import { ResultsPanel } from "@/components/dashboard/results-panel"
import { cn } from "@/lib/utils"
import { useCtWorkspaceStore } from "@/store/ctWorkspaceStore"
import { DicomUploadPanel } from "./dicom-upload-panel"
import { CtSliceViewport } from "./ct-slice-viewport"
import { CtSelectionBar } from "./ct-selection-bar"
import { PredictionSidebar } from "./prediction-sidebar"

export function CtWorkspace() {
  const isPredicting = useCtWorkspaceStore((s) => s.isPredicting)
  const prediction = useCtWorkspaceStore((s) => s.prediction)
  const gradCamDataUrls = useCtWorkspaceStore((s) => s.gradCamDataUrls)
  const resetPrediction = useCtWorkspaceStore((s) => s.resetPrediction)
  const selectionStart = useCtWorkspaceStore((s) => s.selectionStart)
  const selectionEnd = useCtWorkspaceStore((s) => s.selectionEnd)

  const slicesAnalyzed =
    selectionStart !== null && selectionEnd !== null
      ? Math.abs(selectionEnd - selectionStart) + 1
      : undefined

  return (
    <div className="space-y-4" aria-busy={isPredicting}>
      <div className="grid gap-4 xl:grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(280px,340px)] xl:items-start">
        <aside
          className={cn(
            "min-h-0 xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto",
            isPredicting && "pointer-events-none opacity-50",
          )}
        >
          <DicomUploadPanel />
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col gap-3">
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              isPredicting && "pointer-events-none opacity-50",
            )}
          >
            <CtSliceViewport />
          </div>
          <div className={cn(isPredicting && "pointer-events-none opacity-50")}>
            <CtSelectionBar />
          </div>
        </section>

        <aside className="min-h-0 xl:sticky xl:top-24 xl:max-h-[calc(100vh-6rem)] xl:overflow-y-auto">
          <PredictionSidebar />
        </aside>
      </div>

      {prediction && (
        <section className="mx-auto w-full max-w-5xl space-y-4">
          <div className="flex justify-center">
            <Button type="button" variant="outline" size="sm" onClick={() => resetPrediction()}>
              Clear results
            </Button>
          </div>

          <ResultsPanel
            prediction={prediction.prediction}
            confidence={prediction.confidence}
            benignProbability={prediction.benignProbability}
            malignantProbability={prediction.malignantProbability}
            slicesAnalyzed={slicesAnalyzed}
            modelInfo={prediction.modelInfo}
            numSlices={prediction.numSlices}
            sliceResults={prediction.sliceResults}
          />

          {gradCamDataUrls.length > 0 &&
            (!prediction.sliceResults || prediction.sliceResults.length === 0) && (
              <div className="mx-auto max-w-4xl rounded-2xl border border-border/50 bg-card p-4">
                <h3 className="mb-3 text-center text-sm font-semibold">Grad-CAM</h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {gradCamDataUrls.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={i}
                      src={url}
                      alt={`Grad-CAM ${i + 1}`}
                      className="rounded-lg border border-border/40 bg-slate-950 object-contain"
                    />
                  ))}
                </div>
              </div>
            )}
        </section>
      )}
    </div>
  )
}
