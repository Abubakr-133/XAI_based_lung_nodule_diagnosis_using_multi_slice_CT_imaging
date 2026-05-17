import type { PredictionResult, SliceResultItem } from "@/lib/prediction-api"

/** Set to `false` to call the real `/api/predict` backend again. */
export const USE_DUMMY_PREDICTION = false

function svgDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/** CT-style radial mock (original) */
function mockOriginalSvg(index: number): string {
  const seed = (index + 1) * 17
  return svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224" width="224" height="224">
  <defs>
    <radialGradient id="g${seed}" cx="45%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
  </defs>
  <rect width="224" height="224" fill="url(#g${seed})"/>
  <circle cx="112" cy="112" r="88" fill="none" stroke="#334155" stroke-width="1.2" opacity="0.5"/>
  <circle cx="112" cy="112" r="66" fill="none" stroke="#475569" stroke-width="0.8" opacity="0.35"/>
  <circle cx="112" cy="112" r="44" fill="none" stroke="#64748b" stroke-width="0.6" opacity="0.25"/>
  <circle cx="118" cy="98" r="14" fill="#f59e0b" opacity="0.35"/>
  <circle cx="118" cy="98" r="8" fill="#fbbf24" opacity="0.5"/>
  <text x="112" y="208" text-anchor="middle" fill="#64748b" font-size="10" font-family="system-ui,sans-serif">Demo slice ${index + 1}</text>
</svg>`)
}

function mockHeatmapSvg(index: number): string {
  const shift = index * 12
  return svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224" width="224" height="224">
  <defs>
    <radialGradient id="h${shift}" cx="52%" cy="44%" r="45%">
      <stop offset="0%" stop-color="#ef4444"/>
      <stop offset="45%" stop-color="#f97316"/>
      <stop offset="100%" stop-color="#1e3a5f" stop-opacity="0.3"/>
    </radialGradient>
  </defs>
  <rect width="224" height="224" fill="#0c1220"/>
  <rect width="224" height="224" fill="url(#h${shift})"/>
  <text x="112" y="24" text-anchor="middle" fill="#fca5a5" font-size="11" font-family="system-ui,sans-serif" opacity="0.9">Grad-CAM</text>
</svg>`)
}

function mockOverlaySvg(index: number): string {
  return svgDataUrl(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 224 224" width="224" height="224">
  <defs>
    <radialGradient id="b${index}" cx="45%" cy="42%" r="55%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <radialGradient id="o${index}" cx="52%" cy="44%" r="38%">
      <stop offset="0%" stop-color="#ef4444" stop-opacity="0.75"/>
      <stop offset="100%" stop-color="#ef4444" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="224" height="224" fill="url(#b${index})"/>
  <circle cx="112" cy="112" r="88" fill="none" stroke="#334155" stroke-width="1" opacity="0.4"/>
  <rect width="224" height="224" fill="url(#o${index})"/>
  <text x="112" y="24" text-anchor="middle" fill="#fde68a" font-size="11" font-family="system-ui,sans-serif">Overlay</text>
</svg>`)
}

function buildSliceResults(n: number): SliceResultItem[] {
  const malignantBase = [89.4, 91.2, 87.9, 93.1, 90.5, 88.6]
  const items: SliceResultItem[] = []
  for (let i = 0; i < n; i++) {
    const malignantProb = Math.min(
      95,
      Math.max(85, malignantBase[i % malignantBase.length] + ((i % 3) - 1) * 0.6),
    )
    const benignProb = Math.round((100 - malignantProb) * 10) / 10
    items.push({
      slicePath: `demo/series_demo/nodule_roi/slice_${i + 1}.png`,
      predictedClass: 1,
      prediction: "malignant",
      benignProb,
      malignantProb,
      outputs: {
        originalImageUrl: mockOriginalSvg(i),
        gradcamHeatmapUrl: mockHeatmapSvg(i),
        gradcamOverlayUrl: mockOverlaySvg(i),
      },
    })
  }
  return items
}

/**
 * Rich demo output for UI development — no backend. Slice count matches selection length.
 */
export function buildDummyPredictionResult(numSlices: number): PredictionResult {
  const n = Math.max(1, Math.min(20, numSlices))
  const sliceResults = buildSliceResults(n)

  const malignantPct =
    Math.round(
      (sliceResults.reduce((sum, slice) => sum + slice.malignantProb, 0) / sliceResults.length) * 10,
    ) / 10
  const benignPct = Math.round((100 - malignantPct) * 10) / 10
  const confidence = Math.min(95, Math.max(85, Math.round((malignantPct - 1.8) * 10) / 10))

  const result: PredictionResult = {
    prediction: "malignant",
    confidence,
    benignProbability: benignPct,
    malignantProbability: malignantPct,
    modelInfo: {
      modelName: "DenseNet121 Binary Classifier (demo)",
      inputSize: [224, 224],
      aggregationMethod: "average_softmax",
    },
    numSlices: n,
    sliceResults,
    raw: { demo: true, numSlices: n },
  }

  return result
}

export function dummyGradCamUrlsFromResult(result: PredictionResult): string[] {
  return (
    result.sliceResults
      ?.map((s) => s.outputs.gradcamHeatmapUrl)
      .filter((u): u is string => typeof u === "string") ?? []
  )
}
