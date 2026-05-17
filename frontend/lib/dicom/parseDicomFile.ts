import {
  parseDicom,
  type DataSet,
} from "dicom-parser"

export interface ParsedDicomSlice {
  id: string
  fileName: string
  sortKey: number
  instanceNumber?: number
  sliceLocation?: number
  dataUrl: string
  width: number
  height: number
}

function getTransferSyntax(dataSet: DataSet): string | undefined {
  return dataSet.string("x00020010")
}

function readPixelsToRgba(
  dataSet: DataSet,
  rows: number,
  columns: number,
  samplesPerPixel: number,
): Uint8ClampedArray {
  const el = dataSet.elements["x7fe00010"]
  if (!el) {
    throw new Error("Pixel Data (7FE0,0010) missing")
  }
  if (el.encapsulatedPixelData) {
    throw new Error(
      "Compressed pixel data is not supported. Use uncompressed Little Endian DICOM.",
    )
  }

  const bitsAllocated = dataSet.uint16("x00280100") ?? 16
  const pixelRepresentation = dataSet.uint16("x00280103") ?? 0
  const photometric = (dataSet.string("x00280004") ?? "MONOCHROME2").toUpperCase()
  const slope = dataSet.floatString("x00281053") ?? 1
  const intercept = dataSet.floatString("x00281052") ?? 0

  const { byteArray, byteArrayParser } = dataSet
  const offset = el.dataOffset

  const values = new Float32Array(rows * columns)

  if (bitsAllocated === 16) {
    const step = 2 * samplesPerPixel
    let p = 0
    for (let i = 0; i < rows * columns; i++) {
      const pos = offset + i * step
      const stored =
        pixelRepresentation === 1
          ? byteArrayParser.readInt16(byteArray, pos)
          : byteArrayParser.readUint16(byteArray, pos)
      values[p++] = stored * slope + intercept
    }
  } else if (bitsAllocated === 8) {
    if (samplesPerPixel !== 1) {
      throw new Error("8-bit multi-sample images are not supported")
    }
    for (let i = 0; i < rows * columns; i++) {
      values[i] = byteArray[offset + i] * slope + intercept
    }
  } else {
    throw new Error(`Unsupported Bits Allocated: ${bitsAllocated}`)
  }

  let min = Infinity
  let max = -Infinity
  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    if (v < min) min = v
    if (v > max) max = v
  }
  const range = max - min || 1

  const rgba = new Uint8ClampedArray(rows * columns * 4)
  let j = 0
  for (let i = 0; i < values.length; i++) {
    let g = Math.round(((values[i] - min) / range) * 255)
    g = Math.max(0, Math.min(255, g))
    if (photometric === "MONOCHROME1") {
      g = 255 - g
    }
    rgba[j++] = g
    rgba[j++] = g
    rgba[j++] = g
    rgba[j++] = 255
  }

  return rgba
}

function dataUrlFromRgba(
  rgba: Uint8ClampedArray,
  width: number,
  height: number,
): string {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas not available")
  const imageData = new ImageData(rgba, width, height)
  ctx.putImageData(imageData, 0, 0)
  return canvas.toDataURL("image/png")
}

export function parseDicomArrayBuffer(
  buffer: ArrayBuffer,
  fileName: string,
  fileIndex: number,
): ParsedDicomSlice {
  const byteArray = new Uint8Array(buffer)
  const dataSet = parseDicom(byteArray)

  const syntax = getTransferSyntax(dataSet)
  if (
    syntax &&
    syntax !== "1.2.840.10008.1.2" &&
    syntax !== "1.2.840.10008.1.2.1"
  ) {
    throw new Error(
      `Transfer syntax ${syntax} may not be supported. Try Implicit or Explicit VR Little Endian.`,
    )
  }

  const rows = dataSet.uint16("x00280010")
  const columns = dataSet.uint16("x00280011")
  if (!rows || !columns) {
    throw new Error("Rows/Columns not found in DICOM")
  }

  const samplesPerPixel = dataSet.uint16("x00280002") ?? 1
  if (samplesPerPixel !== 1) {
    throw new Error("Only single-channel (grayscale) CT slices are supported")
  }

  const rgba = readPixelsToRgba(dataSet, rows, columns, samplesPerPixel)
  const dataUrl = dataUrlFromRgba(rgba, columns, rows)

  const instanceNumber = dataSet.intString("x00200013")
  const sliceLocation = dataSet.floatString("x00201041")
  let sortKey = fileIndex
  if (instanceNumber !== undefined) {
    sortKey = instanceNumber
  } else if (sliceLocation !== undefined) {
    sortKey = sliceLocation
  }

  return {
    id: crypto.randomUUID(),
    fileName,
    sortKey,
    instanceNumber,
    sliceLocation,
    dataUrl,
    width: columns,
    height: rows,
  }
}

export async function parseDicomFile(
  file: File,
  fileIndex: number,
): Promise<ParsedDicomSlice> {
  const lower = file.name.toLowerCase()
  if (!lower.endsWith(".dcm") && !lower.endsWith(".dicom")) {
    throw new Error(`Not a DICOM file: ${file.name}`)
  }
  const buffer = await file.arrayBuffer()
  return parseDicomArrayBuffer(buffer, file.name, fileIndex)
}
