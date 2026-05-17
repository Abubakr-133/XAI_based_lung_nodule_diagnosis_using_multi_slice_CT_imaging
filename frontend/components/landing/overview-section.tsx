"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { AlertTriangle, Zap, Target, Users } from "lucide-react"

const features = [
  {
    icon: AlertTriangle,
    title: "The Challenge",
    description: "Lung cancer remains one of the leading causes of death worldwide. Early diagnosis using CT scans is critical, but manual analysis is time-consuming and prone to variability between radiologists. This creates a need for an automated, consistent, and reliable diagnostic support system.",
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  {
    icon: Target,
    title: "Our Solution",
    description: "We propose a deep learning-based system that analyzes CT scan slices to classify lung nodules as benign or malignant. The model leverages multi-slice aggregation and ROI-based analysis to improve prediction reliability and ensure that the most relevant regions are considered during inference.",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    icon: Zap,
    title: "AI-Powered Speed",
    description: "The system processes multiple CT slices within seconds, significantly reducing the time required for diagnosis. By automating the analysis pipeline, it assists clinicians in making faster and more efficient decisions while minimizing manual workload.",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    icon: Users,
    title: "Explainable AI",
    description: "To enhance trust and transparency, the model provides visual explanations using Grad-CAM heatmaps, highlighting the specific regions that influenced the prediction. This enables clinicians to better interpret and validate the model’s decision.",
    color: "text-green-500",
    bgColor: "bg-green-500/10",
  },
]

export function OverviewSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="about" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-muted/30" />
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            Project Overview
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-balance">
            Transforming Lung Cancer Diagnosis with{" "}
            <span className="text-primary">Explainable AI</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground text-pretty">
            Our research-driven solution combines state-of-the-art deep learning with interpretable AI to assist medical professionals in early lung nodule diagnosis.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group relative rounded-3xl bg-card border border-border/50 p-8 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
            >
              <div className={`inline-flex p-3 rounded-2xl ${feature.bgColor} mb-6`}>
                <feature.icon className={`h-6 w-6 ${feature.color}`} />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-pretty">{feature.description}</p>
              
              {/* Hover gradient effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
