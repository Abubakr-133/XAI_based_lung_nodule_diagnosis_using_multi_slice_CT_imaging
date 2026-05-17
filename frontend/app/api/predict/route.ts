import { NextRequest, NextResponse } from "next/server"

/** Upstream FastAPI (or other) inference endpoint — server-side only, no browser CORS. */
const PREDICT_BACKEND_URL =
  process.env.PREDICT_BACKEND_URL ?? "http://127.0.0.1:8000/predict"

export async function POST(req: NextRequest) {
  let formData: FormData
  try {
    formData = await req.formData()
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  try {
    const upstream = await fetch(PREDICT_BACKEND_URL, {
      method: "POST",
      body: formData,
    })

    const text = await upstream.text()
    const contentType =
      upstream.headers.get("content-type") ?? "application/json"

    return new NextResponse(text, {
      status: upstream.status,
      headers: { "Content-Type": contentType },
    })
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not reach prediction backend"
    return NextResponse.json(
      {
        error: message,
        hint: "Ensure the API is running and PREDICT_BACKEND_URL is correct (default http://127.0.0.1:8000/predict).",
      },
      { status: 502 },
    )
  }
}
