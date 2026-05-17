"use client"

import { useCallback, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileStack, Loader2, Trash2, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useCtWorkspaceStore } from "@/store/ctWorkspaceStore"

export function DicomUploadPanel() {
  const [isDragging, setIsDragging] = useState(false)
  const loadDicomFiles = useCtWorkspaceStore((s) => s.loadDicomFiles)
  const clearWorkspace = useCtWorkspaceStore((s) => s.clearWorkspace)
  const slices = useCtWorkspaceStore((s) => s.slices)
  const isLoadingDicom = useCtWorkspaceStore((s) => s.isLoadingDicom)
  const loadError = useCtWorkspaceStore((s) => s.loadError)

  const onFiles = useCallback(
    (list: FileList | null) => {
      if (!list?.length) return
      void loadDicomFiles(list)
    },
    [loadDicomFiles],
  )

  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-border/50 bg-card p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">DICOM upload</h2>
          <p className="text-sm text-muted-foreground">
            Multiple .dcm files - sorted by Instance Number or Slice Location
            (dicom-parser)
          </p>
        </div>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setIsDragging(false)
          onFiles(e.dataTransfer.files)
        }}
        className={`relative rounded-xl border-2 border-dashed p-6 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/40"
        }`}
      >
        <input
          type="file"
          accept=".dcm,.dicom,application/dicom"
          multiple
          className="absolute inset-0 cursor-pointer opacity-0"
          onChange={(e) => onFiles(e.target.files)}
          disabled={isLoadingDicom}
        />
        <FileStack className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">Drop DICOM slices here</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Grayscale PNG previews are built in memory (not saved to disk)
        </p>
        <Button variant="outline" size="sm" className="mt-4" type="button" disabled={isLoadingDicom}>
          Browse .dcm files
        </Button>
      </div>

      <AnimatePresence>
        {isLoadingDicom && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing DICOM...
          </motion.div>
        )}
      </AnimatePresence>

      {loadError && (
        <Alert className="mt-4" variant="default">
          <AlertDescription className="whitespace-pre-wrap text-xs">
            {loadError}
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-6 flex-1 overflow-y-auto rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Workflow</p>
        <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs leading-relaxed">
          <li>Upload all slices for one axial stack (in-memory PNG previews).</li>
          <li>
            Select <strong>2-20 contiguous</strong> slices:{" "}
            <strong>Shift+click</strong> or <strong>drag</strong> on the
            filmstrip.
          </li>
          <li>
            On the clearest slice, <strong>Draw ROI</strong>, then drag
            corners to resize (min 40x40 px).
          </li>
          <li>
            <strong>Preprocessing</strong> is done automatically by the system.
            The same ROI is cropped from each selected slice and resized to{" "}
            <strong>224x224</strong> for diagnosis.
          </li>
          <li>
            <strong>Diagnose</strong> - POST cropped ROIs as multipart <code className="rounded bg-muted px-1">files</code> to the inference server.
          </li>
        </ol>
      </div>

      {slices.length > 0 && (
        <Button
          variant="ghost"
          className="mt-4 text-muted-foreground hover:text-destructive"
          onClick={() => clearWorkspace()}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Clear volume
        </Button>
      )}
    </div>
  )
}
