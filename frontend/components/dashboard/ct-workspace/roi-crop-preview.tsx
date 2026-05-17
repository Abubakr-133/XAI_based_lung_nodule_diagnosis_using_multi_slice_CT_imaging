"use client"

import { useEffect, useRef } from "react"
import {
  OUTPUT_SIZE,
  clampRoi,
  type RoiRect,
} from "@/store/ctWorkspaceStore"

export function RoiCropPreview({
  dataUrl,
  roi,
  sliceW,
  sliceH,
}: {
  dataUrl: string
  roi: RoiRect
  sliceW: number
  sliceH: number
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const img = new Image()
    img.onload = () => {
      const r = clampRoi(roi, sliceW, sliceH)
      canvas.width = OUTPUT_SIZE
      canvas.height = OUTPUT_SIZE
      ctx.fillStyle = "#000"
      ctx.fillRect(0, 0, OUTPUT_SIZE, OUTPUT_SIZE)
      ctx.imageSmoothingEnabled = true
      ctx.imageSmoothingQuality = "high"
      ctx.drawImage(
        img,
        r.x,
        r.y,
        r.width,
        r.height,
        0,
        0,
        OUTPUT_SIZE,
        OUTPUT_SIZE,
      )
    }
    img.src = dataUrl
  }, [dataUrl, roi, sliceW, sliceH])

  return (
    <canvas
      ref={ref}
      className="h-full w-full object-contain"
      aria-label="ROI crop preview resized to model input"
    />
  )
}
