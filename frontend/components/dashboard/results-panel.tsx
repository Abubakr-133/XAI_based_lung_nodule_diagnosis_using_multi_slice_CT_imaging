"use client"

import { motion } from "framer-motion"
import {
  CheckCircle2,
  AlertTriangle,
  Info,
  Brain,
  BarChart3,
  Layers,
  ImageIcon,
  Flame,
  Scan,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import type { ModelInfo, SliceResultItem } from "@/lib/prediction-api"
import { formatAggregationLabel, sliceFileLabel } from "@/lib/prediction-api"
import { cn } from "@/lib/utils"

interface ResultsPanelProps {
  prediction: "benign" | "malignant"
  confidence: number
  benignProbability: number
  malignantProbability: number
  /** From UI selection range when backend does not report slice count */
  slicesAnalyzed?: number
  modelInfo?: ModelInfo
  numSlices?: number
  sliceResults?: SliceResultItem[]
}

function SliceResultCard({
  slice,
  index,
  total,
}: {
  slice: SliceResultItem
  index: number
  total: number
}) {
  const label = sliceFileLabel(slice.slicePath, index)
  const views = [
    { id: "original", label: "Original", url: slice.outputs.originalImageUrl },
    {
      id: "heatmap",
      label: "Grad-CAM",
      url: slice.outputs.gradcamHeatmapUrl,
    },
    { id: "overlay", label: "Overlay", url: slice.outputs.gradcamOverlayUrl },
  ].filter(
    (v): v is { id: string; label: string; url: string } =>
      typeof v.url === "string" && v.url.length > 0,
  )

  const isMal = slice.prediction === "malignant"

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      className="mx-auto flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-b from-card via-card to-muted/15 shadow-sm ring-1 ring-border/30 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2 border-b border-border/50 bg-muted/25 px-4 py-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-background/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              {index + 1} / {total}
            </span>
            <h4 className="truncate text-sm font-medium" title={label}>
              {label}
            </h4>
          </div>
          <div className="mt-2">
            <Badge
              variant={isMal ? "destructive" : "secondary"}
              className={
                !isMal
                  ? "border-green-500/30 bg-green-500/15 text-green-700 dark:text-green-400"
                  : undefined
              }
            >
              {slice.prediction.toUpperCase()}
            </Badge>
          </div>
        </div>
      </div>

      <div className="space-y-2 px-4 py-3">
        <div className="flex justify-between text-[11px] text-muted-foreground">
          <span>Benign {slice.benignProb.toFixed(1)}%</span>
          <span>Malignant {slice.malignantProb.toFixed(1)}%</span>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
          <motion.div
            className="bg-gradient-to-r from-green-600 to-green-400"
            initial={{ width: 0 }}
            animate={{ width: `${slice.benignProb}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
          <motion.div
            className="bg-gradient-to-r from-red-600 to-red-400"
            initial={{ width: 0 }}
            animate={{ width: `${slice.malignantProb}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="relative border-t border-border/40 bg-slate-950 p-2">
        {views.length === 0 ? (
          <div className="flex h-32 sm:h-40 lg:h-44 items-center justify-center p-4 text-center">
            <p className="text-xs text-muted-foreground">
              No image URLs returned for this slice.
            </p>
          </div>
        ) : views.length === 1 ? (
          <div className="relative h-32 sm:h-40 lg:h-44 overflow-hidden rounded-xl bg-slate-900/50 ring-1 ring-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={views[0].url}
              alt={views[0].label}
              className="h-full w-full object-contain"
              loading="lazy"
            />
          </div>
        ) : (
          <Tabs defaultValue={views[0].id} className="w-full">
            <TabsList
              className={cn(
                "mb-2 grid h-auto w-full gap-0.5 p-1",
                views.length === 2 && "grid-cols-2",
                views.length >= 3 && "grid-cols-3",
              )}
            >
              {views.map((v) => (
                <TabsTrigger
                  key={v.id}
                  value={v.id}
                  className="gap-1 px-1 py-1.5 text-[10px] sm:text-xs"
                >
                  {v.id === "original" && (
                    <ImageIcon className="h-3 w-3 opacity-70" />
                  )}
                  {v.id === "heatmap" && (
                    <Flame className="h-3 w-3 opacity-70" />
                  )}
                  {v.id === "overlay" && <Scan className="h-3 w-3 opacity-70" />}
                  <span className="truncate">{v.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
            {views.map((v) => (
              <TabsContent key={v.id} value={v.id} className="mt-0">
                <div className="relative h-32 sm:h-40 lg:h-44 overflow-hidden rounded-xl bg-slate-900/50 ring-1 ring-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={v.url}
                    alt={`${label} — ${v.label}`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </motion.div>
  )
}

export function ResultsPanel({
  prediction,
  confidence,
  benignProbability,
  malignantProbability,
  slicesAnalyzed,
  modelInfo,
  numSlices,
  sliceResults,
}: ResultsPanelProps) {
  const isBenign = prediction === "benign"

  const sliceCountLabel =
    numSlices != null
      ? `${numSlices} slice${numSlices !== 1 ? "s" : ""}`
      : slicesAnalyzed != null
        ? `${slicesAnalyzed} slice${slicesAnalyzed !== 1 ? "s" : ""}`
        : "—"

  const arch = modelInfo?.modelName ?? "DenseNet121"
  const inputW = modelInfo?.inputSize?.[0] ?? 224
  const inputH = modelInfo?.inputSize?.[1] ?? 224
  const aggregation = modelInfo?.aggregationMethod
    ? formatAggregationLabel(modelInfo.aggregationMethod)
    : "Avg. Softmax"

  const hasSliceGallery =
    Array.isArray(sliceResults) && sliceResults.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-2xl rounded-2xl bg-card border border-border/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-accent/10">
          <BarChart3 className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold">Diagnosis Results</h2>
          <p className="text-sm text-muted-foreground">
            AI-powered classification output
          </p>
        </div>
      </div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className={`rounded-2xl p-6 text-center ${
          isBenign
            ? "bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20"
            : "bg-gradient-to-br from-red-500/10 via-red-500/5 to-transparent border border-red-500/20"
        }`}
      >
        <div
          className={`inline-flex p-4 rounded-full mb-4 ${
            isBenign ? "bg-green-500/20" : "bg-red-500/20"
          }`}
        >
          {isBenign ? (
            <CheckCircle2 className="h-10 w-10 text-green-500" />
          ) : (
            <AlertTriangle className="h-10 w-10 text-red-500" />
          )}
        </div>

        <h3
          className={`text-3xl font-bold mb-2 ${
            isBenign
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          }`}
        >
          {prediction.toUpperCase()}
        </h3>

        <p className="text-muted-foreground mb-4">Classification Result</p>

        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isBenign
              ? "bg-green-500/10 text-green-600 dark:text-green-400"
              : "bg-red-500/10 text-red-600 dark:text-red-400"
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${isBenign ? "bg-green-500" : "bg-red-500"}`}
          />
          {isBenign ? "Low Risk" : "High Risk - Requires Attention"}
        </div>
      </motion.div>

      <div className="mt-6 p-4 rounded-xl bg-muted/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Confidence Score</span>
          <span className="text-2xl font-bold">{confidence.toFixed(1)}%</span>
        </div>
        <Progress value={confidence} className="h-3" />
      </div>

      <div className="mt-6 space-y-4">
        <h4 className="text-sm font-medium">Class Probabilities (aggregated)</h4>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              Benign
            </span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {benignProbability.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${benignProbability}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              Malignant
            </span>
            <span className="font-medium text-red-600 dark:text-red-400">
              {malignantProbability.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${malignantProbability}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400"
            />
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-primary/5 border border-primary/10">
        <div className="flex items-start gap-3">
          <Brain className="h-5 w-5 text-primary mt-0.5 shrink-0" />
          <div>
            <h4 className="text-sm font-medium mb-1">AI Interpretation</h4>
            <p className="text-sm text-muted-foreground">
              {isBenign
                ? "The analyzed CT slices show characteristics consistent with benign nodule morphology. No significant indicators of malignancy were identified by the model. Regular follow-up is recommended as per clinical guidelines."
                : "The analyzed CT slices exhibit features that may indicate malignant characteristics. Further clinical evaluation and potentially biopsy confirmation are strongly recommended."}
            </p>
          </div>
        </div>
      </div>

      {hasSliceGallery && (
        <>
          <Separator className="my-8" />
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2 rounded-xl bg-primary/10 px-3 py-2">
                <Layers className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Per-slice output</span>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {sliceResults!.length} slice{sliceResults!.length !== 1 ? "s" : ""}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Each row matches one input slice. Available Grad-CAM views depend on
              the backend; tabs appear only when URLs are provided.
            </p>
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2 justify-items-center">
              {sliceResults!.map((slice, i) => (
                <SliceResultCard
                  key={`${slice.slicePath}-${i}`}
                  slice={slice}
                  index={i}
                  total={sliceResults!.length}
                />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="mt-6 pt-6 border-t border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Info className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Model Information</span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Architecture</span>
            <p className="font-medium leading-snug">{arch}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Input Size</span>
            <p className="font-medium">
              {inputW} × {inputH}
            </p>
          </div>
          <div>
            <span className="text-muted-foreground">Aggregation</span>
            <p className="font-medium leading-snug">{aggregation}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Slices analyzed</span>
            <p className="font-medium">{sliceCountLabel}</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
