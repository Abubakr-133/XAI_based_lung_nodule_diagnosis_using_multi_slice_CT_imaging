"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Upload, Settings, Cpu, CheckCircle2, Eye, MapPin } from "lucide-react"

const steps = [
  {
    step: "01",
    icon: Upload,
    title: "Upload CT Slices",
    description: "Upload multiple CT scan slices in DICOM format.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    step: "02",
    icon: MapPin,
    title: "Select Slices & ROI",
    description:
      "Select 2–5 consecutive slices where the nodule is clearly visible, then draw an ROI on the slice that best highlights it. The selected slices are annotated with the ROI for consistent inference.",
    color: "from-cyan-500 to-teal-500",
  },
  {
    step: "03",
    icon: Cpu,
    title: "Preprocessing",
    description:
      "Crop the same ROI region from each selected slice and resize every crop to 224×224 to prepare model-ready inputs.",
    color: "from-teal-500 to-green-500",
  },
  {
    step: "04",
    icon: CheckCircle2,
    title: "Diagnosis",
    description:
      "DenseNet121 performs slice-level inference, then uses softmax aggregation to produce a single nodule-level benign/malignant diagnosis with confidence.",
    color: "from-green-500 to-emerald-500",
  },
  {
    step: "05",
    icon: Eye,
    title: "Explainability",
    description: "Generate Grad-CAM explanations highlighting the ROI regions that influenced the diagnosis.",
    color: "from-emerald-500 to-primary",
  },
]

export function WorkflowSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="workflow" className="relative py-24 sm:py-32 overflow-hidden">
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
            Methodology
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            How It <span className="text-primary">Works</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            A streamlined five-step process from CT scan upload to interpretable diagnosis results.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-accent/50 to-primary/50 hidden lg:block -translate-x-1/2" />
          
          <div className="space-y-8 lg:space-y-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative lg:grid lg:grid-cols-2 lg:gap-8 ${index % 2 === 0 ? "" : "lg:direction-rtl"}`}
              >
                {/* Content */}
                <div className={`lg:py-8 ${index % 2 === 0 ? "lg:text-right lg:pr-12" : "lg:text-left lg:pl-12 lg:col-start-2"}`}>
                  <div className={`inline-block ${index % 2 === 0 ? "lg:ml-auto" : ""}`}>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${step.color} text-white shadow-lg`}>
                        <step.icon className="h-6 w-6" />
                      </div>
                      <span className="text-4xl font-bold text-muted-foreground/30">{step.step}</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                    <p className="text-muted-foreground max-w-md">{step.description}</p>
                  </div>
                </div>

                {/* Center Dot */}
                <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={isInView ? { scale: 1 } : {}}
                    transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}
                    className={`w-4 h-4 rounded-full bg-gradient-to-br ${step.color} ring-4 ring-background`}
                  />
                </div>

                {/* Empty column for alternating layout */}
                <div className={`hidden lg:block ${index % 2 === 0 ? "" : "lg:col-start-1 lg:row-start-1"}`} />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
