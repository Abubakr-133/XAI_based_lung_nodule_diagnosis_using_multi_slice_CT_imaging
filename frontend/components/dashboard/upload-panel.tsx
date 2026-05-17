"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Upload, X, FileImage, Play, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

interface UploadedFile {
  id: string
  name: string
  size: number
  preview?: string
}

interface UploadPanelProps {
  onRunDiagnosis: (files: UploadedFile[], caseId: string) => void
  isProcessing: boolean
}

export function UploadPanel({ onRunDiagnosis, isProcessing }: UploadPanelProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [caseId, setCaseId] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const droppedFiles = Array.from(e.dataTransfer.files)
    processFiles(droppedFiles)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      processFiles(selectedFiles)
    }
  }, [])

  const processFiles = (newFiles: File[]) => {
    // Simulate upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 100)

    const processedFiles: UploadedFile[] = newFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      size: file.size,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined
    }))

    setTimeout(() => {
      setFiles(prev => [...prev, ...processedFiles])
      setUploadProgress(0)
    }, 1000)
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB"
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  return (
    <div className="rounded-2xl bg-card border border-border/50 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Upload className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Upload CT Slices</h2>
          <p className="text-sm text-muted-foreground">Drag and drop or click to upload</p>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        }`}
      >
        <input
          type="file"
          multiple
          accept="image/*,.dcm"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-full transition-colors ${isDragging ? "bg-primary/10" : "bg-muted"}`}>
            <FileImage className={`h-8 w-8 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
          </div>
          <div>
            <p className="font-medium">Drop CT images here</p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports DICOM, PNG, JPG formats
            </p>
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            Browse Files
          </Button>
        </div>
      </div>

      {/* Upload Progress */}
      <AnimatePresence>
        {uploadProgress > 0 && uploadProgress < 100 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4"
          >
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Uploading...</span>
              <span className="font-medium">{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* File List */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{files.length} file(s) selected</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFiles([])}
                className="text-muted-foreground hover:text-destructive"
              >
                Clear all
              </Button>
            </div>
            
            <div className="max-h-48 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 group"
                >
                  {file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-10 h-10 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <FileImage className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Case ID Input */}
      <div className="mt-6">
        <label className="text-sm font-medium mb-2 block">
          Case ID (Optional)
        </label>
        <Input
          placeholder="Enter patient/case identifier"
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
          className="bg-muted/50"
        />
      </div>

      {/* Run Diagnosis Button */}
      <Button
        onClick={() => onRunDiagnosis(files, caseId)}
        disabled={files.length === 0 || isProcessing}
        className="w-full mt-6 rounded-xl py-6 text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            Run Diagnosis
          </>
        )}
      </Button>
    </div>
  )
}
