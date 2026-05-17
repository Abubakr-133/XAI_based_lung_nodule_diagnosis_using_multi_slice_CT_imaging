"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "What image formats are supported?",
    answer: "Our system supports standard medical imaging formats including DICOM, PNG, and JPEG. For best results, we recommend using DICOM files as they preserve the full dynamic range of CT scan data. Images are automatically preprocessed and normalized before analysis.",
  },
  {
    question: "How many CT slices can be uploaded at once?",
    answer: "You can upload multiple CT slices per case. The system will automatically select the most relevant central slices for analysis. We recommend uploading 5-20 slices per nodule region for optimal diagnostic accuracy.",
  },
  {
    question: "Is this model suitable for clinical use?",
    answer: "This system is designed as a research demonstration and decision-support tool. It should not be used as a standalone diagnostic tool. All predictions should be reviewed and validated by qualified medical professionals. The system is intended to assist, not replace, clinical judgment.",
  },
  {
    question: "What does the Grad-CAM heatmap show?",
    answer: "Grad-CAM (Gradient-weighted Class Activation Mapping) creates a heatmap highlighting the regions of the CT scan that most influenced the model prediction. Red/warm colors indicate high importance regions, while blue/cool colors indicate low importance. This helps clinicians understand which areas the AI focused on.",
  },
  {
    question: "How is the prediction confidence calculated?",
    answer: "Confidence scores are derived from the softmax output of the DenseNet121 classifier. For multiple slices, we use average softmax aggregation across all analyzed slices. The final confidence represents the model certainty in its benign or malignant classification.",
  },
  {
    question: "Can I compare multiple scans from the same patient?",
    answer: "Yes, the dashboard supports uploading and analyzing multiple scans. You can use the history panel to view previous analyses and compare results over time. This is useful for monitoring nodule progression or treatment response.",
  },
  {
    question: "Is this system suitable for research demonstrations?",
    answer: "Absolutely! This system is specifically designed for academic research demonstrations and final-year projects. It showcases state-of-the-art deep learning techniques, explainable AI methods, and modern web development practices in a polished, presentation-ready interface.",
  },
]

export function FAQSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="faq" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-muted/30" />
      
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Frequently Asked <span className="text-primary">Questions</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Common questions about the diagnostic system and its capabilities.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="rounded-2xl bg-card border border-border/50 px-6 data-[state=open]:border-primary/30 data-[state=open]:shadow-lg transition-all"
              >
                <AccordionTrigger className="text-left hover:no-underline py-6">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}
