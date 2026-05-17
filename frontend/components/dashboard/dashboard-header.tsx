"use client"

import Link from "next/link"
import { ArrowLeft, Activity, Wifi, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"

interface DashboardHeaderProps {
  modelStatus?: "online" | "offline" | "loading"
}

export function DashboardHeader({ modelStatus = "online" }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left */}
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Home</span>
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg">
                <Activity className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-semibold">Diagnostic Dashboard</h1>
                <p className="text-xs text-muted-foreground hidden sm:block max-w-xl leading-snug text-pretty">
                  Explainable CNN based Lung nodule diagnosis using multi-slice Imaging
                </p>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            {/* Model Status Badge */}
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              modelStatus === "online" 
                ? "bg-green-500/10 text-green-600 dark:text-green-400" 
                : modelStatus === "loading"
                ? "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                : "bg-red-500/10 text-red-600 dark:text-red-400"
            }`}>
              {modelStatus === "online" ? (
                <Wifi className="h-3 w-3" />
              ) : modelStatus === "loading" ? (
                <div className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {modelStatus === "online" ? "Model Ready" : modelStatus === "loading" ? "Loading..." : "Offline"}
            </div>
            
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  )
}
