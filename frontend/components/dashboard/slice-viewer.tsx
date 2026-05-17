"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SliceViewerProps {
  slices: { id: string; preview?: string }[]
}

export function SliceViewer({ slices }: SliceViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? slices.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === slices.length - 1 ? 0 : prev + 1))
  }

  // If no slices, show placeholder
  const displaySlices = slices.length > 0 ? slices : [
    { id: "1" }, { id: "2" }, { id: "3" }, { id: "4" }, { id: "5" }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-2xl bg-card border border-border/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-accent/10">
          <Layers className="h-5 w-5 text-accent" />
        </div>
        <div>
          <h2 className="font-semibold">CT Slice Preview</h2>
          <p className="text-sm text-muted-foreground">
            Slice {currentIndex + 1} of {displaySlices.length}
          </p>
        </div>
      </div>

      {/* Main Viewer */}
      <div className="relative aspect-square rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden">
        {displaySlices[currentIndex]?.preview ? (
          <img
            src={displaySlices[currentIndex].preview}
            alt={`CT Slice ${currentIndex + 1}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Simulated CT scan visualization */}
            <div className="relative w-3/4 h-3/4">
              {[0.9, 0.75, 0.6, 0.45, 0.3].map((scale, i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border border-cyan-500/30"
                  style={{ transform: `scale(${scale})` }}
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
              {/* Nodule indicator */}
              <motion.div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-full h-full rounded-full bg-cyan-500/40 blur-sm" />
                <div className="absolute inset-1 rounded-full bg-cyan-400/60" />
              </motion.div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        {displaySlices.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </>
        )}

        {/* Slice indicator */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
          {displaySlices.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "bg-primary w-6"
                  : "bg-white/50 hover:bg-white/80"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Thumbnails */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {displaySlices.map((slice, index) => (
          <button
            key={slice.id}
            onClick={() => setCurrentIndex(index)}
            className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              index === currentIndex
                ? "border-primary ring-2 ring-primary/20"
                : "border-transparent hover:border-border"
            }`}
          >
            {slice.preview ? (
              <img
                src={slice.preview}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">{index + 1}</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
