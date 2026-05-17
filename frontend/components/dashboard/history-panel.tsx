"use client"

import { motion } from "framer-motion"
import { History, Eye, CheckCircle2, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HistoryCase {
  id: string
  caseId: string
  date: string
  prediction: "benign" | "malignant"
  confidence: number
}

const mockHistory: HistoryCase[] = [
  { id: "1", caseId: "CASE-2024-001", date: "2024-01-15", prediction: "benign", confidence: 94.2 },
  { id: "2", caseId: "CASE-2024-002", date: "2024-01-14", prediction: "malignant", confidence: 87.5 },
  { id: "3", caseId: "CASE-2024-003", date: "2024-01-13", prediction: "benign", confidence: 96.8 },
  { id: "4", caseId: "CASE-2024-004", date: "2024-01-12", prediction: "benign", confidence: 91.3 },
]

interface HistoryPanelProps {
  onViewCase?: (caseId: string) => void
}

export function HistoryPanel({ onViewCase }: HistoryPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-2xl bg-card border border-border/50 p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-xl bg-muted">
          <History className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h2 className="font-semibold">Previous Cases</h2>
          <p className="text-sm text-muted-foreground">Recent diagnostic history</p>
        </div>
      </div>

      <div className="space-y-3">
        {mockHistory.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors group"
          >
            {/* Status Icon */}
            <div className={`p-2 rounded-lg ${
              item.prediction === "benign" 
                ? "bg-green-500/10" 
                : "bg-red-500/10"
            }`}>
              {item.prediction === "benign" ? (
                <CheckCircle2 className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
            </div>

            {/* Case Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.caseId}</p>
              <p className="text-xs text-muted-foreground">{item.date}</p>
            </div>

            {/* Confidence */}
            <div className="text-right">
              <p className={`text-sm font-medium ${
                item.prediction === "benign" 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}>
                {item.prediction.charAt(0).toUpperCase() + item.prediction.slice(1)}
              </p>
              <p className="text-xs text-muted-foreground">{item.confidence}%</p>
            </div>

            {/* View Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => onViewCase?.(item.id)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View All History
      </Button>
    </motion.div>
  )
}
