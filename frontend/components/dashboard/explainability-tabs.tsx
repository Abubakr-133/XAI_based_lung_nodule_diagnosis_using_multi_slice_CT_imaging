"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Eye, Flame, Layers } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function ExplainabilityTabs() {
  const [activeTab, setActiveTab] = useState("original")

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="rounded-2xl bg-card border border-border/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-primary/10">
          <Eye className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold">Explainability Visualization</h2>
          <p className="text-sm text-muted-foreground">Understand model predictions</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="original" className="text-xs sm:text-sm">
            <Layers className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Original
          </TabsTrigger>
          <TabsTrigger value="gradcam" className="text-xs sm:text-sm">
            <Flame className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Grad-CAM
          </TabsTrigger>
          <TabsTrigger value="overlay" className="text-xs sm:text-sm">
            <Eye className="h-4 w-4 mr-1.5 hidden sm:inline" />
            Overlay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="original" className="mt-0">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                {[0.9, 0.75, 0.6, 0.45].map((scale, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gray-600"
                    style={{ transform: `scale(${scale})` }}
                  />
                ))}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-500/60" />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-background/80 text-xs">
              Original CT Slice
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gradcam" className="mt-0">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                {[0.9, 0.75, 0.6, 0.45].map((scale, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gray-600/50"
                    style={{ transform: `scale(${scale})` }}
                  />
                ))}
                {/* Heatmap overlay */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/60 via-yellow-500/40 to-transparent blur-xl" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500/80 via-orange-500/60 to-yellow-500/40 blur-md" />
                  <div className="absolute inset-8 rounded-full bg-red-500/90" />
                </motion.div>
              </div>
            </div>
            {/* Color scale */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-32 rounded-full overflow-hidden">
              <div className="w-full h-full bg-gradient-to-t from-blue-500 via-yellow-500 to-red-500" />
            </div>
            <div className="absolute right-9 top-1/2 -translate-y-1/2 flex flex-col justify-between h-32 text-xs text-muted-foreground">
              <span>High</span>
              <span>Low</span>
            </div>
            <div className="absolute bottom-3 left-3 px-2 py-1 rounded bg-background/80 text-xs">
              Grad-CAM Heatmap
            </div>
          </div>
        </TabsContent>

        <TabsContent value="overlay" className="mt-0">
          <div className="aspect-square rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-3/4 h-3/4">
                {[0.9, 0.75, 0.6, 0.45].map((scale, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border border-gray-600/50"
                    style={{ transform: `scale(${scale})` }}
                  />
                ))}
                {/* Original nodule */}
                <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-500/60" />
                {/* Heatmap overlay with transparency */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  transition={{ duration: 0.5 }}
                  className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20"
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/50 via-yellow-500/30 to-transparent blur-lg" />
                  <div className="absolute inset-4 rounded-full bg-gradient-to-br from-red-500/60 to-orange-500/40 blur-md" />
                </motion.div>
                {/* ROI indicator */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full border-2 border-yellow-400 border-dashed"
                />
              </div>
            </div>
            <div className="absolute bottom-3 left-3 right-3 flex justify-between">
              <span className="px-2 py-1 rounded bg-background/80 text-xs">
                Combined Overlay View
              </span>
              <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400 text-xs">
                ROI Highlighted
              </span>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Legend */}
      <div className="mt-4 p-3 rounded-xl bg-muted/50 text-xs text-muted-foreground">
        <strong className="text-foreground">Tip:</strong> The explainability visualizations help understand which regions and features influenced the model prediction. Use these to verify the AI reasoning aligns with clinical observations.
      </div>
    </motion.div>
  )
}
