export interface ModelInfo {
  modelName: string
  inputSize: [number, number]
  aggregationMethod: string
}

export interface SliceOutputs {
  originalImageUrl?: string
  gradcamHeatmapUrl?: string
  gradcamOverlayUrl?: string
}

export interface SliceResultItem {
  slicePath: string
  predictedClass: number
  prediction: "benign" | "malignant"
  benignProb: number
  malignantProb: number
  outputs: SliceOutputs
}

export interface PredictionResult {
  prediction: "benign" | "malignant"
  confidence: number
  benignProbability: number
  malignantProbability: number
  modelInfo?: ModelInfo
  numSlices?: number
  sliceResults?: SliceResultItem[]
  raw?: unknown
}

function pctFromUnit(n: number): number {
  return n <= 1 ? n * 100 : n
}

function parseModelInfo(m: unknown): ModelInfo | undefined {
  if (!m || typeof m !== "object") return undefined
  const o = m as Record<string, unknown>
  const input = o.input_size
  let inputSize: [number, number] = [224, 224]
  if (
    Array.isArray(input) &&
    input.length >= 2 &&
    typeof input[0] === "number" &&
    typeof input[1] === "number"
  ) {
    inputSize = [input[0], input[1]]
  }
  return {
    modelName:
      typeof o.model_name === "string" ? o.model_name : "DenseNet121",
    inputSize,
    aggregationMethod:
      typeof o.aggregation_method === "string"
        ? o.aggregation_method
        : "average_softmax",
  }
}

function parseSliceOutputs(
  outputs: Record<string, unknown> | undefined,
): SliceOutputs {
  if (!outputs) return {}
  return {
    originalImageUrl:
      typeof outputs.original_image_url === "string"
        ? outputs.original_image_url
        : undefined,
    gradcamHeatmapUrl:
      typeof outputs.gradcam_heatmap_url === "string"
        ? outputs.gradcam_heatmap_url
        : undefined,
    gradcamOverlayUrl:
      typeof outputs.gradcam_overlay_url === "string"
        ? outputs.gradcam_overlay_url
        : undefined,
  }
}

function parseSliceResult(
  row: Record<string, unknown>,
  index: number,
): SliceResultItem | null {
  const predRaw = String(row.prediction ?? "").toLowerCase()
  const prediction: "benign" | "malignant" =
    predRaw.includes("malig") || row.predicted_class === 1
      ? "malignant"
      : "benign"

  const probs = row.probabilities as Record<string, unknown> | undefined
  let benignProb = 0
  let malignantProb = 0
  if (probs) {
    const b = probs.benign
    const m = probs.malignant
    benignProb = typeof b === "number" ? pctFromUnit(b) : 0
    malignantProb = typeof m === "number" ? pctFromUnit(m) : 0
  }

  const outputsRaw = row.outputs as Record<string, unknown> | undefined
  const slicePath =
    typeof row.slice_path === "string" ? row.slice_path : `slice_${index + 1}`

  return {
    slicePath,
    predictedClass:
      typeof row.predicted_class === "number"
        ? row.predicted_class
        : prediction === "malignant"
          ? 1
          : 0,
    prediction,
    benignProb,
    malignantProb,
    outputs: parseSliceOutputs(outputsRaw),
  }
}

function normalizeBackendSuccess(
  data: Record<string, unknown>,
): PredictionResult {
  const fp = String(data.final_prediction ?? "").toLowerCase()
  const prediction: "benign" | "malignant" =
    fp.includes("malig") ||
    data.final_class === 1 ||
    data.final_class === "1"
      ? "malignant"
      : "benign"

  const avg = data.avg_probabilities as Record<string, unknown> | undefined
  let benignProbability = 50
  let malignantProbability = 50
  if (avg) {
    const b = avg.benign
    const m = avg.malignant
    benignProbability = typeof b === "number" ? pctFromUnit(b) : benignProbability
    malignantProbability =
      typeof m === "number" ? pctFromUnit(m) : malignantProbability
  }

  let confidence = 50
  if (typeof data.confidence === "number") {
    confidence = pctFromUnit(data.confidence)
  }

  const rawSlices = data.slice_results
  const sliceResults: SliceResultItem[] = Array.isArray(rawSlices)
    ? rawSlices
        .map((x, i) => parseSliceResult(x as Record<string, unknown>, i))
        .filter((x): x is SliceResultItem => x !== null)
    : []

  const numSlices =
    typeof data.num_slices === "number"
      ? data.num_slices
      : sliceResults.length

  return {
    prediction,
    confidence,
    benignProbability,
    malignantProbability,
    modelInfo: parseModelInfo(data.model_info),
    numSlices,
    sliceResults,
    raw: data,
  }
}

export function normalizePredictionPayload(
  data: Record<string, unknown>,
): PredictionResult {
  if (data.status === "success") {
    const slice_results = Array.isArray(data.slice_results)
      ? data.slice_results
      : []
    return normalizeBackendSuccess({ ...data, slice_results })
  }

  const predRaw =
    (data.prediction as string) ??
    (data.label as string) ??
    (data.class_name as string) ??
    (data.final_prediction as string) ??
    ""
  const p = String(predRaw).toLowerCase()
  const prediction: "benign" | "malignant" =
    p.includes("malig") || p === "1" || p === "positive"
      ? "malignant"
      : "benign"

  const confidence =
    typeof data.confidence === "number"
      ? pctFromUnit(data.confidence)
      : typeof data.confidence_score === "number"
        ? pctFromUnit(data.confidence_score)
        : 85

  let benignProbability =
    typeof data.benign_probability === "number"
      ? pctFromUnit(data.benign_probability)
      : prediction === "benign"
        ? confidence
        : 100 - confidence

  let malignantProbability =
    typeof data.malignant_probability === "number"
      ? pctFromUnit(data.malignant_probability)
      : prediction === "malignant"
        ? confidence
        : 100 - confidence

  const avgLegacy = data.avg_probabilities as Record<string, unknown> | undefined
  if (
    avgLegacy &&
    typeof avgLegacy.benign === "number" &&
    typeof avgLegacy.malignant === "number"
  ) {
    benignProbability = pctFromUnit(avgLegacy.benign)
    malignantProbability = pctFromUnit(avgLegacy.malignant)
  }

  const sum = benignProbability + malignantProbability
  if (sum > 0 && Math.abs(sum - 100) > 1) {
    benignProbability = (benignProbability / sum) * 100
    malignantProbability = (malignantProbability / sum) * 100
  }

  return {
    prediction,
    confidence,
    benignProbability,
    malignantProbability,
    modelInfo: parseModelInfo(data.model_info),
    raw: data,
  }
}

export function extractGradCamImages(data: Record<string, unknown>): string[] {
  if (data.status === "success" && Array.isArray(data.slice_results)) {
    const urls: string[] = []
    for (const s of data.slice_results as Record<string, unknown>[]) {
      const o = s.outputs as Record<string, unknown> | undefined
      if (o && typeof o.gradcam_heatmap_url === "string") {
        urls.push(o.gradcam_heatmap_url)
      }
    }
    if (urls.length > 0) return urls
  }

  const candidates = [
    data.grad_cam,
    data.gradcam,
    data.grad_cams,
    data.gradcam_images,
    data.explanations,
  ]
  for (const c of candidates) {
    if (Array.isArray(c) && c.length > 0 && typeof c[0] === "string") {
      return (c as string[]).map((s) =>
        s.startsWith("data:") ? s : `data:image/png;base64,${s}`,
      )
    }
  }
  if (typeof data.grad_cam === "string") {
    const s = data.grad_cam as string
    return [s.startsWith("data:") ? s : `data:image/png;base64,${s}`]
  }
  return []
}

export function formatAggregationLabel(method: string): string {
  return method
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ")
}

export function sliceFileLabel(path: string, index: number): string {
  const normalized = path.replace(/\\/g, "/")
  const base = normalized.split("/").pop()
  return base && base.length > 0 ? base : `Slice ${index + 1}`
}
