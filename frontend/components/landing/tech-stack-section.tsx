"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

function LogoPython() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <defs>
        <linearGradient id="py" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffd43b" />
          <stop offset="1" stopColor="#4dabf7" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#py)" opacity="0.18" />
      <path
        d="M32 16c-7 0-12 4-12 10v20c0 6 5 12 12 12h5c7 0 12-6 12-12V26c0-6-5-10-12-10h-5z"
        fill="#3772ff"
        opacity="0.18"
      />
      <text
        x="32"
        y="39"
        textAnchor="middle"
        fontSize="18"
        fontWeight="800"
        fill="#3772ff"
        fontFamily="system-ui, sans-serif"
      >
        Py
      </text>
    </svg>
  )
}

function LogoFastAPI() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <rect x="10" y="10" width="44" height="44" rx="14" fill="#21c7a8" opacity="0.18" />
      <path d="M24 38c4 4 12 4 16 0" stroke="#21c7a8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="24" cy="27" r="4" fill="#21c7a8" />
      <circle cx="40" cy="27" r="4" fill="#21c7a8" opacity="0.55" />
      <text x="32" y="49" textAnchor="middle" fontSize="12" fontWeight="800" fill="#21c7a8" fontFamily="system-ui, sans-serif">
        API
      </text>
    </svg>
  )
}

function LogoNext() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <path
        d="M14 18c0-4 3-7 7-7h22c4 0 7 3 7 7v28c0 4-3 7-7 7H21c-4 0-7-3-7-7V18z"
        fill="#111827"
        opacity="0.14"
      />
      <path
        d="M22 45V19l20 26H22z"
        fill="#0ea5e9"
        opacity="0.9"
      />
      <text x="32" y="48" textAnchor="middle" fontSize="11" fontWeight="900" fill="#0ea5e9" fontFamily="system-ui, sans-serif">
        Next
      </text>
    </svg>
  )
}

function LogoTailwind() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <rect x="12" y="12" width="40" height="40" rx="12" fill="#38bdf8" opacity="0.16" />
      <path
        d="M20 24c4-6 20-6 24 0-4 6-20 6-24 0z"
        fill="#38bdf8"
        opacity="0.85"
      />
      <path
        d="M20 32c4 6 20 6 24 0-4-6-20-6-24 0z"
        fill="#38bdf8"
        opacity="0.45"
      />
      <text x="32" y="50" textAnchor="middle" fontSize="11" fontWeight="800" fill="#38bdf8" fontFamily="system-ui, sans-serif">
        TW
      </text>
    </svg>
  )
}

function LogoDenseNet() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <rect x="12" y="12" width="40" height="40" rx="12" fill="#a855f7" opacity="0.15" />
      <g fill="#a855f7" opacity="0.9">
        <rect x="20" y="19" width="6" height="26" rx="2" />
        <rect x="29" y="19" width="6" height="26" rx="2" opacity="0.7" />
        <rect x="38" y="19" width="6" height="26" rx="2" opacity="0.45" />
      </g>
      <text x="32" y="50" textAnchor="middle" fontSize="11" fontWeight="900" fill="#a855f7" fontFamily="system-ui, sans-serif">
        Dense
      </text>
    </svg>
  )
}

function LogoGradCam() {
  return (
    <svg viewBox="0 0 64 64" width="32" height="32" aria-hidden="true">
      <rect x="12" y="12" width="40" height="40" rx="12" fill="#fb7185" opacity="0.15" />
      <path d="M26 47c-4-4-4-10 0-14l12-12c4-4 10-4 14 0-4 4-4 10 0 14L40 47c-4 4-10 4-14 0z" fill="#fb7185" opacity="0.85" />
      <text x="32" y="50" textAnchor="middle" fontSize="11" fontWeight="900" fill="#fb7185" fontFamily="system-ui, sans-serif">
        CAM
      </text>
    </svg>
  )
}

const technologies = [
  {
    name: "Python",
    description: "Core programming language for ML pipeline",
    icon: <LogoPython />,
    color: "from-yellow-400 to-blue-500",
  },
  {
    name: "FastAPI",
    description: "High-performance async backend API",
    icon: <LogoFastAPI />,
    color: "from-teal-400 to-green-500",
  },
  {
    name: "Next.js",
    description: "React framework for the frontend UI",
    icon: <LogoNext />,
    color: "from-gray-600 to-gray-800 dark:from-gray-300 dark:to-gray-100",
  },
  {
    name: "Tailwind CSS",
    description: "Utility-first styling framework",
    icon: <LogoTailwind />,
    color: "from-cyan-400 to-blue-500",
  },
  {
    name: "DenseNet121",
    description: "CNN architecture for classification",
    icon: <LogoDenseNet />,
    color: "from-purple-400 to-pink-500",
  },
  {
    name: "LIDC-IDRI",
    description: "Lung CT scan research dataset",
    icon: (
      <span className="text-[10px] font-extrabold tracking-tight text-indigo-600 dark:text-indigo-300">
        LIDC-IDRI
      </span>
    ),
    color: "from-blue-400 to-indigo-500",
  },
  {
    name: "Grad-CAM",
    description: "Visual explanation heatmaps",
    icon: <LogoGradCam />,
    color: "from-orange-400 to-red-500",
  },
]

export function TechStackSection() {
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
            Technology Stack
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Built with Modern{" "}
            <span className="text-accent">Technologies</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground">
            Leveraging cutting-edge tools and frameworks for reliable, scalable, and interpretable AI diagnostics.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {technologies.map((tech, index) => (
            <motion.div
              key={tech.name}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="group relative rounded-2xl bg-card border border-border/50 p-6 text-center hover:border-primary/30 hover:shadow-lg transition-all duration-300"
            >
              {/* Icon with gradient background */}
              <div className="relative mx-auto w-16 h-16 mb-4">
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${tech.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className="relative flex items-center justify-center w-full h-full">
                  {tech.icon}
                </div>
              </div>
              
              <h3 className="font-semibold mb-1">{tech.name}</h3>
              <p className="text-sm text-muted-foreground">{tech.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
