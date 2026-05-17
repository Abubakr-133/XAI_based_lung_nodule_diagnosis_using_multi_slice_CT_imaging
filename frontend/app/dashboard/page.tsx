"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CtWorkspace } from "@/components/dashboard/ct-workspace/ct-workspace"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader modelStatus="online" />
      <main className="mx-auto max-w-[1680px] px-4 py-6 sm:px-6 lg:px-8">
        <CtWorkspace />
      </main>
    </div>
  )
}
