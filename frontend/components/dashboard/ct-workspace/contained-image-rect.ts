export function getContainedImageRect(
  containerW: number,
  containerH: number,
  imageW: number,
  imageH: number,
) {
  if (containerW <= 0 || containerH <= 0 || imageW <= 0 || imageH <= 0) {
    return { x: 0, y: 0, w: 0, h: 0, scale: 1 }
  }
  const scale = Math.min(containerW / imageW, containerH / imageH)
  const w = imageW * scale
  const h = imageH * scale
  const x = (containerW - w) / 2
  const y = (containerH - h) / 2
  return { x, y, w, h, scale }
}
