"use client"

import { useCallback, useEffect, useLayoutEffect, useRef } from "react"
import {
  MIN_ROI_SIZE,
  MAX_SELECTED_SLICES,
  useCtWorkspaceStore,
  type RoiRect,
} from "@/store/ctWorkspaceStore"
import { getContainedImageRect } from "./contained-image-rect"

type DragMode = "move" | "nw" | "ne" | "sw" | "se" | null

const HIT = 12

export function RoiCanvasOverlay({
  imageWidth,
  imageHeight,
}: {
  imageWidth: number
  imageHeight: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef<{
    mode: DragMode
    startRoi: RoiRect
    startIx: number
    startIy: number
  }>({ mode: null, startRoi: {} as RoiRect, startIx: 0, startIy: 0 })

  const roi = useCtWorkspaceStore((s) => s.roi)
  const currentIndex = useCtWorkspaceStore((s) => s.currentIndex)
  const selectionStart = useCtWorkspaceStore((s) => s.selectionStart)
  const selectionEnd = useCtWorkspaceStore((s) => s.selectionEnd)
  const applyRoi = useCtWorkspaceStore((s) => s.applyRoi)

  const rangeLo =
    selectionStart !== null && selectionEnd !== null
      ? Math.min(selectionStart, selectionEnd)
      : null
  const rangeHi =
    selectionStart !== null && selectionEnd !== null
      ? Math.max(selectionStart, selectionEnd)
      : null
  const rangeOk =
    rangeLo !== null &&
    rangeHi !== null &&
    rangeHi - rangeLo + 1 >= 2 &&
    rangeHi - rangeLo + 1 <= MAX_SELECTED_SLICES

  const active =
    roi !== null &&
    roi.sliceIndex === currentIndex &&
    rangeOk &&
    rangeLo !== null &&
    rangeHi !== null &&
    roi.sliceIndex >= rangeLo &&
    roi.sliceIndex <= rangeHi

  const clientToImage = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current
      if (!canvas) return { ix: 0, iy: 0 }
      const r = canvas.getBoundingClientRect()
      const cssX = clientX - r.left
      const cssY = clientY - r.top
      const cw = canvas.width
      const ch = canvas.height
      const px = (cssX / r.width) * cw
      const py = (cssY / r.height) * ch
      const { x, y, scale } = getContainedImageRect(
        cw,
        ch,
        imageWidth,
        imageHeight,
      )
      return {
        ix: (px - x) / scale,
        iy: (py - y) / scale,
      }
    },
    [imageWidth, imageHeight],
  )

  const hitTest = useCallback(
    (ix: number, iy: number, r: RoiRect): DragMode => {
      const { x, y, width: w, height: h } = r
      const t = Math.max(MIN_ROI_SIZE / 4, HIT / 2)
      if (ix >= x - t && ix <= x + t && iy >= y - t && iy <= y + t) return "nw"
      if (ix >= x + w - t && ix <= x + w + t && iy >= y - t && iy <= y + t)
        return "ne"
      if (ix >= x - t && ix <= x + t && iy >= y + h - t && iy <= y + h + t)
        return "sw"
      if (
        ix >= x + w - t &&
        ix <= x + w + t &&
        iy >= y + h - t &&
        iy <= y + h + t
      )
        return "se"
      if (ix > x && ix < x + w && iy > y && iy < y + h) return "move"
      return null
    },
    [],
  )

  const resizeRoi = useCallback(
    (mode: Exclude<DragMode, "move" | null>, r0: RoiRect, ix: number, iy: number) => {
      const x1 = r0.x
      const y1 = r0.y
      const x2 = r0.x + r0.width
      const y2 = r0.y + r0.height
      let x = x1
      let y = y1
      let w = r0.width
      let h = r0.height
      switch (mode) {
        case "se": {
          const nx2 = Math.min(Math.max(ix, x1 + MIN_ROI_SIZE), imageWidth)
          const ny2 = Math.min(Math.max(iy, y1 + MIN_ROI_SIZE), imageHeight)
          w = nx2 - x1
          h = ny2 - y1
          break
        }
        case "nw": {
          const nx1 = Math.min(Math.max(ix, 0), x2 - MIN_ROI_SIZE)
          const ny1 = Math.min(Math.max(iy, 0), y2 - MIN_ROI_SIZE)
          x = nx1
          y = ny1
          w = x2 - nx1
          h = y2 - ny1
          break
        }
        case "ne": {
          const nx2 = Math.min(Math.max(ix, x1 + MIN_ROI_SIZE), imageWidth)
          const ny1 = Math.min(Math.max(iy, 0), y2 - MIN_ROI_SIZE)
          x = x1
          y = ny1
          w = nx2 - x1
          h = y2 - ny1
          break
        }
        case "sw": {
          const nx1 = Math.min(Math.max(ix, 0), x2 - MIN_ROI_SIZE)
          const ny2 = Math.min(Math.max(iy, y1 + MIN_ROI_SIZE), imageHeight)
          x = nx1
          y = y1
          w = x2 - nx1
          h = ny2 - y1
          break
        }
        default:
          break
      }
      return { ...r0, x, y, width: w, height: h }
    },
    [imageWidth, imageHeight],
  )

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !active || !roi) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const cw = canvas.width
    const ch = canvas.height
    ctx.clearRect(0, 0, cw, ch)

    const { x, y, scale } = getContainedImageRect(
      cw,
      ch,
      imageWidth,
      imageHeight,
    )
    const rx = x + roi.x * scale
    const ry = y + roi.y * scale
    const rw = roi.width * scale
    const rh = roi.height * scale

    ctx.fillStyle = "rgba(15, 23, 42, 0.55)"
    ctx.fillRect(0, 0, cw, ch)
    ctx.clearRect(rx, ry, rw, rh)

    ctx.strokeStyle = "rgba(34, 211, 238, 0.95)"
    ctx.lineWidth = 2
    ctx.strokeRect(rx + 1, ry + 1, rw - 2, rh - 2)

    ctx.fillStyle = "rgba(34, 211, 238, 0.12)"
    ctx.fillRect(rx, ry, rw, rh)

    const hs = 7
    const corners = [
      [rx, ry],
      [rx + rw, ry],
      [rx, ry + rh],
      [rx + rw, ry + rh],
    ]
    ctx.fillStyle = "rgba(34, 211, 238, 0.95)"
    for (const [cx, cy] of corners) {
      ctx.fillRect(cx - hs / 2, cy - hs / 2, hs, hs)
    }
  }, [active, roi, imageWidth, imageHeight])

  useEffect(() => {
    draw()
  }, [draw])

  const syncCanvasSize = useCallback(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const w = Math.floor(wrap.clientWidth)
    const h = Math.floor(wrap.clientHeight)
    if (w > 0 && h > 0) {
      canvas.width = w
      canvas.height = h
      draw()
    }
  }, [draw])

  useLayoutEffect(() => {
    syncCanvasSize()
  }, [syncCanvasSize, active])

  useEffect(() => {
    const ro = new ResizeObserver(() => syncCanvasSize())
    const wrap = wrapRef.current
    if (wrap) ro.observe(wrap)
    return () => ro.disconnect()
  }, [syncCanvasSize])

  const onPointerDown = (e: React.PointerEvent) => {
    if (!active || !roi) return
    const { ix, iy } = clientToImage(e.clientX, e.clientY)
    const mode = hitTest(ix, iy, roi)
    if (!mode) return
    e.currentTarget.setPointerCapture(e.pointerId)
    dragRef.current = {
      mode,
      startRoi: { ...roi },
      startIx: ix,
      startIy: iy,
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d.mode || !roi) return
    const { ix, iy } = clientToImage(e.clientX, e.clientY)
    const r0 = d.startRoi
    if (d.mode === "move") {
      const dx = ix - d.startIx
      const dy = iy - d.startIy
      applyRoi({
        ...r0,
        x: r0.x + dx,
        y: r0.y + dy,
      })
      return
    }
    applyRoi(resizeRoi(d.mode, r0, ix, iy))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId)
    }
    dragRef.current.mode = null
  }

  if (!active) return null

  return (
    <div ref={wrapRef} className="absolute inset-0 z-10">
      <canvas
        ref={canvasRef}
        className="h-full w-full touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      />
    </div>
  )
}
