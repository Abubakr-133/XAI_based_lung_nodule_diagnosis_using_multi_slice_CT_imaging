"use client"

import { useCallback, useState } from "react"
import type { RoiSelection, PredictionResponse, SelectedSliceInput } from "@/lib/prediction-integration"
import { prepareSelectedSlicesForPrediction, sendSlicesToBackend } from "@/lib/prediction-integration"

interface HandlePredictInput {
  selectedSlices: SelectedSliceInput[]
  roi: RoiSelection | null
  endpoint?: string
}

export function usePredictionIntegration() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [predictionResult, setPredictionResult] = useState<PredictionResponse | null>(null)

  const handlePredict = useCallback(async ({ selectedSlices, roi, endpoint }: HandlePredictInput) => {
    if (!roi) {
      setError("Please select an ROI before predicting.")
      return
    }
    if (!selectedSlices || selectedSlices.length < 2) {
      setError("Please select at least 2 contiguous slices before predicting.")
      return
    }

    setLoading(true)
    setError(null)
    setPredictionResult(null)

    try {
      const files = await prepareSelectedSlicesForPrediction(selectedSlices, roi)
      const response = await sendSlicesToBackend(files, endpoint)
      setPredictionResult(response)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Prediction failed.")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    predictionResult,
    setPredictionResult,
    handlePredict,
  }
}
