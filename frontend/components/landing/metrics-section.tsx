"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

const metrics = [
  { label: "Precision", value: 96, suffix: "%", color: "from-cyan-500 to-teal-500" },
  { label: "Recall", value: 92.31, suffix: "%", color: "from-teal-500 to-green-500" },
  { label: "F1 Score", value: 98.0, suffix: "%", color: "from-green-500 to-emerald-500" },
  { label: "AUC", value: 0.99, suffix: "", color: "from-emerald-500 to-primary" },
]

export function MetricsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="performance" className="relative py-24 sm:py-32 overflow-hidden">
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
            Performance
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Model <span className="text-primary">Metrics</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Comprehensive evaluation results demonstrating the reliability and accuracy of our diagnostic system.
          </p>
        </motion.div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6 mb-12">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="relative rounded-2xl bg-card border border-border/50 p-6 text-center overflow-hidden group hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${metric.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="text-sm text-muted-foreground mb-2">{metric.label}</div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                className="text-3xl lg:text-4xl font-bold"
              >
                {metric.value}{metric.suffix}
              </motion.div>
              {/* Progress bar */}
              <div className="mt-4 h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={isInView ? { width: `${metric.value > 1 ? metric.value : metric.value * 100}%` } : {}}
                  transition={{ duration: 1, delay: index * 0.1 + 0.2, ease: "easeOut" }}
                  className={`h-full rounded-full bg-gradient-to-r ${metric.color}`}
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Visualization Panels */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Confusion Matrix */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="rounded-2xl bg-card border border-border/50 p-6"
          >
            <h3 className="font-semibold mb-4">Confusion Matrix</h3>
            <div className="aspect-square bg-muted/50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-2 h-full">
                <div className="flex flex-col">
                  <div className="text-xs text-muted-foreground mb-2 text-center">Predicted</div>
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    <div className="rounded-lg bg-green-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">24</div>
                        <div className="text-xs text-muted-foreground">TN</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-red-500/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">2</div>
                        <div className="text-xs text-muted-foreground">FP</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-red-500/10 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-500">1</div>
                        <div className="text-xs text-muted-foreground">FN</div>
                      </div>
                    </div>
                    <div className="rounded-lg bg-green-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">28</div>
                        <div className="text-xs text-muted-foreground">TP</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ROC Curve */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="rounded-2xl bg-card border border-border/50 p-6"
          >
            <h3 className="font-semibold mb-4">ROC Curve</h3>
            <div className="aspect-square bg-muted/50 rounded-xl p-4 relative">
              {/* Axes */}
              <div className="absolute bottom-4 left-4 right-4 h-px bg-border" />
              <div className="absolute bottom-4 left-4 top-4 w-px bg-border" />
              {/* Diagonal reference line */}
              <svg className="absolute inset-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)]" preserveAspectRatio="none">
                <line x1="0" y1="100%" x2="100%" y2="0" stroke="currentColor" strokeDasharray="4" className="text-muted-foreground/30" />
                <motion.path
                  d="M 0 100% Q 10% 5%, 100% 0"
                  fill="none"
                  stroke="url(#rocGradient)"
                  strokeWidth="3"
                  initial={{ pathLength: 0 }}
                  animate={isInView ? { pathLength: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.5 }}
                />
                <defs>
                  <linearGradient id="rocGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="hsl(var(--primary))" />
                    <stop offset="100%" stopColor="hsl(var(--accent))" />
                  </linearGradient>
                </defs>
              </svg>
              {/* Labels */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">FPR</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-muted-foreground">TPR</div>
              <div className="absolute top-4 right-4 text-sm font-medium">AUC: 0.99</div>
            </div>
          </motion.div>

          {/* Sample Grad-CAM (uses the same CT image as the hero) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="rounded-2xl bg-card border border-border/50 p-6"
          >
            <h3 className="font-semibold mb-4">Sample Grad-CAM</h3>
            <div className="aspect-square bg-muted/50 rounded-xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero-slice.png"
                alt="Sample Grad-CAM input"
                className="absolute inset-0 h-full w-full object-cover opacity-90"
                draggable={false}
              />
              {/* Label */}
              <motion.div
                className="absolute bottom-3 left-3 right-3 flex justify-between text-xs"
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <span className="px-2 py-1 rounded bg-background/80 text-foreground">
                  Region of Interest
                </span>
                <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">
                  High Attention
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
