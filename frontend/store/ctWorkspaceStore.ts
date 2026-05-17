import { create } from "zustand"
import {
  parseDicomFile,
  type ParsedDicomSlice,
} from "@/lib/dicom/parseDicomFile"
import {
  type PredictionResult,
  extractGradCamImages,
  normalizePredictionPayload,
} from "@/lib/prediction-api"
import {
  USE_DUMMY_PREDICTION,
  buildDummyPredictionResult,
  dummyGradCamUrlsFromResult,
} from "@/lib/mock-prediction"

export type { PredictionResult } from "@/lib/prediction-api"

/** Minimum ROI edge length in image pixels (before resize to model input). */
export const MIN_ROI_SIZE = 40
/** Model / backend input size (square). Cropped ROI is scaled to this. */
export const OUTPUT_SIZE = 224
/** Maximum contiguous slices for inference (configurable). */
export const MAX_SELECTED_SLICES = 20

/** Same-origin proxy — avoids browser CORS for local API. */
export const PREDICT_URL = "/api/predict"

export interface RoiRect {
  sliceIndex: number
  x: number
  y: number
  width: number
  height: number
}

export function clampRoi(roi: RoiRect, sliceW: number, sliceH: number): RoiRect {
  let { x, y, width, height } = roi
  width = Math.max(MIN_ROI_SIZE, Math.min(width, sliceW))
  height = Math.max(MIN_ROI_SIZE, Math.min(height, sliceH))
  x = Math.max(0, Math.min(x, sliceW - width))
  y = Math.max(0, Math.min(y, sliceH - height))
  return { ...roi, x, y, width, height }
}

function sortSlicesStable(items: ParsedDicomSlice[]): ParsedDicomSlice[] {
  return [...items].sort((a, b) => {
    if (a.sortKey !== b.sortKey) return a.sortKey - b.sortKey
    return a.fileName.localeCompare(b.fileName)
  })
}

function selectionIndices(start: number, end: number): number[] {
  const lo = Math.min(start, end)
  const hi = Math.max(start, end)
  const out: number[] = []
  for (let i = lo; i <= hi; i++) out.push(i)
  return out
}

function isContiguousRange(start: number, end: number, total: number): boolean {
  const lo = Math.min(start, end)
  const hi = Math.max(start, end)
  return lo >= 0 && hi < total && hi - lo >= 1
}

/** Keeps selection contiguous and at most MAX_SELECTED_SLICES, anchored at the moving edge. */
function clampSelectionSpan(
  anchor: number,
  other: number,
  total: number,
): [number, number] {
  let lo = Math.min(anchor, other)
  let hi = Math.max(anchor, other)
  lo = Math.max(0, lo)
  hi = Math.min(total - 1, hi)
  const span = hi - lo + 1
  if (span > MAX_SELECTED_SLICES) {
    if (other >= anchor) {
      hi = lo + MAX_SELECTED_SLICES - 1
    } else {
      lo = hi - MAX_SELECTED_SLICES + 1
    }
  }
  return [lo, hi]
}

async function cropRegionToPngBase64(
  dataUrl: string,
  roi: RoiRect,
  sliceW: number,
  sliceH: number,
): Promise<string> {
  const c = clampRoi(roi, sliceW, sliceH)
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      const ctx = canvas.getContext("2d")
      if (!ctx) {
        reject(new Error("Canvas unsupported"))
        return
      }
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(
        img,
        c.x,
        c.y,
        c.width,
        c.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      )
      const full = canvas.toDataURL("image/png")
      const i = full.indexOf(",")
      resolve(i >= 0 ? full.slice(i + 1) : full)
    }
    img.onerror = () => reject(new Error("Failed to load slice for crop"))
    img.src = dataUrl
  })
}

function base64ToPngFile(base64: string, fileName: string): File {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return new File([bytes], fileName, { type: "image/png" })
}

interface CtWorkspaceState {
  slices: ParsedDicomSlice[]
  loadError: string | null
  isLoadingDicom: boolean
  currentIndex: number
  selectionAnchor: number | null
  selectionStart: number | null
  selectionEnd: number | null
  selectionDragAnchor: number | null
  roi: RoiRect | null
  roiDraft: RoiRect | null

  isPredicting: boolean
  predictionError: string | null
  prediction: PredictionResult | null
  gradCamDataUrls: string[]

  setCurrentIndex: (i: number) => void
  applyRoi: (roi: RoiRect) => void
  initRoiOnSlice: (sliceIndex: number) => void
  clearRoi: () => void

  loadDicomFiles: (files: FileList | File[]) => Promise<void>
  clearWorkspace: () => void

  handleSlicePointerDown: (index: number, shiftKey: boolean) => void
  handleSlicePointerEnter: (index: number, buttons: number) => void
  endSelectionPointer: () => void

  canPredict: () => boolean
  predict: () => Promise<void>
  resetPrediction: () => void
}

export const useCtWorkspaceStore = create<CtWorkspaceState>((set, get) => ({
  slices: [],
  loadError: null,
  isLoadingDicom: false,
  currentIndex: 0,
  selectionAnchor: null,
  selectionStart: null,
  selectionEnd: null,
  selectionDragAnchor: null,
  roi: null,
  roiDraft: null,

  isPredicting: false,
  predictionError: null,
  prediction: null,
  gradCamDataUrls: [],

  setCurrentIndex: (i) => {
    const { slices } = get()
    if (slices.length === 0) return
    const next = Math.max(0, Math.min(i, slices.length - 1))
    set({ currentIndex: next })
  },

  applyRoi: (roi) => {
    const { slices } = get()
    const sl = slices[roi.sliceIndex]
    if (!sl) return
    set({ roi: clampRoi(roi, sl.width, sl.height) })
  },

  initRoiOnSlice: (sliceIndex) => {
    const { slices } = get()
    const sl = slices[sliceIndex]
    if (!sl) return
    const w = sl.width
    const h = sl.height
    const maxDim = Math.min(w, h)
    const target = Math.max(
      MIN_ROI_SIZE,
      Math.min(Math.floor(maxDim / 2.2), Math.min(w, h)),
    )
    const size = Math.min(target, maxDim)
    const x = Math.max(0, Math.floor((w - size) / 2))
    const y = Math.max(0, Math.floor((h - size) / 2))
    set({
      roi: clampRoi(
        { sliceIndex, x, y, width: size, height: size },
        w,
        h,
      ),
      roiDraft: null,
      currentIndex: sliceIndex,
    })
  },

  clearRoi: () => set({ roi: null, roiDraft: null }),

  loadDicomFiles: async (files) => {
    const list = Array.from(files).filter((f) => {
      const n = f.name.toLowerCase()
      return n.endsWith(".dcm") || n.endsWith(".dicom")
    })
    if (list.length === 0) {
      set({
        loadError: "Please drop one or more .dcm files.",
        isLoadingDicom: false,
      })
      return
    }
    set({ isLoadingDicom: true, loadError: null })
    const parsed: ParsedDicomSlice[] = []
    const errors: string[] = []
    for (let i = 0; i < list.length; i++) {
      try {
        parsed.push(await parseDicomFile(list[i], i))
      } catch (e) {
        errors.push(
          `${list[i].name}: ${e instanceof Error ? e.message : String(e)}`,
        )
      }
    }
    const sorted = sortSlicesStable(parsed)
    if (sorted.length === 0) {
      set({
        slices: [],
        isLoadingDicom: false,
        loadError: errors.join("\n") || "No valid DICOM slices loaded.",
        currentIndex: 0,
        selectionAnchor: null,
        selectionStart: null,
        selectionEnd: null,
        roi: null,
      })
      return
    }
    set({
      slices: sorted,
      isLoadingDicom: false,
      loadError:
        errors.length > 0
          ? `Loaded ${sorted.length} slice(s). Some files failed:\n${errors.join("\n")}`
          : null,
      currentIndex: 0,
      selectionAnchor: 0,
      selectionStart: 0,
      selectionEnd: sorted.length >= 2 ? 1 : 0,
      selectionDragAnchor: null,
      roi: null,
      prediction: null,
      gradCamDataUrls: [],
      predictionError: null,
    })
  },

  clearWorkspace: () =>
    set({
      slices: [],
      loadError: null,
      isLoadingDicom: false,
      currentIndex: 0,
      selectionAnchor: null,
      selectionStart: null,
      selectionEnd: null,
      selectionDragAnchor: null,
      roi: null,
      roiDraft: null,
      prediction: null,
      gradCamDataUrls: [],
      predictionError: null,
    }),

  handleSlicePointerDown: (index, shiftKey) => {
    const { slices, selectionAnchor, currentIndex } = get()
    if (slices.length === 0) return
    if (shiftKey) {
      const anchor = selectionAnchor ?? currentIndex
      const [start, end] = clampSelectionSpan(anchor, index, slices.length)
      const clampedIndex = Math.max(start, Math.min(index, end))
      set({
        selectionStart: start,
        selectionEnd: end,
        selectionDragAnchor: null,
        selectionAnchor: anchor,
      })
      set({ currentIndex: clampedIndex })
    } else {
      const [start, end] = clampSelectionSpan(index, index, slices.length)
      set({
        selectionAnchor: index,
        selectionStart: start,
        selectionEnd: end,
        selectionDragAnchor: index,
      })
      set({ currentIndex: index })
    }
  },

  handleSlicePointerEnter: (index, buttons) => {
    if ((buttons & 1) === 0) return
    const { selectionDragAnchor, slices } = get()
    if (selectionDragAnchor === null || slices.length === 0) return
    const [start, end] = clampSelectionSpan(
      selectionDragAnchor,
      index,
      slices.length,
    )
    const clampedIndex = Math.max(start, Math.min(index, end))
    set({
      selectionStart: start,
      selectionEnd: end,
      currentIndex: clampedIndex,
    })
  },

  endSelectionPointer: () => set({ selectionDragAnchor: null }),

  canPredict: () => {
    const { slices, selectionStart, selectionEnd, roi } = get()
    if (slices.length === 0) return false
    if (selectionStart === null || selectionEnd === null) return false
    if (!isContiguousRange(selectionStart, selectionEnd, slices.length)) {
      return false
    }
    const count = Math.abs(selectionEnd - selectionStart) + 1
    if (count < 2 || count > MAX_SELECTED_SLICES) return false
    if (!roi) return false
    const selected = selectionIndices(selectionStart, selectionEnd)
    if (!selected.includes(roi.sliceIndex)) return false
    return true
  },

  predict: async () => {
    const { slices, selectionStart, selectionEnd, roi, canPredict } = get()
    if (!canPredict() || !roi || selectionStart === null || selectionEnd === null) {
      set({
        predictionError:
          `Select ${MIN_ROI_SIZE}px+ ROI on one selected slice, choose 2-${MAX_SELECTED_SLICES} contiguous slices, then try again.`,
      })
      return
    }
    const indices = selectionIndices(selectionStart, selectionEnd).sort(
      (a, b) => a - b,
    )
    if (!indices.includes(roi.sliceIndex)) {
      set({
        predictionError: "The ROI must be on one of the selected slices.",
      })
      return
    }

    set({
      isPredicting: true,
      predictionError: null,
      prediction: null,
      gradCamDataUrls: [],
    })

    try {
      if (USE_DUMMY_PREDICTION) {
        await new Promise((r) => setTimeout(r, 950))
        const prediction = buildDummyPredictionResult(indices.length)
        set({
          isPredicting: false,
          prediction,
          gradCamDataUrls: dummyGradCamUrlsFromResult(prediction),
          predictionError: null,
        })
        return
      }

      const files: File[] = []
      for (const idx of indices) {
        const sl = slices[idx]
        const b64 = await cropRegionToPngBase64(
          sl.dataUrl,
          roi,
          sl.width,
          sl.height,
        )
        files.push(base64ToPngFile(b64, `slice_${idx + 1}.png`))
      }

      const formData = new FormData()
      files.forEach((file) => formData.append("files", file))

      const res = await fetch(PREDICT_URL, {
        method: "POST",
        body: formData,
      })

      if (!res.ok) {
        const t = await res.text()
        throw new Error(t || `HTTP ${res.status}`)
      }

      const data = (await res.json()) as Record<string, unknown>
      const prediction = normalizePredictionPayload(data)
      const gradCamDataUrls = extractGradCamImages(data)

      set({
        isPredicting: false,
        prediction,
        gradCamDataUrls,
        predictionError: null,
      })
    } catch (e) {
      set({
        isPredicting: false,
        predictionError:
          e instanceof Error ? e.message : "Prediction request failed.",
      })
    }
  },

  resetPrediction: () =>
    set({
      prediction: null,
      gradCamDataUrls: [],
      predictionError: null,
    }),
}))
