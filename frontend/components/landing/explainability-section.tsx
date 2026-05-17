"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Eye, Shield } from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Grad-CAM Heatmaps",
    description: "Gradient-weighted Class Activation Mapping visualizes which regions of the CT scan most influenced the model prediction, creating intuitive heatmap overlays.",
    preview: "heatmap",
  },
  {
    icon: Shield,
    title: "Model Transparency",
    description: "Full transparency into the decision-making process, building trust between AI systems and medical professionals for better clinical adoption.",
    preview: "transparency",
  },
]

function PreviewCard({ type }: { type: string }) {
  if (type === "heatmap") {
    return (
      <div className="relative w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero-slice.png"
          alt="Grad-CAM sample input"
          className="absolute inset-0 h-full w-full object-cover opacity-95"
          draggable={false}
        />
        {/* Subtle heatmap overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/15 to-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.15, 0.45, 0.15] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    )
  }
  return (
    <div className="relative w-full h-full bg-card rounded-xl p-3 overflow-hidden">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-xs">Model Confidence: High</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span className="text-xs">Explainability: Enabled</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs">Audit Trail: Complete</span>
        </div>
      </div>
    </div>
  )
}

export function ExplainabilitySection() {
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
            Interpretability
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Understand the <span className="text-accent">Why</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Our system goes beyond predictions to provide clear, visual explanations that help clinicians understand and trust AI recommendations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative rounded-3xl bg-card border border-border/50 p-6 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5 transition-all duration-300"
            >
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="inline-flex p-3 rounded-2xl bg-accent/10 mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </div>
                <div className="hidden sm:block w-32 h-32 flex-shrink-0">
                  <PreviewCard type={feature.preview} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
