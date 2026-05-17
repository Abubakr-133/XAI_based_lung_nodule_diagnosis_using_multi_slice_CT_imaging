"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Database, Layers, Maximize2, BarChart3, Sparkles } from "lucide-react"

const highlights = [
  {
    icon: Database,
    label: "Dataset Used",
    value: "LIDC + IDRI",
    description:
      "Lung Image Database Consortium (LIDC) and Image Database Resource Initiative (IDRI)",
  },
  {
    icon: Layers,
    label: "Model Architecture",
    value: "DenseNet121",
    description: "Binary classifier with dense connections",
  },
  {
    icon: Maximize2,
    label: "Input Size",
    value: "224 x 224",
    description: "Standardized image dimensions for CNN",
  },
  {
    icon: BarChart3,
    label: "Aggregation",
    value: "Avg. Softmax",
    description:
      "slice level prediction with softmax aggregation to get nodule level result",
  },
  {
    icon: Sparkles,
    label: "Explainability",
    value: "Grad-CAM",
    description: "Visual heatmap interpretations",
  },
]

export function ResearchSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
            Research Highlights
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Model <span className="text-accent">Specifications</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Key technical details and research parameters used in our diagnostic system.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
          {highlights.map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="group relative rounded-2xl bg-card border border-border/50 p-6 text-center hover:border-accent/30 hover:shadow-lg transition-all duration-300"
            >
              <div className="inline-flex p-3 rounded-xl bg-accent/10 mb-4">
                <item.icon className="h-5 w-5 text-accent" />
              </div>
              <div className="text-sm text-muted-foreground mb-1">{item.label}</div>
              <div className="text-xl font-bold mb-2">{item.value}</div>
              <p className="text-xs text-muted-foreground">{item.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
