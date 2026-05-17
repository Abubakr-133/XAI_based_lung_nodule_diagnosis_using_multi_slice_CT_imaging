"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Play, Scan, Brain, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export function HeroSection() {
  const targetConfidence = 92.4
  const [confidence, setConfidence] = useState(0)

  useEffect(() => {
    let raf = 0
    const start = performance.now()
    const duration = 1200

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3) // easeOutCubic
      setConfidence(Number((targetConfidence * eased).toFixed(1)))
      if (t < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const confidencePct = useMemo(
    () => Math.max(0, Math.min(100, confidence)),
    [confidence],
  )

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-background/50 to-background" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,hsl(var(--border)/0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.3)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              AI-Powered Medical Imaging
            </motion.div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              <span className="bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text">
                Explainable AI Based CNN Framework
              </span>
              <br />
              <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                for Annotated Lung Nodule Diagnosis
              </span>
              <br />
              <span className="bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent">
                using Multi-Slice Imaging
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0 text-pretty">
              Upload CT slices and receive AI-powered annotated lung nodule diagnosis with interpretable visual explanations using Grad-CAM.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all group">
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="rounded-full px-8 group">
                <Link href="#workflow">
                  <Play className="mr-2 h-4 w-4" />
                  View Methodology
                </Link>
              </Button>
            </div>

            {/* Legacy stats removed */}
          </motion.div>

          {/* Right Content - Visual Element */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-lg">
              {/* Main Card */}
              <div className="relative rounded-3xl bg-gradient-to-br from-card via-card to-muted/50 border border-border/50 p-6 shadow-2xl shadow-primary/10">
                {/* Scan Preview */}
                <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/hero-slice.png"
                    alt="Sample CT slice with ROI"
                    className="absolute inset-0 h-full w-full object-cover opacity-90"
                    draggable={false}
                  />
                </div>

                {/* Diagnosis Results */}
                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Diagnosis Status</span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Complete
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Malignant Probability</span>
                      <span className="font-medium text-red-600 dark:text-red-400">{targetConfidence.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidencePct}%` }}
                        transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  <div className="rounded-xl bg-muted/50 border border-border/40 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Confidence score
                      </span>
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {confidencePct.toFixed(1)}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-red-500 to-amber-400"
                        initial={{ width: 0 }}
                        animate={{ width: `${confidencePct}%` }}
                        transition={{ duration: 1.2, delay: 0.35, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <motion.div
                className="absolute -top-4 -right-4 p-4 rounded-2xl bg-card border border-border/50 shadow-xl"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Brain className="h-6 w-6 text-primary" />
              </motion.div>

              <motion.div
                className="absolute -bottom-4 -left-4 p-4 rounded-2xl bg-card border border-border/50 shadow-xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              >
                <Scan className="h-6 w-6 text-accent" />
              </motion.div>

              <motion.div
                className="absolute top-1/2 -right-8 p-3 rounded-xl bg-card border border-border/50 shadow-xl"
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                <Shield className="h-5 w-5 text-green-500" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
