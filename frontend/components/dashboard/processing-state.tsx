"use client"

import { motion } from "framer-motion"
import { Check, Loader2 } from "lucide-react"

interface ProcessingStep {
  id: string
  label: string
  status: "pending" | "processing" | "complete"
}

interface ProcessingStateProps {
  steps: ProcessingStep[]
  currentStep: number
}

export function ProcessingState({ steps, currentStep }: ProcessingStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl bg-card border border-border/50 p-8"
    >
      <div className="text-center mb-8">
        <motion.div
          className="relative inline-flex"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-16 h-16 rounded-full border-4 border-primary/20" />
          <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary" />
        </motion.div>
        <h3 className="mt-6 text-xl font-semibold">Analyzing CT Scans</h3>
        <p className="mt-2 text-muted-foreground">Please wait while the AI processes your images</p>
      </div>

      <div className="space-y-4 max-w-md mx-auto">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`flex items-center gap-4 p-4 rounded-xl transition-colors ${
              step.status === "processing" 
                ? "bg-primary/10 border border-primary/20" 
                : step.status === "complete"
                ? "bg-green-500/10"
                : "bg-muted/50"
            }`}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              step.status === "processing"
                ? "bg-primary text-primary-foreground"
                : step.status === "complete"
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}>
              {step.status === "processing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : step.status === "complete" ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`font-medium ${
              step.status === "pending" ? "text-muted-foreground" : ""
            }`}>
              {step.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
