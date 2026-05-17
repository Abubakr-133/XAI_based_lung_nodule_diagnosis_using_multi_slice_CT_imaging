"use client"

import type { PredictionResponse } from "@/lib/prediction-integration"

export function PredictionResponseView({
  result,
}: {
  result: PredictionResponse | null
}) {
  if (!result) return null

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-card p-4">
      <div>
        <h3 className="text-lg font-semibold">Prediction</h3>
        <p className="text-sm text-muted-foreground">
          Final model decision and Grad-CAM outputs
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Final Prediction</p>
          <p className="mt-1 text-xl font-bold">{result.final_prediction}</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Confidence</p>
          <p className="mt-1 text-xl font-bold">{(result.confidence * 100).toFixed(2)}%</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Benign</p>
          <p className="mt-1 text-lg font-semibold">{(result.avg_probabilities.benign * 100).toFixed(2)}%</p>
        </div>
        <div className="rounded-xl border border-border/50 bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Avg Malignant</p>
          <p className="mt-1 text-lg font-semibold">{(result.avg_probabilities.malignant * 100).toFixed(2)}%</p>
        </div>
      </div>

      <div className="space-y-3">
        {result.slice_results.map((slice) => (
          <div
            key={slice.slice_name}
            className="space-y-3 rounded-xl border border-border/50 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{slice.slice_name}</p>
              <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                {slice.prediction}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Benign: {(slice.probabilities.benign * 100).toFixed(2)}% · Malignant:{" "}
              {(slice.probabilities.malignant * 100).toFixed(2)}%
            </p>
            <div className="grid gap-2 sm:grid-cols-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slice.outputs.original_image_url}
                alt={`${slice.slice_name} original`}
                className="rounded-lg border border-border/50 bg-black object-contain"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slice.outputs.gradcam_heatmap_url}
                alt={`${slice.slice_name} heatmap`}
                className="rounded-lg border border-border/50 bg-black object-contain"
                loading="lazy"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={slice.outputs.gradcam_overlay_url}
                alt={`${slice.slice_name} overlay`}
                className="rounded-lg border border-border/50 bg-black object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
