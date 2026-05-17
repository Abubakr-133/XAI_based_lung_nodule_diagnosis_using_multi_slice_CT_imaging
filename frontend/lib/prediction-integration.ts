export interface RoiSelection {
  x: number
  y: number
  width: number
  height: number
}

export interface SliceResult {
  slice_name: string
  predicted_class: number
  prediction: "BENIGN" | "MALIGNANT"
  probabilities: {
    benign: number
    malignant: number
  }
  outputs: {
    original_image_url: string
    gradcam_heatmap_url: string
    gradcam_overlay_url: string
  }
}

export interface PredictionResponse {
  status: string
  final_class: number
  final_prediction: "BENIGN" | "MALIGNANT"
  avg_probabilities: {
    benign: number
    malignant: number
  }
  confidence: number
  num_slices: number
  slice_results: SliceResult[]
}

export interface SelectedSliceInput {
  dataUrl: string
  fileName?: string
}

const MODEL_INPUT_SIZE = 224

function clampRoi(roi: RoiSelection, imageW: number, imageH: number): RoiSelection {
  const width = Math.max(1, Math.min(roi.width, imageW))
  const height = Math.max(1, Math.min(roi.height, imageH))
  const x = Math.max(0, Math.min(roi.x, imageW - width))
  const y = Math.max(0, Math.min(roi.y, imageH - height))
  return { x, y, width, height }
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load slice image for ROI crop"))
    image.src = src
  })
}

async function toImageElement(
  sliceImage: string | HTMLImageElement | HTMLCanvasElement,
): Promise<{ image: CanvasImageSource; width: number; height: number }> {
  if (typeof sliceImage === "string") {
    const image = await loadHtmlImage(sliceImage)
    return { image, width: image.naturalWidth, height: image.naturalHeight }
  }
  if (sliceImage instanceof HTMLImageElement) {
    return {
      image: sliceImage,
      width: sliceImage.naturalWidth || sliceImage.width,
      height: sliceImage.naturalHeight || sliceImage.height,
    }
  }
  return {
    image: sliceImage,
    width: sliceImage.width,
    height: sliceImage.height,
  }
}

function canvasToPngFile(canvas: HTMLCanvasElement, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Unable to convert cropped ROI to PNG blob"))
        return
      }
      resolve(new File([blob], fileName, { type: "image/png" }))
    }, "image/png")
  })
}

export async function cropAndResizeSlice(
  sliceImage: string | HTMLImageElement | HTMLCanvasElement,
  roi: RoiSelection,
  sliceIndex: number,
): Promise<File> {
  const { image, width, height } = await toImageElement(sliceImage)
  const clamped = clampRoi(roi, width, height)

  const canvas = document.createElement("canvas")
  canvas.width = MODEL_INPUT_SIZE
  canvas.height = MODEL_INPUT_SIZE

  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas is not available in this environment")

  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = "high"
  ctx.fillStyle = "#000"
  ctx.fillRect(0, 0, MODEL_INPUT_SIZE, MODEL_INPUT_SIZE)
  ctx.drawImage(
    image,
    clamped.x,
    clamped.y,
    clamped.width,
    clamped.height,
    0,
    0,
    MODEL_INPUT_SIZE,
    MODEL_INPUT_SIZE,
  )

  return canvasToPngFile(canvas, `slice_${sliceIndex + 1}.png`)
}

export async function prepareSelectedSlicesForPrediction(
  selectedSlices: Array<SelectedSliceInput | string | HTMLImageElement | HTMLCanvasElement>,
  roi: RoiSelection,
): Promise<File[]> {
  const files: File[] = []
  for (let i = 0; i < selectedSlices.length; i++) {
    const slice = selectedSlices[i]
    if (typeof slice === "string" || slice instanceof HTMLImageElement || slice instanceof HTMLCanvasElement) {
      files.push(await cropAndResizeSlice(slice, roi, i))
      continue
    }
    files.push(await cropAndResizeSlice(slice.dataUrl, roi, i))
  }
  return files
}

export async function sendSlicesToBackend(
  files: File[],
  endpoint = "/api/predict",
): Promise<PredictionResponse> {
  const formData = new FormData()
  files.forEach((file) => formData.append("files", file))

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Prediction request failed with HTTP ${response.status}`)
  }

  const data = (await response.json()) as PredictionResponse
  return data
}
